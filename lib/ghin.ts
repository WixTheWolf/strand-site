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

// Env-var names are case-sensitive; accept the common casings so a
// GHIN_Email / ghin_email entry in the dashboard still resolves. Trim the
// values so a stray space/newline pasted into the Vercel field can't break
// the login.
export function ghinEmail(): string | undefined {
  return (process.env.GHIN_EMAIL ?? process.env.GHIN_Email ?? process.env.ghin_email)?.trim();
}

export function ghinPassword(): string | undefined {
  return (process.env.GHIN_PASSWORD ?? process.env.GHIN_Password ?? process.env.ghin_password)?.trim();
}

export function ghinConfigured(): boolean {
  return Boolean(ghinEmail() && ghinPassword());
}

// The api2.ghin.com login endpoint accepts a GHIN NUMBER as the identifier,
// but rejects the account email (that only works through ghin.com's web
// OAuth). So authenticate with the number: an explicit GHIN_NUMBER env if set,
// then the account owner's known number, then whatever's in GHIN_Email (in
// case a number was entered there). Any valid member login yields a token
// that can look up every golfer.
const ACCOUNT_OWNER_GHIN = "11634237"; // WIX

function loginIdentifiers(): string[] {
  const ids = [
    process.env.GHIN_NUMBER ?? process.env.GHIN_Number ?? process.env.ghin_number,
    ACCOUNT_OWNER_GHIN,
    ghinEmail(),
  ].filter((id): id is string => Boolean(id && id.trim()));
  return [...new Set(ids)];
}

// Share a single in-flight login across concurrent callers. The players
// route resolves 20 golfers in parallel; without this they'd each fire
// their own login and GHIN throttles the burst, failing them all.
let loginPromise: Promise<string | null> | null = null;

async function doLogin(): Promise<string | null> {
  const password = ghinPassword();
  if (!password) return null;

  for (const identifier of loginIdentifiers()) {
    try {
      const response = await fetch(`${GHIN_API}/golfer_login.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: { email_or_ghin: identifier, password, remember_me: true },
          token: "nonblank",
        }),
        cache: "no-store",
      });
      if (!response.ok) continue;
      const data = await response.json();
      const token: string | null = data?.golfer_user?.golfer_user_token ?? null;
      if (token) {
        cachedToken = { token, expiresAt: Date.now() + 50 * 60 * 1000 };
        return token;
      }
    } catch {
      continue;
    }
  }
  return null;
}

async function ghinLogin(): Promise<string | null> {
  if (!ghinConfigured()) return null;
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;
  // Coalesce concurrent logins into one request
  if (!loginPromise) {
    loginPromise = doLogin().finally(() => {
      loginPromise = null;
    });
  }
  return loginPromise;
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
    next: { revalidate: 1800 },
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
  number_of_holes?: number | string;
  number_of_played_holes?: number | string;
}

export interface GhinRoundResult {
  date: string;
  score: number;
  course?: string;
  differential?: number | null;
  nineHole?: boolean;
}

/** GHIN wraps score arrays a few different ways depending on the endpoint. */
function extractScoreRows(data: unknown): GhinScoreRecord[] {
  const d = data as Record<string, unknown>;
  const candidates: unknown[] = [
    d?.scores,
    (d?.revision_scores as Record<string, unknown>)?.scores,
    (d?.recent_scores as Record<string, unknown>)?.scores,
    d?.golfer_scores,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length) return candidate as GhinScoreRecord[];
  }
  return [];
}

/** Last posted rounds for a golfer, newest first — requires GHIN credentials */
export async function fetchGhinScores(ghinNumber: string, limit = 5): Promise<GhinRoundResult[]> {
  const token = await ghinLogin();
  if (!token) return [];

  const id = encodeURIComponent(ghinNumber);
  // Pull a generous window then sort newest-first ourselves. The flat
  // /scores.json?golfer_id= shape is cleanest; the nested /golfers/{id}/
  // shape (scores under revision_scores) is the fallback.
  const window = Math.max(limit * 4, 20);
  const urls = [
    `${GHIN_API}/scores.json?golfer_id=${id}&source=GHINcomWeb&per_page=${window}&page=1`,
    `${GHIN_API}/golfers/${id}/scores.json?source=GHINcomWeb&per_page=${window}&page=1`,
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 1800 },
      });
      if (!response.ok) continue;
      const rows = extractScoreRows(await response.json());
      if (!rows.length) continue;

      const results: GhinRoundResult[] = [];
      for (const row of rows) {
        const score = parseFloat(String(row.adjusted_gross_score ?? row.adjusted_score ?? row.score ?? ""));
        const date = row.played_at ?? row.date_played ?? row.posted_at ?? "";
        if (Number.isNaN(score) || !date) continue;
        const diff = parseFloat(String(row.differential ?? ""));
        const holes = parseFloat(String(row.number_of_holes ?? row.number_of_played_holes ?? ""));
        results.push({
          date,
          score,
          course: row.course_name ?? row.facility_name,
          differential: Number.isNaN(diff) ? null : diff,
          nineHole: !Number.isNaN(holes) && holes <= 9,
        });
      }
      if (!results.length) continue;
      // Newest first, then trim to the requested count
      results.sort((a, b) => b.date.localeCompare(a.date));
      return results.slice(0, limit);
    } catch {
      continue;
    }
  }
  return [];
}

/**
 * Look a player up on GHIN by GHIN number first, then by name. GHIN's name
 * search requires a country (or state), and returns legal names ("Matthew"
 * where the roster says "Matt"), so match on last name + a first-name prefix.
 * When several match, an expected handicap index disambiguates safely.
 */
export async function lookupGhinIndex(player: {
  name: string;
  ghinNumber?: string | null;
  expectedIndex?: number | null;
  expectedClub?: string | null;
}): Promise<GhinLookupResult | null> {
  const token = await ghinLogin();
  if (!token) return null;

  const alpha = (value: string | undefined) => (value ?? "").toLowerCase().replace(/[^a-z]/g, "");

  try {
    if (player.ghinNumber) {
      const golfers = await ghinSearch(token, new URLSearchParams({ golfer_id: player.ghinNumber }));
      const hit = golfers[0] && toResult(golfers[0]);
      if (hit) return hit;
    }

    const [firstName, ...rest] = player.name.trim().split(/\s+/);
    const lastName = rest.join(" ");
    if (!firstName || !lastName) return null;

    // Country (not residence state) — a player's GHIN home association may be
    // in a different state than where they live, so state would over-filter.
    const golfers = await ghinSearch(
      token,
      new URLSearchParams({
        first_name: firstName,
        last_name: lastName,
        status: "Active",
        country: "USA",
      }),
    );

    const fn = alpha(firstName);
    const ln = alpha(lastName);
    const candidates = golfers.filter((golfer) => {
      const gl = alpha(golfer.last_name);
      const gf = alpha(golfer.first_name);
      if (gl !== ln) return false; // apostrophes/hyphens already stripped
      return gf === fn || gf.startsWith(fn) || fn.startsWith(gf);
    });

    if (candidates.length === 1) return toResult(candidates[0]);
    if (!candidates.length) return null;

    // Disambiguate same-name golfers by club, then by verified index.
    const clubKey = alpha(player.expectedClub ?? undefined);
    if (clubKey) {
      const byClub = candidates.filter((golfer) => {
        const c = alpha(golfer.club_name);
        return c && (c.includes(clubKey) || clubKey.includes(c));
      });
      if (byClub.length === 1) return toResult(byClub[0]);
    }

    if (player.expectedIndex != null) {
      const scored = candidates
        .map((golfer) => ({
          golfer,
          diff: Math.abs(
            parseFloat(String(golfer.handicap_index ?? golfer.hi_display ?? "NaN")) - player.expectedIndex!,
          ),
        }))
        .filter((entry) => !Number.isNaN(entry.diff))
        .sort((a, b) => a.diff - b.diff);
      // Accept the closest index when it's a clear, close match
      if (scored.length && scored[0].diff <= 0.5 && (scored.length === 1 || scored[1].diff - scored[0].diff >= 0.5)) {
        return toResult(scored[0].golfer);
      }
    }
    return null;
  } catch {
    return null;
  }
}
