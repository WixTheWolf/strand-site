import { fetchGrintHandicap, searchGrintUsers, type GrintSearchResult } from "./grint";
import type { GrintHandicap, StrandPlayer } from "./types";

export interface ResolvedGrintPlayer {
  handicap: GrintHandicap | null;
  match: GrintSearchResult | null;
  matchedTerm: string | null;
  dataSource: "live" | "estimated" | "missing";
}

function normalizeTerm(term: string): string {
  return term.trim().toLowerCase();
}

function scoreMatch(player: StrandPlayer, hit: GrintSearchResult, term: string): number {
  let score = 0;
  const termNorm = normalizeTerm(term);
  const username = (hit.username || "").toLowerCase();
  const name = (hit.name || "").toLowerCase();
  const playerName = player.name.toLowerCase();

  if (player.grintId && hit.id === player.grintId) score += 100;
  if (termNorm === username || termNorm === username.replace(/\s/g, "")) score += 50;
  if (player.email && termNorm === player.email.toLowerCase()) score += 45;
  if (username.includes(termNorm) || termNorm.includes(username)) score += 20;
  if (name.includes(playerName.split(" ")[0]) && name.includes(playerName.split(" ").slice(-1)[0])) score += 15;
  if (player.grintUsername && username === player.grintUsername.toLowerCase()) score += 40;

  return score;
}

export async function resolvePlayerGrint(player: StrandPlayer): Promise<ResolvedGrintPlayer> {
  const terms = [
    ...(player.grintSearchTerms ?? []),
    player.email,
    player.grintUsername,
    player.name,
    player.nickname,
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

  if (bestHit && bestScore >= 15) {
    try {
      const handicap = await fetchGrintHandicap(bestHit.id);
      return {
        handicap,
        match: bestHit,
        matchedTerm: bestTerm,
        dataSource: "live",
      };
    } catch {
      return { handicap: null, match: bestHit, matchedTerm: bestTerm, dataSource: "estimated" };
    }
  }

  return {
    handicap: null,
    match: null,
    matchedTerm: null,
    dataSource: player.estimatedIndex ? "estimated" : "missing",
  };
}