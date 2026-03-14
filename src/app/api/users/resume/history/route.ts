import { NextRequest, NextResponse } from "next/server";

import { decodeToken } from "@/helpers/decodeToken";
import { connectDB } from "@/lib/db";
import { ResumeModel } from "@/models/resumeModel";
import { RESUME_TASK_CREDIT_COST, type ResumeAgentTask } from "@/schemas/resumeAgentSchema";

type HistoryTask = ResumeAgentTask | "pdf_resume_analysis" | null;

function toWorkflowLabel(task: HistoryTask): string {
  if (!task) {
    return "Resume Analysis";
  }

  if (task === "pdf_resume_analysis") {
    return "PDF Resume Analysis";
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

    const records = await ResumeModel.find({ userId })
      .sort({ createdAt: -1 })
      .select("_id createdAt atsScore parsedData.task parsedData.jobTitle title")
      .limit(100)
      .lean();

    const history = records.map((item: any) => {
      const task = (item?.parsedData?.task || null) as HistoryTask;
      const jobTitle = item?.parsedData?.jobTitle || item?.title || "Untitled";

      return {
        id: String(item._id),
        createdAt: item.createdAt,
        jobTitle,
        workflow: toWorkflowLabel(task),
        creditsUsed: toCreditsUsed(task),
        score: typeof item.atsScore === "number" ? item.atsScore : null,
        status: "completed",
      };
    });

    return NextResponse.json({ success: true, history }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch resume history error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to fetch resume history.", success: false },
      { status: 500 }
    );
  }
}
