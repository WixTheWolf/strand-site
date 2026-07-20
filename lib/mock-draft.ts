import {
  CAPTAIN_IDS,
  DRAFT_PICKS_PER_CAPTAIN,
  isCaptain,
  TEAM_SIZE,
  TOTAL_DRAFT_PICKS,
} from "./players";
import { computeMatchPlayValue, marginalTeamValue } from "./draft-engine";
import type { PlayerDraftStats } from "./types";

export type DraftSide = "mine" | "justin";

export interface DraftPick {
  pickNumber: number;
  playerId: string;
  side: DraftSide;
}

export interface MockDraftScenario {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  iPickFirst: boolean;
  picks: DraftPick[];
  notes: string;
}

export const MY_CAPTAIN = {
  id: CAPTAIN_IDS[0],
  name: "Matt Wixted",
  nickname: "WIX",
};

export const OPPONENT_CAPTAIN = {
  id: CAPTAIN_IDS[1],
  name: "Justin Uribe",
  nickname: "J-BONE",
};

const STORAGE_KEY = "strand-mock-draft-scenarios";

/** Traditional (linear) order — the same captain leads off every round */
export function getPickOwner(pickNumber: number, iPickFirst: boolean): DraftSide {
  const first = iPickFirst ? "mine" : "justin";
  const second = iPickFirst ? "justin" : "mine";
  return pickNumber % 2 === 1 ? first : second;
}

export function getNextPickNumber(picks: DraftPick[]): number {
  return picks.length + 1;
}

export function getCurrentOwner(picks: DraftPick[], iPickFirst: boolean): DraftSide | null {
  if (picks.length >= TOTAL_DRAFT_PICKS) return null;
  return getPickOwner(getNextPickNumber(picks), iPickFirst);
}

export function getPicksForSide(picks: DraftPick[], side: DraftSide): DraftPick[] {
  return picks.filter((pick) => pick.side === side);
}

export function getDraftedIds(picks: DraftPick[]): Set<string> {
  return new Set(picks.map((pick) => pick.playerId));
}

export function getAvailablePlayers(players: PlayerDraftStats[], picks: DraftPick[]): PlayerDraftStats[] {
  const drafted = getDraftedIds(picks);
  return players.filter((player) => !drafted.has(player.id) && !isCaptain(player.id));
}

export function getFullRoster(
  players: PlayerDraftStats[],
  picks: DraftPick[],
  side: DraftSide,
): PlayerDraftStats[] {
  const captainId = side === "mine" ? MY_CAPTAIN.id : OPPONENT_CAPTAIN.id;
  const captain = players.find((player) => player.id === captainId);
  const drafted = getPicksForSide(picks, side)
    .map((pick) => players.find((player) => player.id === pick.playerId))
    .filter(Boolean) as PlayerDraftStats[];

  return captain ? [captain, ...drafted] : drafted;
}

export function suggestJustinPick(
  available: PlayerDraftStats[],
  myPicks: DraftPick[],
  allPlayers: PlayerDraftStats[],
): PlayerDraftStats | null {
  if (!available.length) return null;

  const justinCaptain = allPlayers.find((player) => player.id === OPPONENT_CAPTAIN.id);
  const justinBase = justinCaptain ? [justinCaptain] : [];
  const myTeam = getFullRoster(allPlayers, myPicks, "mine");
  const myValue = marginalTeamValue(myTeam);

  let best = available[0];
  let bestScore = -Infinity;

  for (const candidate of available) {
    const score =
      marginalTeamValue([...justinBase, candidate]) -
      myValue * 0.1 +
      computeMatchPlayValue(candidate) * 0.05;
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return best;
}

// Justin won the flip — new scenarios start from draft-night reality (J-BONE picks first)
export function createScenario(name: string, iPickFirst = false): MockDraftScenario {
  const now = new Date().toISOString();
  return {
    id: `scenario-${Date.now()}`,
    name,
    createdAt: now,
    updatedAt: now,
    iPickFirst,
    picks: [],
    notes: "",
  };
}

export function loadScenarios(): MockDraftScenario[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MockDraftScenario[];
  } catch {
    return [];
  }
}

export function saveScenarios(scenarios: MockDraftScenario[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
}

export function upsertScenario(scenarios: MockDraftScenario[], scenario: MockDraftScenario) {
  const index = scenarios.findIndex((item) => item.id === scenario.id);
  if (index >= 0) {
    const next = [...scenarios];
    next[index] = scenario;
    saveScenarios(next);
    return next;
  }
  const next = [scenario, ...scenarios];
  saveScenarios(next);
  return next;
}

export function deleteScenario(scenarios: MockDraftScenario[], id: string) {
  const next = scenarios.filter((item) => item.id !== id);
  saveScenarios(next);
  return next;
}

export function formatPickLabel(pickNumber: number, iPickFirst: boolean): string {
  const owner = getPickOwner(pickNumber, iPickFirst);
  return owner === "mine" ? `${MY_CAPTAIN.nickname} picks` : `${OPPONENT_CAPTAIN.nickname} picks`;
}

export { DRAFT_PICKS_PER_CAPTAIN, TEAM_SIZE, TOTAL_DRAFT_PICKS };

export const SCENARIO_TEMPLATES = [
  { name: "Justin takes Fred #1", preset: (s: MockDraftScenario) => presetJustinFirstPick(s, "fred-geisinger") },
  { name: "Justin takes Mager #1", preset: (s: MockDraftScenario) => presetJustinFirstPick(s, "andrew-mager") },
  { name: "Justin takes D'Arcy #1", preset: (s: MockDraftScenario) => presetJustinFirstPick(s, "ryan-darcy") },
  { name: "Draft night — Justin picks first", preset: (s: MockDraftScenario) => ({ ...s, iPickFirst: false, picks: [] }) },
  { name: "I pick first — hypothetical", preset: (s: MockDraftScenario) => ({ ...s, iPickFirst: true, picks: [] }) },
];

function presetJustinFirstPick(scenario: MockDraftScenario, playerId: string): MockDraftScenario {
  return {
    ...scenario,
    iPickFirst: false,
    picks: [{ pickNumber: 1, playerId, side: "justin" }],
    name: scenario.name,
  };
}
