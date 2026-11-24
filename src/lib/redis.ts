import { Redis } from "@upstash/redis/cloudflare";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

// Initialize Upstash Redis (Edge/Middleware & Node safe) if credentials exist
export const redis =
  redisUrl &&
  redisToken &&
  !redisUrl.includes("your_upstash_url") &&
  !redisToken.includes("your_upstash_token")
    ? new Redis({
        url: redisUrl,
        token: redisToken,
      })
    : null;

export interface CachedLinkData {
  id: string;
  destination_url: string;
  discount_param: string;
  block_coupon_sites: boolean;
  is_active: boolean;
}

export async function getCachedLink(
  slug: string
): Promise<CachedLinkData | null> {
  if (!redis) return null;
  try {
    const cached = await redis.get<CachedLinkData>(`link:${slug}`);
    return cached ?? null;
  } catch {
    return null;
  }
}

export async function setCachedLink(
  slug: string,
  data: CachedLinkData,
  ttlSeconds = 60
): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(`link:${slug}`, data, { ex: ttlSeconds });
  } catch {
    // Cache write failure should not block primary request flow
  }
}

export async function deleteCachedLink(slug: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(`link:${slug}`);
  } catch {
    // Ignore cache invalidation errors
  }
}