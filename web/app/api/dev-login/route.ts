import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set("ng_token", "dev_bypass_token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return response;
}
