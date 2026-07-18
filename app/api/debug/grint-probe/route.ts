import { NextRequest, NextResponse } from "next/server";

/**
 * Temporary server-side probe: locates the endpoint TheGrint's public
 * score page calls to load its "Scoring Record" table. mode=page dissects
 * the HTML shell; mode=js greps a same-site JS bundle for endpoint paths;
 * mode=try POSTs/GETs a candidate path with a user id. Removed once the
 * working endpoint is wired into lib/grint.ts.
 */

export const dynamic = "force-dynamic";

const GRINT = "https://thegrint.com";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

function contexts(text: string, pattern: RegExp, radius: number, max: number): string[] {
  const found: string[] = [];
  for (const match of text.matchAll(pattern)) {
    const start = Math.max(0, (match.index ?? 0) - radius);
    const end = Math.min(text.length, (match.index ?? 0) + (match[0]?.length ?? 0) + radius);
    found.push(text.slice(start, end).replace(/\s+/g, " "));
    if (found.length >= max) break;
  }
  return found;
}

async function grab(url: string): Promise<{ status: number; text: string }> {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(9000),
    headers: { "User-Agent": UA },
  });
  return { status: response.status, text: await response.text() };
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const id = params.get("id") ?? "1812465"; // WIX
  const mode = params.get("mode") ?? "page";

  if (mode === "js") {
    // Grep a same-site JS bundle for endpoint paths
    const src = params.get("src") ?? "";
    if (!src.startsWith(GRINT) && !src.startsWith("/")) {
      return NextResponse.json({ error: "src must be a thegrint.com URL or path" }, { status: 400 });
    }
    const { status, text } = await grab(src.startsWith("/") ? `${GRINT}${src}` : src);
    return NextResponse.json({
      src,
      status,
      length: text.length,
      endpointHits: contexts(text, /url\s*[:=]\s*["'`][^"'`]{4,120}["'`]/gi, 80, 40),
      scoreHits: contexts(text, /["'`][^"'`]*(?:score|scoring|round|record)[^"'`]*["'`]/gi, 100, 40),
      fetchHits: contexts(text, /(?:fetch|axios|\$\.(?:post|get|ajax))\s*\(/gi, 200, 25),
    });
  }

  if (mode === "try") {
    // Hit a candidate endpoint with the id in common parameter spellings
    const path = params.get("path") ?? "";
    if (!path.startsWith("/")) {
      return NextResponse.json({ error: "path must start with /" }, { status: 400 });
    }
    const method = params.get("method") ?? "POST";
    const idField = params.get("field") ?? "user_id";
    const url =
      method === "GET" ? `${GRINT}${path.replace(/\{id\}/, id)}` : `${GRINT}${path}`;
    const response = await fetch(url, {
      method,
      cache: "no-store",
      signal: AbortSignal.timeout(9000),
      headers: {
        "User-Agent": UA,
        ...(method === "POST"
          ? { "Content-Type": "application/x-www-form-urlencoded" }
          : {}),
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
      snippet: text.slice(0, 2500),
    });
  }

  // Default: dissect the score page shell
  const url = `${GRINT}/golf-handicap-tracker/scores/${id}`;
  const { status, text: html } = await grab(url);

  return NextResponse.json({
    url,
    status,
    length: html.length,
    scriptSrcs: [
      ...new Set([...html.matchAll(/<script[^>]*src="([^"]+)"/gi)].map((match) => match[1])),
    ],
    // Everything around the Scoring Record table, markup intact
    scoringRecordContext: contexts(html, /Scoring Record/gi, 1500, 2),
    // Inline-script path strings
    inlinePaths: [
      ...new Set(
        [...html.matchAll(/["'](\/(?:[a-z0-9_-]+\/)+[a-z0-9_-]*)["']/gi)].map((match) => match[1]),
      ),
    ].slice(0, 50),
    idMentions: contexts(html, new RegExp(id, "g"), 250, 8),
  });
}
