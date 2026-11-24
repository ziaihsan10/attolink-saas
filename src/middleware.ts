import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { redis, CachedLinkData } from "@/lib/redis";
import { createClient } from "@supabase/supabase-js";

const BLOCKED_COUPON_DOMAINS = [
  "retailmenot.com",
  "joinhoney.com",
  "honey.com",
  "groupon.com",
  "coupons.com",
  "slickdeals.net",
  "rakuten.com",
  "capitaloneshopping.com",
  "coupert.com",
  "offers.com",
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

type NormalizedLink = {
  id: string;
  slug: string;
  destination_url: string;
  promo_code?: string | null;
  discount_param?: string | null;
  block_coupon_sites?: boolean;
  is_active?: boolean;
  clicks?: number;
  blocked_leaks?: number;
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/r/")) {
    return NextResponse.next();
  }

  const rawSlug = pathname.replace("/r/", "").split("/")[0] || "";
  const slug = decodeURIComponent(rawSlug).toLowerCase().trim();

  if (!slug) {
    return NextResponse.json({ error: "Missing slug in /r/" }, { status: 400 });
  }

  let linkData: NormalizedLink | null = null;
  let debugReason = "unknown";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 1. Try Upstash Redis cache first
  if (redis) {
    try {
      const cached = await redis.get<CachedLinkData | NormalizedLink>(
        `link:${slug}`
      );
      if (cached) {
        const anyCached = cached as Record<string, unknown>;
        const dest = String(
          anyCached.destination_url || anyCached.target_url || ""
        ).trim();
        if (dest) {
          linkData = {
            id: String(anyCached.id || ""),
            slug: String(anyCached.slug || slug),
            destination_url: dest,
            promo_code: (anyCached.promo_code as string | null) ?? null,
            discount_param: (anyCached.discount_param as string | null) ?? null,
            block_coupon_sites:
              anyCached.block_coupon_sites === undefined
                ? true
                : Boolean(anyCached.block_coupon_sites),
            is_active:
              anyCached.is_active === undefined
                ? true
                : Boolean(anyCached.is_active),
            clicks: Number(anyCached.clicks || 0),
            blocked_leaks: Number(anyCached.blocked_leaks || 0),
          };
        } else {
          debugReason = "redis_cache_missing_destination_url";
        }
      } else {
        debugReason = "redis_cache_miss";
      }
    } catch (e) {
      debugReason = `redis_error:${e instanceof Error ? e.message : "unknown"}`;
    }
  } else {
    debugReason = "redis_not_configured";
  }

  // 2. Fallback to Supabase if not cached
  if (!linkData) {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          error: "Missing Supabase URL or key in middleware env",
          hasUrl: Boolean(supabaseUrl),
          hasKey: Boolean(supabaseKey),
          debugReason,
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase
      .from("creator_links")
      .select("*")
      .ilike("slug", slug)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        {
          error: "Supabase query failed in middleware",
          slug,
          dbError: error.message,
          debugReason,
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error: `No row found in creator_links for slug: ${slug}`,
          debugReason,
        },
        { status: 404 }
      );
    }

    const dest = String(data.target_url || data.destination_url || "").trim();
    if (!dest) {
      return NextResponse.json(
        {
          error:
            "Row found in creator_links but target_url/destination_url is empty",
          row: data,
        },
        { status: 400 }
      );
    }

    linkData = {
      id: String(data.id),
      slug: String(data.slug || slug),
      destination_url: dest,
      promo_code: data.promo_code ?? null,
      discount_param: data.discount_param ?? null,
      block_coupon_sites:
        data.block_coupon_sites === undefined
          ? true
          : Boolean(data.block_coupon_sites),
      is_active: data.is_active === undefined ? true : Boolean(data.is_active),
      clicks: Number(data.clicks || 0),
      blocked_leaks: Number(data.blocked_leaks || 0),
    };

    if (redis) {
      try {
        await redis.set(`link:${slug}`, linkData, { ex: 3600 });
      } catch {
        // Ignore Redis write error in dev
      }
    }
  }

  if (linkData.is_active === false) {
    return NextResponse.json(
      { error: "Creator link is marked inactive", slug },
      { status: 403 }
    );
  }

  // 3. Anti-Coupon Leak Shield Check
  const referer = request.headers.get("referer") || "";
  let refererDomain = "direct";
  let isCouponLeak = false;

  if (referer) {
    try {
      const urlObj = new URL(referer);
      refererDomain = urlObj.hostname.replace("www.", "").toLowerCase();
      if (
        linkData.block_coupon_sites !== false &&
        BLOCKED_COUPON_DOMAINS.some((domain) => refererDomain.includes(domain))
      ) {
        isCouponLeak = true;
      }
    } catch {
      refererDomain = "unknown";
    }
  }

  // Build final destination URL
  const rawDest = linkData.destination_url.trim();
  const normalizedDest =
    rawDest.startsWith("http://") || rawDest.startsWith("https://")
      ? rawDest
      : `https://${rawDest}`;

  let targetUrl: URL;
  try {
    targetUrl = new URL(normalizedDest);
  } catch {
    return NextResponse.json(
      { error: "Invalid destination URL", destination_url: rawDest },
      { status: 400 }
    );
  }

  // Carry over incoming non-discount query params
  request.nextUrl.searchParams.forEach((value, key) => {
    if (!DISCOUNT_QUERY_KEYS.includes(key.toLowerCase())) {
      targetUrl.searchParams.set(key, value);
    }
  });

  if (isCouponLeak) {
    // Strip any leaked discount parameters on coupon scraper traffic
    for (const key of DISCOUNT_QUERY_KEYS) {
      targetUrl.searchParams.delete(key);
    }
  } else {
    // Attach discount code & attribution ref ONLY for legitimate traffic
    if (linkData.promo_code) {
      targetUrl.searchParams.set("code", String(linkData.promo_code).trim());
    } else if (linkData.discount_param) {
      const [key, val] = String(linkData.discount_param).split("=");
      if (key && val) {
        targetUrl.searchParams.set(key, val);
      }
    }
    targetUrl.searchParams.set("attolink_ref", linkData.slug || slug);
  }

  // 4. Increment counters in Supabase & log attribution event
  if (supabaseUrl && supabaseKey && linkData.id) {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    if (isCouponLeak) {
      const nextBlocked = Number(linkData.blocked_leaks || 0) + 1;
      supabase
        .from("creator_links")
        .update({ blocked_leaks: nextBlocked })
        .eq("id", linkData.id)
        .then(() => {});
    } else {
      const nextClicks = Number(linkData.clicks || 0) + 1;
      supabase
        .from("creator_links")
        .update({ clicks: nextClicks })
        .eq("id", linkData.id)
        .then(() => {});
    }

    const reqWithGeo = request as NextRequest & { geo?: { country?: string } };
    const country = reqWithGeo.geo?.country || "US";

    supabase
      .from("attribution_events")
      .insert({
        link_id: linkData.id,
        event_type: isCouponLeak ? "blocked_leak" : "click",
        source_platform: isCouponLeak ? "shield" : "link",
        referer_domain: refererDomain,
        country,
      })
      .then(() => {});
  }

  // 5. Redirect & Set 30-Day Attribution Cookie ONLY when not a coupon leak
  const response = NextResponse.redirect(targetUrl.toString(), 302);

  if (!isCouponLeak) {
    response.cookies.set("attolink_ref", linkData.slug || slug, {
      maxAge: 60 * 60 * 24 * 30, // 30 Days
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/r/:path*"],
};