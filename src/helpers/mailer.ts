import { Resend } from "resend";
import User from "@/models/userModel";
import EmailTemplate from "../../email/template";
import { connectDB } from "@/lib/db";
import { generateOpaqueToken } from "@/helpers/tokens";

export const sendEmail = async (
  EmailType: string,
  subject: string,
  Email: string,
  userId: string
) => {
  if (!EmailType || !subject || !Email || !userId) {
    throw new Error("All parameters are required");
  }

  try {
    await connectDB();

    const resend = new Resend(process.env.RESEND_API_KEY as string);

    // Generate an unguessable random token; only its SHA-256 hash is stored.
    const { rawToken, tokenHash } = generateOpaqueToken();

    if (EmailType === "VERIFY") {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      user.verificationToken = tokenHash;
      user.verificationTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();
    } else if (EmailType === "FORGOT_PASSWORD") {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      user.forgetToken = tokenHash;
      user.forgetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();
    }

    const { data, error } = await resend.emails.send({
      from: `Resumind <support@mail.talhabilal.dev>`,
      to: Email,
      subject: `${EmailType} - ${subject}`,
      react: EmailTemplate({
        emailType: EmailType,
        Subject: subject,
        token: rawToken,
      }),
    });

    if (error as any) {
      console.error("Error sending email:", error);
      throw new Error(error as any);
    }
    return data;
  } catch (error: any) {
    console.error("Error in sendEmail:", error?.message || error);
    return null;
  }
};
