import { NextRequest, NextResponse } from "next/server";

/**
 * Temporary server-side probe: dissects TheGrint's public score page
 * (/golf-handicap-tracker/scores/{id}) to find where round history lives
 * in the markup. Runs on Vercel where thegrint.com is reachable; removed
 * once the parser is wired into lib/grint.ts.
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

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "1812465"; // WIX
  const url = `${GRINT}/golf-handicap-tracker/scores/${id}`;

  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(9000),
    headers: { "User-Agent": UA },
  });
  const html = await response.text();

  // Embedded JS data blobs (var scores = [...], JSON.parse('...'), etc.)
  const scriptBlobs = contexts(
    html,
    /(?:var|let|const)\s+[a-zA-Z_]*(?:score|round|history)[a-zA-Z_]*\s*=/gi,
    600,
    6,
  );

  // Date-shaped strings with surrounding markup
  const dateHits = contexts(html, /\d{2}\/\d{2}\/\d{2,4}|\d{4}-\d{2}-\d{2}/g, 220, 20);

  // Class/id names mentioning score
  const scoreAttrs = [
    ...new Set(
      [...html.matchAll(/(?:class|id)="([^"]*(?:score|round|history)[^"]*)"/gi)].map(
        (match) => match[1],
      ),
    ),
  ].slice(0, 30);

  // Table rows, tags stripped
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
    .map((match) => match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 25);

  // AJAX URLs referenced by scripts on the page
  const ajaxUrls = [
    ...new Set(
      [...html.matchAll(/["'](\/[a-z_/]+(?:score|round|history|ajax)[a-z_/]*)["']/gi)].map(
        (match) => match[1],
      ),
    ),
  ].slice(0, 20);

  return NextResponse.json({
    url,
    status: response.status,
    length: html.length,
    title: html.match(/<title>([^<]*)<\/title>/i)?.[1],
    scoreAttrs,
    ajaxUrls,
    scriptBlobs,
    rows,
    dateHits,
  });
}
