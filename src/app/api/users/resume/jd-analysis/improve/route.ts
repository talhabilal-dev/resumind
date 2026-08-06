import { NextRequest, NextResponse } from "next/server"

import { decodeToken } from "@/helpers/decodeToken"
import { connectDB } from "@/lib/db"
import { deductCredits } from "@/helpers/credits"
import { buildImprovedCvPdf } from "@/helpers/improvedCvPdf"
import { JdAnalysisModel } from "@/models/jdAnalysisModel"
import {
  ImproveResumeRequestSchema,
  JD_IMPROVED_CV_CREDIT_COST,
  type ImprovedResumeContent,
} from "@/schemas/jdAnalysisSchema"

// ─── POST /api/users/resume/jd-analysis/improve ─────────────────────────────
export async function POST(req: NextRequest) {
  const payload: any = await decodeToken(req)
  const userId = payload?.userId
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in.", success: false },
      { status: 401 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid request body.", success: false },
      { status: 400 }
    )
  }

  const parsed = ImproveResumeRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message || "Invalid request.",
        success: false,
      },
      { status: 400 }
    )
  }

  await connectDB()

  const analysis = await JdAnalysisModel.findOne({
    _id: parsed.data.analysisId,
    userId,
  })
    .select("analysisResult jobTitle companyName")
    .lean()

  if (!analysis) {
    return NextResponse.json(
      { error: "Analysis not found.", success: false },
      { status: 404 }
    )
  }

  const improved = (analysis.analysisResult as any)?.improved_resume_content as
    | ImprovedResumeContent
    | undefined

  if (!improved || !Object.values(improved).some((v) => String(v).trim())) {
    return NextResponse.json(
      {
        error: "No improved resume content is available for this analysis.",
        success: false,
      },
      { status: 422 }
    )
  }

  const deduction = await deductCredits({
    userId,
    amount: JD_IMPROVED_CV_CREDIT_COST,
    description: `Improved CV generation (${JD_IMPROVED_CV_CREDIT_COST} credits)${
      analysis.jobTitle ? ` — ${analysis.jobTitle}` : ""
    }`,
  })

  if (!deduction.success) {
    if (deduction.reason === "user-not-found") {
      return NextResponse.json(
        { error: "User not found.", success: false },
        { status: 404 }
      )
    }
    return NextResponse.json(
      {
        error: "Insufficient credits",
        message: `You need ${JD_IMPROVED_CV_CREDIT_COST} credits to generate an improved CV.`,
        credits: deduction.creditsAvailable,
        required: JD_IMPROVED_CV_CREDIT_COST,
        success: false,
      },
      { status: 402 }
    )
  }

  try {
    const pdfBytes = await buildImprovedCvPdf(improved, {
      jobTitle: analysis.jobTitle,
      companyName: analysis.companyName,
    })

    await JdAnalysisModel.updateOne(
      { _id: parsed.data.analysisId, userId },
      { $set: { improvedCvGenerated: true } }
    )

    return new NextResponse(new Uint8Array(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="improved-cv.pdf"`,
        "X-Credits-Remaining": String(deduction.creditsRemaining),
        "Cache-Control": "no-store",
      },
    })
  } catch (error: any) {
    console.error("[jd-analysis/improve] PDF build error:", error?.message || error)
    return NextResponse.json(
      { error: "Failed to generate the improved CV PDF.", success: false },
      { status: 500 }
    )
  }
}