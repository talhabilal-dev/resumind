import { z } from "zod";

export const resumeAgentTaskSchema = z.enum([
  "full_resume_analysis",
  "job_description_match",
  "cover_letter_generator",
  "bullet_point_optimization",
  "full_resume_rewrite",
]);

export type ResumeAgentTask = z.infer<typeof resumeAgentTaskSchema>;

export const RESUME_TASK_CREDIT_COST: Record<ResumeAgentTask, number> = {
  full_resume_analysis: 5,
  job_description_match: 3,
  cover_letter_generator: 4,
  bullet_point_optimization: 1,
  full_resume_rewrite: 8,
};

export const CREDIT_USD_RATE = 0.1;

const baseInputSchema = z.object({
  task: resumeAgentTaskSchema,
  resumeText: z
    .string()
    .trim()
    .min(120, "Resume text must be at least 120 characters")
    .max(30000, "Resume text must be at most 30000 characters"),
  jobTitle: z
    .string()
    .trim()
    .min(2, "Job title must be at least 2 characters")
    .max(120, "Job title must be at most 120 characters"),
  jobDescription: z
    .string()
    .trim()
    .max(12000, "Job description must be at most 12000 characters")
    .optional(),
  userId: z.string().trim().min(1, "userId is required"),
  creditsAvailable: z.number().int().min(0),
  strictMode: z.boolean().default(true),
});

export const resumeAgentInputSchema = baseInputSchema.superRefine((value, ctx) => {
  const requiresJobDescription =
    value.task === "job_description_match" ||
    value.task === "cover_letter_generator" ||
    value.task === "full_resume_analysis" ||
    value.task === "full_resume_rewrite";

  if (requiresJobDescription && !value.jobDescription?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["jobDescription"],
      message: "Job description is required for this task",
    });
  }

  if (value.task === "bullet_point_optimization" && value.resumeText.length < 200) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["resumeText"],
      message: "Provide more resume detail for bullet optimization",
    });
  }
});

const recommendationSchema = z.object({
  title: z.string().min(3).max(120),
  rationale: z.string().min(10).max(500),
  action: z.string().min(10).max(500),
  impact: z.enum(["low", "medium", "high"]),
});

const citationSchema = z.object({
  quote: z.string().min(10).max(220),
  source: z.enum(["resume", "job_description"]),
});

export const resumeAgentOutputSchema = z.object({
  task: resumeAgentTaskSchema,
  summary: z.string().min(30).max(1500),
  score: z.number().min(0).max(100).nullable(),
  recommendations: z.array(recommendationSchema).min(1).max(12),
  missingKeywords: z.array(z.string().min(1).max(60)).max(30),
  optimizedBullets: z.array(z.string().min(10).max(240)).max(10),
  coverLetterDraft: z.string().max(5000).optional(),
  rewrittenResume: z.string().max(20000).optional(),
  evidence: z.object({
    citations: z.array(citationSchema).min(1).max(12),
    assumptions: z.array(z.string().min(5).max(300)).max(10),
  }),
  confidence: z.number().min(0).max(1),
  hallucinationRisk: z.enum(["low", "medium", "high"]),
});

export type ResumeAgentInput = z.infer<typeof resumeAgentInputSchema>;
export type ResumeAgentOutput = z.infer<typeof resumeAgentOutputSchema>;

export const resumeAgentResultSchema = z.object({
  output: resumeAgentOutputSchema,
  cost: z.object({
    creditsCharged: z.number().int().min(1),
    usdCharged: z.number().min(0),
    tokenUsage: z.object({
      inputTokens: z.number().int().min(0),
      outputTokens: z.number().int().min(0),
      totalTokens: z.number().int().min(0),
    }),
  }),
  safeguards: z.object({
    validationPassed: z.boolean(),
    citationCoverage: z.number().min(0).max(1),
    warnings: z.array(z.string()),
  }),
});

export type ResumeAgentResult = z.infer<typeof resumeAgentResultSchema>;

export const resumeAgentApiRequestSchema = z.object({
  task: resumeAgentTaskSchema,
  resumeText: z.string().trim().min(120).max(30000),
  jobTitle: z.string().trim().min(2).max(120),
  jobDescription: z.string().trim().max(12000).optional(),
  strictMode: z.boolean().optional(),
});

export type ResumeAgentApiRequest = z.infer<typeof resumeAgentApiRequestSchema>;
