import { TEAM_SIZE } from "./players";
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
  id: "matt-wixted",
  name: "Matt Wixted",
  nickname: "WIX",
};

export const OPPONENT_CAPTAIN = {
  id: "justin-uribe",
  name: "Justin Uribe",
  nickname: "J-BONE",
};

const STORAGE_KEY = "strand-mock-draft-scenarios";

export function getSnakeOwner(pickNumber: number, iPickFirst: boolean): DraftSide {
  const round = Math.floor((pickNumber - 1) / 2);
  const snakeAFirst = round % 2 === 0;
  const first = iPickFirst ? "mine" : "justin";
  const second = iPickFirst ? "justin" : "mine";

  if (pickNumber % 2 === 1) {
    return snakeAFirst ? first : second;
  }
  return snakeAFirst ? second : first;
}

export function getNextPickNumber(picks: DraftPick[]): number {
  return picks.length + 1;
}

export function getCurrentOwner(picks: DraftPick[], iPickFirst: boolean): DraftSide | null {
  if (picks.length >= TEAM_SIZE * 2) return null;
  return getSnakeOwner(getNextPickNumber(picks), iPickFirst);
}

export function getPicksForSide(picks: DraftPick[], side: DraftSide): DraftPick[] {
  return picks.filter((pick) => pick.side === side);
}

export function getDraftedIds(picks: DraftPick[]): Set<string> {
  return new Set(picks.map((pick) => pick.playerId));
}

export function getAvailablePlayers(players: PlayerDraftStats[], picks: DraftPick[]): PlayerDraftStats[] {
  const drafted = getDraftedIds(picks);
  return players.filter((player) => !drafted.has(player.id));
}

export function suggestJustinPick(
  available: PlayerDraftStats[],
  myPicks: DraftPick[],
  playerMap: Map<string, PlayerDraftStats>,
  totalPicks: number,
): PlayerDraftStats | null {
  if (!available.length) return null;

  const myTeam = myPicks
    .map((pick) => playerMap.get(pick.playerId))
    .filter(Boolean) as PlayerDraftStats[];

  const myAvg = averageIndex(myTeam);
  const ranked = [...available].sort((a, b) => b.draftScore - a.draftScore);
  const earlyRound = totalPicks <= 6;

  const justinFavorites = ranked.filter(
    (player) =>
      player.tags.includes("competitor") ||
      player.tags.includes("low-handicap") ||
      player.tags.includes("champion") ||
      (player.indexNum !== null && player.indexNum <= 10),
  );

  if (earlyRound && justinFavorites.length) {
    return justinFavorites[0];
  }

  if (myAvg !== null && totalPicks >= 12) {
    const counter = available.find((player) => {
      const idx = player.indexNum ?? player.estimatedIndex ?? 20;
      return idx <= myAvg - 1;
    });
    if (counter) return counter;
  }

  return ranked[0] ?? null;
}

function averageIndex(team: PlayerDraftStats[]): number | null {
  const values = team
    .map((player) => player.indexNum ?? player.estimatedIndex)
    .filter((value): value is number => value !== undefined && value !== null);
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function createScenario(name: string, iPickFirst = true): MockDraftScenario {
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
  const owner = getSnakeOwner(pickNumber, iPickFirst);
  return owner === "mine" ? `${MY_CAPTAIN.nickname} picks` : `${OPPONENT_CAPTAIN.nickname} picks`;
}

export const SCENARIO_TEMPLATES = [
  { name: "Justin takes Fred #1", preset: (s: MockDraftScenario) => presetJustinFirstPick(s, "fred-geisinger") },
  { name: "Justin takes Kevin #1", preset: (s: MockDraftScenario) => presetJustinFirstPick(s, "kevin-gordon") },
  { name: "Justin takes D'Arcy #1", preset: (s: MockDraftScenario) => presetJustinFirstPick(s, "ryan-darcy") },
  { name: "I pick first — best case", preset: (s: MockDraftScenario) => ({ ...s, iPickFirst: true, picks: [] }) },
  { name: "Justin picks first — worst case", preset: (s: MockDraftScenario) => ({ ...s, iPickFirst: false, picks: [] }) },
];

function presetJustinFirstPick(scenario: MockDraftScenario, playerId: string): MockDraftScenario {
  return {
    ...scenario,
    iPickFirst: false,
    picks: [{ pickNumber: 1, playerId, side: "justin" }],
    name: scenario.name,
  };
}