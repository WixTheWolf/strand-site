import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { CAPTAIN_WIX_PROFILE } from "@/lib/captain-wix";
import { CAPTAIN_ACCESS_COOKIE, verifyCaptainSession } from "@/lib/stud-buckets-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(CAPTAIN_ACCESS_COOKIE)?.value;
  if (!verifyCaptainSession(session)) {
    return NextResponse.json({ authorized: false }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json({ authorized: true, player: CAPTAIN_WIX_PROFILE }, { headers: { "Cache-Control": "no-store" } });
}
