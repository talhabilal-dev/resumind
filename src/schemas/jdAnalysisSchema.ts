import { z } from "zod"

// ─── Credit costs ─────────────────────────────────────────────────────────────
export const JD_ANALYSIS_CREDIT_COST = 5
export const JD_IMPROVED_CV_CREDIT_COST = 3

// ─── Sub-schemas ──────────────────────────────────────────────────────────────
export const ImprovementSuggestionSchema = z.object({
    section: z.string().trim().min(1).max(80),
    issue: z.string().trim().min(1).max(400),
    suggestion: z.string().trim().min(1).max(700),
})

export const ImprovedResumeContentSchema = z.object({
    summary: z.string().trim().max(2000),
    experience: z.string().trim().max(7000),
    skills: z.string().trim().max(2000),
    projects: z.string().trim().max(5000),
})

// ─── Main AI output schema (matches the required JSON format) ─────────────────
export const JdAnalysisOutputSchema = z.object({
    ats_score: z.number().min(0).max(100),
    jd_match_score: z.number().min(0).max(100),
    missing_keywords: z
        .array(z.string().trim().min(1).max(80))
        .min(0)
        .max(30),
    strengths: z
        .array(z.string().trim().min(5).max(500))
        .min(1)
        .max(10),
    weaknesses: z
        .array(z.string().trim().min(5).max(500))
        .min(1)
        .max(10),
    improvement_suggestions: z
        .array(ImprovementSuggestionSchema)
        .min(1)
        .max(15),
    improved_resume_content: ImprovedResumeContentSchema,
})

export type JdAnalysisOutput = z.infer<typeof JdAnalysisOutputSchema>
export type ImprovementSuggestion = z.infer<typeof ImprovementSuggestionSchema>
export type ImprovedResumeContent = z.infer<typeof ImprovedResumeContentSchema>

// ─── Request validation ───────────────────────────────────────────────────────
export const JdAnalysisApiRequestSchema = z.object({
    jobTitle: z.string().trim().min(2).max(120).optional(),
    companyName: z.string().trim().max(120).optional(),
    jobDescription: z
        .string()
        .trim()
        .min(50, "Job description must be at least 50 characters")
        .max(12000, "Job description must be at most 12,000 characters"),
})

export type JdAnalysisApiRequest = z.infer<typeof JdAnalysisApiRequestSchema>

// ─── Improve-CV request (JSON body) ──────────────────────────────────────────
export const ImproveResumeRequestSchema = z.object({
    analysisId: z.string().trim().min(1, "analysisId is required"),
})

export type ImproveResumeRequest = z.infer<typeof ImproveResumeRequestSchema>