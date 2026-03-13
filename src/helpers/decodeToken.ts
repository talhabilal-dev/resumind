import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function decodeToken(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.TOKEN_SECRET as string);
      const { payload: decoded } = await jwtVerify(token, secret);

      if (decoded) {
        return decoded;
      }
    } catch (error: any) {
      console.error("Access token verification error:", error.message);
    }
  }

  if (refreshToken) {
    try {
      const refreshSecret = new TextEncoder().encode(
        process.env.REFRESH_TOKEN_SECRET as string
      );
      const { payload: decodedRefresh } = await jwtVerify(refreshToken, refreshSecret);

      if (decodedRefresh?.userId) {
        return decodedRefresh;
      }
    } catch (error: any) {
      console.error("Refresh token verification error:", error.message);
    }
  }

  return null;
}
