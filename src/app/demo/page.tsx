"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  MousePointerClick,
  DollarSign,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

interface DemoCampaign {
  id: string;
  creatorName: string;
  channel: string;
  slug: string;
  promoCode: string;
  targetUrl: string;
  clicks: number;
  sales: number;
  revenue: number;
  blockedLeaks: number;
}

const INITIAL_CAMPAIGNS: DemoCampaign[] = [
  {
    id: "1",
    creatorName: "Ali Abdaal",
    channel: "YouTube • 5.4M Subs",
    slug: "ali",
    promoCode: "ALI20",
    targetUrl: "https://yourbrand.com/pricing",
    clicks: 1240,
    sales: 48,
    revenue: 4752,
    blockedLeaks: 19,
  },
  {
    id: "2",
    creatorName: "Sara Vance",
    channel: "TikTok • 890K Followers",
    slug: "sara",
    promoCode: "SARA15",
    targetUrl: "https://yourbrand.com/bundle",
    clicks: 865,
    sales: 31,
    revenue: 2480,
    blockedLeaks: 12,
  },
];

export default function DemoPage() {
  const [campaigns, setCampaigns] = useState<DemoCampaign[]>(INITIAL_CAMPAIGNS);
  const [selectedId, setSelectedId] = useState<string>("1");
  const [copiedSlug, setCopiedSlug] = useState<string>("");
  const [lastEvent, setLastEvent] = useState<string>(
    "Sandbox ready. Test a creator click, simulate a Stripe checkout, or test the Anti-Coupon Leak Shield."
  );

  const [newCreator, setNewCreator] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newCode, setNewCode] = useState("");

  const activeCampaign =
    campaigns.find((c) => c.id === selectedId) || campaigns[0];

  const handleAddDemoLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCreator.trim() || !newSlug.trim()) return;

    const cleanSlug = newSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "");

    if (!cleanSlug) return;

    const created: DemoCampaign = {
      id: Date.now().toString(),
      creatorName: newCreator.trim(),
      channel: "Creator Partner",
      slug: cleanSlug,
      promoCode: (newCode.trim() || `${cleanSlug.toUpperCase()}15`).toUpperCase(),
      targetUrl: "https://yourbrand.com",
      clicks: 0,
      sales: 0,
      revenue: 0,
      blockedLeaks: 0,
    };

    setCampaigns((prev) => [created, ...prev]);
    setSelectedId(created.id);
    setNewCreator("");
    setNewSlug("");
    setNewCode("");
    setLastEvent(
      `Created demo vanity link /r/${cleanSlug} for ${created.creatorName}.`
    );
  };

  const simulateLegitimateClick = () => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === activeCampaign.id ? { ...c, clicks: c.clicks + 1 } : c
      )
    );
    setLastEvent(
      `Legitimate click tracked on /r/${activeCampaign.slug}. 30-day attribution cookie set & promo code ${activeCampaign.promoCode} preserved.`
    );
  };

  const simulateCheckoutSale = (amount: number) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === activeCampaign.id
          ? { ...c, sales: c.sales + 1, revenue: c.revenue + amount }
          : c
      )
    );
    setLastEvent(
      `Webhook matched! +$${amount} checkout attributed to ${activeCampaign.creatorName} (/r/${activeCampaign.slug}).`
    );
  };

  const simulateCouponScraper = () => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === activeCampaign.id
          ? { ...c, blockedLeaks: c.blockedLeaks + 1 }
          : c
      )
    );
    setLastEvent(
      `Anti-Coupon Leak Shield triggered! Honey/RetailMeNot referrer detected on /r/${activeCampaign.slug} — discount code ${activeCampaign.promoCode} stripped before redirect.`
    );
  };

  const handleCopy = (slug: string) => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/r/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(""), 2000);
  };

  const handleReset = () => {
    setCampaigns(INITIAL_CAMPAIGNS);
    setSelectedId("1");
    setLastEvent("Demo sandbox reset to initial sample data.");
  };

  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalBlocked = campaigns.reduce((sum, c) => sum + c.blockedLeaks, 0);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 min-h-16 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition shrink-0"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>Home</span>
            </Link>
            <span className="h-4 w-px bg-slate-200 shrink-0" />
            <Link
              href="/"
              className="flex items-center gap-2 min-w-0 group"
              title="AttoLink Home"
            >
              <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm shadow-blue-600/20 shrink-0 group-hover:bg-blue-700 transition">
                A
              </span>
              <span className="font-extrabold text-xs sm:text-sm text-slate-950 group-hover:text-blue-600 transition-colors truncate">
                AttoLink Demo
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Sandbox Mode</span>
            </span>
            <Link
              href="/login"
              className="px-3 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition shadow-sm shadow-blue-600/20 whitespace-nowrap"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8 flex-1 w-full text-left">
        {/* Header Banner - Left Aligned */}
        <div className="p-5 sm:p-7 rounded-3xl border border-slate-200 bg-white shadow-2xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6 text-left">
          <div className="min-w-0 text-left">
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              Test Attribution, Checkouts &amp; Coupon Leak Protection
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
              No login required. Pick a creator campaign below and simulate real
              clicks, Stripe/Shopify conversions, or coupon scraper attacks.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto self-start lg:self-auto min-h-[42px] px-4 py-2.5 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50 hover:bg-blue-50/40 text-slate-700 text-xs font-bold inline-flex items-center justify-center gap-2 transition shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Sandbox</span>
          </button>
        </div>

        {/* Live Event Feed Strip */}
        <div className="p-3.5 sm:p-4 rounded-2xl border border-blue-200 bg-blue-50/70 text-blue-950 text-xs sm:text-sm font-medium flex items-start sm:items-center gap-3 text-left">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 animate-pulse mt-1 sm:mt-0" />
          <span className="break-words min-w-0">{lastEvent}</span>
        </div>

        {/* Top KPI Cards - Left Aligned */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-5 sm:p-6 rounded-3xl border border-blue-200/80 bg-blue-50/40 shadow-2xs hover:shadow-md hover:border-blue-300 transition min-w-0 text-left">
            <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 sm:mb-2">
              Demo Tracked Revenue
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight">
              ${totalRevenue.toLocaleString()}.00
            </div>
            <div className="text-xs text-blue-700 font-semibold mt-2">
              Live 30-day attribution sum
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs hover:shadow-md hover:border-blue-200 transition min-w-0 text-left">
            <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 sm:mb-2">
              Demo Total Clicks
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              {totalClicks.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-2">
              Across {campaigns.length} active creator links
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl border border-orange-200/80 bg-orange-50/40 shadow-2xs hover:shadow-md hover:border-orange-300 transition min-w-0 text-left">
            <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 sm:mb-2">
              Coupon Leaks Blocked
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-orange-600 tracking-tight">
              {totalBlocked.toLocaleString()}
            </div>
            <div className="text-xs text-orange-700 font-semibold mt-2">
              Protected by Anti-Coupon Shield
            </div>
          </div>
        </div>

        {/* Simulator + Campaign Selector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left: Simulator Controls - Left Aligned */}
          <div className="lg:col-span-2 p-5 sm:p-8 rounded-3xl border border-slate-200 bg-white shadow-2xs space-y-5 sm:space-y-6 min-w-0 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-slate-100">
              <div className="min-w-0 text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  Selected Campaign
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 mt-0.5 flex flex-wrap items-center gap-2">
                  <span>{activeCampaign.creatorName}</span>
                  <span className="text-xs sm:text-sm font-mono font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                    /r/{activeCampaign.slug}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-1 break-words">
                  {activeCampaign.channel} • Promo Code:{" "}
                  <strong className="text-orange-600 font-mono">
                    {activeCampaign.promoCode}
                  </strong>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopy(activeCampaign.slug)}
                  className="flex-1 sm:flex-initial min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50 hover:bg-blue-50/60 text-xs font-bold text-slate-700 inline-flex items-center justify-center gap-1.5 transition"
                >
                  {copiedSlug === activeCampaign.slug ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-blue-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
                <Link
                  href={`/r/${activeCampaign.slug}`}
                  className="flex-1 sm:flex-initial min-h-[40px] px-3.5 py-2 rounded-xl border border-blue-200 hover:border-blue-300 bg-blue-50/60 hover:bg-blue-100/60 text-xs font-bold text-blue-700 inline-flex items-center justify-center gap-1.5 transition"
                >
                  <span>Open Route</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Active Campaign Stats - Left Aligned */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-left">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left">
                <div className="text-xs text-slate-500 font-bold">Clicks</div>
                <div className="text-lg sm:text-xl font-extrabold text-slate-950 mt-1">
                  {activeCampaign.clicks}
                </div>
              </div>
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left">
                <div className="text-xs text-slate-500 font-bold">Sales</div>
                <div className="text-lg sm:text-xl font-extrabold text-slate-950 mt-1">
                  {activeCampaign.sales}
                </div>
              </div>
              <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-left">
                <div className="text-xs text-blue-700 font-bold">Revenue</div>
                <div className="text-lg sm:text-xl font-extrabold text-blue-600 mt-1">
                  ${activeCampaign.revenue}
                </div>
              </div>
              <div className="p-3.5 sm:p-4 rounded-2xl bg-orange-50/70 border border-orange-200/80 text-left">
                <div className="text-xs text-orange-700 font-bold">
                  Leaks Blocked
                </div>
                <div className="text-lg sm:text-xl font-extrabold text-orange-600 mt-1">
                  {activeCampaign.blockedLeaks}
                </div>
              </div>
            </div>

            {/* Action Buttons - Left Aligned */}
            <div className="space-y-3 pt-1 text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Simulate Real-Time Events
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                <button
                  type="button"
                  onClick={simulateLegitimateClick}
                  className="min-h-[56px] p-4 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/40 text-left transition flex items-center gap-3 shadow-2xs hover:-translate-y-0.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <MousePointerClick className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-sm font-bold text-slate-950">
                      1. Simulate Creator Click
                    </div>
                    <div className="text-xs text-slate-500">
                      Sets 30-day cookie &amp; applies promo
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => simulateCheckoutSale(120)}
                  className="min-h-[56px] p-4 rounded-2xl border border-blue-200/90 hover:border-blue-500 bg-blue-50/30 hover:bg-blue-50/70 text-left transition flex items-center gap-3 shadow-2xs hover:-translate-y-0.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-sm font-bold text-slate-950">
                      2. Simulate $120 Checkout
                    </div>
                    <div className="text-xs text-slate-600">
                      Triggers Stripe/Shopify webhook match
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={simulateCouponScraper}
                  className="sm:col-span-2 min-h-[56px] p-4 rounded-2xl border border-orange-200 hover:border-orange-400 bg-orange-50/40 hover:bg-orange-50 text-left transition flex items-center justify-between gap-3 hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3 min-w-0 text-left">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="text-sm font-bold text-slate-950">
                        3. Trigger Anti-Coupon Leak Shield
                      </div>
                      <div className="text-xs text-slate-600">
                        Blocks leaked discount parameter from Honey / RetailMeNot
                      </div>
                    </div>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-orange-600 shrink-0 hidden sm:block" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Add Quick Demo Link + Switcher - Left Aligned */}
          <div className="space-y-6 min-w-0 text-left">
            <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs text-left">
              <h3 className="text-sm font-extrabold text-slate-950 mb-3.5">
                Add Quick Sandbox Link
              </h3>
              <form onSubmit={handleAddDemoLink} className="space-y-3">
                <input
                  type="text"
                  placeholder="Creator Name (e.g. Hamza)"
                  value={newCreator}
                  onChange={(e) => setNewCreator(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-sm text-left text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600"
                  required
                />
                <input
                  type="text"
                  placeholder="Slug (e.g. hamza)"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-sm text-left text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600"
                  required
                />
                <input
                  type="text"
                  placeholder="Promo Code (e.g. HAMZA20)"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-sm text-left text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600"
                />
                <button
                  type="submit"
                  className="w-full min-h-[44px] py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-sm shadow-blue-600/20"
                >
                  + Add to Sandbox
                </button>
              </form>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs text-left">
              <h3 className="text-sm font-extrabold text-slate-950 mb-3">
                Sandbox Campaigns ({campaigns.length})
              </h3>
              <div className="space-y-2.5">
                {campaigns.map((item) => {
                  const isSelected = item.id === activeCampaign.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={`w-full min-h-[52px] p-3.5 rounded-2xl border text-left transition flex items-center justify-between gap-2 ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/70"
                          : "border-slate-200 hover:border-blue-200 bg-white"
                      }`}
                    >
                      <div className="min-w-0 text-left">
                        <div className="text-sm font-bold text-slate-950 truncate">
                          {item.creatorName}
                        </div>
                        <div className="text-xs font-mono text-blue-600 font-semibold">
                          /r/{item.slug}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-extrabold text-blue-600">
                          ${item.revenue}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.clicks} clicks
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Matching Soft Blue-Slate Footer */}
      <footer className="border-t border-blue-200/80 bg-gradient-to-b from-blue-50/70 via-slate-50 to-blue-100/50 text-slate-600 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 text-left">
          <p className="font-semibold text-slate-700">
            AttoLink Sandbox • Interactive Attribution &amp; Leak Shield Demo
          </p>
          <div className="flex flex-wrap items-center gap-4 font-semibold">
            <Link href="/" className="hover:text-blue-600 transition">
              Home
            </Link>
            <Link href="/dashboard" className="hover:text-blue-600 transition">
              Dashboard
            </Link>
            <Link
              href="/stats/demo-creator-token"
              className="hover:text-blue-600 transition"
            >
              Scorecard Preview
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}