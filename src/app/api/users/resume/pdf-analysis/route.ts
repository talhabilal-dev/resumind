import { NextRequest, NextResponse } from "next/server"
import { ChatOpenAI } from "@langchain/openai"
import mammoth from "mammoth"
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (
  data: Buffer
) => Promise<{ text?: string }>

import { decodeToken } from "@/helpers/decodeToken"
import { connectDB } from "@/lib/db"
import User from "@/models/userModel"
import { CreditTransactionModel } from "@/models/transactionModel"
import { ResumeModel } from "@/models/resumeModel"
import { RESUME_TASK_CREDIT_COST } from "@/schemas/resumeAgentSchema"
import {
  PdfAnalysisOutputSchema,
  type PdfAnalysisOutput
} from "@/schemas/pdfAnalysisSchema"

const MAX_RESUME_FILE_SIZE = 5 * 1024 * 1024
const SUPPORTED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt"]

function getFileExtension(filename: string): string {
  const dot = filename.lastIndexOf(".")
  if (dot < 0) return ""
  return filename.slice(dot).toLowerCase()
}

function normalizeExtractedText(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim()
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const parsed = await pdfParse(buffer)
  return parsed.text || ""
}

const getLLM = () =>
  new ChatOpenAI({
    model: "gpt-4.1-mini",
    temperature: 0.2,
    apiKey: process.env.OPENAI_API_KEY
  })

export async function POST(req: NextRequest) {
  try {
    const payload: any = await decodeToken(req)
    const userId = payload?.userId

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      )
    }

    await connectDB()

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 })
    }

    const requiredCredits = RESUME_TASK_CREDIT_COST.full_resume_analysis
    if ((user.credits ?? 0) < requiredCredits) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          message: `You need ${requiredCredits} credits for PDF analysis.`,
          credits: user.credits,
          required: requiredCredits
        },
        { status: 402 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file") ?? formData.get("resumeFile")
    const jobTitle = String(formData.get("jobTitle") || "").trim()
    const companyName = String(formData.get("companyName") || "").trim()

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size <= 0 || file.size > MAX_RESUME_FILE_SIZE) {
      return NextResponse.json(
        { error: "Resume file must be between 1 byte and 5MB." },
        { status: 400 }
      )
    }

    const extension = getFileExtension(file.name)
    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { error: "Resume must be PDF, DOC, DOCX, or TXT." },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let extractedText = ""

    if (extension === ".txt") {
      extractedText = buffer.toString("utf-8")
    } else if (extension === ".pdf") {
      extractedText = await extractPdfText(buffer)
    } else if (extension === ".docx") {
      const parsed = await mammoth.extractRawText({ buffer })
      extractedText = parsed.value || ""
    } else {
      return NextResponse.json(
        {
          error:
            "DOC extraction is not supported directly. Please convert to DOCX/TXT or paste resume text."
        },
        { status: 400 }
      )
    }

    const resumeText = normalizeExtractedText(extractedText)
    if (!resumeText || resumeText.length < 120) {
      return NextResponse.json(
        {
          error:
            "Could not extract enough text from this file. Please use a clearer file."
        },
        { status: 422 }
      )
    }

    const llm = getLLM()
    const structured = llm.withStructuredOutput(PdfAnalysisOutputSchema)

    const feedback: PdfAnalysisOutput = await structured.invoke([
      {
        role: "system",
        content: `You are a senior resume reviewer and ATS expert.
Return strict JSON matching the requested schema.
Do not fabricate facts.
Give practical, specific feedback with clear good/improve tips.`
      },
      {
        role: "user",
        content: `Analyze this resume${jobTitle ? ` for a ${jobTitle} position` : ""}${companyName ? ` at ${companyName}` : ""}.

RESUME TEXT:\n${resumeText}

Scoring guidance:
- Tone & Style: professional language, clarity, active voice
- Content: relevance, quantified impact, achievements
- Structure: organization, readability, ATS compatibility
- Skills: relevant hard/soft skills and keyword alignment

Return at least 2 and at most 6 tips per category, mixing \"good\" and \"improve\".`
      }
    ])

    await ResumeModel.create({
      userId,
      title: `${jobTitle || "PDF Resume"} Analysis`,
      rawText: resumeText,
      atsScore: feedback.overallScore,
      keywords: [],
      parsedData: {
        task: "pdf_resume_analysis",
        jobTitle: jobTitle || file.name,
        jobDescription: companyName || undefined,
        output: feedback,
        safeguards: {
          validationPassed: true,
          citationCoverage: 1,
          warnings: []
        }
      },
      aiMetadata: {
        lastAnalyzedAt: new Date()
      }
    })

    user.credits -= requiredCredits
    await user.save()

    await CreditTransactionModel.create({
      userId,
      amount: requiredCredits,
      type: "usage",
      description: `PDF resume analysis (${requiredCredits} credits) - ${file.name}`
    })

    return NextResponse.json(
      {
        success: true,
        feedback,
        meta: {
          fileName: file.name,
          mimeType: file.type,
          extractedLength: resumeText.length
        },
        creditsRemaining: user.credits
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error analyzing PDF resume:", error?.message || error)
    return NextResponse.json(
      { error: "Failed to analyze resume", details: error?.message || "Unknown error" },
      { status: 500 }
    )
  }
}
