import { Types } from "mongoose"
import { ResumeModel, type IExperience, type IResume } from "../models/resumeModel"
import { getResumeAgent } from "../helpers/resumeAgent"
import {
  AgentRequestSchema,
  type AgentRequest,
  type AgentOutput,
  type ResumeAnalysisOutput
} from "../schemas/resumeAgentSchema"

export interface RunAgentOptions {
  userId: string
  request: AgentRequest
  sessionId?: string
}

export interface RunAgentResult {
  success: boolean
  output?: AgentOutput
  resumeId?: string
  error?: string
  tokensUsed?: number
  durationMs?: number
}

function toValidDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined

  const normalized = value.trim().toLowerCase()
  if (!normalized || normalized === "present" || normalized === "current" || normalized === "ongoing") {
    return undefined
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

function toResumeExperience(exp: {
  company: string
  role: string
  location: string | null
  startDate: string
  endDate: string | null
  current: boolean | null
  achievements: string[]
}): IExperience | undefined {
  const startDate = toValidDate(exp.startDate)
  if (!startDate) {
    return undefined
  }

  return {
    ...exp,
    location: exp.location ?? undefined,
    startDate,
    endDate: toValidDate(exp.endDate),
    current: exp.current ?? undefined
  }
}

function mapAnalysisToResume(
  userId: string,
  rawText: string,
  output: ResumeAnalysisOutput,
  existing?: Partial<IResume>
): Partial<IResume> {
  const { extractedData } = output

  return {
    userId: new Types.ObjectId(userId),
    rawText,
    title: existing?.title ?? `Resume v${(existing?.version ?? 0) + 1}`,
    version: (existing?.version ?? 0) + 1,
    atsScore: output.atsScore,
    keywords: output.keywords,
    parsedData: {
      analysis: {
        overallGrade: output.overallGrade,
        sections: output.sections,
        improvements: output.improvements,
        summary: output.summary
      }
    },
    personal: {
      fullName: extractedData.personal.fullName ?? "",
      email: extractedData.personal.email ?? "",
      phone: extractedData.personal.phone || undefined,
      location: extractedData.personal.location || undefined,
      website: extractedData.personal.website || undefined,
      linkedin: extractedData.personal.linkedin || undefined,
      github: extractedData.personal.github || undefined
    },
    summary: extractedData.summary ?? existing?.summary,
    skills: {
      technical: extractedData.skills.technical ?? [],
      soft: extractedData.skills.soft ?? [],
      tools: extractedData.skills.tools ?? [],
      languages: extractedData.skills.languages ?? []
    },
    experience:
      extractedData.experience
        ?.map(toResumeExperience)
        .filter((exp): exp is IExperience => Boolean(exp)) ?? existing?.experience ?? [],
    education:
      extractedData.education?.map((edu) => ({
        ...edu,
        field: edu.field ?? undefined,
        startDate: toValidDate(edu.startDate),
        endDate: toValidDate(edu.endDate)
      })) ?? existing?.education ?? [],
    projects:
      extractedData.projects?.map((project) => ({
        ...project,
        url: project.url ?? undefined,
        achievements: project.achievements ?? []
      })) ?? existing?.projects ?? [],
    certifications:
      extractedData.certifications?.map((cert) => ({
        ...cert,
        date: toValidDate(cert.date)
      })) ?? existing?.certifications ?? [],
    aiMetadata: {
      lastAnalyzedAt: new Date()
    }
  }
}

async function persistOutput(
  userId: string,
  rawText: string,
  output: AgentOutput,
  existingResumeId?: string
): Promise<string | undefined> {
  if (output.task !== "full_resume_analysis") {
    throw new Error(`Unsupported output task: ${output.task}`)
  }

  let existing: Partial<IResume> | undefined
  if (existingResumeId) {
    const found = await ResumeModel.findOne({
      _id: existingResumeId,
      userId: new Types.ObjectId(userId)
    }).lean()
    if (found) existing = found as Partial<IResume>
  }

  const resumeData = mapAnalysisToResume(
    userId,
    rawText,
    output.result as ResumeAnalysisOutput,
    existing
  )

  if (existingResumeId && existing) {
    await ResumeModel.findByIdAndUpdate(existingResumeId, { $set: resumeData })
    return existingResumeId
  }

  const created = await ResumeModel.create(resumeData)
  return created._id.toString()
}

export async function runResumeAgent({
  userId,
  request,
  sessionId
}: RunAgentOptions): Promise<RunAgentResult> {
  const validation = AgentRequestSchema.safeParse(request)
  if (!validation.success) {
    return {
      success: false,
      error: `Validation error: ${validation.error.message}`
    }
  }

  const agent = getResumeAgent()

  const agentResult = await agent.run(validation.data, {
    userId,
    sessionId,
    saveToDb: true
  })

  if (!agentResult.success || !agentResult.output) {
    return {
      success: false,
      error: agentResult.error ?? "Agent failed with no output",
      durationMs: agentResult.durationMs
    }
  }

  let resumeId: string | undefined
  try {
    resumeId = await persistOutput(
      userId,
      validation.data.rawText,
      agentResult.output,
      validation.data.resumeId
    )
  } catch (dbError) {
    console.error("[resume-service] DB persist failed:", dbError)
  }

  return {
    success: true,
    output: { ...agentResult.output, resumeId },
    resumeId,
    tokensUsed: agentResult.tokensUsed,
    durationMs: agentResult.durationMs
  }
}
