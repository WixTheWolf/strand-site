import { lookupGhinIndex } from "./ghin";
import { fetchGrintHandicap, getGrintProfileUrlForPlayer, searchGrintUsers, type GrintSearchResult } from "./grint";
import type { GrintHandicap, StrandPlayer } from "./types";

export interface ResolvedGrintPlayer {
  handicap: GrintHandicap | null;
  match: GrintSearchResult | null;
  matchedTerm: string | null;
  dataSource: "live" | "ghin" | "manual" | "estimated" | "missing";
  grintProfileUrl: string | null;
  ghinNumber: string | null;
  /** Official USGA index straight from GHIN, when GHIN credentials are configured */
  ghinIndex: string | null;
  ghinLowIndex: string | null;
  ghinLowIndexDate: string | null;
  ghinRevisionDate: string | null;
  ghinSoftCap: boolean | null;
  ghinHardCap: boolean | null;
  ghinStatus: string | null;
}

function ghinProfile(ghin: Awaited<ReturnType<typeof lookupGhinIndex>>) {
  return {
    ghinLowIndex: ghin?.lowHandicapIndex ?? null,
    ghinLowIndexDate: ghin?.lowHandicapDate ?? null,
    ghinRevisionDate: ghin?.revisionDate ?? null,
    ghinSoftCap: ghin?.softCap ?? null,
    ghinHardCap: ghin?.hardCap ?? null,
    ghinStatus: ghin?.status ?? null,
  };
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

function verifiedDataSource(player: StrandPlayer): ResolvedGrintPlayer["dataSource"] {
  return player.ghinClub ? "ghin" : "manual";
}

export async function resolvePlayerGrint(player: StrandPlayer): Promise<ResolvedGrintPlayer> {
  const profileUrl = getGrintProfileUrlForPlayer(player);

  // GHIN is the official source — look it up first (no-op without credentials).
  // Pass the verified index and home club so name lookups can disambiguate.
  const ghin = await lookupGhinIndex({
    name: player.name,
    ghinNumber: player.ghinNumber,
    expectedIndex: player.manualIndex ?? null,
    expectedClub: player.ghinClub ?? null,
  });
  const ghinIndex = ghin?.handicapIndex ?? null;
  const ghinNumber = ghin?.ghinNumber ?? player.ghinNumber ?? null;

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
        dataSource: ghinIndex !== null ? "ghin" : "live",
        grintProfileUrl: profileUrl,
        ghinNumber,
        ghinIndex,
        ...ghinProfile(ghin),
      };
    } catch {
      // fall through
    }
  }

  // No grintId — try to find the player on TheGrint before settling for a
  // manual/estimated index, so every handicap that CAN be live is live.
  // A name alone is not a stable identifier and can silently attach another
  // golfer's index to the draft model. Only search when an authorized private
  // link supplies an email, username, or explicit disambiguation terms.
  const hasExplicitLookup = Boolean(
    player.grintSearchTerms?.length || player.email || player.grintUsername,
  );
  const terms = hasExplicitLookup
    ? [
        ...(player.grintSearchTerms ?? []),
        player.email,
        player.grintUsername,
        player.name,
      ].filter((term): term is string => Boolean(term && term.trim()))
    : [];

  const uniqueTerms = [...new Set(terms)];

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
        dataSource: ghinIndex !== null ? "ghin" : "live",
        grintProfileUrl: getGrintProfileUrlForPlayer({ grintId: bestHit.id, grintUsername: bestHit.username }),
        ghinNumber,
        ghinIndex,
        ...ghinProfile(ghin),
      };
    } catch {
      return {
        handicap: null,
        match: bestHit,
        matchedTerm: bestTerm,
        dataSource: ghinIndex !== null
          ? "ghin"
          : player.manualIndex !== undefined
            ? verifiedDataSource(player)
            : "estimated",
        grintProfileUrl: getGrintProfileUrlForPlayer({ grintId: bestHit.id, grintUsername: bestHit.username }),
        ghinNumber,
        ghinIndex,
        ...ghinProfile(ghin),
      };
    }
  }

  if (player.manualIndex !== undefined) {
    return {
      handicap: null,
      match: null,
      matchedTerm: null,
      dataSource: ghinIndex !== null ? "ghin" : verifiedDataSource(player),
      grintProfileUrl: profileUrl,
      ghinNumber,
      ghinIndex,
      ...ghinProfile(ghin),
    };
  }

  return {
    handicap: null,
    match: null,
    matchedTerm: null,
    dataSource: ghinIndex !== null ? "ghin" : player.estimatedIndex ? "estimated" : "missing",
    grintProfileUrl: getGrintProfileUrlForPlayer(player),
    ghinNumber,
    ghinIndex,
    ...ghinProfile(ghin),
  };
}
