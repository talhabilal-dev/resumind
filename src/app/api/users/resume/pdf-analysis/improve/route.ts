import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { ChatOpenAI } from "@langchain/openai"
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (
  data: Buffer
) => Promise<{ text?: string }>

import { decodeToken } from "@/helpers/decodeToken"
import { connectDB } from "@/lib/db"
import User from "@/models/userModel"
import { CreditTransactionModel } from "@/models/transactionModel"
import { RESUME_TASK_CREDIT_COST } from "@/schemas/resumeAgentSchema"
import { PdfAnalysisOutputSchema } from "@/schemas/pdfAnalysisSchema"
import { buildImprovedResumePdf } from "@/helpers/improvedResumePdf"

const MAX_RESUME_FILE_SIZE = 5 * 1024 * 1024

const ImprovedResumeOutputSchema = z
  .object({
    improvedResumeText: z.string().trim().min(250).max(40000),
    appliedImprovements: z.array(z.string().trim().min(8).max(240)).min(3).max(20)
  })
  .strict()

function normalizeExtractedText(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim()
}

function sanitizeBaseName(value?: string): string {
  const base = (value || "resume")
    .replace(/\.[^./\\]+$/, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .slice(0, 70)

  return base || "resume"
}

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
          message: `You need ${requiredCredits} credits to generate an improved PDF CV.`,
          credits: user.credits,
          required: requiredCredits
        },
        { status: 402 }
      )
    }

    const formData = await req.formData()
    const file = formData.get("file")
    const feedbackRaw = String(formData.get("feedback") || "")
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

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Improved CV generation currently supports PDF files only." },
        { status: 400 }
      )
    }

    let feedbackInput: unknown
    try {
      feedbackInput = JSON.parse(feedbackRaw)
    } catch {
      return NextResponse.json(
        { error: "Invalid feedback payload." },
        { status: 400 }
      )
    }

    const feedbackParsed = PdfAnalysisOutputSchema.safeParse(feedbackInput)
    if (!feedbackParsed.success) {
      return NextResponse.json(
        {
          error: "Feedback schema validation failed.",
          details: feedbackParsed.error.flatten()
        },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const parsed = await pdfParse(Buffer.from(bytes))
    const resumeText = normalizeExtractedText(parsed.text || "")

    if (!resumeText || resumeText.length < 120) {
      return NextResponse.json(
        {
          error:
            "Could not extract enough text from this PDF. Please upload a clearer PDF file."
        },
        { status: 422 }
      )
    }

    const llm = new ChatOpenAI({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      apiKey: process.env.OPENAI_API_KEY
    })

    const structured = llm.withStructuredOutput(ImprovedResumeOutputSchema)
    const improved = await structured.invoke([
      {
        role: "system",
        content: `You are a professional resume writer.
Use ONLY the resume content and the provided AI improvement suggestions.
Do not invent employers, education, certifications, technologies, dates, or achievements.
Apply only "improve" tips from feedback and preserve strong existing content.
Return strict JSON.`
      },
      {
        role: "user",
        content: `Create an improved resume in ATS-friendly plain-text layout.
Keep the candidate truthful and fact-grounded.

TARGET JOB TITLE: ${jobTitle || "Not provided"}
TARGET COMPANY: ${companyName || "Not provided"}

ORIGINAL RESUME TEXT:
${resumeText}

ANALYSIS FEEDBACK JSON:
${JSON.stringify(feedbackParsed.data)}

Output guidance:
- Use clean section headers (Summary, Skills, Experience, Education, Projects, Certifications if available)
- Strengthen wording and quantification where supported by source text
- Do not add placeholders or fictional claims`
      }
    ])

    const improvedPdfBytes = await buildImprovedResumePdf(improved.improvedResumeText, {
      title: jobTitle,
      sourceFileName: file.name
    })

    user.credits -= requiredCredits
    await user.save()

    await CreditTransactionModel.create({
      userId,
      amount: requiredCredits,
      type: "usage",
      description: `Improved PDF CV generation (${requiredCredits} credits) - ${file.name}`
    })

    const improvedBuffer = new ArrayBuffer(improvedPdfBytes.byteLength)
    new Uint8Array(improvedBuffer).set(improvedPdfBytes)

    const safeBase = sanitizeBaseName(file.name)

    return new NextResponse(new Blob([improvedBuffer], { type: "application/pdf" }), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeBase}-improved.pdf"`,
        "Cache-Control": "no-store",
        "X-Credits-Remaining": String(user.credits)
      }
    })
  } catch (error: any) {
    console.error("Error generating improved PDF CV:", error?.message || error)
    return NextResponse.json(
      { error: "Failed to generate improved PDF CV." },
      { status: 500 }
    )
  }
}
