import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { decodeToken } from "@/helpers/decodeToken";
import User from "@/models/userModel";
import { ResumeModel } from "@/models/resumeModel";
import {
  analyzeResumeWithGemini,
  getRequiredCredits,
  ResumeAgentError,
} from "@/helpers/geminiResumeAgent";
import { resumeAgentApiRequestSchema } from "@/schemas/resumeAgentSchema";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const payload: any = await decodeToken(req);
    const userId = payload?.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in.", success: false },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsedBody = resumeAgentApiRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: parsedBody.error.issues[0]?.message || "Invalid analysis request.",
          success: false,
        },
        { status: 400 }
      );
    }

    const user = await User.findById(userId).select("credits email username");
    if (!user) {
      return NextResponse.json(
        { error: "User not found.", success: false },
        { status: 404 }
      );
    }

    const requiredCredits = getRequiredCredits(parsedBody.data.task);
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
      analysis = await analyzeResumeWithGemini({
        ...parsedBody.data,
        userId: String(user._id),
        creditsAvailable: user.credits,
        strictMode: parsedBody.data.strictMode ?? true,
      });
    } catch (error: unknown) {
      if (error instanceof ResumeAgentError) {
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

      throw error;
    }

    const chargedUser = await User.findOneAndUpdate(
      { _id: user._id, credits: { $gte: requiredCredits } },
      { $inc: { credits: -requiredCredits } },
      { new: true }
    ).select("credits");

    if (!chargedUser) {
      return NextResponse.json(
        {
          error: "Credits changed during processing. Please retry.",
          success: false,
        },
        { status: 409 }
      );
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
    console.error("Resume analyze API error:", error.message);
    return NextResponse.json(
      {
        error: "Failed to analyze resume. Please try again.",
        success: false,
      },
      { status: 500 }
    );
  }
}
