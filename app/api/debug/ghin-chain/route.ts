import { NextResponse } from "next/server";
import { ghinChainDiagnose } from "@/lib/ghin";

/**
 * Temporary: exercise the GHIN login → search → scores chain and report raw
 * HTTP status + snippets so we can fix the exact endpoint shapes. No secrets.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await ghinChainDiagnose("11634237", "Matt Wixted"); // WIX
  return NextResponse.json(result);
}
