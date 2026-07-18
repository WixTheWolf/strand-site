import { NextResponse } from "next/server";
import { ghinEmail, ghinPassword } from "@/lib/ghin";

/**
 * Secret-safe production diagnostic for the GHIN integration. Reports which
 * env-var name variants are visible in THIS deployment's scope, the value
 * lengths (never the values), and GHIN's raw login HTTP status / error text.
 * Never returns the email, password, or token. Temporary — remove once live
 * GHIN authenticates on production.
 */
export const dynamic = "force-dynamic";

const GHIN_API = "https://api2.ghin.com/api/v1";

export async function GET() {
  const email = ghinEmail();
  const password = ghinPassword();

  let loginStatus: number | null = null;
  let loginOk = false;
  let note = "not attempted";

  if (email && password) {
    try {
      const response = await fetch(`${GHIN_API}/golfer_login.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: { email_or_ghin: email, password, remember_me: true },
          token: "nonblank",
        }),
        cache: "no-store",
      });
      loginStatus = response.status;
      try {
        const data = await response.json();
        loginOk = Boolean(data?.golfer_user?.golfer_user_token);
        if (!loginOk) note = JSON.stringify(data).slice(0, 200);
        else note = "token received";
      } catch {
        note = `HTTP ${response.status} — non-JSON response`;
      }
    } catch (error) {
      note = `request failed: ${error instanceof Error ? error.name : "unknown"}`;
    }
  } else {
    note = "GHIN_Email / GHIN_Password not visible in this environment scope";
  }

  return NextResponse.json({
    sawEnv: {
      GHIN_EMAIL: Boolean(process.env.GHIN_EMAIL),
      GHIN_Email: Boolean(process.env.GHIN_Email),
      ghin_email: Boolean(process.env.ghin_email),
      GHIN_PASSWORD: Boolean(process.env.GHIN_PASSWORD),
      GHIN_Password: Boolean(process.env.GHIN_Password),
      ghin_password: Boolean(process.env.ghin_password),
    },
    emailLength: email?.length ?? 0,
    passwordLength: password?.length ?? 0,
    loginSucceeded: loginOk,
    httpStatus: loginStatus,
    note,
  });
}
