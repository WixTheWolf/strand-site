import { fetchGrintHandicap, getGrintProfileUrl, searchGrintUsers, type GrintSearchResult } from "./grint";
import type { GrintHandicap, StrandPlayer } from "./types";

export interface ResolvedGrintPlayer {
  handicap: GrintHandicap | null;
  match: GrintSearchResult | null;
  matchedTerm: string | null;
  dataSource: "live" | "manual" | "estimated" | "missing";
  grintProfileUrl: string | null;
  ghinNumber: string | null;
}

function normalizeTerm(term: string): string {
  return term.trim().toLowerCase();
}

const VAGUE_TERMS = new Set(["california", "blade", "kerns", "gord", "wix", "kev", "nick"]);

function scoreMatch(player: StrandPlayer, hit: GrintSearchResult, term: string): number {
  let score = 0;
  const termNorm = normalizeTerm(term);
  const username = (hit.username || "").toLowerCase();
  const name = (hit.name || "").toLowerCase().trim();
  const playerName = player.name.toLowerCase();
  const [first, ...rest] = playerName.split(" ");
  const last = rest.join(" ");

  if (VAGUE_TERMS.has(termNorm) || termNorm.length < 4) return 0;

  if (player.grintId && hit.id === player.grintId) score += 100;
  if (player.grintUsername && username === player.grintUsername.toLowerCase()) score += 50;
  if (termNorm === username || termNorm === username.replace(/\s/g, "")) score += 50;
  if (player.email && termNorm === player.email.toLowerCase()) score += 45;
  if (term.includes("@") && username.includes(termNorm.split("@")[0])) score += 35;
  if (name === playerName || name === `${first} ${last}`) score += 40;
  if (last && name.includes(first) && name.includes(last)) score += 25;
  if (username.includes(termNorm) && termNorm.length >= 6) score += 20;

  return score;
}

export async function resolvePlayerGrint(player: StrandPlayer): Promise<ResolvedGrintPlayer> {
  if (player.manualIndex !== undefined) {
    return {
      handicap: null,
      match: null,
      matchedTerm: null,
      dataSource: "manual",
      grintProfileUrl: getGrintProfileUrl(player.grintUsername),
      ghinNumber: player.ghinNumber ?? null,
    };
  }

  const terms = [
    ...(player.grintSearchTerms ?? []),
    player.email,
    player.grintUsername,
    player.name,
  ].filter((term): term is string => Boolean(term && term.trim()));

  const uniqueTerms = [...new Set(terms)];

  if (player.grintId) {
    try {
      const handicap = await fetchGrintHandicap(player.grintId);
      return {
        handicap,
        match: {
          id: player.grintId,
          name: player.name,
          username: player.grintUsername ?? "",
          location: player.location,
        },
        matchedTerm: player.grintId,
        dataSource: "live",
        grintProfileUrl: getGrintProfileUrl(player.grintUsername),
        ghinNumber: player.ghinNumber ?? null,
      };
    } catch {
      // fall through to search
    }
  }

  let bestHit: GrintSearchResult | null = null;
  let bestTerm: string | null = null;
  let bestScore = 0;

  for (const term of uniqueTerms) {
    try {
      const hits = await searchGrintUsers(term);
      for (const hit of hits) {
        const score = scoreMatch(player, hit, term);
        if (score > bestScore) {
          bestScore = score;
          bestHit = hit;
          bestTerm = term;
        }
      }
    } catch {
      continue;
    }
  }

  if (bestHit && bestScore >= 25) {
    try {
      const handicap = await fetchGrintHandicap(bestHit.id);
      return {
        handicap,
        match: bestHit,
        matchedTerm: bestTerm,
        dataSource: "live",
        grintProfileUrl: getGrintProfileUrl(bestHit.username),
        ghinNumber: player.ghinNumber ?? null,
      };
    } catch {
      return {
        handicap: null,
        match: bestHit,
        matchedTerm: bestTerm,
        dataSource: "estimated",
        grintProfileUrl: getGrintProfileUrl(bestHit.username),
        ghinNumber: player.ghinNumber ?? null,
      };
    }
  }

  return {
    handicap: null,
    match: null,
    matchedTerm: null,
    dataSource: player.estimatedIndex ? "estimated" : "missing",
    grintProfileUrl: getGrintProfileUrl(player.grintUsername),
    ghinNumber: player.ghinNumber ?? null,
  };
}