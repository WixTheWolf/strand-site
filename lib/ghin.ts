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

// The api2.ghin.com login endpoint accepts a GHIN number as the identifier,
// while an account email may only work through ghin.com's web OAuth. Keep the
// member number in a server-only environment variable so it is never stored
// in, or shipped from, the public repository.
function loginIdentifiers(): string[] {
  const ids = [
    process.env.GHIN_NUMBER ?? process.env.GHIN_Number ?? process.env.ghin_number,
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
  lowHandicapIndex?: string | null;
  lowHandicapDate?: string | null;
  revisionDate?: string | null;
  softCap?: boolean | null;
  hardCap?: boolean | null;
  status?: string | null;
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
  low_hi?: string | number;
  low_hi_value?: string | number;
  low_hi_display?: string | number;
  low_hi_date?: string;
  rev_date?: string;
  soft_cap?: boolean;
  hard_cap?: boolean;
  status?: string;
}

function toResult(golfer: GhinGolferRecord): GhinLookupResult | null {
  const index = golfer.handicap_index ?? golfer.hi_display;
  const ghin = golfer.ghin ?? golfer.id;
  if (index === undefined || index === null || ghin === undefined || ghin === null) return null;
  return {
    handicapIndex: String(index),
    ghinNumber: String(ghin),
    clubName: golfer.club_name,
    lowHandicapIndex: golfer.low_hi_value !== undefined && golfer.low_hi_value !== null
      ? String(golfer.low_hi_value)
      : golfer.low_hi !== undefined && golfer.low_hi !== null
        ? String(golfer.low_hi)
        : golfer.low_hi_display !== undefined && golfer.low_hi_display !== null
          ? String(golfer.low_hi_display)
          : null,
    lowHandicapDate: golfer.low_hi_date ?? null,
    revisionDate: golfer.rev_date ?? null,
    softCap: golfer.soft_cap ?? null,
    hardCap: golfer.hard_cap ?? null,
    status: golfer.status ?? null,
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
  course_rating?: number | string;
  slope_rating?: number | string;
  pcc?: number | string;
  unadjusted_differential?: number | string;
  net_score_differential?: number | string;
  score_type?: string;
  score_type_display_short?: string;
  score_type_display_full?: string;
  status?: string;
  used?: boolean | string | number;
  exceptional?: boolean | string | number;
  edited?: boolean | string | number;
  statistics?: Record<string, unknown> | null;
  hole_details?: Array<Record<string, unknown>> | null;
}

export interface GhinRoundResult {
  date: string;
  score: number;
  course?: string;
  differential?: number | null;
  nineHole?: boolean;
  adjustedGrossScore?: number | null;
  courseRating?: number | null;
  slopeRating?: number | null;
  pcc?: number | null;
  unadjustedDifferential?: number | null;
  netScoreDifferential?: number | null;
  holesPlayed?: number | null;
  postedDate?: string | null;
  scoreType?: string | null;
  scoreStatus?: string | null;
  usedInIndex?: boolean | null;
  exceptional?: boolean | null;
  edited?: boolean | null;
  shotStats?: import("./types").RoundShotStats | null;
}

function numberValue(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function booleanValue(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1" || value === "true") return true;
  if (value === 0 || value === "0" || value === "false") return false;
  return null;
}

function percentValue(value: unknown): number | null {
  const parsed = numberValue(value);
  if (parsed === null) return null;
  return parsed >= 0 && parsed <= 1 ? parsed * 100 : parsed;
}

function firstPresent(source: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null && source[key] !== "") return source[key];
  }
  return null;
}

function shotStatsFromHoles(
  holes: Array<Record<string, unknown>>,
): import("./types").RoundShotStats | null {
  if (!holes.length) return null;
  let birdies = 0;
  let pars = 0;
  let bogeys = 0;
  let doubles = 0;
  let triples = 0;
  let fairways = 0;
  let fairwayChances = 0;
  let greens = 0;
  let greenChances = 0;
  let putts = 0;
  let puttHoles = 0;
  let onePutts = 0;
  let twoPutts = 0;
  let threePutts = 0;
  const parScores: Record<3 | 4 | 5, number[]> = { 3: [], 4: [], 5: [] };

  for (const hole of holes) {
    const par = numberValue(hole.par);
    const score = numberValue(hole.raw_score ?? hole.adjusted_gross_score);
    if (par !== null && score !== null) {
      const relative = score - par;
      if (relative <= -1) birdies += 1;
      else if (relative === 0) pars += 1;
      else if (relative === 1) bogeys += 1;
      else if (relative === 2) doubles += 1;
      else triples += 1;
      if (par === 3 || par === 4 || par === 5) parScores[par].push(score);
    }

    if (par !== 3) {
      const fairway = booleanValue(hole.fairway_hit);
      if (fairway !== null) {
        fairwayChances += 1;
        if (fairway) fairways += 1;
      }
    }

    const gir = booleanValue(hole.gir_flag);
    if (gir !== null) {
      greenChances += 1;
      if (gir) greens += 1;
    }

    const holePutts = numberValue(hole.putts);
    if (holePutts !== null) {
      putts += holePutts;
      puttHoles += 1;
      if (holePutts <= 1) onePutts += 1;
      else if (holePutts === 2) twoPutts += 1;
      else threePutts += 1;
    }
  }

  const holesPlayed = holes.length;
  const pct = (count: number, total: number) => total ? (count / total) * 100 : null;
  const avg = (values: number[]) => values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : null;

  return {
    birdiesOrBetterPct: pct(birdies, holesPlayed),
    parsPct: pct(pars, holesPlayed),
    bogeysPct: pct(bogeys, holesPlayed),
    doubleBogeysPct: pct(doubles, holesPlayed),
    tripleBogeysOrWorsePct: pct(triples, holesPlayed),
    fairwayHitsPct: pct(fairways, fairwayChances),
    girPct: pct(greens, greenChances),
    onePuttOrBetterPct: pct(onePutts, puttHoles),
    twoPuttPct: pct(twoPutts, puttHoles),
    threePuttOrWorsePct: pct(threePutts, puttHoles),
    putts: puttHoles ? putts : null,
    par3Average: avg(parScores[3]),
    par4Average: avg(parScores[4]),
    par5Average: avg(parScores[5]),
  };
}

function extractShotStats(row: GhinScoreRecord): import("./types").RoundShotStats | null {
  const source = row.statistics;
  if (source && typeof source === "object") {
    return {
      birdiesOrBetterPct: percentValue(firstPresent(source, ["birdies_or_better_percent"])),
      parsPct: percentValue(firstPresent(source, ["pars_percent"])),
      bogeysPct: percentValue(firstPresent(source, ["bogeys_percent"])),
      doubleBogeysPct: percentValue(firstPresent(source, ["double_bogeys_percent"])),
      tripleBogeysOrWorsePct: percentValue(firstPresent(source, ["triple_bogeys_or_worse_percent"])),
      fairwayHitsPct: percentValue(firstPresent(source, ["fairway_hits_percent"])),
      girPct: percentValue(firstPresent(source, ["gir_percent"])),
      onePuttOrBetterPct: percentValue(firstPresent(source, ["one_putt_or_better_percent"])),
      twoPuttPct: percentValue(firstPresent(source, ["two_putt_percent"])),
      threePuttOrWorsePct: percentValue(firstPresent(source, ["three_putt_or_worse_percent"])),
      putts: numberValue(firstPresent(source, ["putts_total"])),
      upAndDowns: numberValue(firstPresent(source, ["up_and_downs_total"])),
      par3Average: numberValue(firstPresent(source, ["par3s_average"])),
      par4Average: numberValue(firstPresent(source, ["par4s_average"])),
      par5Average: numberValue(firstPresent(source, ["par5s_average"])),
      approachMissLeftPct: percentValue(firstPresent(source, ["missed_left_approach_shot_accuracy_percent", "missed_left_percent"])),
      approachMissRightPct: percentValue(firstPresent(source, ["missed_right_approach_shot_accuracy_percent", "missed_right_percent"])),
      approachMissShortPct: percentValue(firstPresent(source, ["missed_short_approach_shot_accuracy_percent", "missed_short_percent"])),
      approachMissLongPct: percentValue(firstPresent(source, ["missed_long_approach_shot_accuracy_percent", "missed_long_percent"])),
    };
  }
  return shotStatsFromHoles(Array.isArray(row.hole_details) ? row.hole_details : []);
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
export async function fetchGhinScores(ghinNumber: string, limit = 60): Promise<GhinRoundResult[]> {
  const token = await ghinLogin();
  if (!token) return [];

  const id = encodeURIComponent(ghinNumber);
  // Pull a generous window then sort newest-first ourselves. The flat
  // /scores.json?golfer_id= shape is cleanest; the nested /golfers/{id}/
  // shape (scores under revision_scores) is the fallback.
  const window = Math.min(100, Math.max(limit, 20));
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
        const holes = parseFloat(String(row.number_of_played_holes ?? row.number_of_holes ?? ""));
        const scoreType = row.score_type_display_full ?? row.score_type_display_short ?? row.score_type ?? null;
        results.push({
          date,
          score,
          course: row.course_name ?? row.facility_name,
          differential: Number.isNaN(diff) ? null : diff,
          nineHole: !Number.isNaN(holes) && holes <= 9,
          adjustedGrossScore: numberValue(row.adjusted_gross_score ?? row.adjusted_score ?? row.score),
          courseRating: numberValue(row.course_rating),
          slopeRating: numberValue(row.slope_rating),
          pcc: numberValue(row.pcc),
          unadjustedDifferential: numberValue(row.unadjusted_differential),
          netScoreDifferential: numberValue(row.net_score_differential),
          holesPlayed: Number.isNaN(holes) ? null : holes,
          postedDate: row.posted_at ?? null,
          scoreType,
          scoreStatus: row.status ?? null,
          usedInIndex: booleanValue(row.used),
          exceptional: booleanValue(row.exceptional),
          edited: booleanValue(row.edited),
          shotStats: extractShotStats(row),
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
