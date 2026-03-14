import { tool } from "@langchain/core/tools"
import { ChatOpenAI } from "@langchain/openai"
import {
  ResumeAnalysisInputSchema,
  ResumeAnalysisOutputSchema,
  type ResumeAnalysisOutput
} from "../schemas/resumeAgentSchema"

const getLLM = () =>
  new ChatOpenAI({
    model: "gpt-4.1-mini",
    temperature: 0.3,
    apiKey: process.env.OPENAI_API_KEY
  })

export const fullResumeAnalysisTool = tool(
  async (input): Promise<string> => {
    const llm = getLLM()
    const structured = llm.withStructuredOutput(ResumeAnalysisOutputSchema)

    const result: ResumeAnalysisOutput = await structured.invoke([
      {
        role: "system",
        content: `You are a senior resume consultant and ATS expert with 15+ years of experience.
Analyze resumes holistically: structure, content quality, ATS optimization, and impact.
Extract ALL structured data from the resume accurately.
Provide honest, actionable feedback. Score sections objectively (0-100).
Prioritize improvements: high = must fix, medium = should fix, low = nice to have.`
      },
      {
        role: "user",
        content: `
RESUME TEXT:
${input.resumeText}

${input.targetRole ? `TARGET ROLE: ${input.targetRole}` : ""}

Perform a comprehensive analysis:
1. Extract all structured data (personal info, skills, experience, education, projects)
2. Score each section and provide specific feedback
3. Calculate overall ATS score
4. List improvements sorted by priority
5. Extract keywords from the resume`
      }
    ])

    return JSON.stringify(result)
  },
  {
    name: "full_resume_analysis",
    description:
      "Perform a comprehensive analysis of a resume including ATS scoring, section-by-section feedback, data extraction, and prioritized improvements.",
    schema: ResumeAnalysisInputSchema
  }
)

export const ALL_TOOLS = [fullResumeAnalysisTool] as const
