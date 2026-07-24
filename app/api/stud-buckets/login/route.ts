import { NextResponse } from "next/server";

import {
  COURSE_INTEL_ACCESS_COOKIE,
  courseIntelAccessConfigured,
  createCourseIntelSession,
  createStudBucketsSession,
  STUD_BUCKETS_ACCESS_COOKIE,
  studBucketsAccessConfigured,
  verifyCourseIntelCode,
  verifyStudBucketsCode,
} from "@/lib/stud-buckets-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    code?: unknown;
    scope?: unknown;
  };
  const courseOnly = body.scope === "course";
  const configured = courseOnly ? courseIntelAccessConfigured() : studBucketsAccessConfigured();

  if (!configured) {
    return NextResponse.json(
      { error: "Team access is not configured yet." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const valid = courseOnly
    ? verifyCourseIntelCode(body.code)
    : verifyStudBucketsCode(body.code);
  if (!valid) {
    return NextResponse.json(
      { error: "That team code is not correct." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const session = courseOnly ? createCourseIntelSession() : createStudBucketsSession();
  if (!session) {
    return NextResponse.json({ error: "Unable to create team access." }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(courseOnly ? COURSE_INTEL_ACCESS_COOKIE : STUD_BUCKETS_ACCESS_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 45,
  });
  return response;
}
