"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/dashboard");
      } else {
        setCheckingSession(false);
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          router.push("/dashboard");
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) {
          setErrorMsg(error.message);
        } else if (data.session) {
          router.push("/dashboard");
        } else {
          setInfoMsg(
            "Account created! If email confirmation is enabled in Supabase, please check your inbox or sign in directly."
          );
          setMode("signin");
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-white text-slate-600 flex items-center justify-center font-medium px-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Checking active session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition shrink-0"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Home</span>
          </Link>

          <Link
            href="/demo"
            className="text-xs sm:text-sm font-bold text-blue-600 hover:underline whitespace-nowrap"
          >
            Try Live Demo →
          </Link>
        </div>
      </header>

      {/* Auth Card Container - Left Aligned Inside Card */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md p-6 sm:p-10 rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 text-left">
          {/* Clickable Brand Logo */}
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 mb-5 sm:mb-6 group text-left"
            title="AttoLink Home"
          >
            <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-sm shadow-blue-600/20 group-hover:bg-blue-700 transition shrink-0">
              A
            </span>
            <div className="text-left">
              <div className="font-extrabold text-lg leading-none text-slate-950 group-hover:text-blue-600 transition-colors">
                AttoLink
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Creator Attribution &amp; ROI Workspace
              </div>
            </div>
          </Link>

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 border border-slate-200/80 mb-5 sm:mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMsg("");
                setInfoMsg("");
              }}
              className={`min-h-[40px] py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                mode === "signin"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMsg("");
                setInfoMsg("");
              }}
              className={`min-h-[40px] py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                mode === "signup"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Create Account
            </button>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950 mb-1.5 text-left">
            {mode === "signin"
              ? "Welcome back"
              : "Start tracking creator ROI"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mb-5 sm:mb-6 leading-relaxed text-left">
            {mode === "signin"
              ? "Sign in to manage your creator attribution links and revenue."
              : "Create your brand account to launch vanity links in minutes."}
          </p>

          {errorMsg && (
            <div className="mb-4 sm:mb-5 p-3.5 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold break-words text-left">
              {errorMsg}
            </div>
          )}

          {infoMsg && (
            <div className="mb-4 sm:mb-5 p-3.5 rounded-2xl border border-blue-200 bg-blue-50 text-blue-800 text-xs font-semibold break-words text-left">
              {infoMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} method="post" className="space-y-4 text-left">
            <div className="text-left">
              <label
                htmlFor="email"
                className="block text-xs font-bold text-slate-700 mb-1.5 text-left"
              >
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username email"
                  placeholder="founder@yourbrand.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[46px] pl-11 pr-4 py-3 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm text-left text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition"
                  required
                />
              </div>
            </div>

            <div className="text-left">
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 mb-1.5 text-left"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  className="w-full min-h-[46px] pl-11 pr-11 py-3 rounded-2xl bg-slate-50/80 border border-slate-200 text-sm text-left text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1.5"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[48px] py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 mt-2"
            >
              {loading ? (
                mode === "signin" ? (
                  "Signing in..."
                ) : (
                  "Creating account..."
                )
              ) : (
                <>
                  <span>
                    {mode === "signin"
                      ? "Sign In to Dashboard"
                      : "Create Free Account"}
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500 text-left">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-600">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Supabase Auth Protected</span>
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-orange-600">
              <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span>30-Day Attribution</span>
            </span>
          </div>
        </div>
      </main>

      {/* Matching Soft Blue-Slate Footer */}
      <footer className="border-t border-blue-200/80 bg-gradient-to-b from-blue-50/70 via-slate-50 to-blue-100/50 text-slate-600 py-5 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 text-left">
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