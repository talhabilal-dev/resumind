"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CircleDollarSign,
  ChevronRight,
  FileSearch,
  LayoutList,
  Sparkles,
  Target,
} from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const Page: React.FC = () => {
  const router = useRouter();
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch("/api/users/profile");
        const payload = await response.json();
        if (response.ok && payload?.user && typeof payload.user.credits === "number") {
          setCredits(payload.user.credits);
        }
      } catch {
        // Keep dashboard usable even if profile fetch fails.
      }
    };

    fetchCredits();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-rose-500/10 bg-background/70 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="border border-rose-500/20 bg-white/5 hover:bg-white/10" />
            <div>
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">Resume Dashboard</h1>
              <p className="text-sm text-foreground/65">Track resume quality and optimize before applying.</p>
            </div>
          </div>

          <Button
            type="button"
            className="gradient-accent border-0 text-white"
            onClick={() => router.push("/user/dashboard/tasks")}
          >
            Select Analysis Task
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="p-4 sm:p-6">
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Resume Score", value: "84/100", icon: Target, hint: "+6 this week" },
            { label: "ATS Match", value: "91%", icon: FileSearch, hint: "Strong keyword fit" },
            { label: "Analyses", value: "12", icon: LayoutList, hint: "3 in last 7 days" },
            { label: "AI Suggestions", value: "27", icon: Sparkles, hint: "9 pending actions" },
          ].map((card) => (
            <article key={card.label} className="glow-card rounded-xl bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-foreground/70">{card.label}</p>
                <card.icon className="h-4 w-4 text-rose-300" />
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="mt-1 text-xs text-foreground/60">{card.hint}</p>
            </article>
          ))}
        </section>

        <section className="mb-6">
          <article className="glow-card rounded-xl border border-rose-500/20 bg-white/5 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-foreground/70">Available Credits</p>
                <div className="mt-1 flex items-end gap-2">
                  <p className="text-3xl font-bold text-foreground">
                    {credits === null ? "--" : credits}
                  </p>
                  <p className="pb-1 text-xs text-foreground/60">
                    {credits === null
                      ? "Loading balance..."
                      : `~$${(credits * 0.1).toFixed(2)} value at 1 credit = $0.10`}
                  </p>
                </div>
                <p className="mt-2 text-sm text-foreground/75">
                  Full Resume Analysis: 5 credits, Job Match: 3, Cover Letter: 4, Bullet Optimization: 1, Full Rewrite: 8.
                </p>
              </div>

              <Button
                type="button"
                className="gradient-accent border-0 text-white"
                onClick={() => router.push("/user/dashboard/credits")}
              >
                <CircleDollarSign className="mr-2 h-4 w-4" />
                Buy Credits
              </Button>
            </div>
          </article>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <article className="lg:col-span-2 glow-card rounded-xl bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-foreground">Recent Resume Analyses</h2>
            <p className="mt-1 text-sm text-foreground/65">Your latest analysis results and score trends.</p>
            <div className="mt-4 space-y-3">
              {[
                { name: "Product Manager Resume", score: "84", date: "2 hours ago" },
                { name: "Frontend Engineer Resume", score: "78", date: "Yesterday" },
                { name: "Data Analyst Resume", score: "88", date: "3 days ago" },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-lg border border-rose-500/15 bg-black/20 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-foreground/60">{item.date}</p>
                  </div>
                  <span className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-sm text-rose-200">
                    {item.score}/100
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="glow-card rounded-xl bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-foreground">Priority Actions</h2>
            <p className="mt-1 text-sm text-foreground/65">Top improvements to boost interview chances.</p>
            <ul className="mt-4 space-y-3 text-sm text-foreground/80">
              <li className="rounded-lg border border-rose-500/15 bg-black/20 px-3 py-2">Add measurable outcomes to 2 experience bullets.</li>
              <li className="rounded-lg border border-rose-500/15 bg-black/20 px-3 py-2">Improve ATS keyword coverage for target roles.</li>
              <li className="rounded-lg border border-rose-500/15 bg-black/20 px-3 py-2">Shorten summary section for stronger clarity.</li>
            </ul>
          </article>
        </section>
      </main>
    </>
  );
};

export default Page;
