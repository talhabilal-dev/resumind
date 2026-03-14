"use client"

import React, { useRef, useState } from "react"
import {
  AlertCircle,
  BarChart2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Loader2,
  Search,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Upload,
  XCircle,
  Zap,
} from "lucide-react"
import { toast } from "sonner"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  JD_ANALYSIS_CREDIT_COST,
  JD_IMPROVED_CV_CREDIT_COST,
  type JdAnalysisOutput,
  type ImprovementSuggestion,
} from "@/schemas/jdAnalysisSchema"

// ─── Types ────────────────────────────────────────────────────────────────────
type AnalysisState = {
  analysisId: string
  analysis: JdAnalysisOutput
  cached: boolean
  creditsCharged: number
  creditsRemaining?: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ScoreRing({
  value,
  label,
  size = 96,
}: {
  value: number
  label: string
  size?: number
}) {
  const r = 38
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  const colour =
    value >= 75 ? "#22c55e" : value >= 50 ? "#f59e0b" : "#ef4444"

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox="0 0 96 96">
        <circle cx={48} cy={48} r={r} fill="none" stroke="#ffffff10" strokeWidth={8} />
        <circle
          cx={48}
          cy={48}
          r={r}
          fill="none"
          stroke={colour}
          strokeWidth={8}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <text
          x={48}
          y={48}
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize={18}
          fontWeight="700"
          fill="#f9fafb"
        >
          {value}
        </text>
      </svg>
      <span className="text-xs text-foreground/60 text-center">{label}</span>
    </div>
  )
}

function Badge({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode
  variant?: "good" | "bad" | "neutral" | "keyword"
}) {
  const styles: Record<string, string> = {
    good: "border-emerald-400/35 bg-emerald-500/10 text-emerald-200",
    bad: "border-red-400/35 bg-red-500/10 text-red-200",
    neutral: "border-rose-500/25 bg-rose-500/8 text-rose-100",
    keyword: "border-amber-400/35 bg-amber-500/10 text-amber-200",
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  )
}

function SectionCard({
  title,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-rose-500/20 bg-white/5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2 font-semibold text-foreground">
          {icon}
          {title}
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-foreground/50" />
        ) : (
          <ChevronDown className="h-4 w-4 text-foreground/50" />
        )}
      </button>
      {open && <div className="border-t border-rose-500/15 px-5 pb-5 pt-4">{children}</div>}
    </div>
  )
}

function ImprovementCard({ item }: { item: ImprovementSuggestion }) {
  return (
    <div className="rounded-lg border border-rose-500/15 bg-black/20 p-3 text-sm">
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded-full border border-rose-400/35 bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold uppercase text-rose-200">
          {item.section}
        </span>
      </div>
      <p className="font-medium text-foreground">{item.issue}</p>
      <p className="mt-1 text-foreground/75">{item.suggestion}</p>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function JdAnalysisPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Form state ──────────────────────────────────────────────────────────
  const [file, setFile] = useState<File | null>(null)
  const [jobTitle, setJobTitle] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [jobDescription, setJobDescription] = useState("")

  // ── UI state ─────────────────────────────────────────────────────────────
  const [isAnalysing, setIsAnalysing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ── Results ───────────────────────────────────────────────────────────────
  const [result, setResult] = useState<AnalysisState | null>(null)

  // ── Validation ────────────────────────────────────────────────────────────
  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!file) next.file = "Please upload a CV file (PDF, DOCX or TXT)."
    if (!jobDescription.trim() || jobDescription.trim().length < 50)
      next.jd = "Job description must be at least 50 characters."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  // ── Submit analysis ───────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsAnalysing(true)
    setResult(null)

    try {
      const fd = new FormData()
      fd.append("file", file!)
      fd.append("jobDescription", jobDescription)
      if (jobTitle) fd.append("jobTitle", jobTitle)
      if (companyName) fd.append("companyName", companyName)

      const res = await fetch("/api/users/resume/jd-analysis", {
        method: "POST",
        body: fd,
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Analysis failed.")
      }

      setResult({
        analysisId: data.analysisId,
        analysis: data.analysis as JdAnalysisOutput,
        cached: Boolean(data.cached),
        creditsCharged: data.meta?.creditsCharged ?? JD_ANALYSIS_CREDIT_COST,
        creditsRemaining: data.meta?.creditsRemaining,
      })

      if (data.cached) {
        toast.info("Returned cached analysis — no credits charged.")
      } else {
        toast.success(`Analysis complete. ${data.meta?.creditsCharged ?? JD_ANALYSIS_CREDIT_COST} credits used.`)
      }
    } catch (err: any) {
      toast.error(err.message || "Analysis failed.")
    } finally {
      setIsAnalysing(false)
    }
  }

  // ── Generate improved CV ──────────────────────────────────────────────────
  async function handleGenerateImprovedCv() {
    if (!result) return
    setIsGenerating(true)

    try {
      const res = await fetch("/api/users/resume/jd-analysis/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId: result.analysisId }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || data.message || "Failed to generate improved CV.")
      }

      const remaining = res.headers.get("X-Credits-Remaining")
      if (remaining) {
        toast.success(
          `Improved CV generated. Credits remaining: ${remaining}.`
        )
      } else {
        toast.success("Improved CV generated and downloading.")
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const baseName = (jobTitle || "improved-cv")
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .trim()
      const link = document.createElement("a")
      link.href = url
      link.download = `${baseName || "improved-cv"}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err: any) {
      toast.error(err.message || "Failed to generate improved CV.")
    } finally {
      setIsGenerating(false)
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  const a = result?.analysis

  return (
    <>
      {/* Analysing dialog */}
      <Dialog open={isAnalysing}>
        <DialogContent
          showCloseButton={false}
          className="border-rose-500/30 bg-background/95"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-rose-300" />
              Analysing Your CV
            </DialogTitle>
            <DialogDescription className="text-foreground/75">
              AI is reviewing your CV against the job description. This takes
              10–30 seconds. Do not close the tab.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-lg border border-rose-500/20 bg-black/20 p-3 text-sm text-foreground/80">
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              Extracting text from CV
            </p>
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Comparing against job description
            </p>
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Generating improvement suggestions
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-rose-500/10 bg-background/70 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="border border-rose-500/20 bg-white/5 hover:bg-white/10" />
          <div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">
              CV + Job Description Analysis
            </h1>
            <p className="text-sm text-foreground/65">
              Upload your CV and a job description to get AI-powered ATS analysis and a
              tailored improvement plan.
            </p>
          </div>
        </div>
      </header>

      <main className="space-y-6 p-4 sm:p-6">

        {/* ── Upload Form ─────────────────────────────────────────────────────── */}
        <section className="rounded-xl border border-rose-500/20 bg-white/5 p-5 sm:p-6">
          <h2 className="mb-1 text-lg font-semibold text-foreground">
            Upload CV &amp; Job Description
          </h2>
          <p className="mb-4 text-sm text-foreground/65">
            Costs {JD_ANALYSIS_CREDIT_COST} credits for a fresh analysis. Duplicate
            CV+JD combinations are returned from cache for free.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Job title / company */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-foreground/80">
                  Job Title <span className="text-foreground/45">(optional)</span>
                </label>
                <input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full rounded-lg border border-rose-500/25 bg-white/5 px-4 py-2.5 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-foreground/80">
                  Company <span className="text-foreground/45">(optional)</span>
                </label>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full rounded-lg border border-rose-500/25 bg-white/5 px-4 py-2.5 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40"
                />
              </div>
            </div>

            {/* File upload */}
            <div>
              <label className="mb-1 block text-sm text-foreground/80">
                CV File <span className="text-rose-300">*</span>
              </label>
              <label
                htmlFor="cv-file"
                className={`flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed px-4 py-6 transition hover:bg-white/10 ${
                  errors.file
                    ? "border-red-500/50 bg-red-500/5"
                    : "border-rose-400/35 bg-white/5"
                }`}
              >
                <Upload className="h-5 w-5 text-rose-300 shrink-0" />
                <div className="text-center">
                  <p className="text-sm text-foreground/80">
                    {file ? (
                      <span className="font-medium text-rose-200">{file.name}</span>
                    ) : (
                      "Click to upload PDF, DOCX or TXT"
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-foreground/50">Max 5 MB</p>
                </div>
              </label>
              <input
                id="cv-file"
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                className="hidden"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null)
                  setErrors((p) => ({ ...p, file: "" }))
                }}
              />
              {errors.file && (
                <p className="mt-1 flex items-center gap-1 text-sm text-red-300">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.file}
                </p>
              )}
            </div>

            {/* Job description */}
            <div>
              <label className="mb-1 block text-sm text-foreground/80">
                Job Description <span className="text-rose-300">*</span>
              </label>
              <textarea
                rows={9}
                value={jobDescription}
                onChange={(e) => {
                  setJobDescription(e.target.value)
                  setErrors((p) => ({ ...p, jd: "" }))
                }}
                placeholder="Paste the full job description here (responsibilities, requirements, preferred skills…)"
                className={`w-full rounded-lg border bg-white/5 px-4 py-2.5 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40 ${
                  errors.jd ? "border-red-500/50" : "border-rose-500/25"
                }`}
              />
              {errors.jd && (
                <p className="mt-1 flex items-center gap-1 text-sm text-red-300">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.jd}
                </p>
              )}
              <p className="mt-1 text-xs text-foreground/50">
                {jobDescription.length} / 12,000 chars
              </p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-foreground/55">
                {JD_ANALYSIS_CREDIT_COST} credits · cached results are free
              </p>
              <Button
                type="submit"
                disabled={isAnalysing}
                className="gradient-accent border-0 text-white"
              >
                <Search className="mr-2 h-4 w-4" />
                {isAnalysing ? "Analysing…" : "Analyse CV"}
              </Button>
            </div>
          </form>
        </section>

        {/* ── Results ──────────────────────────────────────────────────────────── */}
        {a && result && (
          <>
            {/* Cache notice */}
            {result.cached && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-200">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Cached result — same CV + JD analysed before. No credits charged.
              </div>
            )}

            {/* Score cards */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <article className="flex flex-col items-center justify-center rounded-xl border border-rose-500/20 bg-white/5 py-6">
                <ScoreRing value={a.ats_score} label="ATS Score" />
              </article>
              <article className="flex flex-col items-center justify-center rounded-xl border border-rose-500/20 bg-white/5 py-6">
                <ScoreRing value={a.jd_match_score} label="JD Match Score" />
              </article>
              <article className="flex flex-col items-center justify-center rounded-xl border border-rose-500/20 bg-white/5 py-5 px-4">
                <p className="mb-2 text-sm text-foreground/65">Missing Keywords</p>
                <p className="text-3xl font-bold text-foreground">
                  {a.missing_keywords.length}
                </p>
                <p className="mt-1 text-xs text-foreground/50">
                  keywords absent from your CV
                </p>
              </article>
            </section>

            {/* Missing keywords */}
            {a.missing_keywords.length > 0 && (
              <SectionCard
                title="Missing Keywords"
                icon={<Target className="h-4 w-4 text-amber-300" />}
              >
                <div className="flex flex-wrap gap-2">
                  {a.missing_keywords.map((kw) => (
                    <Badge key={kw} variant="keyword">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <SectionCard
                title="Strengths"
                icon={<TrendingUp className="h-4 w-4 text-emerald-300" />}
              >
                <ul className="space-y-2">
                  {a.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      {s}
                    </li>
                  ))}
                </ul>
              </SectionCard>

              <SectionCard
                title="Weaknesses"
                icon={<TrendingDown className="h-4 w-4 text-red-300" />}
              >
                <ul className="space-y-2">
                  {a.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                      {w}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            </div>

            {/* Improvement suggestions */}
            <SectionCard
              title={`Improvement Suggestions (${a.improvement_suggestions.length})`}
              icon={<Zap className="h-4 w-4 text-rose-300" />}
            >
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {a.improvement_suggestions.map((item, i) => (
                  <ImprovementCard key={i} item={item} />
                ))}
              </div>
            </SectionCard>

            {/* Improved resume preview */}
            <SectionCard
              title="AI-Improved Resume Content"
              icon={<FileText className="h-4 w-4 text-rose-300" />}
              defaultOpen={false}
            >
              <p className="mb-4 text-sm text-foreground/65">
                Preview of what will be included in the improved CV PDF. Sections rewritten
                using your actual background with stronger language and ATS keywords.
              </p>
              <div className="space-y-4">
                {[
                  { key: "summary", label: "Professional Summary" },
                  { key: "experience", label: "Work Experience" },
                  { key: "skills", label: "Skills" },
                  { key: "projects", label: "Projects" },
                ].map(({ key, label }) => {
                  const val =
                    a.improved_resume_content[
                      key as keyof typeof a.improved_resume_content
                    ]
                  if (!val?.trim()) return null
                  return (
                    <div key={key}>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-rose-300">
                        {label}
                      </p>
                      <pre className="whitespace-pre-wrap rounded-lg border border-rose-500/15 bg-black/20 p-3 text-xs text-foreground/85 font-sans">
                        {val}
                      </pre>
                    </div>
                  )
                })}
              </div>
            </SectionCard>

            {/* Generate improved CV CTA */}
            <section className="rounded-xl border border-rose-400/30 bg-rose-500/8 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Sparkles className="h-5 w-5 text-rose-300" />
                    Generate Improved CV
                  </h2>
                  <p className="mt-1 text-sm text-foreground/70">
                    Download a professionally formatted PDF applying all AI suggestions.
                    ATS-optimised with improved bullet points and relevant keywords.
                  </p>
                  <p className="mt-1 text-xs text-foreground/55">
                    Costs {JD_IMPROVED_CV_CREDIT_COST} credits per generation.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleGenerateImprovedCv}
                  disabled={isGenerating}
                  className="gradient-accent shrink-0 border-0 text-white"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Generate Improved CV
                    </>
                  )}
                </Button>
              </div>
            </section>

            {/* Meta footer */}
            <section className="rounded-xl border border-rose-500/20 bg-black/20 p-4 text-xs text-foreground/65">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1">
                  <BarChart2 className="h-3.5 w-3.5 text-rose-300" />
                  ATS: {a.ats_score}/100 · JD Match: {a.jd_match_score}/100
                </span>
                <span>
                  Credits charged: {result.creditsCharged}
                  {result.cached ? " (cached — free)" : ""}
                </span>
                {result.creditsRemaining != null && (
                  <span>Credits remaining: {result.creditsRemaining}</span>
                )}
              </div>
            </section>
          </>
        )}

        {/* Empty state */}
        {!a && !isAnalysing && (
          <div className="rounded-xl border border-rose-500/15 bg-black/10 px-6 py-12 text-center">
            <BarChart2 className="mx-auto mb-3 h-10 w-10 text-rose-400/50" />
            <p className="font-medium text-foreground/70">
              Upload your CV and paste a job description above to get started.
            </p>
            <p className="mt-1 text-sm text-foreground/50">
              Results include ATS score, JD match score, missing keywords, and a
              full improvement plan.
            </p>
          </div>
        )}
      </main>
    </>
  )
}