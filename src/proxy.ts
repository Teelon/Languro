import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.SECRET });
  const isAuth = !!token;
  const isAuthPage =
    req.nextUrl.pathname === "/signin" ||
    req.nextUrl.pathname === "/signup";

  const isDashboardPage = req.nextUrl.pathname.startsWith("/dashboard");

  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isDashboardPage && !isAuth) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/signin", "/signup", "/dashboard/:path*"],
};
