import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

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

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const payload: any = await decodeToken(req);
    const userId = payload?.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in.", success: false },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid history id.", success: false },
        { status: 400 }
      );
    }

    await connectDB();

    const record = await ResumeModel.findOne({
      _id: id,
      userId,
    })
      .select(
        "_id createdAt updatedAt title atsScore rawText keywords aiMetadata parsedData"
      )
      .lean();

    if (!record) {
      return NextResponse.json(
        { error: "History record not found.", success: false },
        { status: 404 }
      );
    }

    const task = (record?.parsedData?.task || null) as HistoryTask;
    const details = {
      id: String(record._id),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      title: record.title,
      task,
      workflow: toWorkflowLabel(task),
      creditsUsed: toCreditsUsed(task),
      atsScore: typeof record.atsScore === "number" ? record.atsScore : null,
      keywords: Array.isArray(record.keywords) ? record.keywords : [],
      aiMetadata: record.aiMetadata || null,
      parsedData: record.parsedData || {},
      rawText: typeof record.rawText === "string" ? record.rawText : "",
    };

    return NextResponse.json({ success: true, details }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch resume history detail error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to fetch resume history detail.", success: false },
      { status: 500 }
    );
  }
}
