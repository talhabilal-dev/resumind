import { connectDB } from "@/lib/db";
import User from "@/models/userModel";
import { NextResponse, NextRequest } from "next/server";
import { sendEmail } from "@/helpers/mailer";
import { forgotPasswordEmailSchema } from "@/schemas/userSchema";

const EMAIL_SUBJECT = "Password Reset Verification";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const parsed = forgotPasswordEmailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid email.", success: false },
        { status: 400 }
      );
    }
    const { email } = parsed.data;

    // Check if email exists in the database
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Email not found.", success: false },
        { status: 404 }
      );
    }

    // Send reset password email
    const response = await sendEmail(
      "FORGOT_PASSWORD",
      EMAIL_SUBJECT,
      email,
      existingUser._id.toString()
    );

    if (!response) {
      return NextResponse.json(
        { error: "Failed to send reset password email.", success: false },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Reset password email sent successfully.", success: true },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      "Error in POST /api/users/forgot-password/sent:",
      error.message
    );
    return NextResponse.json(
      {
        error: "An error occurred while processing your request.",
        success: false,
      },
      { status: 500 }
    );
  }
}
