"use client";

import React from "react";
import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  Coins,
  Sparkles,
  XCircle,
} from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";

type ResumeHistoryStatus = "completed" | "processing" | "failed";

type ResumeHistoryItem = {
  id: string;
  createdAt: string;
  jobTitle: string;
  workflow: string;
  creditsUsed: number;
  score: number | null;
  status: ResumeHistoryStatus;
};

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

const STATUS_STYLES: Record<
  ResumeHistoryStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  completed: {
    label: "Completed",
    className: "border-emerald-400/35 bg-emerald-500/15 text-emerald-200",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  processing: {
    label: "Processing",
    className: "border-amber-400/35 bg-amber-500/15 text-amber-200",
    icon: <CircleDashed className="h-3.5 w-3.5" />,
  },
  failed: {
    label: "Failed",
    className: "border-red-400/35 bg-red-500/15 text-red-200",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

const ResumeHistoryPage: React.FC = () => {
  const [historyData, setHistoryData] = React.useState<ResumeHistoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/users/resume/history", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const payload = await response.json();
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.error || "Failed to load resume history.");
        }

        if (mounted) {
          setHistoryData(Array.isArray(payload.history) ? payload.history : []);
        }
      } catch (fetchError: any) {
        if (mounted) {
          setError(fetchError?.message || "Failed to load resume history.");
          setHistoryData([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, []);

  const totalCreditsUsed = historyData.reduce((acc, item) => acc + item.creditsUsed, 0);
  const completedCount = historyData.filter((item) => item.status === "completed").length;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-rose-500/10 bg-background/70 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="border border-rose-500/20 bg-white/5 hover:bg-white/10" />
          <div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">Resume History</h1>
            <p className="text-sm text-foreground/65">
              View processing history as metadata only. No resume files are exposed here.
            </p>
          </div>
        </div>
      </header>

      <main className="space-y-6 p-4 sm:p-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <article className="glow-card rounded-xl bg-white/5 p-4">
            <p className="text-sm text-foreground/70">Total History Records</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{historyData.length}</p>
          </article>

          <article className="glow-card rounded-xl bg-white/5 p-4">
            <p className="text-sm text-foreground/70">Completed Runs</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{completedCount}</p>
          </article>

          <article className="glow-card rounded-xl bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm text-foreground/70">
              <Coins className="h-4 w-4 text-rose-300" />
              Total Credits Used
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{totalCreditsUsed}</p>
          </article>
        </section>

        <section className="rounded-xl glow-card bg-white/5 p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-rose-300" />
            <h2 className="text-lg font-semibold text-foreground">History Timeline</h2>
          </div>
          <p className="text-sm text-foreground/65">
            Includes job target, workflow, credits used, score and status. No file downloads.
          </p>

          <div className="mt-4 overflow-x-auto">
            {loading ? (
              <div className="rounded-lg border border-rose-500/15 bg-black/20 px-4 py-8 text-center text-sm text-foreground/70">
                Loading resume history...
              </div>
            ) : error ? (
              <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-8 text-center text-sm text-red-200">
                {error}
              </div>
            ) : historyData.length === 0 ? (
              <div className="rounded-lg border border-rose-500/15 bg-black/20 px-4 py-8 text-center text-sm text-foreground/70">
                No resume history found yet.
              </div>
            ) : (
            <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-foreground/65">Date</th>
                  <th className="px-3 py-2 text-foreground/65">Job Title</th>
                  <th className="px-3 py-2 text-foreground/65">Workflow</th>
                  <th className="px-3 py-2 text-foreground/65">Credits</th>
                  <th className="px-3 py-2 text-foreground/65">Score</th>
                  <th className="px-3 py-2 text-foreground/65">Status</th>
                  <th className="px-3 py-2 text-foreground/65">Details</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((item) => {
                  const status = STATUS_STYLES[item.status];
                  return (
                    <tr key={item.id} className="rounded-lg bg-black/20">
                      <td className="rounded-l-lg border-y border-l border-rose-500/15 px-3 py-3 text-foreground/80">
                        {formatDateTime(item.createdAt)}
                      </td>
                      <td className="border-y border-rose-500/15 px-3 py-3 font-medium text-foreground">
                        {item.jobTitle}
                      </td>
                      <td className="border-y border-rose-500/15 px-3 py-3 text-foreground/80">
                        {item.workflow}
                      </td>
                      <td className="border-y border-rose-500/15 px-3 py-3 text-rose-200">
                        {item.creditsUsed}
                      </td>
                      <td className="border-y border-rose-500/15 px-3 py-3 text-foreground/85">
                        {item.score ? `${item.score}/100` : "-"}
                      </td>
                      <td className="rounded-r-lg border-y border-r border-rose-500/15 px-3 py-3">
                        <span
                          className={[
                            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs",
                            status.className,
                          ].join(" ")}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                      </td>
                      <td className="rounded-r-lg border-y border-r border-rose-500/15 px-3 py-3">
                        <Link
                          href={`/user/dashboard/history/${item.id}`}
                          className="inline-flex items-center rounded-md border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs text-rose-100 hover:bg-rose-500/20"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-rose-500/20 bg-black/20 p-4 text-xs text-foreground/70">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-rose-300" />
            <p>
              This page intentionally shows only analysis metadata and usage data, not uploaded
              resume files.
            </p>
          </div>
        </section>
      </main>
    </>
  );
};

export default ResumeHistoryPage;
