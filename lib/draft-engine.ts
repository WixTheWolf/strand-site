import { STRAND_PLAYERS, TEAM_SIZE } from "./players";
import { parseHandicapNumber } from "./grint";
import type {
  DraftRecommendation,
  GrintHandicap,
  HeatStatus,
  PlayerDraftStats,
  StrandPlayer,
} from "./types";

function getHeat(indexNum: number | null, lowestNum: number | null, attestNum: number): {
  heat: HeatStatus;
  heatLabel: string;
  formDelta: number | null;
} {
  if (indexNum === null) {
    return { heat: "unknown", heatLabel: "No GHIN data", formDelta: null };
  }

  if (lowestNum !== null) {
    const delta = indexNum - lowestNum;
    if (delta >= 1.5) {
      return {
        heat: "heating",
        heatLabel: `Playing ${delta.toFixed(1)} below index`,
        formDelta: delta,
      };
    }
    if (delta <= -1) {
      return {
        heat: "cooling",
        heatLabel: "Index below recent low",
        formDelta: delta,
      };
    }
  }

  if (attestNum >= 60) {
    return { heat: "steady", heatLabel: "Reliable posted scores", formDelta: 0 };
  }

  if (attestNum < 15) {
    return { heat: "unknown", heatLabel: "Limited recent attested rounds", formDelta: null };
  }

  return { heat: "steady", heatLabel: "Steady form", formDelta: 0 };
}

function strategicBonus(player: StrandPlayer): number {
  let bonus = 0;
  if (player.tags.includes("champion")) bonus += 4;
  if (player.tags.includes("captain")) bonus += 3;
  if (player.tags.includes("low-handicap")) bonus += 3;
  if (player.tags.includes("competitor")) bonus += 2.5;
  if (player.tags.includes("match-play")) bonus += 2;
  if (player.tags.includes("clutch")) bonus += 2;
  if (player.tags.includes("improving")) bonus += 1.5;
  if (player.tags.includes("shotmaker")) bonus += 1;
  const projectedIndex = player.manualIndex ?? player.estimatedIndex;
  if (player.tags.includes("rookie") && projectedIndex && projectedIndex < 12) {
    bonus += 2;
  }
  if (player.tags.includes("replacement")) bonus -= 1;
  return bonus;
}

function computeDraftScore(
  player: StrandPlayer,
  indexNum: number | null,
  lowestNum: number | null,
  attestNum: number,
  heat: HeatStatus,
  formDelta: number | null,
): number {
  const effectiveIndex = indexNum ?? player.estimatedIndex ?? 24;
  const handicapScore = Math.max(0, 36 - effectiveIndex);

  let formScore = 0;
  if (heat === "heating" && formDelta) formScore = Math.min(8, formDelta * 3);
  if (heat === "cooling") formScore = -2;

  const attestScore = Math.min(6, attestNum / 15);
  const strategyScore = strategicBonus(player);

  return handicapScore + formScore + attestScore + strategyScore;
}

function buildRationale(player: PlayerDraftStats): string {
  const parts: string[] = [];

  if (player.indexNum !== null) {
    const label = player.dataSource === "manual" ? "verified index" : "index";
    parts.push(`${player.indexNum.toFixed(1)} ${label}`);
  } else if (player.estimatedIndex) {
    parts.push(`~${player.estimatedIndex} estimated index`);
  }

  if (player.heat === "heating" && player.formDelta) {
    parts.push(`heating up (${player.formDelta.toFixed(1)} below low)`);
  } else if (player.heatLabel) {
    parts.push(player.heatLabel.toLowerCase());
  }

  if (player.tags.includes("champion")) parts.push("Strand winner");
  if (player.tags.includes("captain")) parts.push("proven captain");
  if (player.tags.includes("competitor")) parts.push("elite competitor");
  if (player.tags.includes("rookie")) parts.push("rookie upside");

  return parts.join(" • ");
}

export function buildPlayerStats(
  player: StrandPlayer,
  handicap: GrintHandicap | null,
  grintMeta?: { location?: string; username?: string; dataSource?: PlayerDraftStats["dataSource"] },
): PlayerDraftStats {
  const indexNum = player.manualIndex ?? (
    handicap
      ? parseHandicapNumber(handicap.index) ?? parseHandicapNumber(handicap.lowest)
      : player.estimatedIndex ?? null
  );
  const lowestNum = handicap ? parseHandicapNumber(handicap.lowest) : null;
  const attestNum = handicap ? parseFloat(handicap.attest || "0") : 0;
  const { heat, heatLabel, formDelta } = getHeat(indexNum, lowestNum, attestNum);
  const draftScore = computeDraftScore(player, indexNum, lowestNum, attestNum, heat, formDelta);

  return {
    ...player,
    handicap,
    indexNum,
    lowestNum,
    attestNum,
    heat,
    heatLabel,
    draftScore,
    draftRank: 0,
    formDelta,
    dataSource: grintMeta?.dataSource
      ?? (player.manualIndex !== undefined
        ? "manual"
        : handicap
          ? "live"
          : player.estimatedIndex
            ? "estimated"
            : "missing"),
    grintLocation: grintMeta?.location,
    grintUsernameResolved: grintMeta?.username,
  };
}

export function rankPlayers(stats: PlayerDraftStats[]): PlayerDraftStats[] {
  const ranked = [...stats].sort((a, b) => b.draftScore - a.draftScore);
  return ranked.map((player, index) => ({ ...player, draftRank: index + 1 }));
}

export function getOptimalDraftOrder(stats: PlayerDraftStats[]): DraftRecommendation[] {
  const ranked = rankPlayers(stats);
  return ranked.map((player, index) => ({
    pick: index + 1,
    playerId: player.id,
    rationale: buildRationale(player),
  }));
}

export function getTeamSnakePickSlots(teamName: "A" | "B"): number[] {
  const slots: number[] = [];
  for (let round = 0; round < TEAM_SIZE; round += 1) {
    const aFirst = round % 2 === 0;
    const overallPick = aFirst
      ? teamName === "A"
        ? round * 2 + 1
        : round * 2 + 2
      : teamName === "A"
        ? round * 2 + 2
        : round * 2 + 1;
    slots.push(overallPick);
  }
  return slots;
}

export interface OptimalTeamPick {
  snakePick: number;
  player: PlayerDraftStats;
  rationale: string;
}

export function getOptimalTeamWithPicks(
  stats: PlayerDraftStats[],
  recommendations: DraftRecommendation[],
  teamName: "A" | "B" = "A",
): OptimalTeamPick[] {
  const team = getOptimalTeam(stats, teamName);
  const rationaleMap = new Map(recommendations.map((rec) => [rec.playerId, rec.rationale]));
  const pickSlots = getTeamSnakePickSlots(teamName);

  return team.map((player, index) => ({
    snakePick: pickSlots[index] ?? index + 1,
    player,
    rationale: rationaleMap.get(player.id) ?? buildRationale(player),
  }));
}

export function getOptimalTeam(stats: PlayerDraftStats[], teamName: "A" | "B" = "A"): PlayerDraftStats[] {
  const ranked = rankPlayers(stats);
  const picks: PlayerDraftStats[] = [];

  for (let round = 0; round < TEAM_SIZE; round += 1) {
    const snakeAFirst = round % 2 === 0;
    const pickIndex = teamName === "A"
      ? snakeAFirst
        ? round * 2
        : round * 2 + 1
      : snakeAFirst
        ? round * 2 + 1
        : round * 2;

    if (ranked[pickIndex]) picks.push(ranked[pickIndex]);
  }

  return picks;
}

export function summarizeTeam(team: PlayerDraftStats[]) {
  const indexes = team.map((p) => p.indexNum ?? p.estimatedIndex).filter((v): v is number => v !== null && v !== undefined);
  const avgIndex = indexes.length
    ? indexes.reduce((sum, value) => sum + value, 0) / indexes.length
    : null;
  const heating = team.filter((p) => p.heat === "heating").length;
  return { avgIndex, heating, size: team.length };
}

export function getAllPlayerIds(): string[] {
  return STRAND_PLAYERS.map((player) => player.id);
}