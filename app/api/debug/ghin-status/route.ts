import { NextResponse } from "next/server";
import { ghinConfigured, ghinEmail, ghinPassword, ghinLoginProbe } from "@/lib/ghin";

/**
 * Secret-safe diagnostic for the GHIN integration. Reports only booleans,
 * lengths, and GHIN's own HTTP status / error text — never the email,
 * password, or token. Lets us tell an env-scope miss from a credential or
 * endpoint rejection. Readable on the public production URL.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const probe = await ghinLoginProbe();
  return NextResponse.json({
    configured: ghinConfigured(),
    // which name variant actually resolved (helps spot a casing/scope miss)
    sawEnv: {
      GHIN_EMAIL: Boolean(process.env.GHIN_EMAIL),
      GHIN_Email: Boolean(process.env.GHIN_Email),
      ghin_email: Boolean(process.env.ghin_email),
      GHIN_PASSWORD: Boolean(process.env.GHIN_PASSWORD),
      GHIN_Password: Boolean(process.env.GHIN_Password),
      ghin_password: Boolean(process.env.ghin_password),
    },
    emailLength: ghinEmail()?.length ?? 0,
    passwordLength: ghinPassword()?.length ?? 0,
    loginSucceeded: probe.ok,
    httpStatus: probe.status,
    note: probe.note,
  });
}
