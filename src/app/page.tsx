"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Lock,
  Link2,
  Webhook,
  TrendingUp,
  Star,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Zap,
  ShieldAlert,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

const USE_CASES = [
  {
    quote:
      "We were spending $4,000/mo on YouTube sponsors with zero idea who was actually driving checkouts. AttoLink showed us two creators generated 85% of our attributed revenue.",
    author: "Marcus Vance",
    role: "E-Commerce Founder • DTC Skincare",
    metric: "+$6,400 Attributed Revenue",
  },
  {
    quote:
      "RetailMeNot and Honey were scraping our influencer promo codes within hours of a video going live. The Anti-Coupon Leak Shield protected our margins from day one.",
    author: "Elena Rostova",
    role: "Growth Lead • B2B SaaS",
    metric: "310+ Coupon Leaks Blocked",
  },
  {
    quote:
      "Sending creators a zero-login live scorecard link ended all the awkward end-of-month spreadsheet arguments. Creators promote harder when they see live sales.",
    author: "Devon Brooks",
    role: "Creator Partnerships • Consumer App",
    metric: "Zero-Login Live Reporting",
  },
];

const FAQS = [
  {
    question:
      "How does AttoLink track sales across any payment gateway without complex code?",
    answer:
      "When a visitor clicks your AttoLink vanity URL (/r/slug), our redirect engine sets a 30-day attribution cookie and passes a lightweight reference ID. Once the customer completes checkout on any payment gateway or store, our universal webhook automatically matches that reference ID and logs the exact dollar revenue on your dashboard.",
  },
  {
    question: "How does the Anti-Coupon Leak Shield work?",
    answer:
      "AttoLink inspects the HTTP Referer before applying your discount parameter. If visitors arrive from coupon aggregators (like Honey, RetailMeNot, or Groupon) instead of the creator's channel, AttoLink strips the discount code automatically and redirects them cleanly.",
  },
  {
    question:
      "Do influencers or YouTubers need to create an account to see their stats?",
    answer:
      "No. Every creator link automatically powers a read-only Live Scorecard URL (e.g., /stats/your-slug). You simply share that link with your creator so they can verify clicks, conversions, and revenue in real time without logging in.",
  },
  {
    question:
      "How does the 7-day free trial and link limit work before paid plans?",
    answer:
      "Every new workspace starts with a 7-day free trial ($0) allowing up to 2 active creator links with full 30-day attribution, Anti-Coupon Leak Shield, and creator scorecards. After 7 days, continue on Starter ($19/mo for up to 15 links) or Growth ($49/mo for unlimited links).",
  },
];

export default function LandingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
  }, []);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const scrollToTop = () => {
    setMobileMenuOpen(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const trialDestination = isLoggedIn ? "/dashboard" : "/login";

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Subtle Top Grid & Blue Tint */}
      <div className="absolute top-0 inset-x-0 h-[640px] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none -z-10" />
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-50/90 via-blue-50/35 to-transparent pointer-events-none -z-10" />

      {/* Sticky Glass Navigation */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          <Link
            href="/"
            onClick={scrollToTop}
            className="flex items-center gap-2 sm:gap-2.5 font-bold text-lg sm:text-xl tracking-tight group shrink-0"
            title="AttoLink Home"
          >
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-sm shadow-blue-600/20 group-hover:bg-blue-700 transition">
              A
            </span>
            <span className="text-slate-900 font-extrabold group-hover:text-blue-600 transition-colors">
              AttoLink
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-blue-600 transition">
              How it Works
            </a>
            <a href="#use-cases" className="hover:text-blue-600 transition">
              Use Cases
            </a>
            <a href="#pricing" className="hover:text-blue-600 transition">
              Pricing
            </a>
            <a href="#faq" className="hover:text-blue-600 transition">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <Link
              href="/demo"
              className="hidden sm:inline-flex items-center text-sm font-semibold text-slate-600 hover:text-blue-600 transition px-3 py-2 rounded-xl hover:bg-blue-50/60"
            >
              Live Demo
            </Link>
            <Link
              href={trialDestination}
              className="min-h-[40px] px-3.5 py-2 sm:px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition shadow-sm shadow-blue-600/20 inline-flex items-center justify-center whitespace-nowrap"
            >
              {isLoggedIn ? "Dashboard" : "7-Day Trial"}
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="md:hidden min-h-[40px] min-w-[40px] rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-1 shadow-lg">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50/70 hover:text-blue-600"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50/70 hover:text-blue-600"
            >
              How it Works
            </a>
            <a
              href="#use-cases"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50/70 hover:text-blue-600"
            >
              Use Cases
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50/70 hover:text-blue-600"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50/70 hover:text-blue-600"
            >
              FAQ
            </a>
            <div className="pt-2 mt-2 border-t border-slate-100">
              <Link
                href="/demo"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50/60 text-sm font-bold text-blue-700 hover:bg-blue-100/70"
              >
                Open Live Demo Sandbox
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section + Live Product Preview */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-10 sm:pt-16 sm:pb-12 md:pt-20 md:pb-14">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-orange-200 bg-orange-50 text-orange-600 text-xs font-bold mb-5 sm:mb-6 max-w-full">
              <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span className="truncate">
                Creator Attribution & Anti-Coupon Leak Engine
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.1] mb-5 sm:mb-6 break-words">
              Stop Guessing Which Creator Is{" "}
              <span className="text-blue-600">Actually Driving Sales.</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8 sm:mb-9 leading-relaxed">
              Launch vanity sponsor links, track verified revenue across any
              payment gateway per creator, and automatically block coupon
              scrapers from stealing your margins.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 mb-12 sm:mb-14">
              <Link
                href={trialDestination}
                className="w-full sm:w-auto min-h-[50px] px-7 sm:px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base transition shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
              >
                <span>
                  {isLoggedIn
                    ? "Go to Brand Dashboard"
                    : "Start 7-Day Free Trial"}
                </span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
              <Link
                href="/demo"
                className="w-full sm:w-auto min-h-[50px] px-7 sm:px-8 py-3.5 rounded-2xl border border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50/40 text-slate-800 font-bold text-sm sm:text-base transition shadow-2xs flex items-center justify-center gap-2"
              >
                Try Interactive Sandbox
              </Link>
            </div>
          </div>

          {/* Product Preview Card */}
          <div className="max-w-5xl mx-auto rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 overflow-hidden">
            <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              </div>
              <div className="text-[11px] font-mono text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200 truncate">
                app.attolink.io/dashboard
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Sync</span>
              </div>
            </div>

            <div className="p-4 sm:p-6 md:p-7 space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                <div className="p-4 sm:p-5 rounded-2xl border border-blue-100 bg-blue-50/40 min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Verified Creator Revenue
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">
                    $14,820.00
                  </div>
                  <div className="text-xs text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 shrink-0" />
                    <span>+34% vs last 30 days</span>
                  </div>
                </div>
                <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-slate-50/60 min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Attributed Sponsor Clicks
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                    4,912
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1.5">
                    30-Day Cookie Window Active
                  </div>
                </div>
                <div className="p-4 sm:p-5 rounded-2xl border border-orange-200/70 bg-orange-50/50 min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-orange-700">
                    Coupon Leaks Blocked
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-orange-600 mt-1">
                    148
                  </div>
                  <div className="text-xs text-orange-700 font-semibold mt-1.5 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>$2,210 margin saved</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 divide-y divide-slate-100 text-xs sm:text-sm">
                <div className="px-4 py-3 flex items-center justify-between gap-2 bg-white">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-bold text-slate-900 truncate">
                      TechWithAlex
                    </span>
                    <code className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200 font-mono shrink-0">
                      /r/alex
                    </code>
                  </div>
                  <div className="flex items-center gap-5 shrink-0">
                    <span className="text-slate-500 hidden sm:inline">
                      2,410 clicks
                    </span>
                    <span className="font-extrabold text-emerald-600">
                      $8,940.00
                    </span>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center justify-between gap-2 bg-white">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-bold text-slate-900 truncate">
                      Sara Vance
                    </span>
                    <code className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200 font-mono shrink-0">
                      /r/sara
                    </code>
                  </div>
                  <div className="flex items-center gap-5 shrink-0">
                    <span className="text-slate-500 hidden sm:inline">
                      1,680 clicks
                    </span>
                    <span className="font-extrabold text-emerald-600">
                      $5,880.00
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                <span>
                  Want to see what your influencers see without logging in?
                </span>
                <Link
                  href="/stats/demo-creator-token"
                  className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <span>Preview Live Creator Scorecard</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Free Trial CTA Strip */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-8 sm:pb-10">
          <div className="rounded-3xl border border-blue-200 bg-blue-50/70 p-5 sm:p-7 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/90 border border-orange-200 text-orange-700 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>7-Day Free Trial • Up to 2 Active Creator Links</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight text-slate-950">
                Test AttoLink Free for 7 Days — Upgrade Only When You Scale
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Start with up to 2 active creator links free for 7 days, then
                move to Starter ($19/mo for up to 15 links) or Growth ($49/mo
                for unlimited links).
              </p>
            </div>

            <Link
              href={trialDestination}
              className="w-full md:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-extrabold inline-flex items-center justify-center gap-2 transition shadow-sm shadow-blue-600/20 shrink-0"
            >
              <span>Start 7-Day Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Compact Value Proof Strip */}
        <section className="border-y border-slate-200/80 bg-slate-50/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>60-Second Universal Webhook Sync</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
              <span>Automatic Honey & RetailMeNot Referrer Block</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Zero-Login Live Scorecards for Creators</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12"
        >
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs uppercase tracking-widest text-blue-600 font-bold px-3 py-1 rounded-full bg-blue-50">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-2.5 mb-2">
              Why Modern Brands Switch to AttoLink
            </h2>
            <p className="text-slate-600 text-sm">
              Built specifically to replace messy UTM spreadsheets and bloated
              affiliate networks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs hover:shadow-md hover:border-blue-300 transition-all duration-200 group">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-1.5 text-slate-900">
                1-Click Universal Webhook ROI
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Connect your universal webhook in 60 seconds. See exact revenue
                generated by every creator link with 30-day cookie attribution.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs hover:shadow-md hover:border-blue-300 transition-all duration-200 group">
              <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-1.5 text-slate-900">
                Anti-Coupon Leak Shield
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                If visitors arrive from Honey or RetailMeNot instead of the
                creator channel, AttoLink strips the discount parameter
                automatically.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs hover:shadow-md hover:border-blue-300 transition-all duration-200 group">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-1.5 text-slate-900">
                Zero-Login Creator Scorecards
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Send influencers a private live stats URL so they can verify
                clicks and sales in real time without passwords or spreadsheets.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          className="bg-slate-50/80 border-y border-slate-200/80 py-10 sm:py-12"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs uppercase tracking-widest text-orange-600 font-bold px-3 py-1 rounded-full bg-orange-100/80">
                2-Minute Setup
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-2.5">
                How AttoLink Works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center mb-4 shadow-sm shadow-blue-600/20">
                  <Link2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-1.5 text-slate-900">
                  1. Generate a Vanity Link
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Create a clean link like{" "}
                  <code className="text-blue-600 bg-blue-50 font-semibold px-2 py-0.5 rounded break-all">
                    yourbrand.com/r/alex
                  </code>{" "}
                  with a protected promo code attached.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center mb-4 shadow-sm shadow-blue-600/20">
                  <Webhook className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-1.5 text-slate-900">
                  2. Connect Universal Webhook
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Paste your webhook URL once. AttoLink sets a 30-day
                  attribution cookie on every legitimate creator click.
                </p>
              </div>

              <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center mb-4 shadow-sm shadow-blue-600/20">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base sm:text-lg mb-1.5 text-slate-900">
                  3. Watch Revenue Grow
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  See which sponsors bring real buyers, block coupon scrapers, and
                  share live scorecards effortlessly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases & Founder Feedback */}
        <section
          id="use-cases"
          className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12"
        >
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs uppercase tracking-widest text-blue-600 font-bold px-3 py-1 rounded-full bg-blue-50">
              Built for Growth Teams
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-2.5">
              How Founders Track Every Sponsor Dollar
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {USE_CASES.map((item, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-w-0"
              >
                <div>
                  <div className="flex items-center gap-1 text-orange-400 mb-3.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-orange-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed mb-4">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>
                <div className="pt-3.5 border-t border-slate-100">
                  <div className="font-bold text-sm text-slate-900">
                    {item.author}
                  </div>
                  <div className="text-xs text-slate-500">{item.role}</div>
                  <div className="mt-2.5 inline-block text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {item.metric}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section: Consistent Blue + Slate + Orange Accent */}
        <section
          id="pricing"
          className="bg-slate-50/80 border-y border-slate-200/80 py-10 sm:py-12"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <div className="max-w-xl mx-auto mb-8">
              <span className="text-xs uppercase tracking-widest text-blue-600 font-bold px-3 py-1 rounded-full bg-blue-50">
                7-Day Free Trial Included
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-2.5 mb-2">
                Simple, High-ROI Pricing
              </h2>
              <p className="text-slate-600 text-sm">
                Start free for 7 days (up to 2 active creator links), then
                choose Starter ($19/mo) or Growth ($49/mo).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left items-stretch md:items-center">
              <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-slate-600 font-bold">
                      7-Day Free Trial
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                      Limited Links
                    </span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold my-2.5 text-slate-950">
                    $0
                    <span className="text-base font-normal text-slate-400">
                      /7 days
                    </span>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-600 my-5">
                    <li>✓ Up to 2 Active Creator Links</li>
                    <li>✓ 30-Day Cookie Attribution</li>
                    <li>✓ Anti-Coupon Leak Shield & Scorecard</li>
                  </ul>
                </div>
                <Link
                  href={trialDestination}
                  className="min-h-[44px] flex items-center justify-center text-center py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-sm transition"
                >
                  Start 7-Day Trial
                </Link>
              </div>

              <div className="p-6 sm:p-7 rounded-3xl border-2 border-blue-600 bg-white relative shadow-lg shadow-blue-900/10 md:scale-[1.02] flex flex-col justify-between min-w-0">
                <span className="absolute -top-3.5 right-5 bg-orange-500 text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                  MOST POPULAR
                </span>
                <div>
                  <div className="text-sm text-blue-600 font-bold">Starter</div>
                  <div className="text-3xl sm:text-4xl font-extrabold my-2.5 text-slate-950">
                    $19
                    <span className="text-base font-normal text-slate-400">
                      /mo
                    </span>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-600 my-5">
                    <li>✓ Up to 15 Active Creator Links</li>
                    <li>✓ 30-Day Cookie Attribution</li>
                    <li>✓ Anti-Coupon Leak Shield & Webhooks</li>
                  </ul>
                </div>
                <Link
                  href={trialDestination}
                  className="min-h-[44px] flex items-center justify-center text-center py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-sm text-white transition shadow-sm shadow-blue-600/20"
                >
                  Start With Starter
                </Link>
              </div>

              <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition flex flex-col justify-between min-w-0">
                <div>
                  <div className="text-sm text-blue-600 font-bold">Growth</div>
                  <div className="text-3xl sm:text-4xl font-extrabold my-2.5 text-slate-950">
                    $49
                    <span className="text-base font-normal text-slate-400">
                      /mo
                    </span>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-600 my-5">
                    <li>✓ Unlimited Active Creator Links</li>
                    <li>✓ Universal Order Webhooks</li>
                    <li>✓ Priority Scorecards & Leak Alerts</li>
                  </ul>
                </div>
                <Link
                  href={trialDestination}
                  className="min-h-[44px] flex items-center justify-center text-center py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-sm transition"
                >
                  Start With Growth
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section
          id="faq"
          className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12"
        >
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs uppercase tracking-widest text-blue-600 font-bold px-3 py-1 rounded-full bg-blue-50">
              FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-2.5">
              Common Questions Answered
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs hover:border-blue-200 transition"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-4 sm:px-5 py-3.5 text-left flex items-center justify-between gap-3 font-bold text-sm sm:text-base text-slate-900 hover:bg-blue-50/30 transition"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-blue-600 shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA Section in Unified Royal Blue */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-10 sm:pb-12">
          <div className="p-7 sm:p-10 rounded-3xl bg-blue-600 text-center relative overflow-hidden shadow-lg shadow-blue-600/20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 text-white">
              Ready to Track Every Sponsor Dollar?
            </h2>
            <p className="text-blue-100 max-w-xl mx-auto mb-6 text-sm md:text-base">
              Start your 7-day free trial (up to 2 creator links) in under 2
              minutes. No credit card required.
            </p>
            <Link
              href={trialDestination}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white hover:bg-blue-50 text-blue-700 font-extrabold text-sm sm:text-base transition shadow-md"
            >
              <span>
                {isLoggedIn ? "Go to Brand Workspace" : "Launch Brand Workspace"}
              </span>
              <ArrowRight className="w-5 h-5 shrink-0" />
            </Link>
          </div>
        </section>
      </main>

      {/* Matching Soft Blue-Slate Footer */}
      <footer className="border-t border-blue-200/80 bg-gradient-to-b from-blue-50/70 via-slate-50 to-blue-100/50 text-slate-600 py-9 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-7">
          <div className="sm:col-span-2 space-y-2.5">
            <Link
              href="/"
              onClick={scrollToTop}
              className="inline-flex items-center gap-2 font-bold text-xl text-slate-900 hover:text-blue-600 transition-colors"
            >
              <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-2xs">
                A
              </span>
              <span>AttoLink</span>
            </Link>
            <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
              Creator attribution infrastructure and anti-coupon leak protection
              for fast-growing e-commerce and SaaS brands.
            </p>
          </div>

          <div>
            <h4 className="text-slate-900 font-bold text-sm mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#features"
                  className="hover:text-blue-600 transition"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-blue-600 transition"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-blue-600 transition"
                >
                  Pricing
                </a>
              </li>
              <li>
                <Link
                  href="/demo"
                  className="hover:text-blue-600 transition"
                >
                  Live Demo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-900 font-bold text-sm mb-3">
              Legal & Support
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-blue-600 transition"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-blue-600 transition"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@attolink.app"
                  className="hover:text-blue-600 transition break-all"
                >
                  support@attolink.app
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 border-t border-blue-200/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 text-center sm:text-left">
          <p>© {new Date().getFullYear()} AttoLink. All rights reserved.</p>
          <p>Built for transparent Creator & Brand partnerships.</p>
        </div>
      </footer>
    </div>
  );
}