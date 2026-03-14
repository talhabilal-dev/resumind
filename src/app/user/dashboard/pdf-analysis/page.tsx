"use client"

import React from "react"
import { Download, FileSearch, Sparkles, Upload } from "lucide-react"
import { toast } from "sonner"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"

type Tip = {
  type: "good" | "improve"
  tip: string
  explanation: string
}

type Category = {
  score: number
  tips: Tip[]
}

type Feedback = {
  overallScore: number
  toneAndStyle: Category
  content: Category
  structure: Category
  skills: Category
}

const sectionClass = "rounded-xl border border-rose-500/20 bg-white/5 p-5"

function downloadFile(file: File) {
  const url = URL.createObjectURL(file)
  const link = document.createElement("a")
  link.href = url
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function CategoryCard({
  title,
  data
}: {
  title: string
  data: Category
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
                    : "bg-amber-500/20 text-amber-200"
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
  )
}

export default function PdfAnalysisPage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [jobTitle, setJobTitle] = React.useState("")
  const [companyName, setCompanyName] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isExportingReport, setIsExportingReport] = React.useState(false)
  const [isGeneratingImprovedCv, setIsGeneratingImprovedCv] = React.useState(false)
  const [feedback, setFeedback] = React.useState<Feedback | null>(null)
  const [creditsRemaining, setCreditsRemaining] = React.useState<number | null>(null)

  const exportAnalysisReport = async () => {
    if (!feedback) {
      toast.error("Analyze a resume first to export the report")
      return
    }

    setIsExportingReport(true)

    try {
      const response = await fetch("/api/users/resume/pdf-analysis/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          feedback,
          jobTitle,
          companyName,
          sourceFileName: file?.name,
          analyzedAt: new Date().toLocaleString()
        })
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.error || "Failed to generate report PDF")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const fileNameBase = (file?.name || "analysis-report").replace(/\.[^./\\]+$/, "")
      const link = document.createElement("a")
      link.href = url
      link.download = `${fileNameBase}-analysis-report.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      toast.success("Analysis report PDF exported")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export report")
    } finally {
      setIsExportingReport(false)
    }
  }

  const generateImprovedCv = async () => {
    if (!file || !feedback) {
      toast.error("Analyze a PDF resume first")
      return
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Improved CV generation currently supports PDF files only")
      return
    }

    setIsGeneratingImprovedCv(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("feedback", JSON.stringify(feedback))
      formData.append("jobTitle", jobTitle)
      formData.append("companyName", companyName)

      const response = await fetch("/api/users/resume/pdf-analysis/improve", {
        method: "POST",
        body: formData
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload?.error || payload?.message || "Failed to generate improved CV")
      }

      const remainingHeader = response.headers.get("X-Credits-Remaining")
      if (remainingHeader && !Number.isNaN(Number(remainingHeader))) {
        setCreditsRemaining(Number(remainingHeader))
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const baseName = file.name.replace(/\.[^./\\]+$/, "")
      const link = document.createElement("a")
      link.href = url
      link.download = `${baseName}-improved.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      toast.success("Improved PDF CV generated")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate improved CV")
    } finally {
      setIsGeneratingImprovedCv(false)
    }
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!file) {
      toast.error("Please upload a CV file first")
      return
    }

    setIsSubmitting(true)
    setFeedback(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("jobTitle", jobTitle)
      formData.append("companyName", companyName)

      const response = await fetch("/api/users/resume/pdf-analysis", {
        method: "POST",
        body: formData
      })

      const result = await response.json()
      if (!response.ok || !result?.feedback) {
        throw new Error(result?.error || result?.message || "Failed to analyze PDF")
      }

      setFeedback(result.feedback as Feedback)
      setCreditsRemaining(
        typeof result.creditsRemaining === "number" ? result.creditsRemaining : null
      )
      toast.success("PDF resume analyzed successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Analysis failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Dialog open={isSubmitting}>
        <DialogContent
          showCloseButton={false}
          className="border-rose-500/30 bg-background/95"
          onEscapeKeyDown={(event: { preventDefault: () => void }) => event.preventDefault()}
          onPointerDownOutside={(event: { preventDefault: () => void }) => event.preventDefault()}
          onInteractOutside={(event: { preventDefault: () => void }) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Spinner className="size-4 text-rose-300" />
              Analyzing Your Resume
            </DialogTitle>
            <DialogDescription className="text-foreground/75">
              Please wait while AI reviews your CV and prepares detailed feedback. Do not close or navigate away.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 rounded-lg border border-rose-500/20 bg-black/20 p-3 text-sm text-foreground/80">
            <p>1. Extracting text from uploaded file</p>
            <p>2. Running ATS and category analysis</p>
            <p>3. Preparing structured recommendations</p>
          </div>
        </DialogContent>
      </Dialog>

      <header className="sticky top-0 z-30 border-b border-rose-500/10 bg-background/70 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="border border-rose-500/20 bg-white/5 hover:bg-white/10" />
          <div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">PDF Resume Analysis</h1>
            <p className="text-sm text-foreground/65">Upload CV, get detailed AI feedback, and export your uploaded CV in the same format.</p>
          </div>
        </div>
      </header>

      <main className="space-y-6 p-4 sm:p-6">
        <section className={sectionClass}>
          <h2 className="text-lg font-semibold text-foreground">Upload and Analyze</h2>
          <p className="mt-1 text-sm text-foreground/65">Supported: PDF, DOCX, TXT (max 5MB). DOC is not directly supported.</p>

          <form className="mt-4 space-y-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                className="w-full rounded-lg border border-rose-500/25 bg-white/5 px-4 py-2.5 text-foreground"
                placeholder="Target job title (optional)"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
              <input
                className="w-full rounded-lg border border-rose-500/25 bg-white/5 px-4 py-2.5 text-foreground"
                placeholder="Company name (optional)"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-rose-400/35 bg-white/5 px-4 py-6 text-foreground/80 hover:bg-white/10">
              <Upload className="h-4 w-4 text-rose-300" />
              <span>{file ? file.name : "Choose CV file"}</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={isSubmitting} className="gradient-accent border-0 text-white">
                <FileSearch className="mr-2 h-4 w-4" />
                {isSubmitting ? "Analyzing..." : "Analyze PDF"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="border-rose-500/30 bg-white/5 text-foreground hover:bg-white/10"
                disabled={!file}
                onClick={() => file && downloadFile(file)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Uploaded CV
              </Button>

              <Button
                type="button"
                variant="outline"
                className="border-rose-500/30 bg-white/5 text-foreground hover:bg-white/10"
                disabled={!feedback}
                onClick={exportAnalysisReport}
              >
                <Download className="mr-2 h-4 w-4" />
                {isExportingReport ? "Exporting Report..." : "Export Analysis Report PDF"}
              </Button>

              <Button
                type="button"
                className="gradient-accent border-0 text-white"
                disabled={!feedback || !file || isGeneratingImprovedCv}
                onClick={generateImprovedCv}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isGeneratingImprovedCv ? "Creating Improved CV..." : "Create Improved CV (PDF)"}
              </Button>

              {creditsRemaining !== null ? (
                <p className="text-sm text-foreground/75">Credits remaining: {creditsRemaining}</p>
              ) : null}
            </div>
          </form>
        </section>

        {feedback ? (
          <>
            <section className={sectionClass}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Overall Score</h2>
                <span className="rounded-md border border-rose-500/35 bg-rose-500/15 px-2 py-1 text-sm text-rose-100">
                  {feedback.overallScore}/100
                </span>
              </div>
              <p className="mt-2 text-sm text-foreground/75">AI highlights what is strong and what needs improvement in each category.</p>
            </section>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <CategoryCard title="Tone & Style" data={feedback.toneAndStyle} />
              <CategoryCard title="Content" data={feedback.content} />
              <CategoryCard title="Structure" data={feedback.structure} />
              <CategoryCard title="Skills" data={feedback.skills} />
            </section>

            <section className="rounded-xl border border-rose-500/20 bg-black/20 p-4 text-xs text-foreground/70">
              <p className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-rose-300" />
                Export button downloads the exact uploaded file format (same file type and extension).
              </p>
              <p className="mt-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-rose-300" />
                Analysis report export now uses a server-generated PDF file.
              </p>
              <p className="mt-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-rose-300" />
                Improved CV generation applies only AI "improve" suggestions and is currently PDF-only.
              </p>
            </section>
          </>
        ) : null}
      </main>
    </>
  )
}
