import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { connectDB } from "@/lib/db";
import { decodeToken } from "@/helpers/decodeToken";
import User from "@/models/userModel";
import { PaymentModel } from "@/models/stripeModel";
import {
  CREDIT_PACK_CONFIG,
  creditCheckoutRequestSchema,
} from "@/schemas/creditsSchema";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export async function POST(req: NextRequest) {
  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is not configured.", success: false },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecretKey);

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
    const parsed = creditCheckoutRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid checkout request.", success: false },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(userId).select("email");
    if (!user) {
      return NextResponse.json(
        { error: "User not found.", success: false },
        { status: 404 }
      );
    }

    const pack = CREDIT_PACK_CONFIG[parsed.data.packId];
    const origin = req.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            product_data: {
              name: `${pack.label} Credit Pack`,
              description: `${pack.credits} credits for Resumind`,
            },
            unit_amount: pack.amountCents,
          },
        },
      ],
      metadata: {
        userId: String(userId),
        packId: parsed.data.packId,
        credits: String(pack.credits),
        amountCents: String(pack.amountCents),
      },
      success_url: `${origin}/user/dashboard/credits?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/user/dashboard/credits?canceled=1`,
    });

    await PaymentModel.create({
      userId,
      amount: pack.amountCents / 100,
      credits: pack.credits,
      stripePaymentId: session.id,
      status: "pending",
    });

    return NextResponse.json(
      { success: true, checkoutUrl: session.url },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Create checkout session error:", error.message);
    return NextResponse.json(
      { error: "Unable to start Stripe checkout.", success: false },
      { status: 500 }
    );
  }
}
