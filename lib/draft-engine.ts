import {
  CAPTAIN_IDS,
  DRAFT_PICKS_PER_CAPTAIN,
  isCaptain,
  STRAND_PLAYERS,
  TEAM_SIZE,
  TOTAL_DRAFT_PICKS,
} from "./players";
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
  if (player.tags.includes("veteran")) bonus += 2;
  if (player.tags.includes("experience")) bonus += 1.5;
  if (player.tags.includes("net-leverage")) bonus += 2;
  return bonus;
}

/** Stroke allocation value in PGA singles / net match play */
function strokeLeverage(index: number): number {
  if (index <= 7) return 1.5;
  if (index <= 12) return 4;
  if (index <= 18) return 7;
  if (index <= 24) return 10;
  return 6;
}

const FORMAT_WEIGHTS = {
  fourball: 0.25,
  scramble: 0.2,
  singles: 0.35,
  shamble: 0.2,
} as const;

/** Cross-format match-play value — weights singles net leverage higher */
export function computeMatchPlayValue(player: PlayerDraftStats): number {
  const index = player.indexNum ?? player.estimatedIndex ?? 24;
  const grossSkill = Math.max(0, 40 - index);
  const netLeverage = strokeLeverage(index);

  let formBonus = 0;
  if (player.heat === "heating" && player.formDelta) {
    formBonus = Math.min(10, player.formDelta * 3.5);
  } else if (player.heat === "steady") {
    formBonus = 2;
  }

  const reliability = Math.min(5, player.attestNum / 12);
  const strategy = strategicBonus(player);

  const fourball = grossSkill * 1.1 + strategy;
  const scramble = grossSkill * 0.85 + strategy * 1.15 + reliability;
  const singles = grossSkill * 0.35 + netLeverage * 1.4 + formBonus + strategy;
  const shamble = grossSkill * 0.5 + netLeverage * 0.7 + strategy + reliability * 0.5;

  return (
    fourball * FORMAT_WEIGHTS.fourball +
    scramble * FORMAT_WEIGHTS.scramble +
    singles * FORMAT_WEIGHTS.singles +
    shamble * FORMAT_WEIGHTS.shamble
  );
}

function teamSynergyBonus(roster: PlayerDraftStats[]): number {
  const indexes = roster.map((p) => p.indexNum ?? 24).sort((a, b) => a - b);
  if (indexes.length < 2) return 0;

  const low = indexes.filter((i) => i <= 12).length;
  const mid = indexes.filter((i) => i > 12 && i <= 20).length;
  const high = indexes.filter((i) => i > 20).length;

  let bonus = 0;
  if (low >= 2 && low <= 4) bonus += 4;
  if (mid >= 3 && mid <= 5) bonus += 5;
  if (high >= 2 && high <= 4) bonus += 6;

  const spread = indexes[indexes.length - 1] - indexes[0];
  if (spread >= 14) bonus += 3;

  bonus += Math.min(4, roster.filter((p) => p.heat === "heating").length * 2);
  return bonus;
}

export function marginalTeamValue(roster: PlayerDraftStats[]): number {
  return roster.reduce((sum, player) => sum + computeMatchPlayValue(player), 0) + teamSynergyBonus(roster);
}

export function getDraftablePlayers(stats: PlayerDraftStats[]): PlayerDraftStats[] {
  return stats.filter((player) => !isCaptain(player.id));
}

export function getCaptainRoster(
  stats: PlayerDraftStats[],
  captainId: string,
  drafted: PlayerDraftStats[],
): PlayerDraftStats[] {
  const captain = stats.find((player) => player.id === captainId);
  if (!captain) return drafted;
  return [captain, ...drafted];
}

function getSnakeOwnerForPick(pickNumber: number, wixPicksFirst: boolean): "wix" | "justin" {
  const round = Math.floor((pickNumber - 1) / 2);
  const positionInRound = (pickNumber - 1) % 2;
  const wixFirstInRound = round % 2 === 0 ? wixPicksFirst : !wixPicksFirst;
  return positionInRound === 0
    ? wixFirstInRound
      ? "wix"
      : "justin"
    : wixFirstInRound
      ? "justin"
      : "wix";
}

function greedyBestPick(available: PlayerDraftStats[], roster: PlayerDraftStats[]): PlayerDraftStats {
  let best = available[0];
  let bestValue = -Infinity;
  for (const candidate of available) {
    const value = marginalTeamValue([...roster, candidate]);
    if (value > bestValue) {
      bestValue = value;
      best = candidate;
    }
  }
  return best;
}

function simulateRemainingDraft(
  startPick: number,
  wixPicksFirst: boolean,
  available: PlayerDraftStats[],
  wixRoster: PlayerDraftStats[],
  justinRoster: PlayerDraftStats[],
): { wix: PlayerDraftStats[]; justin: PlayerDraftStats[] } {
  let pool = [...available];
  const wix = [...wixRoster];
  const justin = [...justinRoster];

  for (let pick = startPick; pick <= TOTAL_DRAFT_PICKS; pick += 1) {
    if (!pool.length) break;
    const owner = getSnakeOwnerForPick(pick, wixPicksFirst);
    if (owner === "wix") {
      const choice = greedyBestPick(pool, wix);
      wix.push(choice);
      pool = pool.filter((player) => player.id !== choice.id);
    } else {
      const choice = greedyBestPick(pool, justin);
      justin.push(choice);
      pool = pool.filter((player) => player.id !== choice.id);
    }
  }

  return { wix, justin };
}

export interface SimulatedDraftResult {
  wixPicks: PlayerDraftStats[];
  justinPicks: PlayerDraftStats[];
  wixRoster: PlayerDraftStats[];
  justinRoster: PlayerDraftStats[];
}

/** Optimal snake draft with match-play roster analytics; captains pre-assigned */
export function simulateOptimalSnakeDraft(
  stats: PlayerDraftStats[],
  wixPicksFirst = true,
): SimulatedDraftResult {
  const draftable = getDraftablePlayers(stats);
  const wixCaptain = stats.find((player) => player.id === CAPTAIN_IDS[0])!;
  const justinCaptain = stats.find((player) => player.id === CAPTAIN_IDS[1])!;

  let available = [...draftable];
  let wixRoster: PlayerDraftStats[] = [wixCaptain];
  let justinRoster: PlayerDraftStats[] = [justinCaptain];
  const wixPicks: PlayerDraftStats[] = [];
  const justinPicks: PlayerDraftStats[] = [];

  for (let pick = 1; pick <= TOTAL_DRAFT_PICKS; pick += 1) {
    const owner = getSnakeOwnerForPick(pick, wixPicksFirst);
    if (!available.length) break;

    if (owner === "wix") {
      let bestPlayer = available[0];
      let bestScore = -Infinity;

      for (const candidate of available) {
        const simAvailable = available.filter((player) => player.id !== candidate.id);
        const sim = simulateRemainingDraft(
          pick + 1,
          wixPicksFirst,
          simAvailable,
          [...wixRoster, candidate],
          justinRoster,
        );
        const score = marginalTeamValue(sim.wix);
        if (score > bestScore) {
          bestScore = score;
          bestPlayer = candidate;
        }
      }

      wixRoster.push(bestPlayer);
      wixPicks.push(bestPlayer);
      available = available.filter((player) => player.id !== bestPlayer.id);
    } else {
      const choice = greedyBestPick(available, justinRoster);
      justinRoster.push(choice);
      justinPicks.push(choice);
      available = available.filter((player) => player.id !== choice.id);
    }
  }

  return { wixPicks, justinPicks, wixRoster, justinRoster };
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
    const label = player.dataSource === "ghin" || player.dataSource === "manual" ? "verified index" : "index";
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
  if (player.tags.includes("veteran")) parts.push("Strand veteran");
  if (player.tags.includes("net-leverage")) parts.push("high net leverage");

  return parts.join(" • ");
}

export function buildPlayerStats(
  player: StrandPlayer,
  handicap: GrintHandicap | null,
  grintMeta?: {
    location?: string;
    username?: string;
    dataSource?: PlayerDraftStats["dataSource"];
    grintProfileUrl?: string | null;
    ghinNumber?: string | null;
  },
): PlayerDraftStats {
  const indexNum = player.manualIndex ?? (
    handicap
      ? parseHandicapNumber(handicap.index) ?? parseHandicapNumber(handicap.lowest)
      : player.estimatedIndex ?? null
  );
  const lowestNum = handicap
    ? parseHandicapNumber(handicap.lowest)
    : player.manualLowest ?? null;
  const attestNum = handicap ? parseFloat(handicap.attest || "0") : 0;
  const { heat, heatLabel, formDelta } = getHeat(indexNum, lowestNum, attestNum);
  const draftScore = computeMatchPlayValue({
    ...player,
    handicap,
    indexNum: indexNum ?? player.estimatedIndex ?? null,
    lowestNum,
    attestNum,
    heat,
    heatLabel,
    draftScore: 0,
    draftRank: 0,
    formDelta,
    dataSource: "live",
  } as PlayerDraftStats);

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
        ? player.ghinClub
          ? "ghin"
          : "manual"
        : handicap
          ? "live"
          : player.estimatedIndex
            ? "estimated"
            : "missing"),
    grintLocation: grintMeta?.location,
    grintUsernameResolved: grintMeta?.username,
    grintProfileUrl: grintMeta?.grintProfileUrl ?? null,
    ghinNumberResolved: grintMeta?.ghinNumber ?? player.ghinNumber ?? null,
  };
}

export function rankPlayers(stats: PlayerDraftStats[]): PlayerDraftStats[] {
  const ranked = [...stats].sort((a, b) => b.draftScore - a.draftScore);
  return ranked.map((player, index) => ({ ...player, draftRank: index + 1 }));
}

export function getOptimalDraftOrder(stats: PlayerDraftStats[]): DraftRecommendation[] {
  const ranked = rankPlayers(getDraftablePlayers(stats));
  return ranked.map((player, index) => ({
    pick: index + 1,
    playerId: player.id,
    rationale: buildRationale(player),
  }));
}

export function getTeamSnakePickSlots(teamName: "A" | "B", rounds = DRAFT_PICKS_PER_CAPTAIN): number[] {
  const slots: number[] = [];
  for (let round = 0; round < rounds; round += 1) {
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
  const simulation = simulateOptimalSnakeDraft(stats, teamName === "A");
  const picks = teamName === "A" ? simulation.wixPicks : simulation.justinPicks;
  const captain = stats.find((player) =>
    player.id === (teamName === "A" ? CAPTAIN_IDS[0] : CAPTAIN_IDS[1]),
  )!;
  const rationaleMap = new Map(recommendations.map((rec) => [rec.playerId, rec.rationale]));
  const pickSlots = getTeamSnakePickSlots(teamName);

  const captainPick: OptimalTeamPick = {
    snakePick: 0,
    player: captain,
    rationale: "Captain — pre-assigned to your team",
  };

  const drafted = picks.map((player, index) => ({
    snakePick: pickSlots[index] ?? index + 1,
    player,
    rationale: rationaleMap.get(player.id) ?? buildRationale(player),
  }));

  return [captainPick, ...drafted];
}

export function getOptimalTeam(stats: PlayerDraftStats[], teamName: "A" | "B" = "A"): PlayerDraftStats[] {
  const simulation = simulateOptimalSnakeDraft(stats, teamName === "A");
  return teamName === "A" ? simulation.wixRoster : simulation.justinRoster;
}

export function summarizeTeam(team: PlayerDraftStats[]) {
  const indexes = team.map((p) => p.indexNum ?? p.estimatedIndex).filter((v): v is number => v !== null && v !== undefined);
  const avgIndex = indexes.length
    ? indexes.reduce((sum, value) => sum + value, 0) / indexes.length
    : null;
  const heating = team.filter((p) => p.heat === "heating").length;
  const matchValue = marginalTeamValue(team);
  return { avgIndex, heating, size: team.length, matchValue };
}

export function getAllPlayerIds(): string[] {
  return STRAND_PLAYERS.map((player) => player.id);
}