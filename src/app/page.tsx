import React from "react";
import {
  ArrowRight,
  CircleUserRound,
  Sparkles,
  Github,
  Shield,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="app-theme-bg overflow-hidden text-white">
      <nav className="relative z-20 border-b border-white/10 bg-black/35 px-4 py-4 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="text-3xl font-bold tracking-wide theme-title"
              style={{ fontFamily: "var(--font-rajdhani), sans-serif" }}
            >
              RESUMIND
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm sm:gap-6">
            <div className="hidden items-center gap-2 rounded-full border border-violet-400/40 bg-violet-500/15 px-4 py-2 text-violet-200 sm:flex">
              <Sparkles className="h-4 w-4" />
              <span>10 credits</span>
            </div>
            <span className="hidden text-zinc-300 sm:inline">Usage</span>
            <Link
              href="/user/register"
              className="theme-button-primary px-5 py-2.5 text-sm font-semibold"
            >
              Upload Resume
            </Link>
            <div className="rounded-full border-2 border-violet-300/55 bg-zinc-900/80 p-1">
              <CircleUserRound className="h-8 w-8 text-zinc-300" />
            </div>
          </div>
        </div>
      </nav>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-76px)] w-full max-w-7xl items-center px-6 py-16 text-center sm:px-10">
        <div className="mx-auto w-full max-w-4xl">
          <h1
            className="text-6xl font-bold tracking-wide theme-title sm:text-7xl md:text-8xl"
            style={{ fontFamily: "var(--font-rajdhani), sans-serif" }}
          >
            RESUMIND
          </h1>
          <div className="mx-auto mt-5 h-1.5 w-full max-w-2xl rounded-full bg-linear-to-r from-violet-500 via-fuchsia-500 to-blue-500" />
          <h2 className="mt-8 text-4xl font-semibold text-slate-100 sm:text-5xl">
            AI-Powered Resume Analysis
          </h2>
          <p className="theme-subtitle mx-auto mt-6 max-w-3xl text-xl leading-relaxed">
            Transform your resume with secure authentication and polished user
            journeys. Launch fast, protect user data, and ship with confidence.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/user/login"
              className="theme-button-primary inline-flex items-center gap-2 px-8 py-4 text-2xl font-bold sm:text-3xl"
            >
              Analyze Your Resume
              <ArrowRight className="h-8 w-8" />
            </Link>
            <Link
              href="https://github.com/talhabilal-dev/next-auth-kit"
              target="_blank"
              className="theme-button-secondary px-8 py-4 text-base font-semibold"
            >
              View Source
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20 sm:px-10">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="theme-card rounded-2xl p-6">
            <Shield className="h-7 w-7 text-violet-300" />
            <h3 className="mt-4 text-xl font-semibold">Secure by design</h3>
            <p className="theme-subtitle mt-2 text-sm leading-relaxed">
              JWT auth flows, protected routes, and robust token handling out
              of the box.
            </p>
          </div>

          <div className="theme-card rounded-2xl p-6">
            <Zap className="h-7 w-7 text-pink-300" />
            <h3 className="mt-4 text-xl font-semibold">Fast onboarding</h3>
            <p className="theme-subtitle mt-2 text-sm leading-relaxed">
              Polished login, register, verification, and reset flows with a
              consistent UX.
            </p>
          </div>

          <div className="theme-card rounded-2xl p-6">
            <Github className="h-7 w-7 text-blue-300" />
            <h3 className="mt-4 text-xl font-semibold">Developer first</h3>
            <p className="theme-subtitle mt-2 text-sm leading-relaxed">
              Type-safe patterns and clean API routes that are easy to extend
              for production.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
