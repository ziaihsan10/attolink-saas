import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const COUPON_AGGREGATORS = [
  "joinhoney.com",
  "honey.com",
  "retailmenot.com",
  "groupon.com",
  "rakuten.com",
  "coupert.com",
  "capitaloneshopping.com",
  "slickdeals.net",
  "offers.com",
  "coupons.com",
  "priceblink.com",
  "evoucher.com",
];

const DISCOUNT_QUERY_KEYS = [
  "code",
  "coupon",
  "discount",
  "promo",
  "promo_code",
  "voucher",
  "attolink_ref",
];

function getSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or Supabase key in environment variables"
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function incrementCounterSafely(
  supabaseAdmin: SupabaseClient,
  linkId: string | number,
  field: "clicks" | "blocked_leaks",
  currentValue: number
) {
  const nextVal = Number(currentValue || 0) + 1;

  // Optional RPC if configured in Supabase; falls back cleanly to standard update
  const { error: rpcError } = await supabaseAdmin.rpc(
    "increment_creator_link_counter",
    {
      p_link_id: linkId,
      p_field: field,
    }
  );

  if (!rpcError) return;

  await supabaseAdmin
    .from("creator_links")
    .update({ [field]: nextVal })
    .eq("id", linkId);
}

async function logAttributionEventSafely(
  supabaseAdmin: SupabaseClient,
  payload: {
    link_id: string | number;
    user_id?: string | null;
    slug: string;
    event_type: "click" | "blocked_leak";
    referer?: string;
    user_agent?: string;
  }
) {
  try {
    await supabaseAdmin.from("attribution_events").insert([
      {
        link_id: payload.link_id,
        user_id: payload.user_id ?? null,
        slug: payload.slug,
        event_type: payload.event_type,
        referer: payload.referer || null,
        user_agent: payload.user_agent ? payload.user_agent.slice(0, 255) : null,
      },
    ]);
  } catch {
    // Ignore if attribution_events table is not created yet
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const cleanSlug = decodeURIComponent(slug || "").toLowerCase().trim();

  if (!cleanSlug) {
    return NextResponse.json(
      { error: "Missing creator slug" },
      { status: 400 }
    );
  }

  let supabaseAdmin: SupabaseClient;
  try {
    supabaseAdmin = getSupabaseClient();
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Supabase configuration error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  // 1. Lookup creator link by slug (case-insensitive)
  const { data: link, error } = await supabaseAdmin
    .from("creator_links")
    .select("*")
    .ilike("slug", cleanSlug)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      {
        error: "Database lookup failed",
        slug: cleanSlug,
        dbError: error.message,
      },
      { status: 500 }
    );
  }

  if (!link) {
    return NextResponse.json(
      { error: `Creator link not found for slug: ${cleanSlug}` },
      { status: 404 }
    );
  }

  if (link.is_active === false) {
    return NextResponse.json(
      { error: "Creator link is marked inactive", slug: cleanSlug },
      { status: 403 }
    );
  }

  // 2. Anti-Coupon Leak Shield check via Referer
  const rawReferer = (
    request.headers.get("referer") ||
    request.headers.get("x-attolink-referer") ||
    ""
  )
    .toLowerCase()
    .trim();

  const userAgent = request.headers.get("user-agent") || "";
  const shieldEnabled = link.block_coupon_sites !== false;

  const isCouponLeak =
    shieldEnabled &&
    Boolean(rawReferer) &&
    COUPON_AGGREGATORS.some((domain) => rawReferer.includes(domain));

  // 3. Increment counter + log attribution event
  if (isCouponLeak) {
    await Promise.all([
      incrementCounterSafely(
        supabaseAdmin,
        link.id,
        "blocked_leaks",
        Number(link.blocked_leaks || 0)
      ),
      logAttributionEventSafely(supabaseAdmin, {
        link_id: link.id,
        user_id: link.user_id,
        slug: cleanSlug,
        event_type: "blocked_leak",
        referer: rawReferer,
        user_agent: userAgent,
      }),
    ]);
  } else {
    await Promise.all([
      incrementCounterSafely(
        supabaseAdmin,
        link.id,
        "clicks",
        Number(link.clicks || 0)
      ),
      logAttributionEventSafely(supabaseAdmin, {
        link_id: link.id,
        user_id: link.user_id,
        slug: cleanSlug,
        event_type: "click",
        referer: rawReferer,
        user_agent: userAgent,
      }),
    ]);
  }

  // 4. Build safe destination URL
  const rawTarget = String(
    link.target_url || link.destination_url || ""
  ).trim();

  let destinationUrl: URL;
  try {
    destinationUrl = new URL(
      rawTarget.startsWith("http://") || rawTarget.startsWith("https://")
        ? rawTarget
        : `https://${rawTarget}`
    );
  } catch {
    return NextResponse.json(
      {
        error: "Invalid target_url stored on creator link",
        target_url: rawTarget,
      },
      { status: 400 }
    );
  }

  // Preserve non-discount incoming query params
  request.nextUrl.searchParams.forEach((value, key) => {
    if (!DISCOUNT_QUERY_KEYS.includes(key.toLowerCase())) {
      destinationUrl.searchParams.set(key, value);
    }
  });

  if (isCouponLeak) {
    for (const key of DISCOUNT_QUERY_KEYS) {
      destinationUrl.searchParams.delete(key);
    }
  } else {
    destinationUrl.searchParams.set("attolink_ref", cleanSlug);
    if (link.promo_code) {
      destinationUrl.searchParams.set("code", String(link.promo_code).trim());
    }
  }

  // 5. Redirect & 30-day attribution cookie
  const response = NextResponse.redirect(destinationUrl.toString(), 302);

  if (!isCouponLeak) {
    response.cookies.set("attolink_ref", cleanSlug, {
      maxAge: 60 * 60 * 24 * 30, // 30 Days
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  } else {
    response.cookies.delete("attolink_ref");
  }

  return response;
}