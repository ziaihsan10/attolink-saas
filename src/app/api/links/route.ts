import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { redis, type CachedLinkData } from "@/lib/redis";

// GET all creator links
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("creator_links")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ links: data ?? [] });
}

// POST create a new sponsor attribution link & cache in Upstash Redis
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      brand_id,
      creator_name,
      slug,
      destination_url,
      discount_param,
      block_coupon_sites,
    } = body ?? {};

    const cleanCreatorName = String(creator_name || "").trim();
    const cleanDestinationUrl = String(destination_url || "").trim();
    const cleanSlug = String(slug || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "");

    if (!cleanCreatorName || !cleanSlug || !cleanDestinationUrl) {
      return NextResponse.json(
        { error: "creator_name, valid slug, and destination_url are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("creator_links")
      .insert({
        brand_id: brand_id || null,
        creator_name: cleanCreatorName,
        slug: cleanSlug,
        destination_url: cleanDestinationUrl,
        discount_param: String(discount_param || "").trim(),
        block_coupon_sites: block_coupon_sites ?? true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Cache immediately in Upstash Redis without letting cache errors fail the request
    if (redis && data) {
      const payload: CachedLinkData = {
        id: String(data.id),
        destination_url: String(data.destination_url || cleanDestinationUrl),
        discount_param: String(data.discount_param || ""),
        block_coupon_sites: data.block_coupon_sites ?? true,
        is_active: data.is_active ?? true,
      };

      try {
        await redis.set(`link:${cleanSlug}`, payload, { ex: 86400 });
      } catch {
        // Ignore Redis cache write failure
      }
    }

    return NextResponse.json({ link: data }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}