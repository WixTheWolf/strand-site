/**
 * Live GHIN (USGA) handicap lookup via the api2.ghin.com endpoints used by
 * the official GHIN app. Requires a GHIN member login supplied through env:
 *   GHIN_EMAIL    — email or GHIN number of any GHIN member (e.g. yours)
 *   GHIN_PASSWORD — that member's ghin.com password
 * Without credentials every function quietly returns null and the site falls
 * back to hand-verified GHIN values, then TheGrint.
 */

const GHIN_API = "https://api2.ghin.com/api/v1";

let cachedToken: { token: string; expiresAt: number } | null = null;

export function ghinConfigured(): boolean {
  return Boolean(process.env.GHIN_EMAIL && process.env.GHIN_PASSWORD);
}

async function ghinLogin(): Promise<string | null> {
  if (!ghinConfigured()) return null;
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;

  try {
    const response = await fetch(`${GHIN_API}/golfer_login.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: {
          email_or_ghin: process.env.GHIN_EMAIL,
          password: process.env.GHIN_PASSWORD,
          remember_me: true,
        },
        token: "nonblank",
      }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = await response.json();
    const token: string | null = data?.golfer_user?.golfer_user_token ?? null;
    if (token) cachedToken = { token, expiresAt: Date.now() + 50 * 60 * 1000 };
    return token;
  } catch {
    return null;
  }
}

export interface GhinLookupResult {
  handicapIndex: string;
  ghinNumber: string;
  clubName?: string;
}

interface GhinGolferRecord {
  ghin?: string | number;
  id?: string | number;
  first_name?: string;
  last_name?: string;
  player_name?: string;
  handicap_index?: string | number;
  hi_display?: string | number;
  club_name?: string;
}

function toResult(golfer: GhinGolferRecord): GhinLookupResult | null {
  const index = golfer.handicap_index ?? golfer.hi_display;
  const ghin = golfer.ghin ?? golfer.id;
  if (index === undefined || index === null || ghin === undefined || ghin === null) return null;
  return {
    handicapIndex: String(index),
    ghinNumber: String(ghin),
    clubName: golfer.club_name,
  };
}

async function ghinSearch(token: string, params: URLSearchParams): Promise<GhinGolferRecord[]> {
  params.set("per_page", "25");
  params.set("page", "1");
  const response = await fetch(`${GHIN_API}/golfers/search.json?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 },
  });
  if (!response.ok) return [];
  const data = await response.json();
  return data?.golfers ?? [];
}

interface GhinScoreRecord {
  adjusted_gross_score?: number | string;
  adjusted_score?: number | string;
  score?: number | string;
  played_at?: string;
  date_played?: string;
  posted_at?: string;
  course_name?: string;
  facility_name?: string;
  differential?: number | string;
  score_day_order?: number;
}

export interface GhinRoundResult {
  date: string;
  score: number;
  course?: string;
  differential?: number | null;
}

/** Last posted rounds for a golfer, newest first — requires GHIN credentials */
export async function fetchGhinScores(ghinNumber: string, limit = 5): Promise<GhinRoundResult[]> {
  const token = await ghinLogin();
  if (!token) return [];

  try {
    const response = await fetch(
      `${GHIN_API}/golfers/${encodeURIComponent(ghinNumber)}/scores.json?source=GHINcom&per_page=${limit}&page=1`,
      { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 300 } },
    );
    if (!response.ok) return [];
    const data = await response.json();
    const rows: GhinScoreRecord[] = data?.scores ?? data?.recent_scores ?? data?.revision_scores ?? [];

    const results: GhinRoundResult[] = [];
    for (const row of rows) {
      const score = parseFloat(String(row.adjusted_gross_score ?? row.adjusted_score ?? row.score ?? ""));
      const date = row.played_at ?? row.date_played ?? row.posted_at ?? "";
      if (Number.isNaN(score) || !date) continue;
      const diff = parseFloat(String(row.differential ?? ""));
      results.push({
        date,
        score,
        course: row.course_name ?? row.facility_name,
        differential: Number.isNaN(diff) ? null : diff,
      });
      if (results.length >= limit) break;
    }
    return results;
  } catch {
    return [];
  }
}

/** Look a player up on GHIN by GHIN number first, then by exact name match. */
export async function lookupGhinIndex(player: {
  name: string;
  ghinNumber?: string | null;
}): Promise<GhinLookupResult | null> {
  const token = await ghinLogin();
  if (!token) return null;

  try {
    if (player.ghinNumber) {
      const golfers = await ghinSearch(token, new URLSearchParams({ golfer_id: player.ghinNumber }));
      const hit = golfers[0] && toResult(golfers[0]);
      if (hit) return hit;
    }

    const [firstName, ...rest] = player.name.trim().split(/\s+/);
    const lastName = rest.join(" ");
    if (!firstName || !lastName) return null;

    const golfers = await ghinSearch(
      token,
      new URLSearchParams({ first_name: firstName, last_name: lastName, status: "Active" }),
    );
    const wanted = player.name.trim().toLowerCase();
    const exact = golfers.filter((golfer) => {
      const name = (
        golfer.player_name ?? `${golfer.first_name ?? ""} ${golfer.last_name ?? ""}`
      )
        .trim()
        .toLowerCase();
      return name === wanted;
    });
    // Only trust an unambiguous match — a common name with multiple actives is skipped
    if (exact.length === 1) return toResult(exact[0]);
    return null;
  } catch {
    return null;
  }
}
