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
import { createAgent, toolStrategy } from "langchain";
import { ChatOpenAI } from "@langchain/openai";

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";

/** Fraction of input budget allocated to the job description. */
const JD_INPUT_CHARS_RATIO = 0.75;

/**
 * Rough heuristic: 1 token ≈ 4 characters of English text.
 * Used only as a fallback when the model does not return usage metadata.
 */
const CHARS_PER_TOKEN = 4;

const TASK_TOKEN_BUDGET: Record<
  ResumeAgentInput["task"],
  { maxInputChars: number; maxOutputTokens: number }
> = {
  full_resume_analysis: { maxInputChars: 16_000, maxOutputTokens: 1_200 },
  job_description_match: { maxInputChars: 14_000, maxOutputTokens: 900 },
  cover_letter_generator: { maxInputChars: 15_000, maxOutputTokens: 1_200 },
  bullet_point_optimization: { maxInputChars: 10_000, maxOutputTokens: 700 },
  full_resume_rewrite: { maxInputChars: 18_000, maxOutputTokens: 1_800 },
};

/** Citation coverage thresholds that determine hallucination risk levels. */
const CITATION_THRESHOLDS = {
  HIGH_RISK: 0.4,
  MEDIUM_RISK: 0.75,
  LOW_CONFIDENCE_CAP: 0.45,
} as const;

// ─── Error class ─────────────────────────────────────────────────────────────

export class ResumeAgentError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "ResumeAgentError";
  }
}

// ─── Input helpers ───────────────────────────────────────────────────────────

function clampInput(input: string, maxChars: number): string {
  return input.length <= maxChars
    ? input
    : `${input.slice(0, maxChars)}\n\n[TRUNCATED_FOR_TOKEN_BUDGET]`;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

// ─── Prompt construction ─────────────────────────────────────────────────────

function taskSpecificInstructions(task: ResumeAgentInput["task"]): string {
  const instructions: Record<ResumeAgentInput["task"], string> = {
    full_resume_analysis:
      "Provide ATS-style scoring, strengths, gaps, and prioritized recommendations.",
    job_description_match:
      "Focus on alignment to job requirements, keyword gaps, and role-fit score.",
    cover_letter_generator:
      "Generate a concise tailored cover letter draft grounded only in the provided resume and job description.",
    bullet_point_optimization:
      "Return concrete optimized bullet points with measurable impact language where justified.",
    full_resume_rewrite:
      "Rewrite resume text with clear structure and stronger action-oriented phrasing while preserving factual claims.",
  };
  return instructions[task];
}

function buildSystemPrompt(task: ResumeAgentInput["task"]): string {
  return [
    "You are a strict resume analysis agent.",
    "Rules: never invent experience, metrics, employers, technologies, or achievements.",
    "If evidence is insufficient, explicitly say so in assumptions and lower confidence.",
    "Every major claim must be backed by short direct citations from the provided text.",
    "Output must follow the exact structured response schema.",
    taskSpecificInstructions(task),
  ].join("\n");
}

function buildUserPrompt(input: ResumeAgentInput): string {
  return [
    "Analyze this resume request and return a schema-valid response.",
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

// ─── Token usage extraction ───────────────────────────────────────────────────

interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

/**
 * Extracts token usage from a LangChain agent response, with estimated
 * fallbacks when the model does not return usage metadata.
 */
function extractTokenUsage(
  agentResponse: unknown,
  inputFallback: number,
  outputFallback: number,
): TokenUsage {
  const messages = (agentResponse as { messages?: unknown[] })?.messages ?? [];
  const lastMessage = messages.at(-1) ?? {};
  const meta =
    (lastMessage as Record<string, unknown>)?.usage_metadata ??
    ((lastMessage as Record<string, Record<string, unknown>>)?.response_metadata
      ?.usage_metadata) ??
    {};

  const pick = (...keys: string[]): number => {
    for (const key of keys) {
      const val = Number((meta as Record<string, unknown>)[key]);
      if (!isNaN(val) && val > 0) return val;
    }
    return 0;
  };

  const inputTokens =
    pick("input_tokens", "prompt_token_count", "promptTokenCount") || inputFallback;
  const outputTokens =
    pick("output_tokens", "candidates_token_count", "candidatesTokenCount") || outputFallback;
  const totalTokens =
    pick("total_tokens", "totalTokenCount") || inputTokens + outputTokens;

  return { inputTokens, outputTokens, totalTokens };
}

// ─── Citation validation ──────────────────────────────────────────────────────

interface CitationValidationResult {
  coverage: number;
  warnings: string[];
  hallucinationRisk: ResumeAgentOutput["hallucinationRisk"];
}

function validateCitations(
  output: ResumeAgentOutput,
  resumeText: string,
  jobDescription?: string,
): CitationValidationResult {
  const resumeLower = resumeText.toLowerCase();
  const jdLower = (jobDescription ?? "").toLowerCase();

  const warnings: string[] = [];
  let validCount = 0;

  for (const { quote, source } of output.evidence.citations) {
    const quoteLower = quote.toLowerCase();
    const grounded =
      (source === "resume" && resumeLower.includes(quoteLower)) ||
      (source === "job_description" && jdLower.includes(quoteLower));

    if (grounded) {
      validCount++;
    } else {
      warnings.push(`Citation not grounded in declared source: "${quote.slice(0, 60)}…"`);
    }
  }

  const total = output.evidence.citations.length;
  const coverage = total > 0 ? validCount / total : 0;

  const hallucinationRisk: ResumeAgentOutput["hallucinationRisk"] =
    coverage < CITATION_THRESHOLDS.HIGH_RISK
      ? "high"
      : coverage < CITATION_THRESHOLDS.MEDIUM_RISK && output.hallucinationRisk === "low"
        ? "medium"
        : output.hallucinationRisk;

  return { coverage, warnings, hallucinationRisk };
}

// ─── Credits ─────────────────────────────────────────────────────────────────

export function getRequiredCredits(task: ResumeAgentInput["task"]): number {
  return RESUME_TASK_CREDIT_COST[task];
}

/** Throws `ResumeAgentError` if the caller does not have enough credits. */
export function ensureEnoughCredits(
  creditsAvailable: number,
  task: ResumeAgentInput["task"],
): void {
  const required = getRequiredCredits(task);
  if (creditsAvailable < required) {
    throw new ResumeAgentError(
      `Insufficient credits: required ${required}, available ${creditsAvailable}.`,
      "INSUFFICIENT_CREDITS",
    );
  }
}

// ─── Core analysis function ───────────────────────────────────────────────────

export async function analyzeResumeWithGPT(
  rawInput: ResumeAgentInput,
): Promise<ResumeAgentResult> {
  // 1. Validate input.
  const parsed = resumeAgentInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new ResumeAgentError(
      parsed.error.issues[0]?.message ?? "Invalid analysis input.",
      "INVALID_INPUT",
    );
  }

  const input = parsed.data;
  ensureEnoughCredits(input.creditsAvailable, input.task);

  // 2. Apply token budget constraints.
  const budget = TASK_TOKEN_BUDGET[input.task];
  const clampedInput: ResumeAgentInput = {
    ...input,
    resumeText: clampInput(input.resumeText, budget.maxInputChars),
    jobDescription: clampInput(
      input.jobDescription ?? "",
      Math.floor(budget.maxInputChars * JD_INPUT_CHARS_RATIO),
    ),
  };

  // 3. Build prompt and estimate token usage for fallback purposes.
  const userPrompt = buildUserPrompt(clampedInput);
  const inputTokenEstimate = estimateTokens(userPrompt);

  // 4. Invoke the LangChain agent.
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ResumeAgentError("OPENAI_API_KEY is not configured.", "MISSING_API_KEY");
  }

  const model = new ChatOpenAI({
    apiKey,
    model: DEFAULT_OPENAI_MODEL,
    temperature: 0.1,
    maxTokens: budget.maxOutputTokens,
  });

  let agentResponse: unknown;
  try {
    const agent = createAgent({
      model,
      // Tool strategy avoids provider strict JSON-schema limitations on optional keys.
      responseFormat: toolStrategy(resumeAgentOutputSchema),
      systemPrompt: buildSystemPrompt(clampedInput.task),
    });
    agentResponse = await agent.invoke({ messages: [{ role: "user", content: userPrompt }] });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new ResumeAgentError(
      `LangChain agent request failed: ${message}`,
      "MODEL_REQUEST_FAILED",
    );
  }

  // 5. Extract and validate structured output.
  const modelJson = (agentResponse as { structuredResponse?: unknown })?.structuredResponse;
  if (!modelJson) {
    throw new ResumeAgentError(
      "LangChain agent returned no structured output.",
      "EMPTY_MODEL_RESPONSE",
    );
  }

  const parsedOutput = resumeAgentOutputSchema.safeParse(modelJson);
  if (!parsedOutput.success) {
    throw new ResumeAgentError(
      parsedOutput.error.issues[0]?.message ?? "Model output did not match schema.",
      "INVALID_SCHEMA_OUTPUT",
    );
  }

  // 6. Validate citations and adjust risk/confidence accordingly.
  const output = parsedOutput.data;
  const citation = validateCitations(output, clampedInput.resumeText, clampedInput.jobDescription);
  const { inputTokens, outputTokens, totalTokens } = extractTokenUsage(
    agentResponse,
    inputTokenEstimate,
    estimateTokens(JSON.stringify(output)),
  );

  // 7. Assemble final result.
  const creditsCharged = getRequiredCredits(input.task);
  const result = {
    output: {
      ...output,
      hallucinationRisk: citation.hallucinationRisk,
      confidence:
        citation.coverage < CITATION_THRESHOLDS.HIGH_RISK
          ? Math.min(output.confidence, CITATION_THRESHOLDS.LOW_CONFIDENCE_CAP)
          : output.confidence,
    },
    cost: {
      creditsCharged,
      usdCharged: Number((creditsCharged * CREDIT_USD_RATE).toFixed(2)),
      tokenUsage: { inputTokens, outputTokens, totalTokens },
    },
    safeguards: {
      validationPassed: citation.coverage >= CITATION_THRESHOLDS.HIGH_RISK,
      citationCoverage: Number(citation.coverage.toFixed(2)),
      warnings: citation.warnings,
    },
  };

  const parsedResult = resumeAgentResultSchema.safeParse(result);
  if (!parsedResult.success) {
    throw new ResumeAgentError("Internal result validation failed.", "INTERNAL_VALIDATION_FAILED");
  }

  return parsedResult.data;
}

/**
 * @deprecated Renamed to `analyzeResumeWithGPT`. This alias will be removed in a future release.
 */
export const analyzeResumeWithGemini = analyzeResumeWithGPT;