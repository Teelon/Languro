import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.SECRET });
  const isAuth = !!token;
  const { pathname } = req.nextUrl;

  console.log(`Proxy Debug: Path=${pathname}, Auth=${isAuth}, Token=${token ? 'Present' : 'Missing'}`);

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

  // Marketing pages that should redirect if authenticated
  const marketingPages = [
    "/",
    "/about",
    "/pricing",
    "/contact",
    "/blogs",
    "/conjugation",
    "/error",
  ];

  const isMarketingPage = marketingPages.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`)
  );

  // Redirect authenticated users from auth pages to dashboard
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect authenticated users from marketing pages to dashboard
  if (isMarketingPage && isAuth) {
    console.log(`Proxy: Redirecting authenticated user from ${pathname} to /dashboard`);
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect unauthenticated users from protected routes to signin
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
    "/",
    "/about/:path*",
    "/pricing/:path*",
    "/contact/:path*",
    "/blogs/:path*",
    "/conjugation/:path*",
    "/error/:path*",
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
