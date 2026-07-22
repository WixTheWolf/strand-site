import { CHAMPIONSHIP_COURSES, courseHandicap, strokesOnHole } from "./course-intelligence";
import { CAPTAIN_IDS, STRAND_PLAYERS } from "./players";

export type TeamId = "wix" | "jbone";
export type LiveFormat = "fourball" | "shamble" | "scramble" | "singles";
export type SegmentId = "front" | "back" | "overall";
export type HoleWinner = TeamId | "tie" | "pending";

export interface LiveTeam {
  id: TeamId;
  name: string;
  shortName: string;
  captainId: string;
  color: string;
}

export interface LivePlayer {
  id: string;
  name: string;
  nickname: string;
  initials: string;
  index: number;
  teamId: TeamId;
}

export interface LiveMatch {
  id: string;
  sessionId: string;
  number: number;
  teamWixPlayerIds: string[];
  teamJbonePlayerIds: string[];
}

export interface LiveSession {
  id: string;
  number: number;
  name: string;
  format: LiveFormat;
  courseId: "gamble-sands" | "scarecrow";
  teeName: string;
  allowance: number;
  matchCount: number;
  scheduledPoints: number;
  matches: LiveMatch[];
}

export interface TournamentConfig {
  version: number;
  name: string;
  status: "provisional" | "locked";
  teams: Record<TeamId, LiveTeam>;
  players: LivePlayer[];
  sessions: LiveSession[];
  updatedAt: string;
}

export interface MatchScore {
  matchId: string;
  holes: Record<number, HoleScore>;
  scorerName?: string;
  updatedAt?: string;
}

export interface HoleScore {
  playerGross?: Record<string, number | null>;
  teamGross?: Partial<Record<TeamId, number | null>>;
  selectedDrivePlayerId?: string | null;
}

export interface PlayingHandicap {
  playerId: string;
  courseHandicap: number;
  allowanceHandicap: number;
  matchHandicap: number;
}

export interface HoleResult {
  hole: number;
  winner: HoleWinner;
  wixNet: number | null;
  jboneNet: number | null;
  wixGross: number | null;
  jboneGross: number | null;
  playerNets: Record<string, number | null>;
}

export interface SegmentResult {
  id: SegmentId;
  label: string;
  complete: boolean;
  started: boolean;
  winner: HoleWinner;
  wixHoles: number;
  jboneHoles: number;
  halvedHoles: number;
  points: Record<TeamId, number>;
  projectedPoints: Record<TeamId, number>;
}

export interface MatchResult {
  match: LiveMatch;
  session: LiveSession;
  playingHandicaps: PlayingHandicap[];
  scrambleHandicaps?: Record<TeamId, number>;
  holeResults: HoleResult[];
  segments: Record<SegmentId, SegmentResult>;
  securedPoints: Record<TeamId, number>;
  projectedPoints: Record<TeamId, number>;
  holesComplete: number;
  currentHole: number;
  complete: boolean;
}

export const FORMAT_RULES: Record<LiveFormat, { label: string; allowanceLabel: string; entryLabel: string }> = {
  fourball: {
    label: "Fourball",
    allowanceLabel: "80% of each player's course handicap",
    entryLabel: "Enter both individual gross scores; the low net ball counts.",
  },
  shamble: {
    label: "Shamble",
    allowanceLabel: "75% of each player's course handicap",
    entryLabel: "Enter both individual gross scores after the selected drive; the low net ball counts.",
  },
  scramble: {
    label: "2v2 Scramble",
    allowanceLabel: "35% low course handicap + 15% high course handicap",
    entryLabel: "Enter one gross team score per hole.",
  },
  singles: {
    label: "Singles",
    allowanceLabel: "80% of each player's course handicap",
    entryLabel: "Enter each player's gross score.",
  },
};

export const TOTAL_TOURNAMENT_POINTS = 75;
export const POINTS_TO_WIN = 38;
export const DRAFT_TEAM_TRANSFER_KEY = "strand-2026-draft-team-transfer-v1";

export interface DraftTeamTransfer {
  version: 1;
  capturedAt: string;
  wixPlayerIds: string[];
  jbonePlayerIds: string[];
}

function byIndex(a: LivePlayer, b: LivePlayer) {
  return a.index - b.index || a.name.localeCompare(b.name);
}

function provisionalTeams(): LivePlayer[] {
  const captainTeam: Record<string, TeamId> = {
    [CAPTAIN_IDS[0]]: "wix",
    [CAPTAIN_IDS[1]]: "jbone",
  };
  const available = STRAND_PLAYERS.filter((player) => !player.out && !captainTeam[player.id])
    .map((player) => ({
      id: player.id,
      name: player.name,
      nickname: player.nickname,
      initials: player.initials,
      index: player.eventIndex2026 ?? player.manualIndex ?? player.estimatedIndex ?? 25,
      teamId: "wix" as TeamId,
    }))
    .sort(byIndex);

  // Serpentine distribution is only a pre-draft demo. Captains replace these
  // assignments in setup once the real teams and pairings are known.
  available.forEach((player, index) => {
    const block = Math.floor(index / 2);
    const withinBlock = index % 2;
    player.teamId = (block % 2 === 0 ? withinBlock === 0 : withinBlock === 1) ? "jbone" : "wix";
  });

  const captains = STRAND_PLAYERS.filter((player) => captainTeam[player.id]).map((player) => ({
    id: player.id,
    name: player.name,
    nickname: player.nickname,
    initials: player.initials,
    index: player.eventIndex2026 ?? player.manualIndex ?? player.estimatedIndex ?? 25,
    teamId: captainTeam[player.id],
  }));

  return [...captains, ...available].sort((a, b) => a.teamId.localeCompare(b.teamId) || byIndex(a, b));
}

function pairMatches(sessionId: string, count: number, wix: LivePlayer[], jbone: LivePlayer[], singles = false): LiveMatch[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${sessionId}-m${index + 1}`,
    sessionId,
    number: index + 1,
    teamWixPlayerIds: singles ? [wix[index]?.id].filter(Boolean) : wix.slice(index * 2, index * 2 + 2).map((player) => player.id),
    teamJbonePlayerIds: singles ? [jbone[index]?.id].filter(Boolean) : jbone.slice(index * 2, index * 2 + 2).map((player) => player.id),
  }));
}

export function createInitialTournamentConfig(): TournamentConfig {
  const players = provisionalTeams();
  const wix = players.filter((player) => player.teamId === "wix").sort(byIndex);
  const jbone = players.filter((player) => player.teamId === "jbone").sort(byIndex);
  const sessionDefinitions: Omit<LiveSession, "matches">[] = [
    { id: "fourball", number: 1, name: "Round 1 · Fourball", format: "fourball", courseId: "gamble-sands", teeName: "Sands", allowance: 0.8, matchCount: 5, scheduledPoints: 15 },
    { id: "shamble", number: 2, name: "Round 2 · Shamble", format: "shamble", courseId: "scarecrow", teeName: "Sands", allowance: 0.75, matchCount: 5, scheduledPoints: 15 },
    { id: "singles", number: 3, name: "Round 3 · Singles", format: "singles", courseId: "scarecrow", teeName: "Sands", allowance: 0.8, matchCount: 10, scheduledPoints: 30 },
    { id: "scramble", number: 4, name: "Round 4 · 2v2 Scramble", format: "scramble", courseId: "gamble-sands", teeName: "Sands", allowance: 0, matchCount: 5, scheduledPoints: 15 },
  ];

  return {
    version: 1,
    name: "The Strand · Gamble Sands 2026",
    status: "provisional",
    teams: {
      wix: { id: "wix", name: "Team WIX", shortName: "WIX", captainId: CAPTAIN_IDS[0], color: "#bd7a48" },
      jbone: { id: "jbone", name: "Team J-BONE", shortName: "J-BONE", captainId: CAPTAIN_IDS[1], color: "#315d4e" },
    },
    players,
    sessions: sessionDefinitions.map((session) => ({
      ...session,
      matches: pairMatches(session.id, session.matchCount, wix, jbone, session.format === "singles"),
    })),
    updatedAt: new Date().toISOString(),
  };
}

export function getCourseForSession(session: LiveSession) {
  const course = CHAMPIONSHIP_COURSES.find((item) => item.id === session.courseId);
  if (!course) throw new Error(`Unknown course: ${session.courseId}`);
  const tee = course.tees.find((item) => item.name === session.teeName) ?? course.tees[0];
  return { course, tee };
}

export function calculatePlayingHandicaps(config: TournamentConfig, session: LiveSession, match: LiveMatch): PlayingHandicap[] {
  const { course, tee } = getCourseForSession(session);
  const ids = [...match.teamWixPlayerIds, ...match.teamJbonePlayerIds];
  const raw = ids.map((playerId) => {
    const player = config.players.find((item) => item.id === playerId);
    if (!player) throw new Error(`Unknown player: ${playerId}`);
    const courseHc = courseHandicap(player.index, tee, course.par);
    const allowanceHandicap = session.format === "scramble" ? courseHc : Math.round(courseHc * session.allowance);
    return { playerId, courseHandicap: courseHc, allowanceHandicap, matchHandicap: allowanceHandicap };
  });

  if (session.format === "scramble") return raw;
  const low = Math.min(...raw.map((item) => item.allowanceHandicap));
  return raw.map((item) => ({ ...item, matchHandicap: Math.max(0, item.allowanceHandicap - low) }));
}

export function calculateScrambleHandicaps(config: TournamentConfig, session: LiveSession, match: LiveMatch): Record<TeamId, number> {
  const { course, tee } = getCourseForSession(session);
  const teamAllowance = (ids: string[]) => {
    const handicaps = ids.map((id) => {
      const player = config.players.find((item) => item.id === id);
      if (!player) throw new Error(`Unknown player: ${id}`);
      return courseHandicap(player.index, tee, course.par);
    }).sort((a, b) => a - b);
    if (handicaps.length !== 2) return 0;
    return Math.round(handicaps[0] * 0.35 + handicaps[1] * 0.15);
  };
  const absolute = {
    wix: teamAllowance(match.teamWixPlayerIds),
    jbone: teamAllowance(match.teamJbonePlayerIds),
  };
  const low = Math.min(absolute.wix, absolute.jbone);
  return { wix: absolute.wix - low, jbone: absolute.jbone - low };
}

function validScore(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 1 && value <= 20;
}

function bestBall(ids: string[], strokeIndex: number, gross: Record<string, number | null>, handicaps: PlayingHandicap[]) {
  const candidates = ids.map((id) => {
    const score = gross[id];
    const handicap = handicaps.find((item) => item.playerId === id)?.matchHandicap ?? 0;
    return validScore(score) ? { id, gross: score, net: score - strokesOnHole(handicap, strokeIndex) } : null;
  });
  if (candidates.some((item) => item === null)) return null;
  return candidates.filter((item): item is NonNullable<typeof item> => Boolean(item)).sort((a, b) => a.net - b.net || a.gross - b.gross)[0] ?? null;
}

function holeResult(
  config: TournamentConfig,
  session: LiveSession,
  match: LiveMatch,
  matchScore: MatchScore,
  hole: number,
  handicaps: PlayingHandicap[],
  scrambleHandicaps?: Record<TeamId, number>,
): HoleResult {
  const score = matchScore.holes[hole] ?? {};
  const { course } = getCourseForSession(session);
  const strokeIndex = course.holes[hole - 1].strokeIndex;
  const playerNets: Record<string, number | null> = {};
  let wixNet: number | null = null;
  let jboneNet: number | null = null;
  let wixGross: number | null = null;
  let jboneGross: number | null = null;

  if (session.format === "scramble") {
    const a = score.teamGross?.wix;
    const b = score.teamGross?.jbone;
    if (validScore(a)) {
      wixGross = a;
      wixNet = a - strokesOnHole(scrambleHandicaps?.wix ?? 0, strokeIndex);
    }
    if (validScore(b)) {
      jboneGross = b;
      jboneNet = b - strokesOnHole(scrambleHandicaps?.jbone ?? 0, strokeIndex);
    }
  } else {
    const gross = score.playerGross ?? {};
    for (const handicap of handicaps) {
      const value = gross[handicap.playerId];
      playerNets[handicap.playerId] = validScore(value)
        ? value - strokesOnHole(handicap.matchHandicap, strokeIndex)
        : null;
    }
    const wixBest = bestBall(match.teamWixPlayerIds, strokeIndex, gross, handicaps);
    const jboneBest = bestBall(match.teamJbonePlayerIds, strokeIndex, gross, handicaps);
    wixNet = wixBest?.net ?? null;
    jboneNet = jboneBest?.net ?? null;
    wixGross = wixBest?.gross ?? null;
    jboneGross = jboneBest?.gross ?? null;
  }

  const winner: HoleWinner = wixNet === null || jboneNet === null
    ? "pending"
    : wixNet < jboneNet
      ? "wix"
      : jboneNet < wixNet
        ? "jbone"
        : "tie";
  return { hole, winner, wixNet, jboneNet, wixGross, jboneGross, playerNets };
}

function segmentResult(id: SegmentId, results: HoleResult[]): SegmentResult {
  const range = id === "front" ? results.slice(0, 9) : id === "back" ? results.slice(9) : results;
  const completed = range.filter((hole) => hole.winner !== "pending");
  const wixHoles = completed.filter((hole) => hole.winner === "wix").length;
  const jboneHoles = completed.filter((hole) => hole.winner === "jbone").length;
  const halvedHoles = completed.filter((hole) => hole.winner === "tie").length;
  const complete = completed.length === range.length;
  const started = completed.length > 0;
  const winner: HoleWinner = !started
    ? "pending"
    : wixHoles > jboneHoles
      ? "wix"
      : jboneHoles > wixHoles
        ? "jbone"
        : "tie";
  const split = (target: HoleWinner): Record<TeamId, number> => target === "wix"
    ? { wix: 1, jbone: 0 }
    : target === "jbone"
      ? { wix: 0, jbone: 1 }
      : target === "tie"
        ? { wix: 0.5, jbone: 0.5 }
        : { wix: 0, jbone: 0 };

  return {
    id,
    label: id === "front" ? "Front 9" : id === "back" ? "Back 9" : "Overall",
    complete,
    started,
    winner,
    wixHoles,
    jboneHoles,
    halvedHoles,
    points: complete ? split(winner) : { wix: 0, jbone: 0 },
    projectedPoints: started ? split(winner) : { wix: 0, jbone: 0 },
  };
}

export function scoreMatch(config: TournamentConfig, session: LiveSession, match: LiveMatch, matchScore?: MatchScore): MatchResult {
  const safeScore = matchScore ?? { matchId: match.id, holes: {} };
  const playingHandicaps = calculatePlayingHandicaps(config, session, match);
  const scrambleHandicaps = session.format === "scramble"
    ? calculateScrambleHandicaps(config, session, match)
    : undefined;
  const holeResults = Array.from({ length: 18 }, (_, index) => holeResult(
    config,
    session,
    match,
    safeScore,
    index + 1,
    playingHandicaps,
    scrambleHandicaps,
  ));
  const segments = {
    front: segmentResult("front", holeResults),
    back: segmentResult("back", holeResults),
    overall: segmentResult("overall", holeResults),
  };
  const sum = (key: "points" | "projectedPoints", team: TeamId) => Object.values(segments).reduce((total, segment) => total + segment[key][team], 0);
  const holesComplete = holeResults.filter((hole) => hole.winner !== "pending").length;

  return {
    match,
    session,
    playingHandicaps,
    scrambleHandicaps,
    holeResults,
    segments,
    securedPoints: { wix: sum("points", "wix"), jbone: sum("points", "jbone") },
    projectedPoints: { wix: sum("projectedPoints", "wix"), jbone: sum("projectedPoints", "jbone") },
    holesComplete,
    currentHole: Math.min(18, holesComplete + 1),
    complete: holesComplete === 18,
  };
}

export function scoreTournament(config: TournamentConfig, scores: Record<string, MatchScore>) {
  const matches = config.sessions.flatMap((session) => session.matches.map((match) => scoreMatch(config, session, match, scores[match.id])));
  const total = (key: "securedPoints" | "projectedPoints", team: TeamId) => matches.reduce((sum, match) => sum + match[key][team], 0);
  const holesComplete = matches.reduce((sum, match) => sum + match.holesComplete, 0);
  return {
    matches,
    securedPoints: { wix: total("securedPoints", "wix"), jbone: total("securedPoints", "jbone") },
    projectedPoints: { wix: total("projectedPoints", "wix"), jbone: total("projectedPoints", "jbone") },
    holesComplete,
    pointsDecided: matches.reduce((sum, match) => sum + match.securedPoints.wix + match.securedPoints.jbone, 0),
  };
}

export function validateTournamentConfig(config: TournamentConfig): string[] {
  const errors: string[] = [];
  for (const teamId of ["wix", "jbone"] as const) {
    const count = config.players.filter((player) => player.teamId === teamId).length;
    if (count !== 10) errors.push(`${config.teams[teamId].name} has ${count} players; exactly 10 are required.`);
  }
  for (const session of config.sessions) {
    const expectedPerTeam = session.format === "singles" ? 1 : 2;
    const used: Record<TeamId, string[]> = { wix: [], jbone: [] };
    for (const match of session.matches) {
      if (match.teamWixPlayerIds.length !== expectedPerTeam || match.teamJbonePlayerIds.length !== expectedPerTeam) {
        errors.push(`${session.name}, Match ${match.number} needs ${expectedPerTeam} player${expectedPerTeam === 1 ? "" : "s"} per team.`);
      }
      used.wix.push(...match.teamWixPlayerIds);
      used.jbone.push(...match.teamJbonePlayerIds);
    }
    for (const teamId of ["wix", "jbone"] as const) {
      const expected = config.players.filter((player) => player.teamId === teamId).map((player) => player.id).sort();
      const actual = used[teamId].sort();
      if (new Set(actual).size !== actual.length || expected.join("|") !== actual.join("|")) {
        errors.push(`${session.name} must use every ${config.teams[teamId].name} player exactly once.`);
      }
    }
  }
  const scheduledPoints = config.sessions.reduce((sum, session) => sum + session.matches.length * 3, 0);
  if (scheduledPoints !== TOTAL_TOURNAMENT_POINTS) errors.push(`Schedule contains ${scheduledPoints} points instead of ${TOTAL_TOURNAMENT_POINTS}.`);
  return errors;
}
