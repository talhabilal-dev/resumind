import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { decodeToken } from "@/helpers/decodeToken";
import User from "@/models/userModel";
import { ResumeModel } from "@/models/resumeModel";
import { CreditTransactionModel } from "@/models/transactionModel";
import {
  analyzeResumeWithGPT,
  getRequiredCredits,
  ResumeAgentError,
} from "@/helpers/geminiResumeAgent";
import { resumeAgentApiRequestSchema } from "@/schemas/resumeAgentSchema";

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    };
  }

  return {
    value: error,
  };
}

export async function POST(req: NextRequest) {
  const requestId = `analyze-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  try {
    console.log("[resume:analyze] request:start", { requestId });
    await connectDB();
    console.log("[resume:analyze] db:connected", { requestId });

    const payload: any = await decodeToken(req);
    const userId = payload?.userId;
    console.log("[resume:analyze] auth:decoded", {
      requestId,
      hasUserId: Boolean(userId),
    });

    if (!userId) {
      console.warn("[resume:analyze] auth:missing-user", { requestId });
      return NextResponse.json(
        { error: "Unauthorized. Please log in.", success: false },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsedBody = resumeAgentApiRequestSchema.safeParse(body);
    console.log("[resume:analyze] body:parsed", {
      requestId,
      parseSuccess: parsedBody.success,
    });

    if (!parsedBody.success) {
      console.warn("[resume:analyze] body:invalid", {
        requestId,
        issues: parsedBody.error.issues,
      });
      return NextResponse.json(
        {
          error: parsedBody.error.issues[0]?.message || "Invalid analysis request.",
          success: false,
        },
        { status: 400 }
      );
    }

    const user = await User.findById(userId).select("credits email username");
    console.log("[resume:analyze] user:loaded", {
      requestId,
      found: Boolean(user),
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found.", success: false },
        { status: 404 }
      );
    }

    const requiredCredits = getRequiredCredits(parsedBody.data.task);
    console.log("[resume:analyze] credits:check", {
      requestId,
      requiredCredits,
      availableCredits: user.credits,
      task: parsedBody.data.task,
    });

    if (user.credits < requiredCredits) {
      return NextResponse.json(
        {
          error: `Not enough credits. Required ${requiredCredits}, available ${user.credits}.`,
          requiredCredits,
          availableCredits: user.credits,
          success: false,
        },
        { status: 402 }
      );
    }

    let analysis;
    try {
      analysis = await analyzeResumeWithGPT({
        ...parsedBody.data,
        userId: String(user._id),
        creditsAvailable: user.credits,
        strictMode: parsedBody.data.strictMode ?? true,
      });
      console.log("[resume:analyze] ai:completed", {
        requestId,
        hasOutput: Boolean(analysis?.output),
        tokenUsage: analysis?.cost?.tokenUsage,
      });

    } catch (error: unknown) {
      if (error instanceof ResumeAgentError) {
        console.error("[resume:analyze] ai:resume-agent-error", {
          requestId,
          code: error.code,
          message: error.message,
        });

        const status =
          error.code === "INVALID_INPUT"
            ? 400
            : error.code === "INSUFFICIENT_CREDITS"
              ? 402
              : error.code === "MISSING_API_KEY"
                ? 500
                : 502;

        return NextResponse.json(
          { error: error.message, code: error.code, success: false },
          { status }
        );
      }

      console.error("[resume:analyze] ai:unexpected-error", {
        requestId,
        error: serializeError(error),
      });
      throw error;
    }

    const chargedUser = await User.findOneAndUpdate(
      { _id: user._id, credits: { $gte: requiredCredits } },
      { $inc: { credits: -requiredCredits } },
      { new: true }
    ).select("credits");

    console.log("[resume:analyze] credits:charged", {
      requestId,
      chargeSuccess: Boolean(chargedUser),
      remainingCredits: chargedUser?.credits,
    });

    if (!chargedUser) {
      return NextResponse.json(
        {
          error: "Credits changed during processing. Please retry.",
          success: false,
        },
        { status: 409 }
      );
    }

    try {
      await CreditTransactionModel.create({
        userId: user._id,
        amount: requiredCredits,
        type: "usage",
        description: `Credits used for ${parsedBody.data.task} (${requiredCredits} credits)`,
      });
    } catch (error: any) {
      // Do not fail successful analysis if transaction logging fails.
      console.error("[resume:analyze] transaction-log:error", {
        requestId,
        error: serializeError(error),
      });
    }

    const history = await ResumeModel.create({
      userId: user._id,
      title: `${parsedBody.data.jobTitle} - ${parsedBody.data.task}`,
      rawText: parsedBody.data.resumeText.slice(0, 12000),
      parsedData: {
        task: parsedBody.data.task,
        jobTitle: parsedBody.data.jobTitle,
        jobDescription: parsedBody.data.jobDescription || "",
        output: analysis.output,
        safeguards: analysis.safeguards,
      },
      atsScore: analysis.output.score ?? undefined,
      aiMetadata: {
        lastAnalyzedAt: new Date(),
        tokensUsed: analysis.cost.tokenUsage.totalTokens,
      },
      keywords: analysis.output.missingKeywords,
    });

    console.log("[resume:analyze] history:created", {
      requestId,
      historyId: String(history._id),
    });

    return NextResponse.json(
      {
        message: "Resume analysis completed.",
        success: true,
        data: analysis,
        credits: {
          charged: requiredCredits,
          remaining: chargedUser.credits,
        },
        history: {
          id: history._id,
          createdAt: history.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[resume:analyze] request:failed", {
      requestId,
      error: serializeError(error),
    });
    return NextResponse.json(
      {
        error: "Failed to analyze resume. Please try again.",
        success: false,
      },
      { status: 500 }
    );
  }
}
