import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /client/* routes (exclude /client/login and /client/signup)
  if (
    pathname.startsWith("/client") &&
    !pathname.startsWith("/client/login") &&
    !pathname.startsWith("/client/signup")
  ) {
    const sessionCookie = request.cookies.get("sb_client_session");

    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL("/client/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const session = JSON.parse(decodeURIComponent(sessionCookie.value));
      if (!session || session.role !== "client") {
        const loginUrl = new URL("/client/login", request.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL("/client/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/client/:path*"],
};
