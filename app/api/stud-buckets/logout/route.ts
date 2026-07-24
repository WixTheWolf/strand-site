import { NextResponse } from "next/server";

import {
  COURSE_INTEL_ACCESS_COOKIE,
  STUD_BUCKETS_ACCESS_COOKIE,
} from "@/lib/stud-buckets-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(STUD_BUCKETS_ACCESS_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(COURSE_INTEL_ACCESS_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
