import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/sign-in", "/sign-in/verify", "/privacy", "/sms-terms"];

export function middleware(req: NextRequest) {
  // Screenshot mode bypass — set SCREENSHOT_MODE=true in Replit Secrets to enable.
  if (process.env.SCREENSHOT_MODE === "true") return NextResponse.next();
  const { pathname } = req.nextUrl;

  // Screenshot mode: bypass auth so Playwright can capture all screens.
  // Enable in Replit by setting SCREENSHOT_MODE=true in the Secrets panel.
  // NEVER enable this in production.
  if (process.env.SCREENSHOT_MODE === "true") {
    return NextResponse.next();
  }

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
