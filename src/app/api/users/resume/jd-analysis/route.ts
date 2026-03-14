import { NextRequest, NextResponse } from "next/server"
import { ChatOpenAI } from "@langchain/openai"
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (
  data: Buffer
) => Promise<{ text?: string }>
import mammoth from "mammoth"

import { decodeToken } from "@/helpers/decodeToken"
import { connectDB } from "@/lib/db"
import { computeAnalysisHash } from "@/lib/hash"
import User from "@/models/userModel"
import { JdAnalysisModel } from "@/models/jdAnalysisModel"
import { CreditTransactionModel } from "@/models/transactionModel"
import {
  JdAnalysisOutputSchema,
  JdAnalysisApiRequestSchema,
  JD_ANALYSIS_CREDIT_COST,
  type JdAnalysisOutput,
} from "@/schemas/jdAnalysisSchema"

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const MIN_RESUME_LEN = 120
const SUPPORTED_EXT = [".pdf", ".docx", ".txt"]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getExt(filename: string): string {
  const dot = filename.lastIndexOf(".")
  return dot >= 0 ? filename.slice(dot).toLowerCase() : ""
}

function normaliseText(raw: string): string {
  return raw.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim()
}

async function extractText(file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = getExt(file.name)

  if (ext === ".txt") return buffer.toString("utf-8")
  if (ext === ".pdf") {
    const result = await pdfParse(buffer)
    return result.text || ""
  }
  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ buffer })
    return result.value || ""
  }
  throw new Error("Unsupported file type for text extraction.")
}

function getLLM() {
  return new ChatOpenAI({
    model: "gpt-4.1-mini",
    temperature: 0.2,
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// ─── POST /api/users/resume/jd-analysis ──────────────────────────────────────
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

  // ── Parse multipart form ──────────────────────────────────────────────────
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json(
      { error: "Invalid multipart form data.", success: false },
      { status: 400 }
    )
  }

  const file = formData.get("file")
  const rawJd = formData.get("jobDescription")
  const rawJobTitle = formData.get("jobTitle")
  const rawCompanyName = formData.get("companyName")

  // ── Validate text fields ──────────────────────────────────────────────────
  const parsed = JdAnalysisApiRequestSchema.safeParse({
    jobDescription: rawJd ? String(rawJd) : "",
    jobTitle: rawJobTitle ? String(rawJobTitle).trim() : undefined,
    companyName: rawCompanyName ? String(rawCompanyName).trim() : undefined,
  })
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message || "Invalid request fields.",
        success: false,
      },
      { status: 400 }
    )
  }

  // ── Validate file ─────────────────────────────────────────────────────────
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "A CV file is required.", success: false },
      { status: 400 }
    )
  }
  if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File must be between 1 byte and 5 MB.", success: false },
      { status: 400 }
    )
  }
  const ext = getExt(file.name)
  if (!SUPPORTED_EXT.includes(ext)) {
    return NextResponse.json(
      { error: "Supported formats: PDF, DOCX, TXT.", success: false },
      { status: 400 }
    )
  }

  // ── Extract CV text ───────────────────────────────────────────────────────
  let cvText: string
  try {
    cvText = normaliseText(await extractText(file))
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to extract text from CV.", success: false },
      { status: 422 }
    )
  }

  if (cvText.length < MIN_RESUME_LEN) {
    return NextResponse.json(
      {
        error:
          "Could not extract enough text from the CV file. Please use a text-based PDF or paste the content manually.",
        success: false,
      },
      { status: 422 }
    )
  }

  const { jobDescription, jobTitle, companyName } = parsed.data

  // ── Connect DB ────────────────────────────────────────────────────────────
  await connectDB()

  // ── Cache lookup ──────────────────────────────────────────────────────────
  const contentHash = computeAnalysisHash(cvText, jobDescription)

  const cached = await JdAnalysisModel.findOne({ userId, contentHash })
    .select("analysisResult tokensUsed creditsCharged jobTitle companyName")
    .lean()

  if (cached) {
    return NextResponse.json(
      {
        success: true,
        cached: true,
        analysisId: String((cached as any)._id),
        jobTitle: cached.jobTitle,
        companyName: cached.companyName,
        analysis: cached.analysisResult,
        meta: {
          creditsCharged: 0,
          cached: true,
          tokensUsed: cached.tokensUsed,
        },
      },
      { status: 200 }
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
  if ((user.credits ?? 0) < JD_ANALYSIS_CREDIT_COST) {
    return NextResponse.json(
      {
        error: "Insufficient credits",
        message: `You need ${JD_ANALYSIS_CREDIT_COST} credits to analyse a CV.`,
        credits: user.credits,
        required: JD_ANALYSIS_CREDIT_COST,
        success: false,
      },
      { status: 402 }
    )
  }

  // ── AI analysis ───────────────────────────────────────────────────────────
  const llm = getLLM()
  const structured = llm.withStructuredOutput(JdAnalysisOutputSchema)

  const systemPrompt = `You are a senior ATS consultant and professional resume coach with 15+ years of experience.
Analyse the candidate's CV against the provided Job Description.
Be objective, specific, and constructive.
The improved_resume_content must be ready-to-use text the candidate can paste directly into their CV.
Do NOT fabricate companies, dates, or credentials that are not in the original CV.
Return strict JSON matching the requested schema.`

  const userPrompt = `CANDIDATE CV:
${cvText}

JOB DESCRIPTION${jobTitle ? ` (${jobTitle}${companyName ? ` @ ${companyName}` : ""})` : ""}:
${jobDescription}

Analyse the CV against the job description and return:
- ats_score (0-100): ATS parse-ability score
- jd_match_score (0-100): how well the CV matches the JD
- missing_keywords: keywords in JD missing from CV (max 20)
- strengths: what the candidate does well (3-6 points)
- weaknesses: gaps or weak areas (3-6 points)
- improvement_suggestions: specific fixes by section (5-10 items)
- improved_resume_content: rewritten summary, experience, skills, and projects sections using the candidate's actual background but with stronger language, better ATS keywords, and measurable impact where supported by the original CV`

  let analysis: JdAnalysisOutput
  let tokensUsed = 0

  try {
    // LangChain structured output does not expose raw token counts for gpt-4.1-mini
    // via withStructuredOutput; we'll store 0 as an approximation
    analysis = await structured.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ])
    // Rough token estimate (4 chars ≈ 1 token)
    tokensUsed = Math.round((cvText.length + jobDescription.length + 2000) / 4)
  } catch (err: any) {
    console.error("[jd-analysis] AI error:", err?.message || err)
    return NextResponse.json(
      { error: "AI analysis failed. Please try again.", success: false },
      { status: 500 }
    )
  }

  // ── Persist analysis to cache ─────────────────────────────────────────────
  const saved = await JdAnalysisModel.create({
    userId,
    contentHash,
    jobTitle,
    companyName,
    jobDescription,
    analysisResult: analysis,
    tokensUsed,
    creditsCharged: JD_ANALYSIS_CREDIT_COST,
  })

  // ── Deduct credits ────────────────────────────────────────────────────────
  user.credits -= JD_ANALYSIS_CREDIT_COST
  await user.save()

  await CreditTransactionModel.create({
    userId,
    amount: JD_ANALYSIS_CREDIT_COST,
    type: "usage",
    description: `JD CV analysis (${JD_ANALYSIS_CREDIT_COST} credits)${jobTitle ? ` — ${jobTitle}` : ""}`,
  })

  return NextResponse.json(
    {
      success: true,
      cached: false,
      analysisId: String(saved._id),
      jobTitle,
      companyName,
      analysis,
      meta: {
        creditsCharged: JD_ANALYSIS_CREDIT_COST,
        creditsRemaining: user.credits,
        cached: false,
        tokensUsed,
      },
    },
    { status: 200 }
  )
}