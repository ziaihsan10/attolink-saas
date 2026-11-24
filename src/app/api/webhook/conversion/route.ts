import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { redis } from "@/lib/redis";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-webhook-secret",
};

function parseAmount(raw: unknown): number {
  if (typeof raw === "number") {
    return Number.isFinite(raw) ? raw : 0;
  }
  if (typeof raw === "string") {
    const cleaned = raw.replace(/[^0-9.-]/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    // Optional secret check (if UNIVERSAL_WEBHOOK_SECRET is set in env)
    const configuredSecret = process.env.UNIVERSAL_WEBHOOK_SECRET?.trim();
    if (configuredSecret) {
      const providedSecret =
        req.headers.get("x-webhook-secret")?.trim() ||
        req.nextUrl.searchParams.get("secret")?.trim();

      if (providedSecret !== configuredSecret) {
        return NextResponse.json(
          { error: "Unauthorized webhook request" },
          { status: 401, headers: CORS_HEADERS }
        );
      }
    }

    const rawBody = await req.text();
    let payload: Record<string, any> = {};

    try {
      payload = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Accept common field aliases from any gateway or Thank-You page script
    const slug = String(
      payload.slug ||
        payload.attolink_ref ||
        payload.ref ||
        payload.creator_slug ||
        ""
    )
      .toLowerCase()
      .trim();

    if (!slug) {
      return NextResponse.json(
        { error: "Missing creator attribution slug (slug or attolink_ref)" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const amount = parseAmount(
      payload.amount ??
        payload.total ??
        payload.total_price ??
        payload.revenue ??
        0
    );

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Conversion amount must be greater than 0" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const gateway = String(payload.gateway || payload.source || "universal")
      .toLowerCase()
      .trim();

    const currency = String(payload.currency || "USD")
      .toUpperCase()
      .trim();

    const rawEventId =
      payload.event_id ||
      payload.order_id ||
      payload.transaction_id ||
      payload.id;
    const eventId = rawEventId
      ? `${gateway}_${String(rawEventId).trim()}`
      : null;

    // 1. Redis Deduplication (safe fallback if Redis fetch fails)
    if (eventId && redis) {
      try {
        const dedupeKey = `attolink:conv:${eventId}`;
        const isNew = await redis.set(dedupeKey, "1", {
          nx: true,
          ex: 60 * 60 * 24 * 30, // 30 days
        });

        if (!isNew) {
          return NextResponse.json(
            {
              received: true,
              deduplicated: true,
              slug,
              event_id: eventId,
            },
            { status: 200, headers: CORS_HEADERS }
          );
        }
      } catch (redisErr) {
        console.warn(
          "Redis dedupe skipped due to connection issue:",
          redisErr
        );
      }
    }

    // 2. Lookup Creator Link
    const { data: link, error: lookupError } = await supabaseAdmin
      .from("creator_links")
      .select("id, slug, sales, revenue")
      .eq("slug", slug)
      .maybeSingle();

    if (lookupError) {
      return NextResponse.json(
        { error: "Database lookup failed: " + lookupError.message },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    if (!link) {
      return NextResponse.json(
        { error: `Creator link not found for slug: ${slug}` },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const updatedSales = Number(link.sales || 0) + 1;
    const updatedRevenue = Number(link.revenue || 0) + amount;

    // 3. Update Creator Totals
    const { error: updateError } = await supabaseAdmin
      .from("creator_links")
      .update({
        sales: updatedSales,
        revenue: updatedRevenue,
      })
      .eq("id", link.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update creator revenue: " + updateError.message },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    // 4. Record Attribution Event Audit Log (best-effort)
    try {
      await supabaseAdmin.from("attribution_events").insert([
        {
          link_id: link.id,
          event_type: "conversion",
          revenue: amount,
          metadata: {
            gateway,
            currency,
            event_id: eventId,
          },
        },
      ]);
    } catch {
      // Ignore audit insert failure if table/column shape differs
    }

    return NextResponse.json(
      {
        received: true,
        success: true,
        gateway,
        slug,
        currency,
        added_revenue: amount,
        total_sales: updatedSales,
        total_revenue: updatedRevenue,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    const causeMsg = err?.cause?.message ? ` (${err.cause.message})` : "";
    return NextResponse.json(
      { error: (err?.message || "Unexpected webhook error") + causeMsg },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}