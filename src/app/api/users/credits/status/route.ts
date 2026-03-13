import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { connectDB } from "@/lib/db";
import { decodeToken } from "@/helpers/decodeToken";
import { PaymentModel } from "@/models/stripeModel";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export async function GET(req: NextRequest) {
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

    const sessionId = req.nextUrl.searchParams.get("session_id") || "";
    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session_id query parameter.", success: false },
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
      "status amount credits userId"
    );

    if (payment?.userId && String(payment.userId) !== String(userId)) {
      return NextResponse.json(
        { error: "Payment record does not belong to current user.", success: false },
        { status: 403 }
      );
    }

    const stripePaid = session.payment_status === "paid";
    const localCompleted = payment?.status === "completed";

    return NextResponse.json(
      {
        success: true,
        sessionId: session.id,
        paymentSucceeded: stripePaid,
        stripe: {
          paymentStatus: session.payment_status,
          status: session.status,
          amountTotal: session.amount_total,
          currency: session.currency,
        },
        local: {
          found: Boolean(payment),
          status: payment?.status ?? "not_found",
          amount: payment?.amount ?? null,
          credits: payment?.credits ?? null,
        },
        inSync: stripePaid === localCompleted,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get payment status error:", error.message);
    return NextResponse.json(
      { error: "Unable to fetch payment status.", success: false },
      { status: 500 }
    );
  }
}
