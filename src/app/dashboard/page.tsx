"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Zap,
  LogOut,
  Plus,
  Copy,
  Check,
  Sparkles,
  Link2,
  Home,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

const FREE_TRIAL_ACTIVE_LINK_LIMIT = 2;
const STARTER_ACTIVE_LINK_LIMIT = 15;

function getActiveLinkLimit(planTier?: string | null): number | null {
  const tier = (planTier || "free").toLowerCase().trim();
  if (tier === "growth" || tier === "agency") {
    return null; // Unlimited
  }
  if (tier === "starter") {
    return STARTER_ACTIVE_LINK_LIMIT;
  }
  return FREE_TRIAL_ACTIVE_LINK_LIMIT;
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [planTier, setPlanTier] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState<any[]>([]);
  const [eventBlockedLeaks, setEventBlockedLeaks] = useState<number>(0);
  const [copiedSlug, setCopiedSlug] = useState("");
  const [limitNotice, setLimitNotice] = useState("");

  const [creatorName, setCreatorName] = useState("");
  const [slug, setSlug] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const fetchWorkspaceData = useCallback(async (userId: string) => {
    const { data: brandRow } = await supabase
      .from("brands")
      .select("plan_tier")
      .eq("user_id", userId)
      .maybeSingle();

    const resolvedTier = brandRow?.plan_tier || "free";
    setPlanTier(resolvedTier);

    const { data: userLinks } = await supabase
      .from("creator_links")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const safeLinks = userLinks || [];
    setLinks(safeLinks);

    if (safeLinks.length > 0) {
      const linkIds = safeLinks.map((item) => item.id).filter(Boolean);
      if (linkIds.length > 0) {
        const { count } = await supabase
          .from("attribution_events")
          .select("id", { count: "exact", head: true })
          .in("link_id", linkIds)
          .eq("event_type", "blocked_leak");

        setEventBlockedLeaks(Number(count || 0));
      } else {
        setEventBlockedLeaks(0);
      }
    } else {
      setEventBlockedLeaks(0);
    }
  }, []);

  useEffect(() => {
    async function getUserAndLinks() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      setUser(session.user);
      await fetchWorkspaceData(session.user.id);
      setLoading(false);
    }

    getUserAndLinks();
  }, [router, fetchWorkspaceData]);

  const activeLinksCount = links.filter(
    (item) => item.is_active !== false
  ).length;
  const activeLinkLimit = getActiveLinkLimit(planTier);
  const isAtLimit =
    activeLinkLimit !== null && activeLinksCount >= activeLinkLimit;

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLimitNotice("");

    if (isAtLimit && activeLinkLimit !== null) {
      setLimitNotice(
        `7-Day Free Trial allows up to ${activeLinkLimit} active creator links. Upgrade to Starter ($19/mo for 15 links) or Growth ($49/mo for unlimited links) to add more.`
      );
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("creator_links").insert([
      {
        user_id: user.id,
        creator_name: creatorName,
        slug: slug.toLowerCase().trim(),
        target_url: targetUrl,
        promo_code: promoCode,
        clicks: 0,
        sales: 0,
        revenue: 0,
        blocked_leaks: 0,
        is_active: true,
      },
    ]);

    if (error) {
      alert("Error creating link: " + error.message);
    } else {
      setCreatorName("");
      setSlug("");
      setTargetUrl("");
      setPromoCode("");
      await fetchWorkspaceData(user.id);
    }
    setSubmitting(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const copyToClipboard = (slugText: string) => {
    const fullUrl = `${window.location.origin}/r/${slugText}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slugText);
    setTimeout(() => setCopiedSlug(""), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-600 flex items-center justify-center font-medium px-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading your secure workspace...</span>
        </div>
      </div>
    );
  }

  const totalClicks = links.reduce(
    (acc, curr) => acc + Number(curr.clicks || 0),
    0
  );
  const totalRevenue = links.reduce(
    (acc, curr) => acc + Number(curr.revenue || 0),
    0
  );
  const linkBlockedLeaks = links.reduce(
    (acc, curr) => acc + Number(curr.blocked_leaks || 0),
    0
  );
  const totalBlockedLeaks = Math.max(linkBlockedLeaks, eventBlockedLeaks);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 min-h-16 py-2.5 flex items-center justify-between gap-2">
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 group min-w-0"
            title="Go to Home Page"
          >
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-sm shadow-blue-600/20 group-hover:bg-blue-700 transition shrink-0">
              A
            </span>
            <div className="min-w-0 text-left">
              <div className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                AttoLink Workspace
              </div>
              <div className="text-[10px] sm:text-[11px] text-blue-600 flex items-center gap-1.5 font-semibold truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                <span>Universal Webhook Ready</span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Link
              href="/"
              className="sm:hidden w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-blue-50/50 text-slate-700 flex items-center justify-center transition"
              aria-label="Home"
            >
              <Home className="w-4 h-4" />
            </Link>
            <span className="text-xs text-slate-600 hidden lg:inline bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-mono max-w-[200px] truncate">
              {user?.email}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-3 sm:px-3.5 py-2 rounded-xl border border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50/40 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs active:scale-95 whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8 flex-1 w-full">
        {/* Metric Cards - Left Aligned */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-5 sm:p-6 rounded-3xl border border-blue-200/80 bg-blue-50/40 shadow-2xs hover:shadow-md hover:border-blue-300 transition duration-200 min-w-0 text-left">
            <div className="text-[11px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5 sm:mb-2">
              Verified Creator Revenue
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight break-words">
              ${totalRevenue.toLocaleString()}.00
            </div>
            <div className="text-xs text-blue-700 mt-2.5 sm:mt-3 flex items-center gap-1.5 font-semibold">
              <Zap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Universal Webhook Attribution</span>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs hover:shadow-md hover:border-blue-200 transition duration-200 min-w-0 text-left">
            <div className="text-[11px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5 sm:mb-2">
              Total Sponsor Clicks
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              {totalClicks.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-2.5 sm:mt-3 font-medium">
              30-Day Attribution Window Active
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl border border-orange-200/80 bg-orange-50/40 shadow-2xs hover:shadow-md hover:border-orange-300 transition duration-200 min-w-0 text-left">
            <div className="text-[11px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5 sm:mb-2">
              Coupon Leaks Blocked
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-orange-600 tracking-tight">
              {totalBlockedLeaks.toLocaleString()}
            </div>
            <div className="text-xs text-orange-700 mt-2.5 sm:mt-3 font-semibold">
              Anti-Coupon Shield Enabled
            </div>
          </div>
        </div>

        {/* Create Link Section - Left Aligned */}
        <div className="p-5 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-2xs text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-5">
            <h2 className="text-sm sm:text-base font-extrabold flex items-center gap-2 text-slate-950">
              <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
              <span>Create New Sponsor Attribution Link</span>
            </h2>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 w-fit">
              {activeLinkLimit !== null
                ? `Active Links: ${activeLinksCount} / ${activeLinkLimit} (${planTier.toUpperCase()} Plan)`
                : `Active Links: ${activeLinksCount} (Unlimited)`}
            </span>
          </div>

          {limitNotice && (
            <div className="mb-4 p-3.5 rounded-2xl border border-orange-200 bg-orange-50 text-orange-800 text-xs font-semibold flex items-start gap-2.5 text-left">
              <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <span>{limitNotice}</span>
            </div>
          )}

          <form
            onSubmit={handleCreateLink}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="min-w-0 text-left">
              <label className="block text-xs text-slate-600 mb-1.5 font-bold">
                Creator / Channel Name
              </label>
              <input
                type="text"
                placeholder="e.g. Ali Abdaal"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm text-left focus:outline-none focus:bg-white focus:border-blue-600 transition text-slate-900 placeholder:text-slate-400"
                required
              />
            </div>
            <div className="min-w-0 text-left">
              <label className="block text-xs text-slate-600 mb-1.5 font-bold">
                Vanity Slug (/r/slug)
              </label>
              <input
                type="text"
                placeholder="e.g. ali"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm text-left focus:outline-none focus:bg-white focus:border-blue-600 transition text-slate-900 placeholder:text-slate-400"
                required
              />
            </div>
            <div className="min-w-0 text-left">
              <label className="block text-xs text-slate-600 mb-1.5 font-bold">
                Target Landing URL
              </label>
              <input
                type="url"
                placeholder="https://yourbrand.com"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm text-left focus:outline-none focus:bg-white focus:border-blue-600 transition text-slate-900 placeholder:text-slate-400"
                required
              />
            </div>
            <div className="min-w-0 text-left">
              <label className="block text-xs text-slate-600 mb-1.5 font-bold">
                Promo Code
              </label>
              <input
                type="text"
                placeholder="e.g. VIP20"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm text-left focus:outline-none focus:bg-white focus:border-blue-600 transition text-slate-900 placeholder:text-slate-400"
                required
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4 flex justify-stretch sm:justify-end pt-1 sm:pt-2">
              <button
                type="submit"
                disabled={submitting || isAtLimit}
                className="w-full sm:w-auto min-h-[46px] px-7 sm:px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>
                  {submitting
                    ? "Creating Link..."
                    : isAtLimit
                    ? "Trial Link Limit Reached (2/2)"
                    : "Create Link"}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Links Section: Left-Aligned Cards on Mobile, Table on Desktop */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-2xs overflow-hidden text-left">
          <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-slate-200/80 bg-slate-50/60 font-extrabold text-sm text-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span>Active Creator Campaigns ({links.length})</span>
            <span className="text-xs text-slate-500 font-normal">
              Tap copy to share tracking link or open Stats
            </span>
          </div>

          {links.length === 0 ? (
            <div className="p-10 sm:p-16 text-center text-sm text-slate-500 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Link2 className="w-5 h-5" />
              </div>
              <p>
                No creator attribution links created yet. Create your first link
                above!
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Stacked Campaign Cards - Left Aligned */}
              <div className="md:hidden divide-y divide-slate-100 text-left">
                {links.map((link) => {
                  const statsHref = `/stats/${encodeURIComponent(
                    String(link.slug || "")
                  )}`;

                  return (
                    <div key={link.id} className="p-4 space-y-3 text-left">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 text-left">
                          <div className="font-bold text-sm text-slate-900 truncate">
                            {link.creator_name}
                          </div>
                          <div className="text-xs text-orange-600 font-mono font-semibold mt-0.5 truncate">
                            code={link.promo_code} • {link.blocked_leaks || 0}{" "}
                            leaks blocked
                          </div>
                        </div>
                        <code className="text-xs bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200 text-blue-700 font-mono font-semibold shrink-0">
                          /r/{link.slug}
                        </code>
                      </div>

                      <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50/90 border border-slate-200/80 text-left">
                        <div className="min-w-0 text-left">
                          <div className="text-[10px] font-bold uppercase text-slate-400">
                            Clicks
                          </div>
                          <div className="text-sm font-bold text-slate-900 mt-0.5">
                            {link.clicks || 0}
                          </div>
                        </div>
                        <div className="min-w-0 text-left">
                          <div className="text-[10px] font-bold uppercase text-slate-400">
                            Sales
                          </div>
                          <div className="text-sm font-bold text-slate-900 mt-0.5">
                            {link.sales || 0}
                          </div>
                        </div>
                        <div className="min-w-0 text-left">
                          <div className="text-[10px] font-bold uppercase text-slate-400">
                            Revenue
                          </div>
                          <div className="text-sm font-extrabold text-blue-600 mt-0.5 truncate">
                            ${(link.revenue || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(link.slug)}
                          className="min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 text-xs font-bold text-slate-700 inline-flex items-center justify-center gap-1.5 transition shadow-2xs active:scale-[0.99]"
                        >
                          {copiedSlug === link.slug ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>Copied Link!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>

                        <Link
                          href={statsHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-h-[42px] px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition shadow-2xs active:scale-[0.99]"
                        >
                          <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                          <span>Stats</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 bg-slate-50 text-xs uppercase tracking-wider">
                      <th className="px-8 py-4 font-bold">Creator</th>
                      <th className="px-8 py-4 font-bold">Tracking Link</th>
                      <th className="px-8 py-4 font-bold">Clicks</th>
                      <th className="px-8 py-4 font-bold">Sales</th>
                      <th className="px-8 py-4 font-bold">Verified Revenue</th>
                      <th className="px-8 py-4 font-bold text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {links.map((link) => {
                      const statsHref = `/stats/${encodeURIComponent(
                        String(link.slug || "")
                      )}`;

                      return (
                        <tr
                          key={link.id}
                          className="hover:bg-blue-50/25 transition"
                        >
                          <td className="px-8 py-5 font-bold text-slate-900">
                            {link.creator_name}
                            <div className="text-xs text-orange-600 font-mono font-semibold mt-0.5">
                              code={link.promo_code} •{" "}
                              {link.blocked_leaks || 0} blocked
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <code className="text-xs bg-blue-50 px-2.5 py-1.5 rounded-xl border border-blue-200 text-blue-700 font-mono font-semibold">
                              /r/{link.slug}
                            </code>
                          </td>
                          <td className="px-8 py-5 text-slate-700 font-semibold">
                            {link.clicks || 0}
                          </td>
                          <td className="px-8 py-5 text-slate-700 font-semibold">
                            {link.sales || 0}
                          </td>
                          <td className="px-8 py-5 font-extrabold text-blue-600">
                            ${(link.revenue || 0).toLocaleString()}.00
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="inline-flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => copyToClipboard(link.slug)}
                                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 transition shadow-2xs active:scale-95"
                              >
                                {copiedSlug === link.slug ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Copy Link</span>
                                  </>
                                )}
                              </button>

                              <Link
                                href={statsHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition shadow-2xs active:scale-95"
                              >
                                <BarChart3 className="w-3.5 h-3.5" />
                                <span>Stats</span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Matching Soft Blue-Slate Footer */}
      <footer className="border-t border-blue-200/80 bg-gradient-to-b from-blue-50/70 via-slate-50 to-blue-100/50 text-slate-600 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 text-left">
          <p className="font-semibold text-slate-700">
            AttoLink Workspace • Creator Attribution &amp; Leak Shield
          </p>
          <div className="flex flex-wrap items-center gap-4 font-semibold">
            <Link href="/demo" className="hover:text-blue-600 transition">
              Live Demo
            </Link>
            <Link href="/privacy" className="hover:text-blue-600 transition">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-blue-600 transition">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}