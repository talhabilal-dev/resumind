import { connectDB } from "@/lib/db";
import User from "@/models/userModel";
import { NextResponse, NextRequest } from "next/server";
import { decodeToken } from "@/helpers/decodeToken";
import { deleteAccountSchema, updateProfileSchema } from "@/schemas/userSchema";

async function getAuthorizedUserId(req: NextRequest) {
  const payload: any = await decodeToken(req);
  const userId = payload?.userId;
  if (!payload || !userId) {
    return null;
  }
  return userId;
}

export async function GET(req: NextRequest) {
  const userId = await getAuthorizedUserId(req);

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in.", success: false },
      { status: 401 }
    );
  }

  try {
    await connectDB();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found.", success: false },
        { status: 404 }
      );
    }
    return NextResponse.json({ user, success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching user profile:", error.message);
    return NextResponse.json(
      {
        error: "An error occurred while fetching the user profile.",
        success: false,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const userId = await getAuthorizedUserId(req);
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in.", success: false },
      { status: 401 }
    );
  }

  try {
    await connectDB();

    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input.", success: false },
        { status: 400 }
      );
    }

    const { firstname, lastname, username, bio } = parsed.data;

    const existingUsername = await User.findOne({
      username,
      _id: { $ne: userId },
    });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already taken.", success: false },
        { status: 409 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstname,
        lastname,
        username,
        bio: bio || "",
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found.", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Profile updated successfully.",
        success: true,
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating user profile:", error.message);
    return NextResponse.json(
      { error: "An error occurred while updating the profile.", success: false },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const userId = await getAuthorizedUserId(req);
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in.", success: false },
      { status: 401 }
    );
  }

  try {
    await connectDB();

    const body = await req.json();
    const parsed = deleteAccountSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid deletion request.", success: false },
        { status: 400 }
      );
    }

    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) {
      return NextResponse.json(
        { error: "User not found.", success: false },
        { status: 404 }
      );
    }

    const isProd = process.env.NODE_ENV === "production";
    const response = NextResponse.json(
      { message: "Account deleted successfully.", success: true },
      { status: 200 }
    );

    response.cookies.set("token", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    });
    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Error deleting account:", error.message);
    return NextResponse.json(
      { error: "An error occurred while deleting the account.", success: false },
      { status: 500 }
    );
  }
}
