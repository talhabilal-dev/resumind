import { fullResumeAnalysisTool } from "./resumeTool"
import {
  AgentRequestSchema,
  AgentOutputSchema,
  type AgentRequest,
  type AgentOutput,
  type ResumeAnalysisOutput
} from "../schemas/resumeAgentSchema"
import { ZodError } from "zod"

export interface AgentRunOptions {
  userId?: string
  sessionId?: string
  saveToDb?: boolean
}

export interface AgentRunResult {
  success: boolean
  output?: AgentOutput
  error?: string
  tokensUsed?: number
  durationMs?: number
}

function parseToolResult(rawResult: string): AgentOutput["result"] {
  const normalizedRaw = rawResult.trim()
  if (/^error\s*:/i.test(normalizedRaw)) {
    throw new Error(`Tool execution failed for task \"full_resume_analysis\": ${normalizedRaw.slice(0, 500)}`)
  }

  const tryParseJson = (input: string): unknown => JSON.parse(input)

  const extractJsonCandidate = (input: string): string => {
    const fenced = input.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
    if (fenced?.[1]) {
      return fenced[1].trim()
    }

    const start = input.indexOf("{")
    const end = input.lastIndexOf("}")
    if (start !== -1 && end !== -1 && end > start) {
      return input.slice(start, end + 1)
    }

    return input.trim()
  }

  let parsed: unknown

  try {
    parsed = tryParseJson(rawResult)
  } catch {
    try {
      parsed = tryParseJson(extractJsonCandidate(rawResult))
    } catch {
      console.error("[resume-agent] tool-parse:invalid-json", {
        task: "full_resume_analysis",
        preview: rawResult.slice(0, 220)
      })
      throw new Error("Failed to parse tool result for task: full_resume_analysis")
    }
  }

  const validated = AgentOutputSchema.parse({ task: "full_resume_analysis", result: parsed })
  return validated.result as ResumeAnalysisOutput
}

function normalizeToolMessageContent(content: unknown): string {
  if (typeof content === "string") {
    return content
  }

  if (Array.isArray(content)) {
    const textParts = content
      .map((block: any) => {
        if (typeof block === "string") return block
        if (block?.type === "text" && typeof block?.text === "string") return block.text
        if (typeof block?.content === "string") return block.content
        return null
      })
      .filter((value): value is string => typeof value === "string" && value.length > 0)

    if (textParts.length > 0) {
      return textParts.join("\n")
    }
  }

  return JSON.stringify(content)
}

export class ResumeAgent {
  async run(request: AgentRequest, options: AgentRunOptions = {}): Promise<AgentRunResult> {
    const startTime = Date.now()

    const parsed = AgentRequestSchema.safeParse(request)
    if (!parsed.success) {
      return {
        success: false,
        error: `Invalid request: ${parsed.error.message}`
      }
    }

    if (parsed.data.task !== "full_resume_analysis") {
      return {
        success: false,
        error: `Unsupported task: ${parsed.data.task}`
      }
    }

    try {
      const rawToolOutput = await fullResumeAnalysisTool.invoke({
        resumeText: parsed.data.rawText,
        targetRole: parsed.data.userPreferences?.targetRole
      })

      const content = normalizeToolMessageContent(rawToolOutput)
      const result = parseToolResult(content)

      const output = {
        task: "full_resume_analysis",
        result,
        resumeId: options.userId,
      } as AgentOutput

      return {
        success: true,
        output,
        durationMs: Date.now() - startTime
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return {
          success: false,
          error: `Schema validation failed: ${error.message}`
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        durationMs: Date.now() - startTime
      }
    }
  }
}

let agentInstance: ResumeAgent | null = null

export function getResumeAgent(): ResumeAgent {
  if (!agentInstance) {
    agentInstance = new ResumeAgent()
  }
  return agentInstance
}
