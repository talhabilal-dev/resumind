import { NextRequest, NextResponse } from "next/server"
import { Types } from "mongoose"

import { decodeToken } from "@/helpers/decodeToken"
import { connectDB } from "@/lib/db"
import { buildImprovedCvPdf } from "../../../../../../helpers/jdImprovedCvPdf"
import User from "@/models/userModel"
import { JdAnalysisModel } from "@/models/jdAnalysisModel"
import { CreditTransactionModel } from "@/models/transactionModel"
import {
    ImproveResumeRequestSchema,
    JD_IMPROVED_CV_CREDIT_COST,
} from "@/schemas/jdAnalysisSchema"

function sanitiseBaseName(value?: string): string {
    const base = (value || "improved-cv")
        .replace(/\.[^./\\]+$/, "")
        .replace(/[^a-zA-Z0-9\-_ ]/g, "")
        .trim()
        .slice(0, 70)
    return base || "improved-cv"
}

// ─── POST /api/users/resume/jd-analysis/improve ───────────────────────────────
export async function POST(req: NextRequest) {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const payload: any = await decodeToken(req)
    const userId = payload?.userId
    if (!userId) {
        return NextResponse.json(
            { error: "Unauthorized. Please log in.", success: false },
            { status: 401 }
        )
    }

    // ── Body ──────────────────────────────────────────────────────────────────
    let body: unknown
    try {
        body = await req.json()
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body.", success: false },
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

    const { analysisId } = parsed.data

    // Validate ObjectId format early
    if (!Types.ObjectId.isValid(analysisId)) {
        return NextResponse.json(
            { error: "Invalid analysisId.", success: false },
            { status: 400 }
        )
    }

    await connectDB()

    // ── Fetch analysis record ─────────────────────────────────────────────────
    const record = await JdAnalysisModel.findOne({
        _id: analysisId,
        userId,
    })
        .select("analysisResult jobTitle companyName improvedCvGenerated")
        .lean()

    if (!record) {
        return NextResponse.json(
            { error: "Analysis record not found.", success: false },
            { status: 404 }
        )
    }

    const analysis = record.analysisResult as any

    if (!analysis?.improved_resume_content) {
        return NextResponse.json(
            {
                error:
                    "This analysis does not contain improved resume content. Please re-run the analysis.",
                success: false,
            },
            { status: 422 }
        )
    }

    // ── Credit check ──────────────────────────────────────────────────────────
    const user = await User.findById(userId)
    if (!user) {
        return NextResponse.json(
            { error: "User not found.", success: false },
            { status: 404 }
        )
    }

    if ((user.credits ?? 0) < JD_IMPROVED_CV_CREDIT_COST) {
        return NextResponse.json(
            {
                error: "Insufficient credits",
                message: `You need ${JD_IMPROVED_CV_CREDIT_COST} credits to generate an improved CV.`,
                credits: user.credits,
                required: JD_IMPROVED_CV_CREDIT_COST,
                success: false,
            },
            { status: 402 }
        )
    }

    // ── Build PDF ─────────────────────────────────────────────────────────────
    let pdfBytes: Uint8Array
    try {
        pdfBytes = await buildImprovedCvPdf(analysis.improved_resume_content, {
            jobTitle: record.jobTitle,
            companyName: record.companyName,
            atsScore: analysis.ats_score,
            jdMatchScore: analysis.jd_match_score,
        })
    } catch (err: any) {
        console.error("[jd-analysis/improve] PDF build error:", err?.message || err)
        return NextResponse.json(
            { error: "Failed to generate improved CV PDF.", success: false },
            { status: 500 }
        )
    }

    // ── Deduct credits ────────────────────────────────────────────────────────
    user.credits -= JD_IMPROVED_CV_CREDIT_COST
    await user.save()

    await CreditTransactionModel.create({
        userId,
        amount: JD_IMPROVED_CV_CREDIT_COST,
        type: "usage",
        description: `Improved CV generation (${JD_IMPROVED_CV_CREDIT_COST} credits)${record.jobTitle ? ` — ${record.jobTitle}` : ""}`,
    })

    // Mark analysis as having generated an improved CV (informational)
    await JdAnalysisModel.updateOne({ _id: analysisId }, { $set: { improvedCvGenerated: true } })

    // ── Return PDF ────────────────────────────────────────────────────────────
    const baseName = sanitiseBaseName(record.jobTitle || "improved-cv")
    const filename = `${baseName}-improved.pdf`
    const buffer = new ArrayBuffer(pdfBytes.byteLength)
    new Uint8Array(buffer).set(pdfBytes)

    return new NextResponse(new Blob([buffer], { type: "application/pdf" }), {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Cache-Control": "no-store",
            "X-Credits-Remaining": String(user.credits),
        },
    })
}