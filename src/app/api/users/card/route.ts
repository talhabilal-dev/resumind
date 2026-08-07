import { connectDB } from "@/lib/db";
import User from "@/models/userModel";
import { NextResponse, NextRequest } from "next/server";
import { decodeToken } from "@/helpers/decodeToken";
import { updateCardSchema, DEFAULT_CARD } from "@/schemas/cardSchema";

async function getAuthorizedUserId(req: NextRequest) {
  const payload: any = await decodeToken(req);
  const userId = payload?.userId;
  if (!payload || !userId) return null;
  return userId;
}

function toSafeCard(user: any) {
  const card = user?.savedCard || DEFAULT_CARD;
  return {
    cardNumber: card.cardNumber,
    expiryMonth: card.expiryMonth,
    expiryYear: card.expiryYear,
    cvc: card.cvc,
  };
}

export async function GET(req: NextRequest) {
  const userId = await getAuthorizedUserId(req);
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in.", success: false },
      { status: 401 },
    );
  }

  try {
    await connectDB();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found.", success: false },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { card: toSafeCard(user), success: true },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching saved card:", error.message);
    return NextResponse.json(
      {
        error: "An error occurred while fetching the saved card.",
        success: false,
      },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  const userId = await getAuthorizedUserId(req);
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in.", success: false },
      { status: 401 },
    );
  }

  try {
    await connectDB();

    const body = await req.json();
    const parsed = updateCardSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || "Invalid card details.",
          success: false,
        },
        { status: 400 },
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { savedCard: parsed.data.card } },
      { new: true },
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found.", success: false },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Payment method updated successfully.",
        success: true,
        card: toSafeCard(updatedUser),
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating saved card:", error.message);
    return NextResponse.json(
      {
        error: "An error occurred while updating the saved card.",
        success: false,
      },
      { status: 500 },
    );
  }
}
