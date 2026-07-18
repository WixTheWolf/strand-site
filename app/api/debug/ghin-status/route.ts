import { NextResponse } from "next/server";
import { ghinConfigured, ghinEmail, ghinPassword, ghinLoginDiagnose } from "@/lib/ghin";

/**
 * Secret-safe diagnostic for the GHIN integration. Tries several documented
 * login shapes (email vs GHIN number, with/without the app `source` field)
 * and reports which authenticates, plus GHIN's status/error text. Never
 * returns the email, password, or token. Temporary; removed once live GHIN
 * authenticates.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const attempts = await ghinLoginDiagnose("11634237"); // WIX's GHIN number as alt identifier
  const winner = attempts.find((attempt) => attempt.ok);
  return NextResponse.json({
    configured: ghinConfigured(),
    emailLength: ghinEmail()?.length ?? 0,
    passwordLength: ghinPassword()?.length ?? 0,
    loginSucceeded: Boolean(winner),
    workingVariant: winner?.variant ?? null,
    attempts,
  });
}
