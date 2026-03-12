import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { connectDB } from "@/lib/db";
import User from "@/models/userModel";
import { PaymentModel } from "@/models/stripeModel";
import { CreditTransactionModel } from "@/models/transactionModel";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

function toPositiveInt(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export async function POST(req: NextRequest) {
  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook env vars are not configured." },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecretKey);

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    await connectDB();

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata || {};

      const userId = metadata.userId;
      const credits = toPositiveInt(metadata.credits);
      const amountCents = toPositiveInt(metadata.amountCents);

      if (!userId || !credits || !amountCents) {
        return NextResponse.json({ received: true, ignored: true }, { status: 200 });
      }

      const existingPayment = await PaymentModel.findOne({ stripePaymentId: session.id });
      if (existingPayment?.status === "completed") {
        return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
      }

      await User.findByIdAndUpdate(userId, { $inc: { credits } });

      await PaymentModel.findOneAndUpdate(
        { stripePaymentId: session.id },
        {
          userId,
          amount: amountCents / 100,
          credits,
          stripePaymentId: session.id,
          status: "completed",
        },
        { upsert: true, new: true }
      );

      await CreditTransactionModel.create({
        userId,
        amount: credits,
        type: "purchase",
        description: `Stripe credit purchase (${credits} credits)`,
      });

      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      await PaymentModel.findOneAndUpdate(
        { stripePaymentId: session.id },
        { status: "failed" },
        { new: true }
      );
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Stripe webhook error:", error.message);
    return NextResponse.json({ error: "Webhook handling failed." }, { status: 400 });
  }
}
