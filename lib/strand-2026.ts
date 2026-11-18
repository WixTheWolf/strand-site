import { STRAND_PLAYERS } from "./players";
import type { StrandPlayer } from "./types";

/** Final 2026 rosters, captain-verified 2026-11-18. Order: captain first. */
export const TEAM_JUSTIN_2026_IDS = [
  "justin-uribe",
  "fred-geisinger",
  "matt-schroeder",
  "ryan-darcy",
  "brian-kerns",
  "shaun-eipper",
  "jason-olson",
  "kevin-gordon",
  "matt-onorato",
  "brett-comfort",
] as const;

export const TEAM_WIX_2026_IDS = [
  "matt-wixted",
  "andrew-mager",
  "jack-groot",
  "jordan-brodbeck",
  "nick-sprowls",
  "tim-hummel",
  "nick-kane",
  "pat-morse",
  "sam-blonski",
  "rhett-fahrney",
] as const;

const byId = new Map(STRAND_PLAYERS.map((player) => [player.id, player]));

export function rosterPlayers(ids: readonly string[]): StrandPlayer[] {
  return ids
    .map((id) => byId.get(id))
    .filter((player): player is StrandPlayer => Boolean(player));
}

export const STRAND_2026 = {
  champion: "Team Justin",
  runnerUp: "Team WIX",
  destination: "Gamble Sands · Brewster, WA",
  dates: "August 20–23, 2026",
  edition: 9,
  courses: ["Gamble Sands", "Scarecrow", "QuickSands"],
  recapHref: "/the-strand/gamble-sands-2026",
} as const;
