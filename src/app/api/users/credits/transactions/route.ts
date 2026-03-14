import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { decodeToken } from "@/helpers/decodeToken";
import { CreditTransactionModel } from "@/models/transactionModel";

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

    const totalItems = await CreditTransactionModel.countDocuments({ userId });
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    const transactions = await CreditTransactionModel.find({ userId })
      .sort({ createdAt: -1 })
      .select("amount type description createdAt")
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        success: true,
        transactions,
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
    console.error("Fetch transactions error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch transaction history.", success: false },
      { status: 500 }
    );
  }
}
