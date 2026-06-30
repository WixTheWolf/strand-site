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
  const normalized = String(value).replace(/~/g, "-");
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

export async function fetchGrintHandicap(userId: string): Promise<GrintHandicap> {
  const body = new URLSearchParams({ user_id: userId });
  const response = await fetch(`${GRINT_BASE}/user/get_handicap_info/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    next: { revalidate: 1800 },
  });

  if (!response.ok) {
    throw new Error(`TheGrint handicap fetch failed (${response.status})`);
  }

  return response.json();
}