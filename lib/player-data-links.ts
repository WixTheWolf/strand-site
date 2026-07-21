import "server-only";

import type { StrandPlayer } from "./types";

type PlayerDataLink = Pick<
  StrandPlayer,
  "email" | "ghinNumber" | "ghinClub" | "grintId" | "grintUsername" | "grintSearchTerms"
>;

type PlayerDataLinkMap = Record<string, Partial<PlayerDataLink>>;

let cachedRaw: string | undefined;
let cachedLinks: PlayerDataLinkMap = {};

function playerDataLinks(): PlayerDataLinkMap {
  const raw = process.env.PLAYER_DATA_LINKS_JSON;
  if (raw === cachedRaw) return cachedLinks;
  cachedRaw = raw;

  if (!raw?.trim()) {
    cachedLinks = {};
    return cachedLinks;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    cachedLinks = parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as PlayerDataLinkMap
      : {};
  } catch {
    cachedLinks = {};
  }

  return cachedLinks;
}

/** Add account links at runtime without ever committing them to source. */
export function withPrivateDataLink(player: StrandPlayer): StrandPlayer {
  const link = playerDataLinks()[player.id];
  if (!link || typeof link !== "object") return player;

  return {
    ...player,
    email: typeof link.email === "string" ? link.email : player.email,
    ghinNumber: typeof link.ghinNumber === "string" ? link.ghinNumber : player.ghinNumber,
    ghinClub: typeof link.ghinClub === "string" ? link.ghinClub : player.ghinClub,
    grintId: typeof link.grintId === "string" ? link.grintId : player.grintId,
    grintUsername: typeof link.grintUsername === "string" ? link.grintUsername : player.grintUsername,
    grintSearchTerms: Array.isArray(link.grintSearchTerms)
      ? link.grintSearchTerms.filter((term): term is string => typeof term === "string")
      : player.grintSearchTerms,
  };
}
