"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FileText, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { resumeUploadSchema } from "@/schemas/resumeSchema";
import {
  RESUME_TASK_CREDIT_COST,
  resumeAgentTaskSchema,
  type ResumeAgentTask,
} from "@/schemas/resumeAgentSchema";

type ResumeFormData = {
  jobTitle: string;
  jobDescription: string;
  resumeText: string;
  resumeFile: File | null;
};

type ResumeFormErrors = Partial<Record<keyof ResumeFormData, string>> & {
  general?: string;
};

type AnalysisResponse = {
  output: {
    summary: string;
    score: number | null;
    recommendations: Array<{
      title: string;
      action: string;
      impact: "low" | "medium" | "high";
    }>;
    missingKeywords: string[];
  };
  safeguards: {
    citationCoverage: number;
    warnings: string[];
  };
  cost: {
    creditsCharged: number;
    tokenUsage: {
      totalTokens: number;
    };
  };
};

const TASK_LABELS: Record<ResumeAgentTask, string> = {
  full_resume_analysis: "Full Resume Analysis",
  job_description_match: "Job Description Match",
  cover_letter_generator: "Cover Letter Generator",
  bullet_point_optimization: "Bullet Point Optimization",
  full_resume_rewrite: "Full Resume Rewrite",
};

const AnalyzePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<ResumeFormData>({
    jobTitle: "",
    jobDescription: "",
    resumeText: "",
    resumeFile: null,
  });
  const [errors, setErrors] = useState<ResumeFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ResumeAgentTask>("full_resume_analysis");
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);

  useEffect(() => {
    const urlTask = searchParams.get("task");
    const parsedTask = resumeAgentTaskSchema.safeParse(urlTask);
    if (parsedTask.success) {
      setSelectedTask(parsedTask.data);
    }
  }, [searchParams]);

  const clearFieldError = (field: keyof ResumeFormData) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const parsed = resumeUploadSchema.safeParse(formData);
    if (!parsed.success) {
      const nextErrors: ResumeFormErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && !nextErrors[field as keyof ResumeFormData]) {
          nextErrors[field as keyof ResumeFormData] = issue.message;
        }
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      let effectiveResumeText = formData.resumeText.trim();

      if (!effectiveResumeText && formData.resumeFile) {
        const extractionFormData = new FormData();
        extractionFormData.append("resumeFile", formData.resumeFile);

        const extractionResponse = await fetch("/api/users/resume/extract-text", {
          method: "POST",
          body: extractionFormData,
        });
        const extractionPayload = await extractionResponse.json();

        if (!extractionResponse.ok || !extractionPayload?.resumeText) {
          throw new Error(
            extractionPayload?.error || "Failed to extract text from uploaded resume file."
          );
        }

        effectiveResumeText = String(extractionPayload.resumeText).trim();
      }

      if (!effectiveResumeText) {
        throw new Error("Please upload a resume file or paste resume text to run AI analysis.");
      }

      const response = await fetch("/api/users/resume/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: selectedTask,
          jobTitle: formData.jobTitle,
          jobDescription: formData.jobDescription,
          resumeText: effectiveResumeText,
          strictMode: true,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.data) {
        throw new Error(payload?.error || "Failed to analyze resume.");
      }

      setAnalysis(payload.data as AnalysisResponse);
      toast.success(
        `Analysis complete. ${payload.credits?.charged || RESUME_TASK_CREDIT_COST[selectedTask]} credits used.`
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Analysis failed.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-rose-500/10 bg-background/70 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="border border-rose-500/20 bg-white/5 hover:bg-white/10" />
          <div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">Analyze Resume</h1>
            <p className="text-sm text-foreground/65">Upload your resume and match it to a target role.</p>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6">
        <section className="rounded-xl glow-card bg-white/5 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">Resume Input Form</h2>
          <p className="mt-1 text-sm text-foreground/65">
            Supported resume formats: PDF, DOC, DOCX, TXT, or pasted raw text.
          </p>

          <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-sm text-foreground/80">
                Analysis Task
              </label>
              <div className="flex items-center justify-between rounded-lg border border-rose-500/25 bg-black/20 px-4 py-2.5">
                <p className="text-sm text-foreground">{TASK_LABELS[selectedTask]}</p>
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 border-rose-500/30 bg-white/5 text-foreground hover:bg-white/10"
                  onClick={() => router.push("/user/dashboard/tasks")}
                >
                  Change
                </Button>
              </div>
              <p className="mt-1 text-xs text-rose-200">
                Credits required: {RESUME_TASK_CREDIT_COST[selectedTask]}
              </p>
            </div>

            <div>
              <label htmlFor="jobTitle" className="mb-1 block text-sm text-foreground/80">
                Job Name
              </label>
              <input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, jobTitle: e.target.value }));
                  clearFieldError("jobTitle");
                }}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full rounded-lg border border-rose-500/25 bg-white/5 px-4 py-2.5 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40"
              />
              {errors.jobTitle && <p className="mt-1 text-sm text-red-300">{errors.jobTitle}</p>}
            </div>

            <div>
              <label htmlFor="jobDescription" className="mb-1 block text-sm text-foreground/80">
                Job Description
              </label>
              <textarea
                id="jobDescription"
                rows={7}
                value={formData.jobDescription}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, jobDescription: e.target.value }));
                  clearFieldError("jobDescription");
                }}
                placeholder="Paste full job description here"
                className="w-full rounded-lg border border-rose-500/25 bg-white/5 px-4 py-2.5 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40"
              />
              {errors.jobDescription && <p className="mt-1 text-sm text-red-300">{errors.jobDescription}</p>}
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div>
                <label htmlFor="resumeFile" className="mb-1 block text-sm text-foreground/80">
                  Upload Resume File
                </label>
                <label
                  htmlFor="resumeFile"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-rose-400/35 bg-white/5 px-4 py-6 text-foreground/80 hover:bg-white/10"
                >
                  <Upload className="h-4 w-4 text-rose-300" />
                  <span>{formData.resumeFile ? formData.resumeFile.name : "Choose PDF/DOC/DOCX/TXT"}</span>
                </label>
                <input
                  id="resumeFile"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFormData((prev) => ({ ...prev, resumeFile: file }));
                    clearFieldError("resumeFile");
                    clearFieldError("resumeText");
                  }}
                />
                {errors.resumeFile && <p className="mt-1 text-sm text-red-300">{errors.resumeFile}</p>}
              </div>

              <div>
                <label htmlFor="resumeText" className="mb-1 block text-sm text-foreground/80">
                  Or Paste Raw Resume Text
                </label>
                <textarea
                  id="resumeText"
                  rows={6}
                  value={formData.resumeText}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, resumeText: e.target.value }));
                    clearFieldError("resumeText");
                  }}
                  placeholder="Paste plain text version of your resume"
                  className="w-full rounded-lg border border-rose-500/25 bg-white/5 px-4 py-2.5 text-foreground placeholder:text-foreground/40 outline-none transition focus:ring-2 focus:ring-rose-400/40"
                />
                {errors.resumeText && <p className="mt-1 text-sm text-red-300">{errors.resumeText}</p>}
              </div>
            </div>

            {errors.general && <p className="text-sm text-red-300">{errors.general}</p>}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gradient-accent border-0 text-white"
              >
                <FileText className="mr-2 h-4 w-4" />
                {isSubmitting ? "Analyzing..." : "Run Analysis"}
              </Button>
            </div>
          </form>
        </section>

        {analysis && (
          <section className="rounded-xl glow-card bg-white/5 p-5 sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Analysis Result</h2>
              <span className="text-sm text-foreground/70">
                Score: {analysis.output.score !== null ? `${analysis.output.score}/100` : "N/A"}
              </span>
            </div>

            <p className="text-sm text-foreground/80">{analysis.output.summary}</p>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-rose-500/20 bg-black/20 p-3">
                <p className="mb-2 text-sm font-medium text-foreground">Recommendations</p>
                <ul className="space-y-2 text-sm text-foreground/80">
                  {analysis.output.recommendations.slice(0, 4).map((rec) => (
                    <li key={rec.title} className="rounded-md border border-rose-500/15 bg-white/5 p-2">
                      <p className="font-medium">{rec.title}</p>
                      <p className="text-foreground/70">{rec.action}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-rose-500/20 bg-black/20 p-3">
                <p className="mb-2 text-sm font-medium text-foreground">Missing Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.output.missingKeywords.slice(0, 12).map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-xs text-rose-100"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-rose-500/20 bg-black/20 p-3 text-xs text-foreground/70">
              <p className="mb-1 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-rose-300" />
                Tokens used: {analysis.cost.tokenUsage.totalTokens} | Credits charged: {analysis.cost.creditsCharged}
              </p>
              <p>
                Citation coverage: {(analysis.safeguards.citationCoverage * 100).toFixed(0)}%
                {analysis.safeguards.warnings.length > 0
                  ? ` | Warnings: ${analysis.safeguards.warnings.length}`
                  : ""}
              </p>
            </div>
          </section>
        )}
      </main>
    </>
  );
};

export default AnalyzePage;
