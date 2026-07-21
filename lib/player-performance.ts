import type { PlayerDraftStats, RecentRound, RoundShotStats } from "./types";

const TOURNAMENT_DATE = new Date("2026-07-23T12:00:00Z");

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const average = (values: number[]): number | null =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;

function weightedAverage(values: number[], decay = 0.86): number | null {
  if (!values.length) return null;
  let total = 0;
  let weights = 0;
  values.forEach((value, index) => {
    const weight = decay ** index;
    total += value * weight;
    weights += weight;
  });
  return total / weights;
}

function standardDeviation(values: number[]): number | null {
  const mean = average(values);
  if (mean === null || values.length < 2) return null;
  return Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length);
}

function quantile(values: number[], percentile: number): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * percentile;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function roundDate(round: RecentRound): number {
  const raw = Date.parse(round.date.length === 7 ? `${round.date}-01T00:00:00Z` : round.date);
  return Number.isFinite(raw) ? raw : 0;
}

function validNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function statAverage(
  rounds: RecentRound[],
  key: keyof RoundShotStats,
): number | null {
  const values = rounds
    .map((round) => round.shotStats?.[key])
    .filter(validNumber);
  return average(values);
}

function differentialAverage(rounds: RecentRound[]): number | null {
  return average(rounds.map((round) => round.differential).filter(validNumber));
}

function scoreType(round: RecentRound): string {
  return (round.scoreType ?? "").trim().toUpperCase();
}

function isCompetition(round: RecentRound): boolean {
  const type = scoreType(round);
  return type === "C" || type === "T" || type.includes("COMPETITION") || type.includes("TOURNAMENT");
}

function isAway(round: RecentRound): boolean {
  const type = scoreType(round);
  return type === "A" || type.includes("AWAY");
}

function daysBeforeTournament(timestamp: number): number | null {
  if (!timestamp) return null;
  return Math.max(0, Math.round((TOURNAMENT_DATE.getTime() - timestamp) / 86_400_000));
}

function formIndex(differentials: number[]): number | null {
  if (!differentials.length) return null;
  const window = differentials.slice(0, 20);
  const count = Math.max(1, Math.ceil(window.length * 0.4));
  return average([...window].sort((a, b) => a - b).slice(0, count));
}

export interface PlayerPerformanceProfile {
  roundCount: number;
  fullRoundCount: number;
  detailedRoundCount: number;
  statRoundCount: number;
  latestRoundDate: string | null;
  daysSinceLastRound: number | null;
  activity30: number;
  activity60: number;
  activity90: number;
  recent5: number | null;
  recent10: number | null;
  previous5: number | null;
  trend: number | null;
  weightedForm: number | null;
  formIndex: number | null;
  ceiling: number | null;
  floor: number | null;
  volatility: number | null;
  competitiveRounds: number;
  competitiveDifferential: number | null;
  awayRounds: number;
  awayDifferential: number | null;
  usedInIndexCount: number;
  exceptionalRounds: number;
  averageCourseRating: number | null;
  averageSlope: number | null;
  averagePcc: number | null;
  girPct: number | null;
  fairwayPct: number | null;
  birdieOrBetterPct: number | null;
  parPct: number | null;
  bogeyPct: number | null;
  doubleBogeyPct: number | null;
  tripleBogeyPct: number | null;
  onePuttPct: number | null;
  threePuttPct: number | null;
  puttsPer18: number | null;
  par3Average: number | null;
  par4Average: number | null;
  par5Average: number | null;
  ballStriking: number | null;
  scoringControl: number | null;
  putting: number | null;
  pressure: number | null;
  activityReadiness: number;
  dataDepth: number;
  signals: string[];
}

export function buildPerformanceProfile(player: PlayerDraftStats): PlayerPerformanceProfile {
  const rounds = [...(player.recentRounds ?? [])].sort((a, b) => roundDate(b) - roundDate(a));
  const fullRounds = rounds.filter((round) => !round.nineHole);
  const differentialRounds = (fullRounds.length >= 3 ? fullRounds : rounds).filter((round) =>
    validNumber(round.differential),
  );
  const differentials = differentialRounds.map((round) => round.differential as number);
  const latestTimestamp = rounds[0] ? roundDate(rounds[0]) : 0;
  const latestRoundDate = rounds[0]?.date ?? null;
  const daysSinceLastRound = daysBeforeTournament(latestTimestamp);
  const withinDays = (days: number) => rounds.filter((round) => {
    const timestamp = roundDate(round);
    return timestamp > 0 && TOURNAMENT_DATE.getTime() - timestamp <= days * 86_400_000;
  }).length;
  const recent5 = average(differentials.slice(0, 5));
  const recent10 = average(differentials.slice(0, 10));
  const previous5 = average(differentials.slice(5, 10));
  const trend = recent5 !== null && previous5 !== null ? previous5 - recent5 : null;
  const statRounds = rounds.filter((round) => round.shotStats != null);
  const detailedRounds = rounds.filter((round) =>
    round.courseRating != null || round.slopeRating != null || round.scoreType != null || round.usedInIndex != null,
  );
  const competitionRounds = differentialRounds.filter(isCompetition);
  const awayRounds = differentialRounds.filter(isAway);
  const index = player.indexNum ?? player.estimatedIndex ?? 22;

  const girPct = statAverage(statRounds, "girPct");
  const fairwayPct = statAverage(statRounds, "fairwayHitsPct");
  const birdieOrBetterPct = statAverage(statRounds, "birdiesOrBetterPct");
  const parPct = statAverage(statRounds, "parsPct");
  const bogeyPct = statAverage(statRounds, "bogeysPct");
  const doubleBogeyPct = statAverage(statRounds, "doubleBogeysPct");
  const tripleBogeyPct = statAverage(statRounds, "tripleBogeysOrWorsePct");
  const onePuttPct = statAverage(statRounds, "onePuttOrBetterPct");
  const threePuttPct = statAverage(statRounds, "threePuttOrWorsePct");
  const puttsPer18 = average(statRounds
    .map((round) => {
      const putts = round.shotStats?.putts;
      const holes = round.holesPlayed ?? (round.nineHole ? 9 : 18);
      return validNumber(putts) && holes > 0 ? putts * (18 / holes) : null;
    })
    .filter(validNumber));

  const strikeInputs = [girPct, fairwayPct].filter(validNumber);
  const ballStriking = strikeInputs.length
    ? clamp((girPct ?? average(strikeInputs) ?? 50) * 0.68 + (fairwayPct ?? average(strikeInputs) ?? 50) * 0.32, 10, 95)
    : null;
  const doubleAvoidance = doubleBogeyPct !== null || tripleBogeyPct !== null
    ? 100 - (doubleBogeyPct ?? 0) - (tripleBogeyPct ?? 0)
    : null;
  const scoringInputs = [birdieOrBetterPct, parPct, doubleAvoidance].filter(validNumber);
  const scoringControl = scoringInputs.length
    ? clamp(
        (birdieOrBetterPct ?? 5) * 0.9 +
          (parPct ?? average(scoringInputs) ?? 45) * 0.35 +
          (doubleAvoidance ?? average(scoringInputs) ?? 70) * 0.65,
        10,
        96,
      )
    : null;
  const puttingInputs = [onePuttPct, threePuttPct, puttsPer18].filter(validNumber);
  const putting = puttingInputs.length
    ? clamp(
        (onePuttPct ?? 25) * 0.35 +
          (100 - (threePuttPct ?? 12)) * 0.38 +
          clamp(100 - ((puttsPer18 ?? 33) - 27) * 6, 15, 95) * 0.27,
        10,
        96,
      )
    : null;

  const pressureSamples: number[] = [];
  const competitiveDifferential = differentialAverage(competitionRounds);
  const awayDifferential = differentialAverage(awayRounds);
  if (competitionRounds.length >= 2 && competitiveDifferential !== null) {
    pressureSamples.push(clamp(50 + (index - competitiveDifferential) * 8, 15, 92));
  }
  if (awayRounds.length >= 3 && awayDifferential !== null) {
    pressureSamples.push(clamp(50 + (index - awayDifferential) * 6, 15, 92));
  }
  const pressure = average(pressureSamples);

  const recentActivity = withinDays(90);
  const freshness = daysSinceLastRound === null
    ? 25
    : clamp(100 - Math.max(0, daysSinceLastRound - 14) * 1.1, 20, 100);
  const activityReadiness = clamp(freshness * 0.62 + Math.min(100, recentActivity * 14) * 0.38, 20, 96);
  const attest = Number.isFinite(player.attestNum) ? player.attestNum : 0;
  const dataDepth = clamp(
    Math.min(42, differentialRounds.length * 3.5) +
      Math.min(18, fullRounds.length * 1.5) +
      Math.min(20, statRounds.length * 5) +
      Math.min(12, detailedRounds.length * 1.2) +
      Math.min(8, attest * 0.08),
    8,
    100,
  );

  const signals: string[] = [];
  if (trend !== null && trend >= 1.5) signals.push(`improving ${trend.toFixed(1)} strokes vs prior five`);
  if (trend !== null && trend <= -1.5) signals.push(`cooling ${Math.abs(trend).toFixed(1)} strokes vs prior five`);
  if (competitionRounds.length >= 2 && competitiveDifferential !== null) {
    signals.push(`${competitiveDifferential.toFixed(1)} competitive differential`);
  }
  if (awayRounds.length >= 3 && awayDifferential !== null) {
    signals.push(`${awayDifferential.toFixed(1)} away differential`);
  }
  if (girPct !== null) signals.push(`${girPct.toFixed(0)}% GIR`);
  if (doubleAvoidance !== null) signals.push(`${doubleAvoidance.toFixed(0)}% avoids doubles+`);
  if (daysSinceLastRound !== null && daysSinceLastRound > 75) signals.push(`${daysSinceLastRound} days since last post`);

  return {
    roundCount: rounds.length,
    fullRoundCount: fullRounds.length,
    detailedRoundCount: detailedRounds.length,
    statRoundCount: statRounds.length,
    latestRoundDate,
    daysSinceLastRound,
    activity30: withinDays(30),
    activity60: withinDays(60),
    activity90: recentActivity,
    recent5,
    recent10,
    previous5,
    trend,
    weightedForm: weightedAverage(differentials.slice(0, 20)),
    formIndex: formIndex(differentials),
    ceiling: quantile(differentials, 0.2),
    floor: quantile(differentials, 0.8),
    volatility: standardDeviation(differentials),
    competitiveRounds: competitionRounds.length,
    competitiveDifferential,
    awayRounds: awayRounds.length,
    awayDifferential,
    usedInIndexCount: rounds.filter((round) => round.usedInIndex === true).length,
    exceptionalRounds: rounds.filter((round) => round.exceptional === true).length,
    averageCourseRating: average(rounds.map((round) => round.courseRating).filter(validNumber)),
    averageSlope: average(rounds.map((round) => round.slopeRating).filter(validNumber)),
    averagePcc: average(rounds.map((round) => round.pcc).filter(validNumber)),
    girPct,
    fairwayPct,
    birdieOrBetterPct,
    parPct,
    bogeyPct,
    doubleBogeyPct,
    tripleBogeyPct,
    onePuttPct,
    threePuttPct,
    puttsPer18,
    par3Average: statAverage(statRounds, "par3Average"),
    par4Average: statAverage(statRounds, "par4Average"),
    par5Average: statAverage(statRounds, "par5Average"),
    ballStriking,
    scoringControl,
    putting,
    pressure,
    activityReadiness,
    dataDepth,
    signals,
  };
}
