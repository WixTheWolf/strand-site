import { NextResponse } from "next/server";

import {
  createStudBucketsSession,
  STUD_BUCKETS_ACCESS_COOKIE,
  studBucketsAccessConfigured,
  verifyStudBucketsCode,
} from "@/lib/stud-buckets-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!studBucketsAccessConfigured()) {
    return NextResponse.json(
      { error: "Team access is not configured yet." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const body = (await request.json().catch(() => ({}))) as { code?: unknown };
  if (!verifyStudBucketsCode(body.code)) {
    return NextResponse.json(
      { error: "That team code is not correct." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const session = createStudBucketsSession();
  if (!session) {
    return NextResponse.json({ error: "Unable to create team access." }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(STUD_BUCKETS_ACCESS_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 45,
  });
  return response;
}
