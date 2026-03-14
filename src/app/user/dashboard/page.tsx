"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CircleDollarSign,
  ChevronRight,
  FileSearch,
  History,
  ReceiptText,
  Sparkles,
  TrendingUp,
  Target,
} from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

type HistoryItem = {
  id: string;
  createdAt: string;
  jobTitle: string;
  workflow: string;
  creditsUsed: number;
  score: number | null;
};

type TransactionItem = {
  _id: string;
  amount: number;
  type: "purchase" | "usage" | "refund";
  description: string;
  createdAt: string;
};

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

const Page: React.FC = () => {
  const router = useRouter();
  const [credits, setCredits] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [profileRes, historyRes, txRes] = await Promise.all([
          fetch("/api/users/profile", { cache: "no-store" }),
          fetch("/api/users/resume/history?page=1&limit=5", { cache: "no-store" }),
          fetch("/api/users/credits/transactions?page=1&limit=5", { cache: "no-store" }),
        ]);

        const [profilePayload, historyPayload, txPayload] = await Promise.all([
          profileRes.json().catch(() => ({})),
          historyRes.json().catch(() => ({})),
          txRes.json().catch(() => ({})),
        ]);

        if (
          profileRes.ok &&
          profilePayload?.user &&
          typeof profilePayload.user.credits === "number"
        ) {
          setCredits(profilePayload.user.credits);
        }

        if (historyRes.ok && Array.isArray(historyPayload?.history)) {
          setHistory(historyPayload.history);
          setHistoryTotal(
            typeof historyPayload?.pagination?.totalItems === "number"
              ? historyPayload.pagination.totalItems
              : historyPayload.history.length
          );
        }

        if (txRes.ok && Array.isArray(txPayload?.transactions)) {
          setTransactions(txPayload.transactions);
        }
      } catch {
        // Keep dashboard usable even if profile fetch fails.
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const avgScore = (() => {
    const validScores = history
      .map((item) => item.score)
      .filter((score): score is number => typeof score === "number");
    if (validScores.length === 0) {
      return null;
    }

    const total = validScores.reduce((acc, score) => acc + score, 0);
    return Math.round(total / validScores.length);
  })();

  const spentCredits = transactions
    .filter((item) => item.type === "usage")
    .reduce((acc, item) => acc + item.amount, 0);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-rose-500/10 bg-background/70 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="border border-rose-500/20 bg-white/5 hover:bg-white/10" />
            <div>
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">Resume Dashboard</h1>
              <p className="text-sm text-foreground/65">Track analysis performance and generate stronger CV versions.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-rose-500/30 bg-white/5 text-foreground hover:bg-white/10"
              onClick={() => router.push("/user/dashboard/pdf-analysis")}
            >
              PDF Analysis
            </Button>
            <Button
              type="button"
              className="gradient-accent border-0 text-white"
              onClick={() => router.push("/user/dashboard/jd-analysis")}
            >
              Analyze CV + JD
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6">
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Average ATS Score",
              value: avgScore === null ? "--" : `${avgScore}/100`,
              icon: Target,
              hint: "From recent analysis history",
            },
            {
              label: "Total Analyses",
              value: loading ? "--" : String(historyTotal),
              icon: FileSearch,
              hint: "Across resume and CV+JD workflows",
            },
            {
              label: "Credits Available",
              value: credits === null ? "--" : String(credits),
              icon: CircleDollarSign,
              hint: "Current balance",
            },
            {
              label: "Credits Spent (Recent)",
              value: String(spentCredits),
              icon: Sparkles,
              hint: "From latest transactions page",
            },
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
                    CV + JD analysis and improved CV generation consume credits. Cached analysis results are free.
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
            <p className="mt-1 text-sm text-foreground/65">Latest history items from your account.</p>
            <div className="mt-4 space-y-3">
              {history.length === 0 ? (
                <div className="rounded-lg border border-rose-500/15 bg-black/20 px-4 py-8 text-center text-sm text-foreground/70">
                  No analysis history found yet.
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-rose-500/15 bg-black/20 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.jobTitle}</p>
                      <p className="text-xs text-foreground/60">
                        {item.workflow} · {formatDateTime(item.createdAt)}
                      </p>
                    </div>
                    <span className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-sm text-rose-200">
                      {typeof item.score === "number" ? `${item.score}/100` : "-"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="glow-card rounded-xl bg-white/5 p-5">
            <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
            <p className="mt-1 text-sm text-foreground/65">Jump into the most common workflows.</p>
            <ul className="mt-4 space-y-3 text-sm text-foreground/80">
              <li className="rounded-lg border border-rose-500/15 bg-black/20 px-3 py-2">
                <button
                  type="button"
                  onClick={() => router.push("/user/dashboard/jd-analysis")}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="inline-flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-rose-300" />
                    Run CV + JD analysis
                  </span>
                  <ChevronRight className="h-4 w-4 text-foreground/50" />
                </button>
              </li>
              <li className="rounded-lg border border-rose-500/15 bg-black/20 px-3 py-2">
                <button
                  type="button"
                  onClick={() => router.push("/user/dashboard/pdf-analysis")}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="inline-flex items-center gap-2">
                    <FileSearch className="h-4 w-4 text-rose-300" />
                    Analyze uploaded PDF CV
                  </span>
                  <ChevronRight className="h-4 w-4 text-foreground/50" />
                </button>
              </li>
              <li className="rounded-lg border border-rose-500/15 bg-black/20 px-3 py-2">
                <button
                  type="button"
                  onClick={() => router.push("/user/dashboard/history")}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="inline-flex items-center gap-2">
                    <History className="h-4 w-4 text-rose-300" />
                    View history and regenerate CV
                  </span>
                  <ChevronRight className="h-4 w-4 text-foreground/50" />
                </button>
              </li>
            </ul>

            <div className="mt-4 rounded-lg border border-rose-500/15 bg-black/20 p-3 text-xs text-foreground/70">
              <p className="inline-flex items-center gap-2">
                <CalendarClock className="h-3.5 w-3.5 text-rose-300" />
                Recent transactions: {transactions.length}
              </p>
              <p className="mt-1 inline-flex items-center gap-2">
                <ReceiptText className="h-3.5 w-3.5 text-rose-300" />
                Track full usage in Transactions.
              </p>
            </div>
          </article>
        </section>
      </main>
    </>
  );
};

export default Page;
