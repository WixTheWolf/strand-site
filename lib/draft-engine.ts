import {
  CAPTAIN_IDS,
  DRAFT_PICKS_PER_CAPTAIN,
  isCaptain,
  STRAND_PLAYERS,
  TEAM_SIZE,
  TOTAL_DRAFT_PICKS,
} from "./players";
import { parseHandicapNumber } from "./grint";
import { buildPlayerRecords } from "./history";
import {
  playingIndex,
  scrambleTeamHandicap,
} from "./tournament";
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

/** Career Strand records from the archive, keyed by player id */
const STRAND_RECORDS = new Map(
  buildPlayerRecords(STRAND_PLAYERS).map((rec) => [rec.playerId, rec]),
);

/**
 * Measured pedigree from the archive replaces the old champion/veteran/experience
 * vibe tags: each title is worth 1.5, each trip 0.5, capped so record can't
 * outweigh handicap.
 */
function pedigreeBonus(playerId: string): number {
  const rec = STRAND_RECORDS.get(playerId);
  if (!rec) return 0;
  return Math.min(8, rec.wins * 1.5 + rec.appearances * 0.5);
}

function strategicBonus(player: StrandPlayer): number {
  let bonus = pedigreeBonus(player.id);
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
  if (player.tags.includes("net-leverage")) bonus += 2;
  return bonus;
}

/** Stroke allocation value in PGA singles / net match play */
function strokeLeverage(index: number): number {
  if (index <= 7) return 3;
  if (index <= 12) return 5;
  if (index <= 18) return 8;
  if (index <= 24) return 10;
  return 6;
}

const FORMAT_WEIGHTS = {
  fourball: 0.25,
  scramble: 0.2,
  singles: 0.35,
  shamble: 0.2,
} as const;

export interface FormatValues {
  fourball: number;
  scramble: number;
  singles: number;
  shamble: number;
}

/** Per-format match-play value breakdown for one player */
export function computeFormatValues(player: PlayerDraftStats): FormatValues {
  // Gross skill reflects the real index; strokes received are capped at the
  // Strand ceiling, and every stroke forfeited to the cap is a net penalty
  // weighted by how much net scoring matters in each format.
  const rawIndex = player.indexNum ?? player.estimatedIndex ?? 24;
  const index = playingIndex(rawIndex);
  const forfeit = rawIndex - index;
  const grossSkill = Math.max(0, 40 - rawIndex);
  const netLeverage = strokeLeverage(index);

  let formBonus = 0;
  if (player.heat === "heating" && player.formDelta) {
    formBonus = Math.min(10, player.formDelta * 3.5);
  } else if (player.heat === "steady") {
    formBonus = 2;
  }

  const reliability = Math.min(5, player.attestNum / 12);
  const strategy = strategicBonus(player);

  return {
    fourball: grossSkill * 1.2 + strategy + (index <= 9 ? (9 - index) * 0.8 : 0) - forfeit * 0.5,
    // Scramble team HC only counts the high index at 15%
    scramble: grossSkill * 0.85 + strategy * 1.15 + reliability - forfeit * 0.15,
    // Singles: full course handicap difference between opponents (stroke leverage matters)
    singles: grossSkill * 0.45 + netLeverage * 1.25 + formBonus + strategy - forfeit * 1.25,
    // Shamble uses same 35% low + 15% high team weighting as scramble
    shamble: grossSkill * 0.55 + netLeverage * 0.7 + strategy + reliability * 0.5 - forfeit * 0.7,
  };
}

/** Cross-format match-play value — weights singles net leverage higher */
export function computeMatchPlayValue(player: PlayerDraftStats): number {
  const index = player.indexNum ?? player.estimatedIndex ?? 24;
  const formats = computeFormatValues(player);
  const eliteAnchor = index <= 8 ? 6 + (8 - index) * 0.5 : 0;

  return (
    formats.fourball * FORMAT_WEIGHTS.fourball +
    formats.scramble * FORMAT_WEIGHTS.scramble +
    formats.singles * FORMAT_WEIGHTS.singles +
    formats.shamble * FORMAT_WEIGHTS.shamble +
    eliteAnchor
  );
}

/** Sum of per-format values across a roster */
export function summarizeTeamFormats(team: PlayerDraftStats[]): FormatValues {
  return team.reduce<FormatValues>(
    (acc, player) => {
      const v = computeFormatValues(player);
      return {
        fourball: acc.fourball + v.fourball,
        scramble: acc.scramble + v.scramble,
        singles: acc.singles + v.singles,
        shamble: acc.shamble + v.shamble,
      };
    },
    { fourball: 0, scramble: 0, singles: 0, shamble: 0 },
  );
}

/**
 * Logistic model estimate of match-week win probability from total
 * roster value difference (synergy included). Scale tuned so a full
 * first-round-pick edge (~12 pts) reads as roughly a 62/38 split.
 */
export function winProbability(myValue: number, oppValue: number): number {
  return 1 / (1 + Math.exp(-(myValue - oppValue) / 24));
}

function scramblePairBonus(indexA: number, indexB: number): number {
  const low = Math.min(indexA, indexB);
  const high = Math.max(indexA, indexB);
  const teamHc = scrambleTeamHandicap(low, high);
  // Lower team HC is stronger; reward pairings with useful spread (35% low + 15% high)
  const spread = high - low;
  const spreadBonus = spread >= 8 && spread <= 22 ? 3 : spread >= 5 ? 1.5 : 0;
  return Math.max(0, 28 - teamHc) * 0.4 + spreadBonus;
}

function teamSynergyBonus(roster: PlayerDraftStats[]): number {
  const indexes = roster.map((p) => playingIndex(p.indexNum ?? 24)).sort((a, b) => a - b);
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

  // Scramble / shamble: best pairs are low + high (35% / 15% team HC)
  let scramblePairScore = 0;
  const lows = indexes.filter((i) => i <= 14);
  const highs = indexes.filter((i) => i > 14);
  for (const lowIdx of lows.slice(0, 4)) {
    for (const highIdx of highs.slice(0, 4)) {
      scramblePairScore += scramblePairBonus(lowIdx, highIdx);
    }
  }
  bonus += Math.min(12, scramblePairScore / Math.max(1, Math.min(lows.length, highs.length)));

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

/** Traditional (linear) order — the same captain leads off every round */
function getOwnerForPick(pickNumber: number, wixPicksFirst: boolean): "wix" | "justin" {
  const wixOnOdd = wixPicksFirst;
  return pickNumber % 2 === 1 ? (wixOnOdd ? "wix" : "justin") : wixOnOdd ? "justin" : "wix";
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
    const owner = getOwnerForPick(pick, wixPicksFirst);
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

/** Greedy completion of an in-progress draft — projects both final rosters from the current board */
export function projectRemainingDraft(
  nextPick: number,
  wixPicksFirst: boolean,
  available: PlayerDraftStats[],
  wixRoster: PlayerDraftStats[],
  justinRoster: PlayerDraftStats[],
): { wix: PlayerDraftStats[]; justin: PlayerDraftStats[] } {
  return simulateRemainingDraft(nextPick, wixPicksFirst, available, wixRoster, justinRoster);
}

export interface SimulatedDraftResult {
  wixPicks: PlayerDraftStats[];
  justinPicks: PlayerDraftStats[];
  wixRoster: PlayerDraftStats[];
  justinRoster: PlayerDraftStats[];
}

/** Optimal traditional draft with match-play roster analytics; captains pre-assigned */
export function simulateOptimalDraft(
  stats: PlayerDraftStats[],
  wixPicksFirst = true,
): SimulatedDraftResult {
  const draftable = getDraftablePlayers(stats);
  const wixCaptain = stats.find((player) => player.id === CAPTAIN_IDS[0])!;
  const justinCaptain = stats.find((player) => player.id === CAPTAIN_IDS[1])!;

  let available = [...draftable];
  const wixRoster: PlayerDraftStats[] = [wixCaptain];
  const justinRoster: PlayerDraftStats[] = [justinCaptain];
  const wixPicks: PlayerDraftStats[] = [];
  const justinPicks: PlayerDraftStats[] = [];

  for (let pick = 1; pick <= TOTAL_DRAFT_PICKS; pick += 1) {
    const owner = getOwnerForPick(pick, wixPicksFirst);
    if (!available.length) break;

    if (owner === "wix") {
      let bestPlayer = available[0];
      // Pick 1: take the top available anchor before opponent can — then lookahead for balance
      if (pick === 1 && wixPicksFirst) {
        bestPlayer = [...available].sort(
          (a, b) => computeMatchPlayValue(b) - computeMatchPlayValue(a),
        )[0];
      } else {
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
          const score =
            marginalTeamValue(sim.wix) - marginalTeamValue(sim.justin) * 0.4;
          if (score > bestScore) {
            bestScore = score;
            bestPlayer = candidate;
          }
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
  // Real index for skill; strokes forfeited to the 25 ceiling come off the top
  const effectiveIndex = indexNum ?? player.estimatedIndex ?? 24;
  const handicapScore = Math.max(0, 36 - effectiveIndex) - (effectiveIndex - playingIndex(effectiveIndex));

  let formScore = 0;
  if (heat === "heating" && formDelta) formScore = Math.min(8, formDelta * 3);
  if (heat === "cooling") formScore = -2;

  const attestScore = Math.min(6, attestNum / 15);
  const strategyScore = strategicBonus(player);

  return handicapScore + formScore + attestScore + strategyScore;
}

export function buildRationale(player: PlayerDraftStats): string {
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

  const rec = player.strandRecord;
  if (rec && rec.wins >= 2) parts.push(`${rec.wins}× Strand champ (${rec.wins}–${rec.losses})`);
  else if (rec && rec.wins === 1) parts.push(`Strand champ (${rec.wins}–${rec.losses})`);
  else if (rec && rec.appearances > 0) parts.push(`still hunting a title (0–${rec.losses})`);
  else parts.push("Strand rookie");
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
    ghinIndex?: string | null;
    ghinLowIndex?: string | null;
    ghinLowIndexDate?: string | null;
    ghinRevisionDate?: string | null;
    ghinSoftCap?: boolean | null;
    ghinHardCap?: boolean | null;
    ghinStatus?: string | null;
  },
): PlayerDraftStats {
  // GHIN is the official source per Strand rules. Priority:
  // live GHIN index → hand-verified GHIN value (manualIndex) → TheGrint index
  // (verified against GHIN favorites, it mirrors GHIN far better than the
  // federation band) → federation band → estimated.
  const ghinLiveIndex = parseHandicapNumber(grintMeta?.ghinIndex);
  const grintIndex = handicap
    ? parseHandicapNumber(handicap.index) ??
      parseHandicapNumber(handicap.index_federation) ??
      parseHandicapNumber(handicap.lowest)
    : null;
  const liveIndex = ghinLiveIndex ?? grintIndex;
  const indexNum =
    ghinLiveIndex ?? player.manualIndex ?? grintIndex ?? player.estimatedIndex ?? null;
  const ghinLowIndex = parseHandicapNumber(grintMeta?.ghinLowIndex);
  const lowestNum =
    ghinLowIndex ?? (handicap ? parseHandicapNumber(handicap.lowest) : null) ?? player.manualLowest ?? null;
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

  const record = STRAND_RECORDS.get(player.id);

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
    strandRecord: record
      ? {
          wins: record.wins,
          losses: record.losses,
          appearances: record.appearances,
          winPct: record.winPct,
        }
      : undefined,
    dataSource: ghinLiveIndex !== null
      ? "ghin"
      : player.manualIndex !== undefined
        ? player.ghinClub
          ? "ghin"
          : "manual"
        : liveIndex !== null
          ? "live"
          : grintMeta?.dataSource
            ?? (player.estimatedIndex ? "estimated" : "missing"),
    grintLocation: grintMeta?.location,
    grintUsernameResolved: grintMeta?.username,
    grintProfileUrl: grintMeta?.grintProfileUrl ?? null,
    ghinNumberResolved: grintMeta?.ghinNumber ?? player.ghinNumber ?? null,
    ghinLowIndex,
    ghinLowIndexDate: grintMeta?.ghinLowIndexDate ?? null,
    ghinRevisionDate: grintMeta?.ghinRevisionDate ?? null,
    ghinSoftCap: grintMeta?.ghinSoftCap ?? null,
    ghinHardCap: grintMeta?.ghinHardCap ?? null,
    ghinStatus: grintMeta?.ghinStatus ?? null,
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

/** Traditional order: whoever picks first owns every odd overall pick, the other side every even one */
export function getTeamPickSlots(
  teamName: "A" | "B",
  rounds = DRAFT_PICKS_PER_CAPTAIN,
  wixPicksFirst = true,
): number[] {
  const onOdd = teamName === "A" ? wixPicksFirst : !wixPicksFirst;
  return Array.from({ length: rounds }, (_, round) => round * 2 + (onOdd ? 1 : 2));
}

export interface OptimalTeamPick {
  overallPick: number;
  player: PlayerDraftStats;
  rationale: string;
}

export function getOptimalTeamWithPicks(
  stats: PlayerDraftStats[],
  recommendations: DraftRecommendation[],
  teamName: "A" | "B" = "A",
  simulation?: SimulatedDraftResult,
  wixPicksFirst = true,
): OptimalTeamPick[] {
  const sim = simulation ?? simulateOptimalDraft(stats, wixPicksFirst);
  const picks = teamName === "A" ? sim.wixPicks : sim.justinPicks;
  const captain = stats.find((player) =>
    player.id === (teamName === "A" ? CAPTAIN_IDS[0] : CAPTAIN_IDS[1]),
  )!;
  const rationaleMap = new Map(recommendations.map((rec) => [rec.playerId, rec.rationale]));
  const pickSlots = getTeamPickSlots(teamName, DRAFT_PICKS_PER_CAPTAIN, wixPicksFirst);

  const captainPick: OptimalTeamPick = {
    overallPick: 0,
    player: captain,
    rationale: "Captain — pre-assigned to your team",
  };

  const drafted = picks.map((player, index) => ({
    overallPick: pickSlots[index] ?? index + 1,
    player,
    rationale: rationaleMap.get(player.id) ?? buildRationale(player),
  }));

  return [captainPick, ...drafted];
}

export function getOptimalTeam(
  stats: PlayerDraftStats[],
  teamName: "A" | "B" = "A",
  simulation?: SimulatedDraftResult,
): PlayerDraftStats[] {
  const sim = simulation ?? simulateOptimalDraft(stats, teamName === "A");
  return teamName === "A" ? sim.wixRoster : sim.justinRoster;
}

export function summarizeTeam(team: PlayerDraftStats[]) {
  const indexes = team
    .map((p) => p.indexNum ?? p.estimatedIndex)
    .filter((v): v is number => v !== null && v !== undefined)
    .map(playingIndex);
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
