import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/user/login",
  "/user/register",
  "/user/verify-token",
  "/user/reset-password",
  "/user/reset-password/verify",
  "/user/verify",
];

const AUTH_PATHS = [
  "/user/login",
  "/user/register",
  "/user/verify-token",
  "/user/reset-password",
  "/user/reset-password/verify",
  "/user/verify",
];

export default function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const token = req.cookies.get("token")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  const isPublic = PUBLIC_PATHS.some((p) => path.startsWith(p));
  const isAuthRoute = AUTH_PATHS.some((p) => path.startsWith(p));

  const isAuthenticated = !!token || !!refreshToken;

  // Prevent logged-in users from accessing auth pages
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/user/dashboard", req.url));
  }

  // Allow public routes
  if (isPublic) {
    return NextResponse.next();
  }

  // Protect private routes
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/user/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|_next/static|_next/image|favicon.ico).*)"],
};