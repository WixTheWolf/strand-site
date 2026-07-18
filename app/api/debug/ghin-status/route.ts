import { NextResponse } from "next/server";
import { ghinConfigured, ghinLoginProbe } from "@/lib/ghin";

/**
 * Secret-safe diagnostic for the GHIN integration. Reports only booleans
 * and coarse shape — never the email, password, or token — so we can tell
 * whether credentials reached this deployment and whether login succeeds.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const configured = ghinConfigured();
  const probe = await ghinLoginProbe();
  return NextResponse.json({
    envVarsVisibleHere: configured,
    emailLength: process.env.GHIN_EMAIL?.length ?? 0,
    passwordPresent: Boolean(process.env.GHIN_PASSWORD),
    loginSucceeded: probe.ok,
    httpStatus: probe.status,
    note: probe.note,
  });
}
