import React from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import {
  CheckCircle2,
  MousePointerClick,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Percent,
  DollarSign,
  Award,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface ScorecardData {
  creatorName: string;
  slug: string;
  promoCode: string;
  clicks: number;
  conversions: number;
  revenue: number;
  commissionRate: number;
  isLiveRecord: boolean;
}

async function getScorecardData(rawToken: string): Promise<ScorecardData | null> {
  const cleaned = decodeURIComponent(rawToken || "").trim();
  const normalizedToken = cleaned.toLowerCase();

  if (!normalizedToken) {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: {
          fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }),
        },
      });

      const { data: dbLink } = await supabase
        .from("creator_links")
        .select("id, creator_name, slug, promo_code, clicks, sales, revenue")
        .ilike("slug", normalizedToken)
        .maybeSingle();

      if (dbLink) {
        return {
          creatorName: dbLink.creator_name || `Creator (${dbLink.slug})`,
          slug: dbLink.slug,
          promoCode: dbLink.promo_code || "PARTNER",
          clicks: Number(dbLink.clicks || 0),
          conversions: Number(dbLink.sales || 0),
          revenue: Number(dbLink.revenue || 0),
          commissionRate: 0.15,
          isLiveRecord: true,
        };
      }
    } catch {
      // Fallback preview if query fails
    }
  }

  return {
    creatorName:
      normalizedToken === "demo-creator-token"
        ? "TechWithAlex (YouTube)"
        : `Creator (${cleaned})`,
    slug: normalizedToken,
    promoCode: "CREATOR15",
    clicks: normalizedToken === "demo-creator-token" ? 1840 : 0,
    conversions: normalizedToken === "demo-creator-token" ? 64 : 0,
    revenue: normalizedToken === "demo-creator-token" ? 5120 : 0,
    commissionRate: 0.15,
    isLiveRecord: false,
  };
}

export default async function CreatorPublicScorecard({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getScorecardData(token);

  if (!data) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center px-4 text-left">
        <div className="max-w-md w-full p-8 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-4 text-left">
          <h1 className="text-xl font-extrabold text-slate-950">
            Scorecard Not Found
          </h1>
          <p className="text-sm text-slate-600">
            Invalid creator scorecard token.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition shadow-sm shadow-blue-600/20"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const conversionRate =
    data.clicks > 0
      ? `${((data.conversions / data.clicks) * 100).toFixed(2)}%`
      : "0.00%";

  const estimatedCommission = data.revenue * data.commissionRate;
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  const shareUrl = `${baseUrl}/r/${data.slug}`;
  const initials = data.creatorName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 group min-w-0"
            title="AttoLink Home"
          >
            <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm shadow-blue-600/20 group-hover:bg-blue-700 transition shrink-0">
              A
            </span>
            <span className="font-extrabold text-sm sm:text-base text-slate-950 group-hover:text-blue-600 transition-colors truncate">
              AttoLink Scorecard
            </span>
          </Link>

          <div className="px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>
              {data.isLiveRecord ? "Live Webhook Sync" : "Preview Mode"}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-7 sm:py-9 space-y-5 flex-1 text-left">
        {/* Creator Header Card - Left Aligned */}
        <div className="rounded-3xl border border-blue-200/80 bg-blue-50/40 p-6 sm:p-7 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5 text-left">
          <div className="flex items-start sm:items-center gap-4 min-w-0 text-left">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg sm:text-xl font-extrabold shadow-sm shadow-blue-600/20 shrink-0">
              {initials || "CR"}
            </div>

            <div className="min-w-0 space-y-1.5 text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span>Verified Sponsor Scorecard</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight truncate">
                {data.creatorName}
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600">
                <code className="text-blue-700 bg-white border border-blue-200 px-2.5 py-0.5 rounded-lg font-mono text-xs font-semibold">
                  /r/{data.slug}
                </code>
                <span className="text-slate-300">•</span>
                <span className="bg-white border border-slate-200 text-slate-800 px-2.5 py-0.5 rounded-lg font-mono text-xs">
                  Promo: <strong>{data.promoCode}</strong>
                </span>
              </div>
            </div>
          </div>

          <a
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full md:w-auto h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition shadow-sm shadow-blue-600/20 shrink-0"
          >
            <span>Open Sponsor Link</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* 4 Balanced KPI Cards - Left Aligned */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 transition min-w-0 text-left">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2.5">
              <span>Clicks</span>
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <MousePointerClick className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              {data.clicks.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>30-day window + shield</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-blue-200/80 bg-blue-50/30 shadow-2xs hover:border-blue-300 transition min-w-0 text-left">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2.5">
              <span>Sales</span>
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight">
              {data.conversions.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Verified conversions</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 transition min-w-0 text-left">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2.5">
              <span>Conv. Rate</span>
              <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Percent className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              {conversionRate}
            </div>
            <div className="text-xs text-slate-500 mt-1.5">
              Sales / audience clicks
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 transition min-w-0 text-left">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2.5">
              <span>Revenue</span>
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight truncate">
              $
              {data.revenue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <div className="text-xs text-slate-500 mt-1.5">
              Total attributed sales
            </div>
          </div>
        </div>

        {/* Payout Summary Strip - Left Aligned */}
        <div className="p-5 sm:p-6 rounded-3xl border border-blue-200 bg-blue-50/60 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
          <div className="flex items-start gap-3.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-left">
              <div className="text-xs font-extrabold uppercase tracking-wider text-blue-700">
                Estimated Creator Payout ({Math.round(data.commissionRate * 100)}% Commission)
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                Automatically calculated from verified webhook conversions.
              </p>
            </div>
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight shrink-0">
            $
            {estimatedCommission.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-slate-500 px-1 text-left">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Zero-login transparent scorecard powered by AttoLink. Protected by Anti-Coupon Leak Shield.
          </span>
        </div>
      </main>

      {/* Matching Soft Blue-Slate Footer */}
      <footer className="border-t border-blue-200/80 bg-gradient-to-b from-blue-50/70 via-slate-50 to-blue-100/50 py-5 text-center text-xs text-slate-500 px-4">
        Powered by{" "}
        <Link href="/" className="text-blue-600 hover:underline font-semibold">
          AttoLink
        </Link>{" "}
        — Creator Attribution Infrastructure
      </footer>
    </div>
  );
}