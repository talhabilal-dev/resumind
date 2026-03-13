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

    const transactions = await CreditTransactionModel.find({ userId })
      .sort({ createdAt: -1 })
      .select("amount type description createdAt")
      .limit(100);

    return NextResponse.json({ success: true, transactions }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch transactions error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch transaction history.", success: false },
      { status: 500 }
    );
  }
}
