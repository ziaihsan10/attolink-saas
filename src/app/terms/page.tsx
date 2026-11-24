import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition shrink-0"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 font-extrabold text-sm text-slate-950 hover:text-blue-600 transition shrink-0"
          >
            <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-2xs">
              A
            </span>
            <span>AttoLink</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-12 space-y-6 flex-1 text-left">
        <div className="p-5 sm:p-6 rounded-3xl border border-blue-200/80 bg-blue-50/40 text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-blue-700 font-semibold mt-1.5">
            Last updated: November 2026
          </p>
        </div>

        <section className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2 text-sm text-slate-600 leading-relaxed text-left">
          <h2 className="text-base font-bold text-slate-950">
            1. Use of Service
          </h2>
          <p>
            By using AttoLink, you agree to create vanity redirect links only for
            lawful commercial destinations and to comply with applicable
            advertising disclosure rules for creator partnerships.
          </p>
        </section>

        <section className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2 text-sm text-slate-600 leading-relaxed text-left">
          <h2 className="text-base font-bold text-slate-950">
            2. Subscriptions &amp; Billing
          </h2>
          <p>
            Paid plans are billed monthly and can be canceled at any time from
            your workspace settings.
          </p>
        </section>

        <section className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2 text-sm text-slate-600 leading-relaxed text-left">
          <h2 className="text-base font-bold text-slate-950">3. Support</h2>
          <p>
            Questions regarding these terms may be sent to{" "}
            <a
              href="mailto:support@attolink.app"
              className="text-blue-600 font-semibold hover:underline break-all"
            >
              support@attolink.app
            </a>
            .
          </p>
        </section>
      </main>

      {/* Matching Soft Blue-Slate Footer */}
      <footer className="border-t border-blue-200/80 bg-gradient-to-b from-blue-50/70 via-slate-50 to-blue-100/50 text-slate-600 py-5 mt-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500 text-left">
          <p className="font-semibold text-slate-700">
            AttoLink • Creator Attribution &amp; Coupon Leak Shield
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