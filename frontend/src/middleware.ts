import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware to guard /admin routes (except /admin/login).
 *
 * Checks for the `is_authenticated` cookie set by the client after login.
 * This is a UX guard only — actual auth enforcement is on the backend.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow /admin/login through
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get("is_authenticated");

  if (!authCookie || authCookie.value !== "1") {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
