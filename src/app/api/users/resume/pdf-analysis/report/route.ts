import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { decodeToken } from "@/helpers/decodeToken"
import { buildPdfAnalysisReport } from "@/helpers/pdfAnalysisReport"
import { PdfAnalysisOutputSchema } from "@/schemas/pdfAnalysisSchema"

const PdfAnalysisReportRequestSchema = z
  .object({
    feedback: PdfAnalysisOutputSchema,
    jobTitle: z.string().trim().max(120).optional(),
    companyName: z.string().trim().max(120).optional(),
    sourceFileName: z.string().trim().max(180).optional(),
    analyzedAt: z.string().trim().max(80).optional()
  })
  .strict()

function sanitizeFileName(value?: string): string {
  const base = (value || "pdf-analysis-report")
    .replace(/\.[^./\\]+$/, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .slice(0, 80)

  return `${base || "pdf-analysis-report"}.pdf`
}

export async function POST(req: NextRequest) {
  try {
    const payload: any = await decodeToken(req)
    const userId = payload?.userId

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const parsed = PdfAnalysisReportRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid report payload.",
          details: parsed.error.flatten()
        },
        { status: 400 }
      )
    }

    const pdfBytes = await buildPdfAnalysisReport(parsed.data.feedback, {
      jobTitle: parsed.data.jobTitle,
      companyName: parsed.data.companyName,
      sourceFileName: parsed.data.sourceFileName,
      analyzedAt: parsed.data.analyzedAt
    })
    const reportBuffer = new ArrayBuffer(pdfBytes.byteLength)
    new Uint8Array(reportBuffer).set(pdfBytes)

    const fileName = sanitizeFileName(parsed.data.sourceFileName)

    return new NextResponse(new Blob([reportBuffer], { type: "application/pdf" }), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store"
      }
    })
  } catch (error: any) {
    console.error("Error generating PDF analysis report:", error?.message || error)
    return NextResponse.json(
      { success: false, error: "Failed to generate analysis report." },
      { status: 500 }
    )
  }
}
