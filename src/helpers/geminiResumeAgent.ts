import {
  CREDIT_USD_RATE,
  RESUME_TASK_CREDIT_COST,
  type ResumeAgentInput,
  type ResumeAgentOutput,
  resumeAgentInputSchema,
  resumeAgentOutputSchema,
  resumeAgentResultSchema,
  type ResumeAgentResult,
} from "@/schemas/resumeAgentSchema";

const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";

const TASK_TOKEN_BUDGET: Record<
  ResumeAgentInput["task"],
  { maxInputChars: number; maxOutputTokens: number }
> = {
  full_resume_analysis: { maxInputChars: 16000, maxOutputTokens: 1200 },
  job_description_match: { maxInputChars: 14000, maxOutputTokens: 900 },
  cover_letter_generator: { maxInputChars: 15000, maxOutputTokens: 1200 },
  bullet_point_optimization: { maxInputChars: 10000, maxOutputTokens: 700 },
  full_resume_rewrite: { maxInputChars: 18000, maxOutputTokens: 1800 },
};

export class ResumeAgentError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "ResumeAgentError";
  }
}

function clampInput(input: string, maxChars: number): string {
  if (input.length <= maxChars) {
    return input;
  }
  return `${input.slice(0, maxChars)}\n\n[TRUNCATED_FOR_TOKEN_BUDGET]`;
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
    return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function taskSpecificInstructions(task: ResumeAgentInput["task"]): string {
  switch (task) {
    case "full_resume_analysis":
      return "Provide ATS-style scoring, strengths, gaps, and prioritized recommendations.";
    case "job_description_match":
      return "Focus on alignment to job requirements, keyword gaps, and role-fit score.";
    case "cover_letter_generator":
      return "Generate a concise tailored cover letter draft grounded only in provided resume and job description.";
    case "bullet_point_optimization":
      return "Return concrete optimized bullet points with measurable impact language where justified.";
    case "full_resume_rewrite":
      return "Rewrite resume text with clear structure and stronger action-oriented phrasing while preserving factual claims.";
    default:
      return "Provide grounded, useful output.";
  }
}

function buildPrompt(input: ResumeAgentInput): string {
  return [
    "You are a strict resume analysis agent.",
    "Rules: never invent experience, metrics, employers, technologies, or achievements.",
    "If evidence is insufficient, explicitly say so in assumptions and lower confidence.",
    "Every major claim must be backed by short direct citations from the provided text.",
    "Output must be valid JSON only and follow the target schema.",
    taskSpecificInstructions(input.task),
    "",
    `Task: ${input.task}`,
    `Job Title: ${input.jobTitle}`,
    `Strict Mode: ${input.strictMode ? "on" : "off"}`,
    "",
    "Resume Text:",
    input.resumeText,
    "",
    "Job Description:",
    input.jobDescription || "[NOT_PROVIDED]",
    "",
    "JSON requirements:",
    "- task must match input task",
    "- hallucinationRisk must reflect citation quality",
    "- score is null only if not meaningful for task",
    "- include at least one evidence citation",
  ].join("\n");
}

function validateCitations(
  output: ResumeAgentOutput,
  resumeText: string,
  jobDescription?: string
): { coverage: number; warnings: string[]; hallucinationRisk: ResumeAgentOutput["hallucinationRisk"] } {
  const warnings: string[] = [];
  const resumeLower = resumeText.toLowerCase();
  const jdLower = (jobDescription || "").toLowerCase();

  let valid = 0;
  for (const citation of output.evidence.citations) {
    const quote = citation.quote.toLowerCase();
    const isInResume = resumeLower.includes(quote);
    const isInJob = jdLower.includes(quote);
    const sourceMatch =
      (citation.source === "resume" && isInResume) ||
      (citation.source === "job_description" && isInJob);

    if (sourceMatch) {
      valid += 1;
    } else {
      warnings.push(`Citation not grounded in declared source: \"${citation.quote.slice(0, 60)}...\"
`);
    }
  }

  const coverage = output.evidence.citations.length
    ? valid / output.evidence.citations.length
    : 0;

  let hallucinationRisk: ResumeAgentOutput["hallucinationRisk"] = output.hallucinationRisk;
  if (coverage < 0.4) {
    hallucinationRisk = "high";
  } else if (coverage < 0.75 && hallucinationRisk === "low") {
    hallucinationRisk = "medium";
  }

  return { coverage, warnings, hallucinationRisk };
}

export function getRequiredCredits(task: ResumeAgentInput["task"]): number {
  return RESUME_TASK_CREDIT_COST[task];
}

export function ensureEnoughCredits(creditsAvailable: number, task: ResumeAgentInput["task"]): void {
  const required = getRequiredCredits(task);
  if (creditsAvailable < required) {
    throw new ResumeAgentError(
      `Insufficient credits. Required ${required}, available ${creditsAvailable}.`,
      "INSUFFICIENT_CREDITS"
    );
  }
}

export async function analyzeResumeWithGemini(rawInput: ResumeAgentInput): Promise<ResumeAgentResult> {
  const parsedInput = resumeAgentInputSchema.safeParse(rawInput);
  if (!parsedInput.success) {
    throw new ResumeAgentError(
      parsedInput.error.issues[0]?.message || "Invalid analysis input.",
      "INVALID_INPUT"
    );
  }

  const input = parsedInput.data;
  ensureEnoughCredits(input.creditsAvailable, input.task);

  const budget = TASK_TOKEN_BUDGET[input.task];
  const resumeText = clampInput(input.resumeText, budget.maxInputChars);
  const jobDescription = clampInput(input.jobDescription || "", Math.floor(budget.maxInputChars * 0.75));

  const requestInput: ResumeAgentInput = {
    ...input,
    resumeText,
    jobDescription,
  };

  const prompt = buildPrompt(requestInput);
  const inputTokenEstimate = estimateTokens(prompt);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ResumeAgentError("GEMINI_API_KEY is not configured.", "MISSING_API_KEY");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          topP: 0.9,
          maxOutputTokens: budget.maxOutputTokens,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const failureText = await response.text();
    throw new ResumeAgentError(
      `Gemini request failed (${response.status}): ${failureText}`,
      "MODEL_REQUEST_FAILED"
    );
  }

  const payload = await response.json();
  const rawText =
    payload?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("\n") || "";

  if (!rawText.trim()) {
    throw new ResumeAgentError("Gemini returned an empty response.", "EMPTY_MODEL_RESPONSE");
  }

  let modelJson: unknown;
  try {
    modelJson = JSON.parse(extractJson(rawText));
  } catch {
    throw new ResumeAgentError("Model response was not valid JSON.", "INVALID_JSON_OUTPUT");
  }

  const parsedOutput = resumeAgentOutputSchema.safeParse(modelJson);
  if (!parsedOutput.success) {
    throw new ResumeAgentError(
      parsedOutput.error.issues[0]?.message || "Model output did not match schema.",
      "INVALID_SCHEMA_OUTPUT"
    );
  }

  const output = parsedOutput.data;
  const citationCheck = validateCitations(output, requestInput.resumeText, requestInput.jobDescription);

  const usage = payload?.usageMetadata;
  const outputTokens = Number(usage?.candidatesTokenCount || usage?.outputTokenCount || 0);
  const inputTokens = Number(usage?.promptTokenCount || usage?.inputTokenCount || inputTokenEstimate);
  const totalTokens = Number(usage?.totalTokenCount || inputTokens + outputTokens);

  const creditsCharged = getRequiredCredits(input.task);
  const result = {
    output: {
      ...output,
      hallucinationRisk: citationCheck.hallucinationRisk,
      confidence:
        citationCheck.coverage < 0.4
          ? Math.min(output.confidence, 0.45)
          : output.confidence,
    },
    cost: {
      creditsCharged,
      usdCharged: Number((creditsCharged * CREDIT_USD_RATE).toFixed(2)),
      tokenUsage: {
        inputTokens,
        outputTokens,
        totalTokens,
      },
    },
    safeguards: {
      validationPassed: citationCheck.coverage >= 0.4,
      citationCoverage: Number(citationCheck.coverage.toFixed(2)),
      warnings: citationCheck.warnings,
    },
  };

  const parsedResult = resumeAgentResultSchema.safeParse(result);
  if (!parsedResult.success) {
    throw new ResumeAgentError("Internal result validation failed.", "INTERNAL_VALIDATION_FAILED");
  }

  return parsedResult.data;
}
