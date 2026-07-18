import { NextRequest, NextResponse } from "next/server";

/**
 * Temporary server-side probe. Default mode fetches TheGrint's score page
 * plus its handicap.js / general.js bundles and greps them for the AJAX
 * endpoint that loads the "Scoring Record" modal, all in one request.
 * mode=try hits a candidate endpoint with a user id. Removed once the
 * working endpoint is wired into lib/grint.ts.
 */

export const dynamic = "force-dynamic";

const GRINT = "https://thegrint.com";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

async function grab(url: string): Promise<{ status: number; text: string }> {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(9000),
    headers: { "User-Agent": UA },
  });
  return { status: response.status, text: await response.text() };
}

/** Unique short windows around each regex hit, whitespace-collapsed. */
function windows(text: string, pattern: RegExp, radius: number, max: number): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const match of text.matchAll(pattern)) {
    const start = Math.max(0, (match.index ?? 0) - radius);
    const end = Math.min(text.length, (match.index ?? 0) + (match[0]?.length ?? 0) + radius);
    const snippet = text.slice(start, end).replace(/\s+/g, " ").trim();
    if (!seen.has(snippet)) {
      seen.add(snippet);
      out.push(snippet);
    }
    if (out.length >= max) break;
  }
  return out;
}

async function analyzeBundle(path: string) {
  try {
    const { status, text } = await grab(`${GRINT}${path}`);
    // Endpoint-ish string literals mentioning score/round/record/handicap
    const endpoints = [
      ...new Set(
        [...text.matchAll(/["'`](\/?[a-z0-9_./-]*(?:score|round|record|handicap)[a-z0-9_./-]*)["'`]/gi)]
          .map((match) => match[1])
          .filter((path) => path.length > 3 && !path.startsWith("http")),
      ),
    ].slice(0, 40);
    // The functions that fire on the Scoring Record modal
    const modalFns = windows(text, /openModal|scoringRecord|scoring_record|getScores?|loadScores?/gi, 160, 20);
    // Any ajax/fetch call sites with their URL argument
    const ajaxCalls = windows(text, /(?:\$\.(?:ajax|post|get)|fetch|axios)\s*\(\s*[^)]{0,140}/gi, 20, 30);
    return { path, status, length: text.length, endpoints, modalFns, ajaxCalls };
  } catch (error) {
    return { path, status: `ERR ${error instanceof Error ? error.name : "?"}` };
  }
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const id = params.get("id") ?? "1812465"; // WIX
  const mode = params.get("mode") ?? "page";

  if (mode === "try") {
    const path = params.get("path") ?? "";
    if (!path.startsWith("/")) {
      return NextResponse.json({ error: "path must start with /" }, { status: 400 });
    }
    const method = params.get("method") ?? "POST";
    const idField = params.get("field") ?? "user_id";
    const url = method === "GET" ? `${GRINT}${path.replace(/\{id\}/g, id)}` : `${GRINT}${path}`;
    const response = await fetch(url, {
      method,
      cache: "no-store",
      signal: AbortSignal.timeout(9000),
      headers: {
        "User-Agent": UA,
        "X-Requested-With": "XMLHttpRequest",
        ...(method === "POST" ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
      },
      ...(method === "POST" ? { body: new URLSearchParams({ [idField]: id }).toString() } : {}),
    });
    const text = await response.text();
    return NextResponse.json({
      url,
      method,
      status: response.status,
      contentType: response.headers.get("content-type"),
      length: text.length,
      snippet: text.slice(0, 3000),
    });
  }

  // Default: page shell + the two most likely JS bundles, greped in one shot
  const page = await grab(`${GRINT}/golf-handicap-tracker/scores/${id}`);
  const bundles = await Promise.all(
    ["/assets/js/handicap.js?6", "/assets/js/general.js?73"].map(analyzeBundle),
  );

  return NextResponse.json({
    page: {
      status: page.status,
      length: page.text.length,
      // The Alpine x-data init that seeds the `users` array
      xData: windows(page.text, /x-data\s*=\s*"[^"]{0,400}/gi, 0, 4),
      scoringRecordCell: windows(page.text, /Scoring Record[\s\S]{0,400}/gi, 0, 1),
    },
    bundles,
  });
}
