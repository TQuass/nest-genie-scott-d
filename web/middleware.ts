import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/sign-in", "/sign-in/verify", "/privacy", "/sms-terms"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith("/api/")
  );

  if (!isPublic && pathname.startsWith("/app")) {
    const token = req.cookies.get("ng_token");
    if (!token) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
