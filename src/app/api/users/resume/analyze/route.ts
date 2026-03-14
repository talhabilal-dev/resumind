import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import {
  AgentRequestSchema,
  CREDIT_USD_RATE,
  RESUME_TASK_CREDIT_COST,
  resumeAgentApiRequestSchema,
  type AgentOutput
} from "@/schemas/resumeAgentSchema"
import { runResumeAgent } from "@/services/resumeService"
import { connectDB } from "@/lib/db"
import { decodeToken } from "@/helpers/decodeToken"
import { ResumeModel } from "@/models/resumeModel"

const InternalRequestBodySchema = AgentRequestSchema.extend({
  sessionId: z.string().optional().describe("Optional session ID for multi-turn memory")
})

type FrontendAnalysisResponse = {
  output: {
    summary: string
    score: number | null
    recommendations: Array<{
      title: string
      action: string
      impact: "low" | "medium" | "high"
    }>
    missingKeywords: string[]
  }
  safeguards: {
    citationCoverage: number
    warnings: string[]
  }
  cost: {
    creditsCharged: number
    usdCharged: number
    tokenUsage: {
      inputTokens: number
      outputTokens: number
      totalTokens: number
    }
  }
}

function toFrontendResponse(
  output: AgentOutput,
  tokenUsage: number
): FrontendAnalysisResponse {
  const creditsCharged = RESUME_TASK_CREDIT_COST.full_resume_analysis

  const recommendations = output.result.improvements.slice(0, 12).map((item, index) => ({
    title: `${item.section} Improvement ${index + 1}`,
    action: item.suggestion,
    impact: item.priority
  }))

  return {
    output: {
      summary: output.result.summary,
      score: output.result.atsScore,
      recommendations,
      missingKeywords: output.result.keywords.slice(0, 30)
    },
    safeguards: {
      citationCoverage: 1,
      warnings: []
    },
    cost: {
      creditsCharged,
      usdCharged: Number((creditsCharged * CREDIT_USD_RATE).toFixed(2)),
      tokenUsage: {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: tokenUsage
      }
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload: any = await decodeToken(req)
    const userId = payload?.userId

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in.", success: false },
        { status: 401 }
      )
    }

    const body = await req.json()
    const parsedApi = resumeAgentApiRequestSchema.safeParse(body)

    if (!parsedApi.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsedApi.error.flatten()
        },
        { status: 400 }
      )
    }

    const internalBody = {
      task: "full_resume_analysis" as const,
      rawText: parsedApi.data.resumeText,
      jobDescription: parsedApi.data.jobDescription,
      userPreferences: {
        targetRole: parsedApi.data.jobTitle
      }
    }

    const parsed = InternalRequestBodySchema.safeParse(internalBody)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid normalized request body",
          details: parsed.error.flatten()
        },
        { status: 400 }
      )
    }

    await connectDB()

    const result = await runResumeAgent({
      userId,
      request: parsed.data,
      sessionId: parsed.data.sessionId
    })

    if (!result.success || !result.output) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    const totalTokens = result.tokensUsed ?? 0
    const frontendData = toFrontendResponse(result.output, totalTokens)

    if (result.resumeId) {
      const setPayload: Record<string, unknown> = {
        "parsedData.task": "full_resume_analysis",
        "parsedData.jobTitle": parsedApi.data.jobTitle,
        "parsedData.executedTask": "full_resume_analysis",
        "aiMetadata.tokensUsed": totalTokens
      }

      if (parsedApi.data.jobTitle) {
        setPayload.title = parsedApi.data.jobTitle
      }

      await ResumeModel.findOneAndUpdate(
        { _id: result.resumeId, userId },
        { $set: setPayload }
      )
    }

    return NextResponse.json(
      {
        success: true,
        task: "full_resume_analysis",
        data: frontendData,
        credits: {
          charged: frontendData.cost.creditsCharged
        },
        output: result.output,
        resumeId: result.resumeId,
        meta: {
          tokensUsed: result.tokensUsed,
          durationMs: result.durationMs
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[POST /api/resume/agent] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const payload: any = await decodeToken(req)
    const userId = payload?.userId

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in.", success: false },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const resumeId = searchParams.get("resumeId")

    if (!resumeId) {
      return NextResponse.json({ error: "resumeId is required" }, { status: 400 })
    }

    await connectDB()

    const resume = await ResumeModel.findOne({
      _id: resumeId,
      userId
    }).lean()

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, resume }, { status: 200 })
  } catch (error) {
    console.error("[GET /api/resume/agent] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
