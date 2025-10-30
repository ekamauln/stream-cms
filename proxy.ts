import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  // Check if the request is for a protected admin route
  if (request.nextUrl.pathname.startsWith("/admin")) {
    try {
      // Get session from Better Auth
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      // If no session, redirect to login
      if (!session) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      // If error checking session, redirect to login
      const loginUrl = new URL("/auth/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};