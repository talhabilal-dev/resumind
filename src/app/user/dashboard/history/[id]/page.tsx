"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";
import { ArrowLeft, CalendarClock, Download, FileText, Sparkles } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";

type DetailPayload = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  task: string | null;
  workflow: string;
  creditsUsed: number;
  atsScore: number | null;
  keywords: string[];
  aiMetadata: {
    lastAnalyzedAt?: string;
    tokensUsed?: number;
  } | null;
  parsedData: {
    task?: string;
    jobTitle?: string;
    jobDescription?: string;
    output?: any;
    safeguards?: {
      validationPassed?: boolean;
      citationCoverage?: number;
      warnings?: string[];
    };
  };
  rawText: string;
};

type FeedbackTip = {
  type: "good" | "improve";
  tip: string;
  explanation: string;
};

type FeedbackCategory = {
  score: number;
  tips: FeedbackTip[];
};

type PdfFeedbackOutput = {
  overallScore: number;
  toneAndStyle: FeedbackCategory;
  content: FeedbackCategory;
  structure: FeedbackCategory;
  skills: FeedbackCategory;
};

function isPdfFeedbackOutput(value: any): value is PdfFeedbackOutput {
  return Boolean(
    value &&
      typeof value === "object" &&
      typeof value.overallScore === "number" &&
      value.toneAndStyle &&
      value.content &&
      value.structure &&
      value.skills
  );
}

function FeedbackCategoryCard({
  title,
  data,
}: {
  title: string;
  data: FeedbackCategory;
}) {
  return (
    <article className="rounded-xl border border-rose-500/20 bg-black/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span className="rounded-md border border-rose-500/35 bg-rose-500/15 px-2 py-1 text-xs text-rose-100">
          {data.score}/100
        </span>
      </div>

      <div className="space-y-2">
        {data.tips.map((tip, index) => (
          <div
            key={`${title}-${index}-${tip.tip}`}
            className="rounded-lg border border-rose-500/15 bg-white/5 p-3"
          >
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-[11px] uppercase",
                  tip.type === "good"
                    ? "bg-emerald-500/20 text-emerald-200"
                    : "bg-amber-500/20 text-amber-200",
                ].join(" ")}
              >
                {tip.type}
              </span>
              {tip.tip}
            </p>
            <p className="mt-1 text-sm text-foreground/80">{tip.explanation}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function formatDateTime(value?: string): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export default function ResumeHistoryDetailPage() {
  const params = useParams<{ id: string }>();
  const id = String(params?.id || "");

  const [details, setDetails] = React.useState<DetailPayload | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/users/resume/history/${id}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const payload = await response.json();
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.error || "Failed to load history details.");
        }

        if (mounted) {
          setDetails(payload.details || null);
        }
      } catch (fetchError: any) {
        if (mounted) {
          setError(fetchError?.message || "Failed to load history details.");
          setDetails(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      run();
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  const output = details?.parsedData?.output || {};
  const safeguards = details?.parsedData?.safeguards || {};
  const isPdfAnalysisTask = details?.task === "pdf_resume_analysis";
  const pdfOutput = isPdfFeedbackOutput(output) ? output : null;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-rose-500/10 bg-background/70 px-4 py-4 backdrop-blur-md sm:px-6 print:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="border border-rose-500/20 bg-white/5 hover:bg-white/10" />
            <div>
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">History Detail</h1>
              <p className="text-sm text-foreground/65">Detailed analysis output for this run.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/user/dashboard/history"
              className="inline-flex items-center gap-2 rounded-md border border-rose-500/25 bg-white/5 px-3 py-2 text-sm text-foreground hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-md border border-rose-500/25 bg-rose-500/15 px-3 py-2 text-sm text-rose-100 hover:bg-rose-500/25"
            >
              <Download className="h-4 w-4" />
              Export to PDF
            </button>
          </div>
        </div>
      </header>

      <main className="space-y-6 p-4 sm:p-6">
        {loading ? (
          <div className="rounded-xl border border-rose-500/15 bg-black/20 px-4 py-10 text-center text-sm text-foreground/70">
            Loading history details...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-10 text-center text-sm text-red-200">
            {error}
          </div>
        ) : !details ? (
          <div className="rounded-xl border border-rose-500/15 bg-black/20 px-4 py-10 text-center text-sm text-foreground/70">
            History record not found.
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <article className="glow-card rounded-xl bg-white/5 p-4">
                <p className="text-sm text-foreground/70">Workflow</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{details.workflow}</p>
              </article>

              <article className="glow-card rounded-xl bg-white/5 p-4">
                <p className="text-sm text-foreground/70">Job Title</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {details.parsedData?.jobTitle || details.title || "-"}
                </p>
              </article>

              <article className="glow-card rounded-xl bg-white/5 p-4">
                <p className="text-sm text-foreground/70">ATS Score</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {typeof details.atsScore === "number" ? `${details.atsScore}/100` : "-"}
                </p>
              </article>
            </section>

            <section className="rounded-xl glow-card bg-white/5 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-rose-300" />
                <h2 className="text-lg font-semibold text-foreground">Run Metadata</h2>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm text-foreground/80 sm:grid-cols-2">
                <p><span className="text-foreground/60">Created:</span> {formatDateTime(details.createdAt)}</p>
                <p><span className="text-foreground/60">Updated:</span> {formatDateTime(details.updatedAt)}</p>
                <p><span className="text-foreground/60">Credits Used:</span> {details.creditsUsed}</p>
                <p><span className="text-foreground/60">Tokens Used:</span> {details.aiMetadata?.tokensUsed ?? "-"}</p>
              </div>
            </section>

            <section className="rounded-xl glow-card bg-white/5 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-rose-300" />
                <h2 className="text-lg font-semibold text-foreground">Summary</h2>
              </div>
              {isPdfAnalysisTask && pdfOutput ? (
                <p className="whitespace-pre-wrap text-sm text-foreground/85">
                  This report was generated from uploaded resume analysis with AI category scoring and
                  targeted recommendations.
                </p>
              ) : (
                <p className="whitespace-pre-wrap text-sm text-foreground/85">
                  {output?.summary || "No summary available."}
                </p>
              )}
            </section>

            {isPdfAnalysisTask && pdfOutput ? (
              <>
                <section className="rounded-xl glow-card bg-white/5 p-5 sm:p-6">
                  <h2 className="text-lg font-semibold text-foreground">Overall Score</h2>
                  <p className="mt-2 text-sm text-foreground/80">
                    {pdfOutput.overallScore}/100
                  </p>
                </section>

                <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <FeedbackCategoryCard title="Tone & Style" data={pdfOutput.toneAndStyle} />
                  <FeedbackCategoryCard title="Content" data={pdfOutput.content} />
                  <FeedbackCategoryCard title="Structure" data={pdfOutput.structure} />
                  <FeedbackCategoryCard title="Skills" data={pdfOutput.skills} />
                </section>
              </>
            ) : null}

            {!isPdfAnalysisTask ? (
              <section className="rounded-xl glow-card bg-white/5 p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-foreground">Recommendations</h2>
                {Array.isArray(output?.recommendations) && output.recommendations.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {output.recommendations.map((item: any, index: number) => (
                      <article key={`${index}-${item?.title || "rec"}`} className="rounded-lg border border-rose-500/15 bg-black/20 p-3">
                        <p className="font-medium text-foreground">{item?.title || `Recommendation ${index + 1}`}</p>
                        <p className="mt-1 text-sm text-foreground/80">{item?.rationale || ""}</p>
                        <p className="mt-1 text-sm text-rose-100">{item?.action || ""}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-foreground/70">No recommendations available.</p>
                )}
              </section>
            ) : null}

            {!isPdfAnalysisTask ? (
              <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <article className="rounded-xl glow-card bg-white/5 p-5 sm:p-6">
                  <h2 className="text-lg font-semibold text-foreground">Optimized Bullets</h2>
                  {Array.isArray(output?.optimizedBullets) && output.optimizedBullets.length > 0 ? (
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground/85">
                      {output.optimizedBullets.map((bullet: string, idx: number) => (
                        <li key={`${idx}-${bullet.slice(0, 20)}`}>{bullet}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-foreground/70">No optimized bullets available.</p>
                  )}
                </article>

                <article className="rounded-xl glow-card bg-white/5 p-5 sm:p-6">
                  <h2 className="text-lg font-semibold text-foreground">Missing Keywords</h2>
                  {Array.isArray(output?.missingKeywords) && output.missingKeywords.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {output.missingKeywords.map((keyword: string) => (
                        <span key={keyword} className="rounded-full border border-rose-500/30 bg-rose-500/15 px-2.5 py-1 text-xs text-rose-100">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-foreground/70">No missing keywords found.</p>
                  )}
                </article>
              </section>
            ) : null}

            {!isPdfAnalysisTask && output?.coverLetterDraft ? (
              <section className="rounded-xl glow-card bg-white/5 p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-foreground">Cover Letter Draft</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm text-foreground/85">{output.coverLetterDraft}</p>
              </section>
            ) : null}

            {!isPdfAnalysisTask && output?.rewrittenResume ? (
              <section className="rounded-xl glow-card bg-white/5 p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-foreground">Rewritten Resume</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm text-foreground/85">{output.rewrittenResume}</p>
              </section>
            ) : null}

            <section className="rounded-xl glow-card bg-white/5 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-foreground">Safeguards</h2>
              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-foreground/80 sm:grid-cols-2">
                <p>
                  <span className="text-foreground/60">Validation Passed:</span>{" "}
                  {typeof safeguards?.validationPassed === "boolean"
                    ? safeguards.validationPassed
                      ? "Yes"
                      : "No"
                    : "-"}
                </p>
                <p>
                  <span className="text-foreground/60">Citation Coverage:</span>{" "}
                  {typeof safeguards?.citationCoverage === "number"
                    ? `${Math.round(safeguards.citationCoverage * 100)}%`
                    : "-"}
                </p>
              </div>

              {Array.isArray(safeguards?.warnings) && safeguards.warnings.length > 0 ? (
                <div className="mt-3 rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-100">
                  {safeguards.warnings.map((warning: string, idx: number) => (
                    <p key={`${idx}-${warning.slice(0, 20)}`}>{warning}</p>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="rounded-xl border border-rose-500/20 bg-black/20 p-4 text-xs text-foreground/70">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-rose-300" />
                <p>
                  Export uses your browser print dialog. Choose "Save as PDF" to download this
                  report as a PDF file.
                </p>
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
