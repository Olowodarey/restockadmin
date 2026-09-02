import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/", "/businesses"];

// Public routes (no auth required)
const publicRoutes = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if there's a token in cookies or would need to check localStorage
  // Note: Middleware runs on the server, so we can't access localStorage here
  // We'll rely on client-side guards for full protection
  // This middleware provides basic route structure

  // If user is on login page, let them through
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // For protected routes, let the request through
  // Client-side guards will handle the actual auth check
  const isProtectedRoute =
    protectedRoutes.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/businesses/");

  if (isProtectedRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
