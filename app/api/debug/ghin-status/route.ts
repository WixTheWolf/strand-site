import { NextResponse } from "next/server";
import { ghinEmail, ghinPassword, ghinPasswordRaw } from "@/lib/ghin";

/**
 * Secret-safe production diagnostic. Tries several GHIN login payload
 * variants (email vs GHIN number, base vs app+source shape) with the
 * trimmed password and reports which — if any — authenticates, plus GHIN's
 * error text and whether the stored password had surrounding whitespace.
 * Never returns the email, password, or token. Temporary.
 */
export const dynamic = "force-dynamic";

const GHIN_API = "https://api2.ghin.com/api/v1";
const ACCOUNT_OWNER_GHIN = "11634237";

async function attempt(
  label: string,
  identifier: string,
  password: string,
  extra: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(`${GHIN_API}/golfer_login.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: { email_or_ghin: identifier, password, remember_me: true, ...extra },
        token: "nonblank",
      }),
      cache: "no-store",
    });
    let ok = false;
    let note = `HTTP ${response.status}`;
    try {
      const data = await response.json();
      ok = Boolean(data?.golfer_user?.golfer_user_token);
      if (!ok) note = JSON.stringify(data?.errors ?? data).slice(0, 160);
    } catch {
      note = `HTTP ${response.status} — non-JSON`;
    }
    return { label, ok, status: response.status, note };
  } catch (error) {
    return { label, ok: false, note: error instanceof Error ? error.name : "error" };
  }
}

export async function GET() {
  const email = ghinEmail();
  const password = ghinPassword();
  const raw = ghinPasswordRaw();

  if (!email || !password) {
    return NextResponse.json({ configured: false, emailLength: email?.length ?? 0 });
  }

  const attempts = [
    await attempt("number+base", ACCOUNT_OWNER_GHIN, password, {}),
    await attempt("email+base", email, password, {}),
    await attempt("number+source", ACCOUNT_OWNER_GHIN, password, { source: "GHINcom" }),
    await attempt("email+source", email, password, { source: "GHINcom" }),
  ];

  return NextResponse.json({
    emailLength: email.length,
    passwordLength: password.length,
    passwordHadSurroundingWhitespace: raw !== undefined && raw !== raw.trim(),
    anyAuthenticated: attempts.some((a) => a.ok),
    attempts,
  });
}
