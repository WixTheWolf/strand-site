import type { GrintHandicap } from "./types";

const GRINT_BASE = "https://thegrint.com";

export interface GrintSearchResult {
  id: string;
  name: string;
  username: string;
  location?: string;
  image?: string;
}

export function parseHandicapNumber(value: string | null | undefined): number | null {
  if (!value || value === "N/A") return null;
  const raw = String(value).trim();

  // Plus handicaps ("+2.0") are better than scratch — numerically negative
  if (raw.startsWith("+")) {
    const plus = parseFloat(raw.slice(1));
    return Number.isNaN(plus) ? null : -plus;
  }

  const normalized = raw.replace(/~/g, "-");
  if (normalized.includes("-")) {
    const parts = normalized
      .split("-")
      .map((part) => parseFloat(part.trim()))
      .filter((part) => !Number.isNaN(part));
    if (!parts.length) return null;
    return parts.reduce((sum, part) => sum + part, 0) / parts.length;
  }
  const parsed = parseFloat(normalized);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function searchGrintUsers(query: string): Promise<GrintSearchResult[]> {
  const body = new URLSearchParams({ search: query });
  const response = await fetch(`${GRINT_BASE}/user/ajax_search_users_json`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`TheGrint search failed (${response.status})`);
  }

  return response.json();
}

export function getGrintProfileUrl(username?: string | null): string | null {
  if (!username?.trim()) return null;
  const slug = username.trim().replace(/^@/, "").replace(/\s+/g, "");
  if (!slug || slug.includes("@")) return null;
  return `${GRINT_BASE}/profile/${encodeURIComponent(slug)}`;
}

export function getGrintProfileUrlForPlayer(player: {
  grintId?: string | null;
  grintUsername?: string;
}): string | null {
  if (player.grintId) {
    return `${GRINT_BASE}/profile/index/${player.grintId}`;
  }
  return getGrintProfileUrl(player.grintUsername);
}

export interface GrintRoundResult {
  date: string;
  score: number;
  course?: string;
  differential?: number | null;
}

interface GrintScoreCandidate {
  [key: string]: unknown;
}

function pickString(row: GrintScoreCandidate, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}

function pickNumber(row: GrintScoreCandidate, keys: string[]): number | null {
  for (const key of keys) {
    const parsed = parseFloat(String(row[key] ?? ""));
    if (!Number.isNaN(parsed)) return parsed;
  }
  return null;
}

/**
 * Last posted rounds from TheGrint, newest first. TheGrint's score endpoints
 * are undocumented, so several candidates are tried and parsed leniently;
 * any failure returns an empty list.
 */
export async function fetchGrintScores(userId: string, limit = 5): Promise<GrintRoundResult[]> {
  const body = new URLSearchParams({ user_id: userId, limit: String(limit) });
  const candidates = [
    `${GRINT_BASE}/user/get_scores/`,
    `${GRINT_BASE}/user/get_user_scores/`,
    `${GRINT_BASE}/user/get_score_history/`,
    `${GRINT_BASE}/user/get_last_scores/`,
  ];

  for (const url of candidates) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        next: { revalidate: 300 },
      });
      if (!response.ok) continue;
      const data = await response.json();
      const rows: GrintScoreCandidate[] = Array.isArray(data)
        ? data
        : (data?.scores ?? data?.data ?? data?.rounds ?? []);
      if (!Array.isArray(rows) || !rows.length) continue;

      const parsed: GrintRoundResult[] = [];
      for (const row of rows) {
        const score = pickNumber(row, ["score", "gross", "gross_score", "total", "total_score"]);
        const date = pickString(row, ["date", "date_played", "played_at", "score_date", "created"]);
        if (score === null || !date) continue;
        parsed.push({
          date,
          score,
          course: pickString(row, ["course", "course_name", "club_name"]),
          differential: pickNumber(row, ["differential", "diff"]),
        });
        if (parsed.length >= limit) break;
      }

      if (parsed.length) return parsed;
    } catch {
      continue;
    }
  }

  return [];
}

export async function fetchGrintHandicap(userId: string): Promise<GrintHandicap> {
  const body = new URLSearchParams({ user_id: userId });
  const response = await fetch(`${GRINT_BASE}/user/get_handicap_info/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    // Keep indexes fresh — 5 minutes, not 30
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`TheGrint handicap fetch failed (${response.status})`);
  }

  return response.json();
}