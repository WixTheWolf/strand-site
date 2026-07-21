import { CAPTAIN_IDS, isCaptain, TOTAL_DRAFT_PICKS } from "./players";
import { playingIndex } from "./tournament";
import type { PlayerDraftStats, RecentRound } from "./types";

export type StrandFormat = "foursomes" | "shamble" | "singles" | "scramble";
export type DraftSide = "mine" | "opponent";

export const FORMAT_META: Record<
  StrandFormat,
  { label: string; round: string; course: string; weight: number }
> = {
  foursomes: { label: "Foursomes", round: "R1", course: "Gamble Sands", weight: 0.2 },
  shamble: { label: "Shamble", round: "R2", course: "Scarecrow", weight: 0.2 },
  singles: { label: "Singles", round: "R3", course: "Scarecrow", weight: 0.4 },
  scramble: { label: "2-Man Scramble", round: "R4", course: "Gamble Sands", weight: 0.2 },
};

export const FORMATS = Object.keys(FORMAT_META) as StrandFormat[];
export const SIMULATION_RUNS = 5_000;

export interface PlayerSaberMetrics {
  player: PlayerDraftStats;
  index: number;
  projectedDifferential: number;
  netEdge: number;
  rawNetEdge: number;
  recentMean: number | null;
  recentPotential: number | null;
  volatility: number;
  consistency: number;
  ceiling: number;
  skill: number;
  confidence: number;
  confidenceLabel: "High" | "Medium" | "Low";
  gambleFit: number;
  scarecrowFit: number;
  endurance: number;
  pedigree: number;
  format: Record<StrandFormat, number>;
  tournamentScore: number;
  strandValueAdded: number;
  draftGrade: number;
  sampleSize: number;
  fullRoundSampleSize: number;
  evidence: string[];
}

export interface PairProjection {
  a: PlayerSaberMetrics;
  b: PlayerSaberMetrics;
  format: Exclude<StrandFormat, "singles">;
  score: number;
  lift: number;
  note: string;
}

export interface MatchProjection {
  mine: PlayerSaberMetrics[];
  opponent: PlayerSaberMetrics[];
  mineScore: number;
  opponentScore: number;
  edge: number;
}

export interface FormatProjection {
  format: StrandFormat;
  mineExpected: number;
  opponentExpected: number;
  availablePoints: number;
  matchups: MatchProjection[];
}

export interface TournamentProjection {
  formats: FormatProjection[];
  mineExpected: number;
  opponentExpected: number;
  availablePoints: number;
  analyticWinProbability: number;
}

export interface TournamentSimulation extends TournamentProjection {
  winProbability: number;
  tieProbability: number;
  lossProbability: number;
  simulations: number;
  mineP10: number;
  mineP90: number;
}

export interface DraftAssignment {
  playerId: string;
  side: DraftSide;
}

export interface DraftProjection {
  mine: PlayerDraftStats[];
  opponent: PlayerDraftStats[];
  remaining: PlayerDraftStats[];
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const average = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

function standardDeviation(values: number[]): number {
  if (values.length < 2) return 6;
  const mean = average(values);
  return Math.sqrt(average(values.map((value) => (value - mean) ** 2)));
}

function weightedRecentMean(values: number[]): number | null {
  if (!values.length) return null;
  let weighted = 0;
  let weights = 0;
  values.forEach((value, index) => {
    const weight = 0.82 ** index;
    weighted += value * weight;
    weights += weight;
  });
  return weighted / weights;
}

function usableDifferentials(rounds: RecentRound[] | undefined): {
  all: number[];
  full: number[];
} {
  const withDiff = (rounds ?? []).filter(
    (round): round is RecentRound & { differential: number } =>
      typeof round.differential === "number" && Number.isFinite(round.differential),
  );
  return {
    all: withDiff.map((round) => round.differential),
    full: withDiff.filter((round) => !round.nineHole).map((round) => round.differential),
  };
}

function sourceConfidence(player: PlayerDraftStats): number {
  switch (player.dataSource) {
    case "ghin":
      return 45;
    case "live":
      return 42;
    case "manual":
      return 34;
    case "estimated":
      return 20;
    default:
      return 10;
  }
}

function confidenceLabel(confidence: number): PlayerSaberMetrics["confidenceLabel"] {
  if (confidence >= 75) return "High";
  if (confidence >= 50) return "Medium";
  return "Low";
}

function smoothedPedigree(player: PlayerDraftStats): number {
  const record = player.strandRecord;
  if (!record || !record.appearances) return 50;
  // Two neutral pseudo-seasons prevent a tiny team-level sample from dominating.
  return ((record.wins + 1) / (record.appearances + 2)) * 100;
}

function preliminaryMetrics(player: PlayerDraftStats): PlayerSaberMetrics {
  const rawIndex = player.indexNum ?? player.estimatedIndex ?? 22;
  const index = playingIndex(rawIndex);
  const diffs = usableDifferentials(player.recentRounds);
  const primaryDiffs = diffs.full.length ? diffs.full : diffs.all;
  const recentMean = weightedRecentMean(primaryDiffs);
  const potentialCount = primaryDiffs.length
    ? Math.max(1, Math.ceil(primaryDiffs.length * 0.4))
    : 0;
  const recentPotential = potentialCount
    ? average([...primaryDiffs].sort((a, b) => a - b).slice(0, potentialCount))
    : null;
  const rawNetEdge = recentPotential === null ? 0 : index - recentPotential;
  const record = player.strandRecord;
  const confidence = clamp(
    sourceConfidence(player) +
      Math.min(34, primaryDiffs.length * 6.8) +
      (diffs.full.length >= 4 ? 8 : diffs.full.length * 2) +
      Math.min(8, (record?.appearances ?? 0) * 1.5),
    12,
    95,
  );
  const sampleShrinkage = primaryDiffs.length / (primaryDiffs.length + 5);
  const netEdge = rawNetEdge * sampleShrinkage * (confidence / 100);
  const volatility = standardDeviation(primaryDiffs);
  const consistency = clamp(96 - volatility * 8.2, 22, 94);
  const bestDiff = primaryDiffs.length ? Math.min(...primaryDiffs) : index;
  const ceiling = clamp(50 + (index - bestDiff) * 6.2, 24, 96);
  const skill = clamp(100 - rawIndex * 3.05, 18, 98);
  const netForm = clamp(50 + netEdge * 13, 15, 92);
  const pedigree = smoothedPedigree(player);
  const projectedDifferential = index - netEdge;

  // Course fits are evidence-based proxies until shot-level history exists.
  // Gamble rewards ceiling on its wide, firm corridors; Scarecrow gets more
  // consistency/endurance weight because it hosts singles on the second 36-hole day.
  const endurance = clamp(consistency * 0.55 + confidence * 0.25 + skill * 0.2, 20, 95);
  const gambleFit = clamp(
    skill * 0.34 + ceiling * 0.3 + consistency * 0.22 + confidence * 0.14,
    15,
    96,
  );
  const scarecrowFit = clamp(
    consistency * 0.31 + netForm * 0.28 + endurance * 0.2 + skill * 0.12 + confidence * 0.09,
    15,
    96,
  );

  const format: Record<StrandFormat, number> = {
    foursomes: clamp(
      skill * 0.32 + consistency * 0.3 + gambleFit * 0.18 + confidence * 0.12 + pedigree * 0.08,
      10,
      98,
    ),
    shamble: clamp(
      netForm * 0.24 + consistency * 0.19 + ceiling * 0.18 + scarecrowFit * 0.17 + skill * 0.12 + confidence * 0.1,
      10,
      98,
    ),
    singles: clamp(
      netForm * 0.37 + consistency * 0.24 + scarecrowFit * 0.17 + confidence * 0.13 + pedigree * 0.09,
      10,
      98,
    ),
    scramble: clamp(
      skill * 0.29 + ceiling * 0.28 + gambleFit * 0.19 + consistency * 0.12 + confidence * 0.12,
      10,
      98,
    ),
  };

  const tournamentScore = FORMATS.reduce(
    (sum, formatName) => sum + format[formatName] * FORMAT_META[formatName].weight,
    0,
  );

  const evidence: string[] = [];
  if (netEdge >= 0.65) evidence.push(`${netEdge.toFixed(1)} projected net-stroke edge`);
  else if (netEdge <= -0.65) evidence.push(`${Math.abs(netEdge).toFixed(1)} strokes below current-index form`);
  else evidence.push("form tracks current index");
  if (consistency >= 74) evidence.push("low recent variance");
  if (ceiling >= 72) evidence.push("format-changing ceiling");
  if (confidence < 50) evidence.push("thin data — recommendation is fragile");
  if (rawIndex > index) evidence.push(`${(rawIndex - index).toFixed(1)} strokes lost to the 25 cap`);

  return {
    player,
    index,
    projectedDifferential,
    netEdge,
    rawNetEdge,
    recentMean,
    recentPotential,
    volatility,
    consistency,
    ceiling,
    skill,
    confidence,
    confidenceLabel: confidenceLabel(confidence),
    gambleFit,
    scarecrowFit,
    endurance,
    pedigree,
    format,
    tournamentScore,
    strandValueAdded: 0,
    draftGrade: 50,
    sampleSize: diffs.all.length,
    fullRoundSampleSize: diffs.full.length,
    evidence,
  };
}

export function buildSaberBoard(players: PlayerDraftStats[]): PlayerSaberMetrics[] {
  const board = players.map(preliminaryMetrics);
  const draftable = board.filter((metric) => !isCaptain(metric.player.id));
  const fieldAverage = average(draftable.map((metric) => metric.tournamentScore));

  return board
    .map((metric) => ({
      ...metric,
      // Approximate points created above an average player over four formats.
      strandValueAdded: (metric.tournamentScore - fieldAverage) / 10,
      draftGrade: clamp(50 + (metric.tournamentScore - fieldAverage) * 2.25, 8, 99),
    }))
    .sort((a, b) => b.tournamentScore - a.tournamentScore);
}

function pairNote(
  format: Exclude<StrandFormat, "singles">,
  spread: number,
  consistency: number,
): string {
  if (format === "foursomes") {
    return consistency >= 72 ? "Reliable alternate-shot floor" : "Ceiling pairing with variance";
  }
  if (spread >= 8 && spread <= 18) return "Useful low/high handicap spread";
  if (format === "scramble") return "Gross-skill and birdie-ceiling blend";
  return "Balanced selected-drive pairing";
}

export function projectPair(
  a: PlayerSaberMetrics,
  b: PlayerSaberMetrics,
  format: Exclude<StrandFormat, "singles">,
): PairProjection {
  const base = (a.format[format] + b.format[format]) / 2;
  const spread = Math.abs(a.index - b.index);
  const pairConsistency = (a.consistency + b.consistency) / 2;
  let lift = 0;

  if (format === "foursomes") {
    lift = (pairConsistency - 58) * 0.11 + (Math.min(a.confidence, b.confidence) - 55) * 0.035;
    if (a.volatility > 7 && b.volatility > 7) lift -= 3;
  } else if (format === "shamble") {
    const spreadFit = spread >= 7 && spread <= 18 ? 3.2 : spread >= 4 ? 1.2 : -0.8;
    lift = spreadFit + (Math.max(a.ceiling, b.ceiling) - 55) * 0.055 + (pairConsistency - 58) * 0.035;
  } else {
    const spreadFit = spread >= 8 && spread <= 20 ? 4 : spread >= 5 ? 1.8 : -1;
    lift = spreadFit + (Math.max(a.skill, b.skill) - 55) * 0.055 + (Math.max(a.ceiling, b.ceiling) - 55) * 0.05;
  }

  return {
    a,
    b,
    format,
    score: clamp(base + lift, 8, 99),
    lift,
    note: pairNote(format, spread, pairConsistency),
  };
}

export function optimizePairs(
  team: PlayerSaberMetrics[],
  format: Exclude<StrandFormat, "singles">,
): PairProjection[] {
  if (team.length < 2) return [];
  const evenTeam = team.length % 2 === 0 ? team : team.slice(0, -1);
  let bestScore = -Infinity;
  let bestPairs: PairProjection[] = [];

  function search(remaining: PlayerSaberMetrics[], pairs: PairProjection[], score: number) {
    if (!remaining.length) {
      if (score > bestScore) {
        bestScore = score;
        bestPairs = pairs;
      }
      return;
    }

    const [first, ...rest] = remaining;
    rest.forEach((partner, index) => {
      const pair = projectPair(first, partner, format);
      search(
        rest.filter((_, restIndex) => restIndex !== index),
        [...pairs, pair],
        score + pair.score,
      );
    });
  }

  search(evenTeam, [], 0);
  return [...bestPairs].sort((a, b) => b.score - a.score);
}

function logistic(value: number): number {
  return 1 / (1 + Math.exp(-value));
}

function expectedPointShare(edge: number): number {
  return logistic(edge / 10.5);
}

function formatMatchups(
  mine: PlayerSaberMetrics[],
  opponent: PlayerSaberMetrics[],
  format: StrandFormat,
): MatchProjection[] {
  if (format === "singles") {
    const mineSorted = [...mine].sort((a, b) => b.format.singles - a.format.singles);
    const opponentSorted = [...opponent].sort((a, b) => b.format.singles - a.format.singles);
    return mineSorted.slice(0, Math.min(mineSorted.length, opponentSorted.length)).map((metric, index) => {
      const rival = opponentSorted[index];
      return {
        mine: [metric],
        opponent: [rival],
        mineScore: metric.format.singles,
        opponentScore: rival.format.singles,
        edge: metric.format.singles - rival.format.singles,
      };
    });
  }

  const pairFormat = format as Exclude<StrandFormat, "singles">;
  const minePairs = optimizePairs(mine, pairFormat);
  const opponentPairs = optimizePairs(opponent, pairFormat);
  const count = Math.min(minePairs.length, opponentPairs.length);
  return minePairs.slice(0, count).map((pair, index) => {
    const rival = opponentPairs[index];
    return {
      mine: [pair.a, pair.b],
      opponent: [rival.a, rival.b],
      mineScore: pair.score,
      opponentScore: rival.score,
      edge: pair.score - rival.score,
    };
  });
}

export function projectTournament(
  mine: PlayerSaberMetrics[],
  opponent: PlayerSaberMetrics[],
): TournamentProjection {
  const formats = FORMATS.map((format): FormatProjection => {
    const matchups = formatMatchups(mine, opponent, format);
    const availablePoints = matchups.length * 3;
    const mineExpected = matchups.reduce(
      (sum, matchup) => sum + expectedPointShare(matchup.edge) * 3,
      0,
    );
    return {
      format,
      mineExpected,
      opponentExpected: availablePoints - mineExpected,
      availablePoints,
      matchups,
    };
  });
  const mineExpected = formats.reduce((sum, format) => sum + format.mineExpected, 0);
  const availablePoints = formats.reduce((sum, format) => sum + format.availablePoints, 0);
  const opponentExpected = availablePoints - mineExpected;
  return {
    formats,
    mineExpected,
    opponentExpected,
    availablePoints,
    analyticWinProbability: logistic((mineExpected - opponentExpected) / 3.8),
  };
}

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(random: () => number): number {
  const u = Math.max(random(), Number.EPSILON);
  const v = Math.max(random(), Number.EPSILON);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function segmentPoint(edge: number): number {
  if (edge > 1.4) return 1;
  if (edge < -1.4) return 0;
  return 0.5;
}

function percentile(values: number[], fraction: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) * fraction)];
}

export function simulateTournament(
  mine: PlayerSaberMetrics[],
  opponent: PlayerSaberMetrics[],
  simulations = SIMULATION_RUNS,
): TournamentSimulation {
  const projection = projectTournament(mine, opponent);
  const rosterKey = [...mine, ...opponent]
    .map((metric) => metric.player.id)
    .join("|");
  const random = seededRandom(hashSeed(rosterKey));
  let wins = 0;
  let losses = 0;
  let ties = 0;
  const mineTotals: number[] = [];

  for (let simulation = 0; simulation < simulations; simulation += 1) {
    let minePoints = 0;
    projection.formats.forEach((format) => {
      format.matchups.forEach((matchup) => {
        const front = matchup.edge + normal(random) * 12.5;
        const back = matchup.edge + normal(random) * 12.5;
        const overall = (front + back) / 2 + normal(random) * 3.5;
        minePoints += segmentPoint(front) + segmentPoint(back) + segmentPoint(overall);
      });
    });
    mineTotals.push(minePoints);
    const opponentPoints = projection.availablePoints - minePoints;
    if (minePoints > opponentPoints) wins += 1;
    else if (minePoints < opponentPoints) losses += 1;
    else ties += 1;
  }

  return {
    ...projection,
    winProbability: wins / simulations,
    tieProbability: ties / simulations,
    lossProbability: losses / simulations,
    simulations,
    mineP10: percentile(mineTotals, 0.1),
    mineP90: percentile(mineTotals, 0.9),
  };
}

function teamPower(team: PlayerSaberMetrics[]): number {
  if (!team.length) return 0;
  const playerValue = team.reduce((sum, metric) => sum + metric.tournamentScore, 0);
  const pairLift = (["foursomes", "shamble", "scramble"] as const).reduce(
    (sum, format) =>
      sum + optimizePairs(team, format).reduce((pairSum, pair) => pairSum + pair.lift, 0),
    0,
  );
  // Pairing lift breaks close calls; it should never overpower a materially
  // better individual player during the draft itself.
  return playerValue + pairLift * 0.45;
}

function bestRosterFit(
  roster: PlayerDraftStats[],
  available: PlayerDraftStats[],
  metricMap: Map<string, PlayerSaberMetrics>,
): PlayerDraftStats {
  const current = roster
    .map((player) => metricMap.get(player.id))
    .filter((metric): metric is PlayerSaberMetrics => Boolean(metric));
  let best = available[0];
  let bestValue = -Infinity;
  available.forEach((candidate) => {
    const metric = metricMap.get(candidate.id);
    if (!metric) return;
    const value = teamPower([...current, metric]);
    if (value > bestValue) {
      bestValue = value;
      best = candidate;
    }
  });
  return best;
}

function ownerForPick(pickNumber: number, wixPicksFirst: boolean): DraftSide {
  const first: DraftSide = wixPicksFirst ? "mine" : "opponent";
  const second: DraftSide = wixPicksFirst ? "opponent" : "mine";
  return pickNumber % 2 === 1 ? first : second;
}

export function currentDraftOwner(
  assignments: DraftAssignment[],
  wixPicksFirst = false,
): DraftSide | null {
  if (assignments.length >= TOTAL_DRAFT_PICKS) return null;
  return ownerForPick(assignments.length + 1, wixPicksFirst);
}

export function completeDraft(
  players: PlayerDraftStats[],
  assignments: DraftAssignment[],
  wixPicksFirst = false,
): DraftProjection {
  const metricMap = new Map(buildSaberBoard(players).map((metric) => [metric.player.id, metric]));
  const mineCaptain = players.find((player) => player.id === CAPTAIN_IDS[0]);
  const opponentCaptain = players.find((player) => player.id === CAPTAIN_IDS[1]);
  const assignedIds = new Set(assignments.map((assignment) => assignment.playerId));
  const mine = [
    ...(mineCaptain ? [mineCaptain] : []),
    ...assignments
      .filter((assignment) => assignment.side === "mine")
      .map((assignment) => players.find((player) => player.id === assignment.playerId))
      .filter((player): player is PlayerDraftStats => Boolean(player)),
  ];
  const opponent = [
    ...(opponentCaptain ? [opponentCaptain] : []),
    ...assignments
      .filter((assignment) => assignment.side === "opponent")
      .map((assignment) => players.find((player) => player.id === assignment.playerId))
      .filter((player): player is PlayerDraftStats => Boolean(player)),
  ];
  let remaining = players.filter(
    (player) => !isCaptain(player.id) && !assignedIds.has(player.id),
  );

  for (let pick = assignments.length + 1; pick <= TOTAL_DRAFT_PICKS && remaining.length; pick += 1) {
    const owner = ownerForPick(pick, wixPicksFirst);
    const roster = owner === "mine" ? mine : opponent;
    const candidate = bestRosterFit(roster, remaining, metricMap);
    roster.push(candidate);
    remaining = remaining.filter((player) => player.id !== candidate.id);
  }

  return { mine, opponent, remaining };
}

export function rosterMetrics(
  roster: PlayerDraftStats[],
  board: PlayerSaberMetrics[],
): PlayerSaberMetrics[] {
  const metricMap = new Map(board.map((metric) => [metric.player.id, metric]));
  return roster
    .map((player) => metricMap.get(player.id))
    .filter((metric): metric is PlayerSaberMetrics => Boolean(metric));
}
