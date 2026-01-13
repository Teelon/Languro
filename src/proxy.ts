import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.SECRET });
  const isAuth = !!token;
  const { pathname } = req.nextUrl;

  const isAuthPage =
    pathname === "/signin" ||
    pathname === "/signup" ||
    pathname === "/register";

  // List of protected routes pattern or prefixes
  const protectedPrefixes = [
    "/dashboard",
    "/onboarding",
    "/analytics",
    "/grammar",
    "/immersion",
    "/production",
    "/settings",
    "/conjugation-drills"
  ];

  const isProtectedRoute = protectedPrefixes.some(prefix => pathname.startsWith(prefix));

  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isProtectedRoute && !isAuth) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  if (isAuth) {
    const hasCompletedOnboarding = token?.hasCompletedOnboarding;
    const isOnboardingPage = pathname.startsWith("/onboarding");

    // If user has completed onboarding and is on onboarding page, redirect to dashboard
    if (hasCompletedOnboarding && isOnboardingPage) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If user has NOT completed onboarding and is on a protected page (except onboarding), redirect to onboarding
    if (!hasCompletedOnboarding && isProtectedRoute && !isOnboardingPage) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/signin",
    "/signup",
    "/register",
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/analytics/:path*",
    "/grammar/:path*",
    "/immersion/:path*",
    "/production/:path*",
    "/settings/:path*",
    "/conjugation-drills/:path*"
  ],
};
