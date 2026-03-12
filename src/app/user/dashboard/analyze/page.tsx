"use client";

import React, { useState } from "react";
import { FileText, Upload } from "lucide-react";
import { toast } from "sonner";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { resumeUploadSchema } from "@/schemas/resumeSchema";

type ResumeFormData = {
  jobTitle: string;
  jobDescription: string;
  resumeText: string;
  resumeFile: File | null;
};

type ResumeFormErrors = Partial<Record<keyof ResumeFormData, string>> & {
  general?: string;
};

const AnalyzePage: React.FC = () => {
  const [formData, setFormData] = useState<ResumeFormData>({
    jobTitle: "",
    jobDescription: "",
    resumeText: "",
    resumeFile: null,
  });
  const [errors, setErrors] = useState<ResumeFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // API intentionally not implemented yet. This confirms local validation + form readiness.
      await new Promise((resolve) => setTimeout(resolve, 400));
      toast.success("Resume form validated. Analyzer API integration is next.");
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
                {isSubmitting ? "Validating..." : "Continue to Analysis"}
              </Button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
};

export default AnalyzePage;
