import {
  CAPTAIN_IDS,
  DRAFT_PICKS_PER_CAPTAIN,
  isCaptain,
  TEAM_SIZE,
  TOTAL_DRAFT_PICKS,
} from "./players";
import {
  buildSaberBoard,
  rankDraftCandidates,
  type DraftAssignment,
} from "./sabermetrics";
import { officialDraftSide } from "./draft-order";
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

const STORAGE_KEY = "strand-mock-draft-scenarios-v4";
const LEGACY_STORAGE_KEY = "strand-mock-draft-scenarios";

/** Official linear order: J-BONE odd picks, WIX even picks. */
export function getPickOwner(pickNumber: number): DraftSide {
  return officialDraftSide(pickNumber) === "mine" ? "mine" : "justin";
}

export function getNextPickNumber(picks: DraftPick[]): number {
  return picks.length + 1;
}

export function getCurrentOwner(picks: DraftPick[]): DraftSide | null {
  if (picks.length >= TOTAL_DRAFT_PICKS) return null;
  return getPickOwner(getNextPickNumber(picks));
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
  allPicks: DraftPick[],
  allPlayers: PlayerDraftStats[],
): PlayerDraftStats | null {
  if (!available.length) return null;

  const assignments: DraftAssignment[] = allPicks.map((pick) => ({
    playerId: pick.playerId,
    side: pick.side === "mine" ? "mine" : "opponent",
  }));
  const board = buildSaberBoard(allPlayers);
  return rankDraftCandidates(allPlayers, board, assignments, "opponent")[0]?.metric.player ?? available[0];
}

// Justin won the flip — new scenarios start from draft-night reality (J-BONE picks first)
export function createScenario(name: string): MockDraftScenario {
  const now = new Date().toISOString();
  return {
    id: `scenario-${Date.now()}`,
    name,
    createdAt: now,
    updatedAt: now,
    picks: [],
    notes: "",
  };
}

function normalizeScenario(raw: MockDraftScenario & { iPickFirst?: boolean }): MockDraftScenario {
  const picks = (raw.picks ?? [])
    .slice(0, TOTAL_DRAFT_PICKS)
    .map((pick, index) => ({
      pickNumber: index + 1,
      playerId: pick.playerId,
      side: getPickOwner(index + 1),
    }));
  return {
    id: raw.id,
    name: raw.name,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    picks,
    notes: raw.notes ?? "",
  };
}

export function loadScenarios(): MockDraftScenario[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    const normalized = (JSON.parse(raw) as (MockDraftScenario & { iPickFirst?: boolean })[])
      .map(normalizeScenario);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
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

export function formatPickLabel(pickNumber: number): string {
  const owner = getPickOwner(pickNumber);
  return owner === "mine" ? `${MY_CAPTAIN.nickname} picks` : `${OPPONENT_CAPTAIN.nickname} picks`;
}

export { DRAFT_PICKS_PER_CAPTAIN, TEAM_SIZE, TOTAL_DRAFT_PICKS };

export const SCENARIO_TEMPLATES = [
  { name: "Justin takes Fred #1", preset: (s: MockDraftScenario) => presetJustinFirstPick(s, "fred-geisinger") },
  { name: "Justin takes Mager #1", preset: (s: MockDraftScenario) => presetJustinFirstPick(s, "andrew-mager") },
  { name: "Justin takes D'Arcy #1", preset: (s: MockDraftScenario) => presetJustinFirstPick(s, "ryan-darcy") },
  { name: "Draft night — official order", preset: (s: MockDraftScenario) => ({ ...s, picks: [] }) },
];

function presetJustinFirstPick(scenario: MockDraftScenario, playerId: string): MockDraftScenario {
  return {
    ...scenario,
    picks: [{ pickNumber: 1, playerId, side: "justin" }],
    name: scenario.name,
  };
}
