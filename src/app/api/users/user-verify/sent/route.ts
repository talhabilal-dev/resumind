import { connectDB } from "@/lib/db";
import User from "@/models/userModel";
import { NextResponse, NextRequest } from "next/server";
import { sendEmail } from "@/helpers/mailer";
import { getClientIp, rateLimit } from "@/helpers/rateLimit";

const EMAIL_SUBJECT = "Email Verification";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { error: "Email is required.", success: false },
        { status: 400 }
      );
    }

    const ip = getClientIp(req);
    const emailLimit = rateLimit({ ip, key: `verify:${email}`, limit: 3, windowSeconds: 600 });
    const ipLimit = rateLimit({ ip, key: "verify-sent", limit: 20, windowSeconds: 60 });
    if (!emailLimit.allowed || !ipLimit.allowed) {
      return NextResponse.json(
        { error: "Too many verification requests. Please try again later.", success: false },
        { status: 429 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format.", success: false },
        { status: 400 }
      );
    }

    // Check if email exists in the database (do not reveal existence to the
    // requester — always return the same generic response).
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return NextResponse.json(
        { message: "If an account exists for this email, a verification link has been sent.", success: true },
        { status: 200 }
      );
    }

    // Send verification email

    const response = await sendEmail(
      "VERIFY",
      EMAIL_SUBJECT,
      email,
      existingUser._id.toString()
    );
    if (!response) {
      return NextResponse.json(
        { error: "Failed to send verification email.", success: false },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "Verification email sent successfully.", success: true },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in POST /api/users/user-verify/sent:", error.message);
    return NextResponse.json(
      {
        error: "An error occurred while sending the verification email.",
        success: false,
      },
      { status: 500 }
    );
  }
}
export const dynamic = "force-dynamic"; // Ensure this route is always fresh
export const revalidate = 0; // Disable caching for this route
