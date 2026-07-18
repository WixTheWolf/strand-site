import { NextRequest, NextResponse } from "next/server";

/**
 * Temporary server-side probe: discovers which TheGrint / GHIN endpoints
 * expose posted-score history. Runs on Vercel where thegrint.com is
 * reachable; results are inspected through the protected preview URL and
 * the route is removed once a working endpoint is wired into lib/grint.ts.
 */

export const dynamic = "force-dynamic";

const GRINT = "https://thegrint.com";
const GHIN = "https://api2.ghin.com/api/v1";

interface ProbeResult {
  url: string;
  method: string;
  status: number | string;
  contentType?: string;
  length?: number;
  snippet?: string;
  matches?: string[];
}

async function probe(
  url: string,
  init: RequestInit & { label?: string } = {},
): Promise<ProbeResult> {
  const method = init.method ?? "GET";
  try {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(9000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        ...init.headers,
      },
    });
    const text = await response.text();
    // Score-shaped fragments: dates near 2-3 digit numbers, JSON keys with "score"
    const matches: string[] = [];
    const patterns = [
      /"[a-z_]*score[a-z_]*"\s*:\s*"?[\d.]+"?/gi,
      /\d{2}\/\d{2}\/\d{2,4}[^<>{}]{0,60}\b\d{2,3}\b/g,
      /score_(?:date|day|history|feed)/gi,
      /"differential"\s*:\s*"?[\d.]+"?/gi,
    ];
    for (const pattern of patterns) {
      for (const hit of text.match(pattern)?.slice(0, 6) ?? []) {
        if (!matches.includes(hit)) matches.push(hit);
      }
      if (matches.length >= 12) break;
    }
    return {
      url,
      method,
      status: response.status,
      contentType: response.headers.get("content-type") ?? undefined,
      length: text.length,
      snippet: text.slice(0, 700),
      matches: matches.length ? matches : undefined,
    };
  } catch (error) {
    return { url, method, status: `ERR ${error instanceof Error ? error.name : "unknown"}` };
  }
}

function formPost(body: Record<string, string>): RequestInit {
  return {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
  };
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "1812465"; // WIX
  const ghinNumber = request.nextUrl.searchParams.get("ghin") ?? "11634237"; // WIX
  const mode = request.nextUrl.searchParams.get("mode") ?? "grint";

  const targets: Array<Promise<ProbeResult>> = [];

  if (mode === "grint" || mode === "all") {
    // Sibling endpoints of the two known-working ones
    // (/user/ajax_search_users_json and /user/get_handicap_info/)
    const ajaxCandidates = [
      "get_scores_info",
      "get_stats_info",
      "get_profile_info",
      "get_user_info",
      "get_score_history_info",
      "get_rounds_info",
      "get_scores_json",
      "ajax_get_scores_json",
      "get_score_feed",
      "get_last_rounds",
    ];
    for (const endpoint of ajaxCandidates) {
      targets.push(probe(`${GRINT}/user/${endpoint}/`, formPost({ user_id: id })));
    }
    // Public profile / score pages (HTML)
    for (const path of [
      `/profile/index/${id}`,
      `/profile/scores/${id}`,
      `/profile/stats/${id}`,
      `/scores/index/${id}`,
      `/scorecard/user/${id}`,
      `/golf-handicap-tracker/scores/${id}`,
    ]) {
      targets.push(probe(`${GRINT}${path}`));
    }
  }

  if (mode === "ghin" || mode === "all") {
    // GHIN widget/public auth paths that may not need member credentials
    targets.push(
      probe(`${GHIN}/public/login.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "nonblank" }),
      }),
      probe(`${GHIN}/golfers/search.json?golfer_id=${ghinNumber}&per_page=5&page=1`),
      probe(`${GHIN}/golfers/${ghinNumber}/scores.json?source=GHINcom&per_page=5&page=1`),
    );
  }

  const results = await Promise.all(targets);
  return NextResponse.json({ mode, id, results }, { status: 200 });
}
