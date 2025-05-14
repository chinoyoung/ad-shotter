import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === "/login" || path === "/unauthorized";

  // Get the session token from the cookies
  const isAuthenticated = request.cookies.has("firebase-auth-token");
  const userEmail = request.cookies.get("user-email")?.value;

  // Check if email is from goabroad.com domain
  const isValidDomain = userEmail?.endsWith("@goabroad.com");

  // Redirect logic
  if (!isAuthenticated && !isPublicPath) {
    // If user is not authenticated and tries to access a protected route, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthenticated && !isValidDomain && path !== "/unauthorized") {
    // If user is authenticated but not from goabroad.com domain, redirect to unauthorized
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (isAuthenticated && isValidDomain && path === "/login") {
    // If user is authenticated and from goabroad.com domain and tries to access login page, redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Specify which routes this middleware should run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
