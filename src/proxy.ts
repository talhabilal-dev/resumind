import { NextRequest, NextResponse } from "next/server";
import {
  isRefreshTokenValid,
  isTokenExpired,
  refreshAccessToken,
} from "@/helpers/refreshToken";

const PUBLIC_PATHS = [
  "/",
  "/user/login",
  "/user/register",
  "/user/verify-token",
  "/user/reset-password",
  "/user/reset-password/verify",
  "/user/verify",
  "/user/verify/sent",
];

const AUTH_PATHS = [
  "/user/login",
  "/user/register",
  "/user/verify-token",
  "/user/reset-password",
  "/user/reset-password/verify",
  "/user/verify",
  "/user/verify/sent",
];

function isPathMatch(pathname: string, basePath: string): boolean {
  if (basePath === "/") {
    return pathname === "/";
  }

  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const token = req.cookies.get("token")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  const isPublic = PUBLIC_PATHS.some((p) => isPathMatch(path, p));
  const isAuthRoute = AUTH_PATHS.some((p) => isPathMatch(path, p));

  let hasValidAccess = false;
  if (token) {
    hasValidAccess = !(await isTokenExpired(token));
  }

  let hasValidRefresh = false;
  if (refreshToken) {
    hasValidRefresh = await isRefreshTokenValid(refreshToken);
  }

  const isAuthenticated = hasValidAccess || hasValidRefresh;

  let refreshedToken: string | null = null;
  if (!hasValidAccess && hasValidRefresh) {
    const refreshed = await refreshAccessToken(req);
    if (refreshed.success && refreshed.token) {
      refreshedToken = refreshed.token;
      hasValidAccess = true;
    }
  }

  let response: NextResponse;

  // Prevent logged-in users from accessing auth pages
  if (isAuthRoute && isAuthenticated) {
    response = NextResponse.redirect(new URL("/user/dashboard", req.url));
  } else if (isPublic) {
    // Allow public routes
    response = NextResponse.next();
  } else if (!isAuthenticated) {
    // Protect private routes
    response = NextResponse.redirect(new URL("/user/login", req.url));
  } else {
    response = NextResponse.next();
  }

  if (refreshedToken) {
    response.cookies.set("token", refreshedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 60,
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};