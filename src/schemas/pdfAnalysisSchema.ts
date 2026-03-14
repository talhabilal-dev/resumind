import { z } from "zod"

export const PdfAnalysisTipSchema = z
  .object({
    type: z.enum(["good", "improve"]),
    tip: z.string().trim().min(3).max(120),
    explanation: z.string().trim().min(10).max(600)
  })
  .strict()

export const PdfAnalysisCategorySchema = z
  .object({
    score: z.number().min(0).max(100),
    tips: z.array(PdfAnalysisTipSchema).min(2).max(6)
  })
  .strict()

export const PdfAnalysisOutputSchema = z
  .object({
    overallScore: z.number().min(0).max(100),
    toneAndStyle: PdfAnalysisCategorySchema,
    content: PdfAnalysisCategorySchema,
    structure: PdfAnalysisCategorySchema,
    skills: PdfAnalysisCategorySchema
  })
  .strict()

export type PdfAnalysisOutput = z.infer<typeof PdfAnalysisOutputSchema>
