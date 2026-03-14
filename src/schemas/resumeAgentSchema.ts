import { z } from "zod"

export const resumeAgentTaskSchema = z.enum(["full_resume_analysis"])

export type ResumeAgentTask = z.infer<typeof resumeAgentTaskSchema>

export const RESUME_TASK_CREDIT_COST: Record<ResumeAgentTask, number> = {
  full_resume_analysis: 5
}

export const CREDIT_USD_RATE = 0.1

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
  strictMode: z.boolean().default(true)
})

export const resumeAgentInputSchema = baseInputSchema.superRefine((value, ctx) => {
  if (!value.jobDescription?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["jobDescription"],
      message: "Job description is required for this task"
    })
  }
})

const recommendationSchema = z.object({
  title: z.string().min(3).max(120),
  rationale: z.string().min(10).max(500),
  action: z.string().min(10).max(500),
  impact: z.enum(["low", "medium", "high"])
})

const citationSchema = z.object({
  quote: z.string().min(10).max(220),
  source: z.enum(["resume", "job_description"])
})

export const resumeAgentOutputSchema = z.object({
  task: resumeAgentTaskSchema,
  summary: z.string().min(30).max(1500),
  score: z.number().min(0).max(100).nullable(),
  recommendations: z.array(recommendationSchema).min(1).max(12),
  missingKeywords: z.array(z.string().min(1).max(60)).max(30),
  optimizedBullets: z.array(z.string().min(10).max(240)).max(10),
  evidence: z.object({
    citations: z.array(citationSchema).min(1).max(12),
    assumptions: z.array(z.string().min(5).max(300)).max(10)
  }),
  confidence: z.number().min(0).max(1),
  hallucinationRisk: z.enum(["low", "medium", "high"])
})

export type ResumeAgentInput = z.infer<typeof resumeAgentInputSchema>
export type ResumeAgentOutput = z.infer<typeof resumeAgentOutputSchema>

export const resumeAgentResultSchema = z.object({
  output: resumeAgentOutputSchema,
  cost: z.object({
    creditsCharged: z.number().int().min(1),
    usdCharged: z.number().min(0),
    tokenUsage: z.object({
      inputTokens: z.number().int().min(0),
      outputTokens: z.number().int().min(0),
      totalTokens: z.number().int().min(0)
    })
  }),
  safeguards: z.object({
    validationPassed: z.boolean(),
    citationCoverage: z.number().min(0).max(1),
    warnings: z.array(z.string())
  })
})

export type ResumeAgentResult = z.infer<typeof resumeAgentResultSchema>

export const resumeAgentApiRequestSchema = z.object({
  task: resumeAgentTaskSchema,
  resumeText: z.string().trim().min(120).max(30000),
  jobTitle: z.string().trim().min(2).max(120),
  jobDescription: z.string().trim().max(12000).optional(),
  strictMode: z.boolean().optional()
})

export type ResumeAgentApiRequest = z.infer<typeof resumeAgentApiRequestSchema>

// Shared sub-schemas for structured extraction

export const ExperienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  location: z.string().nullable(),
  startDate: z.string().describe("ISO date string"),
  endDate: z.string().nullable().describe("ISO date string"),
  current: z.boolean().nullable(),
  achievements: z.array(z.string())
})

export const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable()
})

export const ProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  url: z.string().nullable(),
  achievements: z.array(z.string())
})

export const PersonalSchema = z.object({
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  website: z.string(),
  linkedin: z.string(),
  github: z.string()
})

export const SkillsSchema = z.object({
  technical: z.array(z.string()),
  soft: z.array(z.string()),
  tools: z.array(z.string()),
  languages: z.array(z.string())
})

export const CertificationSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  date: z.string().nullable()
})

export const AgentTaskSchema = z.enum(["full_resume_analysis"])

export type AgentTask = z.infer<typeof AgentTaskSchema>

export const AgentRequestSchema = z.object({
  task: AgentTaskSchema,
  resumeId: z.string().optional().describe("Existing resume ID from MongoDB"),
  rawText: z.string().min(50, "Resume text too short").describe("Raw resume text"),
  jobDescription: z.string().optional().describe("Optional job description for context"),
  userPreferences: z
    .object({
      targetRole: z.string().optional()
    })
    .optional()
})

export type AgentRequest = z.infer<typeof AgentRequestSchema>

export const ResumeAnalysisInputSchema = z.object({
  resumeText: z.string().describe("Full resume text"),
  targetRole: z.string().optional().describe("Target job role for tailored feedback")
})

export const ResumeAnalysisOutputSchema = z.object({
  atsScore: z.number().min(0).max(100),
  overallGrade: z.enum(["A", "B", "C", "D", "F"]),
  summary: z.string().describe("High-level assessment"),
  sections: z.object({
    contact: z.object({ score: z.number(), feedback: z.string() }),
    summary: z.object({ score: z.number(), feedback: z.string() }),
    experience: z.object({ score: z.number(), feedback: z.string() }),
    skills: z.object({ score: z.number(), feedback: z.string() }),
    education: z.object({ score: z.number(), feedback: z.string() }),
    projects: z.object({ score: z.number(), feedback: z.string() })
  }),
  improvements: z.array(
    z.object({
      priority: z.enum(["high", "medium", "low"]),
      section: z.string(),
      issue: z.string(),
      suggestion: z.string()
    })
  ),
  keywords: z.array(z.string()).describe("Extracted keywords from resume"),
  extractedData: z.object({
    personal: PersonalSchema,
    skills: SkillsSchema,
    experience: z.array(ExperienceSchema),
    education: z.array(EducationSchema),
    projects: z.array(ProjectSchema),
    certifications: z.array(CertificationSchema),
    summary: z.string().nullable()
  })
})

export type ResumeAnalysisOutput = z.infer<typeof ResumeAnalysisOutputSchema>

export const AgentOutputSchema = z.object({
  task: z.literal("full_resume_analysis"),
  result: ResumeAnalysisOutputSchema,
  resumeId: z.string().optional(),
  tokensUsed: z.number().optional()
})

export type AgentOutput = z.infer<typeof AgentOutputSchema>
