import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirect = searchParams.get("redirect") || "/app";

  const response = NextResponse.redirect(new URL(redirect, request.url));

  response.cookies.set("ng_token", "dev_bypass_token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return response;
}
