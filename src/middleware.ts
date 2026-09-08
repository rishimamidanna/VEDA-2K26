import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/server/auth/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Protect /client/* routes (exclude /client/login and /client/signup)
  if (
    pathname.startsWith("/client") &&
    !pathname.startsWith("/client/login") &&
    !pathname.startsWith("/client/signup")
  ) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    if (sessionCookie?.value) {
      const payload = await verifySessionToken(sessionCookie.value);
      if (payload && payload.role === "CLIENT") {
        return NextResponse.next();
      }
    }

    const loginUrl = new URL("/client/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Protect /student/* routes (exclude /student/login and /student/signup)
  if (
    pathname.startsWith("/student") &&
    !pathname.startsWith("/student/login") &&
    !pathname.startsWith("/student/signup")
  ) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    if (sessionCookie?.value) {
      const payload = await verifySessionToken(sessionCookie.value);
      if (payload && payload.role === "STUDENT") {
        return NextResponse.next();
      }
    }

    const loginUrl = new URL("/student/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/client/:path*", "/student/:path*"],
};
