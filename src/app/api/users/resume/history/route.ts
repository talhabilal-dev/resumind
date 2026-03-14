import { NextRequest, NextResponse } from "next/server";

import { decodeToken } from "@/helpers/decodeToken";
import { connectDB } from "@/lib/db";
import { ResumeModel } from "@/models/resumeModel";
import { RESUME_TASK_CREDIT_COST, type ResumeAgentTask } from "@/schemas/resumeAgentSchema";
import { JdAnalysisModel } from "@/models/jdAnalysisModel";
import { JD_ANALYSIS_CREDIT_COST } from "@/schemas/jdAnalysisSchema";

type HistoryTask = ResumeAgentTask | "pdf_resume_analysis" | "jd_cv_analysis" | null;

function toWorkflowLabel(task: HistoryTask): string {
  if (!task) {
    return "Resume Analysis";
  }

  if (task === "pdf_resume_analysis") {
    return "PDF Resume Analysis";
  }

  if (task === "jd_cv_analysis") {
    return "CV + JD Analysis";
  }

  return task
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toCreditsUsed(task: HistoryTask): number {
  if (!task) {
    return 0;
  }

  if (task === "pdf_resume_analysis") {
    return RESUME_TASK_CREDIT_COST.full_resume_analysis;
  }

  if (task === "jd_cv_analysis") {
    return JD_ANALYSIS_CREDIT_COST;
  }

  return RESUME_TASK_CREDIT_COST[task];
}

export async function GET(req: NextRequest) {
  try {
    const payload: any = await decodeToken(req);
    const userId = payload?.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in.", success: false },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const pageParam = Number(searchParams.get("page") || "1");
    const limitParam = Number(searchParams.get("limit") || "10");

    const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(Math.floor(limitParam), 50)
        : 10;
    const skip = (page - 1) * limit;

    const [resumeCount, jdCount] = await Promise.all([
      ResumeModel.countDocuments({ userId }),
      JdAnalysisModel.countDocuments({ userId }),
    ]);
    const totalItems = resumeCount + jdCount;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    const resumeRecords = await ResumeModel.find({ userId })
      .sort({ createdAt: -1 })
      .select("_id createdAt atsScore parsedData.task parsedData.jobTitle title")
      .lean();

    const jdRecords = await JdAnalysisModel.find({ userId })
      .sort({ createdAt: -1 })
      .select("_id createdAt jobTitle creditsCharged analysisResult.ats_score")
      .lean();

    const resumeHistory = resumeRecords.map((item: any) => {
      const task = (item?.parsedData?.task || null) as HistoryTask;
      const jobTitle = item?.parsedData?.jobTitle || item?.title || "Untitled";

      return {
        id: `resume:${String(item._id)}`,
        createdAt: item.createdAt,
        jobTitle,
        workflow: toWorkflowLabel(task),
        creditsUsed: toCreditsUsed(task),
        score: typeof item.atsScore === "number" ? item.atsScore : null,
        status: "completed",
      };
    });

    const jdHistory = jdRecords.map((item: any) => ({
      id: `jd:${String(item._id)}`,
      createdAt: item.createdAt,
      jobTitle: item?.jobTitle || "JD Analysis",
      workflow: toWorkflowLabel("jd_cv_analysis"),
      creditsUsed:
        typeof item?.creditsCharged === "number"
          ? item.creditsCharged
          : toCreditsUsed("jd_cv_analysis"),
      score:
        typeof item?.analysisResult?.ats_score === "number"
          ? item.analysisResult.ats_score
          : null,
      status: "completed",
    }));

    const mergedHistory = [...resumeHistory, ...jdHistory]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const history = mergedHistory.slice(skip, skip + limit);

    return NextResponse.json(
      {
        success: true,
        history,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Fetch resume history error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to fetch resume history.", success: false },
      { status: 500 }
    );
  }
}
