import { NextResponse } from "next/server";

import { CAPTAIN_ACCESS_COOKIE, createCaptainSession, verifyCaptainCode } from "@/lib/stud-buckets-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { code?: unknown };
  if (!verifyCaptainCode(body.code)) {
    return NextResponse.json({ error: "That captain password is not correct." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  const response = NextResponse.json({ ok: true });
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(CAPTAIN_ACCESS_COOKIE, createCaptainSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(CAPTAIN_ACCESS_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
