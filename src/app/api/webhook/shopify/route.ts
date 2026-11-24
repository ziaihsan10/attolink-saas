import { NextResponse } from "next/server";
import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase";

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function verifyShopifyHmac(rawBody: string, hmacHeader: string | null): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET?.trim();
  if (!secret || secret.includes("your_shopify_webhook_secret")) {
    return true; // Allow local/sandbox testing when secret is not configured
  }
  if (!hmacHeader) return false;

  const computed = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

  const a = Buffer.from(computed, "utf8");
  const b = Buffer.from(hmacHeader.trim(), "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function extractAttolinkSlug(order: any): string {
  // 1. Check note_attributes for attolink_ref
  if (Array.isArray(order?.note_attributes)) {
    const found = order.note_attributes.find(
      (attr: any) =>
        String(attr?.name || "").toLowerCase().trim() === "attolink_ref" &&
        attr?.value
    );
    if (found?.value) {
      return String(found.value).toLowerCase().trim();
    }
  }

  // 2. Check landing_site query param (?attolink_ref=slug)
  if (typeof order?.landing_site === "string" && order.landing_site.trim()) {
    try {
      const parsed = new URL(order.landing_site, "https://example.com");
      const refParam = parsed.searchParams.get("attolink_ref");
      if (refParam) return refParam.toLowerCase().trim();
    } catch {
      // Ignore malformed landing_site
    }
  }

  // 3. Direct slug / ref fallback in payload
  if (order?.attolink_ref || order?.slug) {
    return String(order.attolink_ref || order.slug)
      .toLowerCase()
      .trim();
  }

  return "";
}

function extractDiscountCode(order: any): string {
  if (Array.isArray(order?.discount_codes) && order.discount_codes.length > 0) {
    const firstCode = order.discount_codes[0]?.code;
    if (firstCode) return String(firstCode).trim();
  }
  return "";
}

async function resolveCreatorLink(
  db: SupabaseClient,
  slug: string,
  discountCode: string
) {
  if (slug) {
    const { data: bySlug } = await db
      .from("creator_links")
      .select("*")
      .ilike("slug", slug)
      .maybeSingle();

    if (bySlug) return bySlug;
  }

  if (discountCode) {
    const { data: byPromo } = await db
      .from("creator_links")
      .select("*")
      .ilike("promo_code", discountCode)
      .maybeSingle();

    if (byPromo) return byPromo;
  }

  return null;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");

  if (!verifyShopifyHmac(rawBody, hmacHeader)) {
    return NextResponse.json(
      { error: "Invalid Shopify HMAC signature" },
      { status: 401 }
    );
  }

  let order: any;
  try {
    order = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const slug = extractAttolinkSlug(order);
  const discountCode = extractDiscountCode(order);
  const amountTotal = roundMoney(
    Number(
      order?.total_price ?? order?.current_total_price ?? order?.amount ?? 0
    )
  );
  const currency = String(order?.currency || "USD").toUpperCase();
  const externalOrderId = order?.id
    ? `shopify_${String(order.id).trim()}`
    : null;

  if ((!slug && !discountCode) || Number.isNaN(amountTotal) || amountTotal <= 0) {
    return NextResponse.json({
      received: true,
      attributed: false,
      reason: "Missing attolink_ref/discount_code or valid order total",
    });
  }

  if (externalOrderId) {
    const { data: existingOrder } = await supabaseAdmin
      .from("attribution_events")
      .select("id")
      .eq("external_order_id", externalOrderId)
      .maybeSingle();

    if (existingOrder) {
      return NextResponse.json({
        received: true,
        deduplicated: true,
        external_order_id: externalOrderId,
      });
    }
  }

  const link = await resolveCreatorLink(supabaseAdmin, slug, discountCode);

  if (!link) {
    return NextResponse.json({
      received: true,
      attributed: false,
      reason: `No creator link found for slug: ${slug || "(none)"} or code: ${discountCode || "(none)"}`,
    });
  }

  const updatedSales = Number(link.sales || 0) + 1;
  const updatedRevenue = roundMoney(Number(link.revenue || 0) + amountTotal);

  const { error: updateError } = await supabaseAdmin
    .from("creator_links")
    .update({
      sales: updatedSales,
      revenue: updatedRevenue,
    })
    .eq("id", link.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabaseAdmin.from("attribution_events").insert({
    link_id: link.id,
    user_id: link.user_id ?? null,
    slug: link.slug,
    event_type: "sale",
    source_platform: "shopify",
    revenue_amount: amountTotal,
    currency,
    external_order_id: externalOrderId,
  });

  return NextResponse.json({
    received: true,
    attributed: true,
    slug: link.slug,
    added_revenue: amountTotal,
    total_sales: updatedSales,
    total_revenue: updatedRevenue,
  });
}