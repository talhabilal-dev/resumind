import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { connectDB } from "@/lib/db";
import { decodeToken } from "@/helpers/decodeToken";
import User from "@/models/userModel";
import { PaymentModel } from "@/models/stripeModel";
import { CreditTransactionModel } from "@/models/transactionModel";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

function toPositiveInt(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export async function POST(req: NextRequest) {
  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is not configured.", success: false },
      { status: 500 }
    );
  }

  try {
    const payload: any = await decodeToken(req);
    const userId = payload?.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in.", success: false },
        { status: 401 }
      );
    }

    const body = await req.json();
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId : "";
    const canceled = Boolean(body?.canceled);

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required.", success: false },
        { status: 400 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const metadataUserId = session.metadata?.userId;
    if (metadataUserId && String(metadataUserId) !== String(userId)) {
      return NextResponse.json(
        { error: "Checkout session does not belong to current user.", success: false },
        { status: 403 }
      );
    }

    await connectDB();

    const payment = await PaymentModel.findOne({ stripePaymentId: session.id }).select(
      "status credits amount userId"
    );

    if (payment?.userId && String(payment.userId) !== String(userId)) {
      return NextResponse.json(
        { error: "Payment record does not belong to current user.", success: false },
        { status: 403 }
      );
    }

    const metadataCredits = toPositiveInt(session.metadata?.credits);
    const metadataAmountCents = toPositiveInt(session.metadata?.amountCents);

    const credits = metadataCredits ?? payment?.credits ?? null;
    const amountUsd =
      metadataAmountCents !== null
        ? metadataAmountCents / 100
        : typeof payment?.amount === "number"
          ? payment.amount
          : null;

    const stripePaid = session.payment_status === "paid";

    if (stripePaid && credits && amountUsd !== null) {
      let didTransitionToCompleted = false;

      if (payment) {
        const writeResult = await PaymentModel.updateOne(
          { _id: payment._id, status: { $ne: "completed" } },
          {
            $set: {
              userId,
              amount: amountUsd,
              credits,
              stripePaymentId: session.id,
              status: "completed",
            },
          }
        );
        didTransitionToCompleted = writeResult.modifiedCount > 0;
      } else {
        await PaymentModel.create({
          userId,
          amount: amountUsd,
          credits,
          stripePaymentId: session.id,
          status: "completed",
        });
        didTransitionToCompleted = true;
      }

      if (didTransitionToCompleted) {
        await User.findByIdAndUpdate(userId, { $inc: { credits } });
        await CreditTransactionModel.create({
          userId,
          amount: credits,
          type: "purchase",
          description: `Stripe credit purchase (${credits} credits)`,
        });
      }

      return NextResponse.json(
        {
          success: true,
          sessionId: session.id,
          status: "completed",
          credited: didTransitionToCompleted,
        },
        { status: 200 }
      );
    }

    const shouldMarkFailed = canceled || session.status === "expired";
    if (shouldMarkFailed) {
      if (payment) {
        await PaymentModel.updateOne(
          { _id: payment._id, status: { $ne: "completed" } },
          {
            $set: {
              userId,
              stripePaymentId: session.id,
              status: "failed",
              ...(credits ? { credits } : {}),
              ...(amountUsd !== null ? { amount: amountUsd } : {}),
            },
          }
        );
      } else {
        await PaymentModel.create({
          userId,
          stripePaymentId: session.id,
          status: "failed",
          ...(credits ? { credits } : {}),
          ...(amountUsd !== null ? { amount: amountUsd } : {}),
        });
      }

      return NextResponse.json(
        {
          success: true,
          sessionId: session.id,
          status: "failed",
          reason: canceled ? "canceled" : "expired",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        sessionId: session.id,
        status: payment?.status ?? "pending",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Verify checkout session error:", error.message);
    return NextResponse.json(
      { error: "Unable to verify checkout session.", success: false },
      { status: 500 }
    );
  }
}
