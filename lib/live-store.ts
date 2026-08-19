import "server-only";

import { Redis } from "@upstash/redis";

import { STRAND_PLAYERS } from "./players";
import {
  createInitialTournamentConfig,
  type LiveMatch,
  type LivePlayer,
  type LiveSession,
  type MatchScore,
  type TeamId,
  type TournamentConfig,
} from "./live-scoring";

const CONFIG_KEY = "strand:2026:live:config:v1";
const SCORE_PREFIX = "strand:2026:live:score:v1:";
const OFFICIAL_CONFIG_REVISION = 20260818;

const OFFICIAL_WIX_IDS = new Set([
  "matt-wixted",
  "andrew-mager",
  "jack-groot",
  "jordan-brodbeck",
  "nick-sprowls",
  "tim-hummel",
  "nick-kane",
  "sam-blonski",
  "pat-morse",
  "rhett-fahrney",
]);

const OFFICIAL_JUSTIN_IDS = new Set([
  "justin-uribe",
  "fred-geisinger",
  "ryan-darcy",
  "matt-schroeder",
  "brian-kerns",
  "kevin-gordon",
  "shaun-eipper",
  "jason-olson",
  "brett-comfort",
  "matt-onorato",
]);

type MemoryStore = { config?: TournamentConfig; scores: Record<string, MatchScore> };

declare global { var __strandLiveStore: MemoryStore | undefined; }

function memoryStore(): MemoryStore {
  if (!globalThis.__strandLiveStore) globalThis.__strandLiveStore = { scores: {} };
  return globalThis.__strandLiveStore;
}

function redisCredentials() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

let sharedRedis: Redis | undefined;
function redis() {
  if (!redisCredentials()) throw new Error("Shared live scoring storage is not configured.");
  sharedRedis ??= Redis.fromEnv({ automaticDeserialization: false, readYourWrites: true });
  return sharedRedis;
}

function parseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try { return JSON.parse(value) as T; } catch { return null; }
}

export function liveStorageMode(): "shared" | "preview" { return redisCredentials() ? "shared" : "preview"; }

function officialPlayers(): LivePlayer[] {
  return STRAND_PLAYERS.filter((profile) => !profile.out).map((profile) => {
    const teamId: TeamId = OFFICIAL_WIX_IDS.has(profile.id) ? "wix" : "jbone";
    if (!OFFICIAL_WIX_IDS.has(profile.id) && !OFFICIAL_JUSTIN_IDS.has(profile.id)) {
      throw new Error(`Player ${profile.id} is missing from the final Strand roster.`);
    }
    return {
      id: profile.id,
      name: profile.name,
      nickname: profile.nickname,
      initials: profile.initials,
      index: profile.eventIndex2026 ?? profile.manualIndex ?? profile.estimatedIndex ?? 25,
      teamId,
    };
  }).sort((a, b) => a.teamId.localeCompare(b.teamId) || a.index - b.index || a.name.localeCompare(b.name));
}

function rebuildMatches(session: LiveSession, players: LivePlayer[]): LiveMatch[] {
  const wix = players.filter((p) => p.teamId === "wix").sort((a, b) => a.index - b.index);
  const justin = players.filter((p) => p.teamId === "jbone").sort((a, b) => a.index - b.index);
  const singles = session.format === "singles";
  return Array.from({ length: singles ? 10 : 5 }, (_, i) => ({
    id: `${session.id}-m${i + 1}`,
    sessionId: session.id,
    number: i + 1,
    teamWixPlayerIds: singles ? [wix[i]?.id].filter(Boolean) : wix.slice(i * 2, i * 2 + 2).map((p) => p.id),
    teamJbonePlayerIds: singles ? [justin[i]?.id].filter(Boolean) : justin.slice(i * 2, i * 2 + 2).map((p) => p.id),
  }));
}

function migrateToOfficialSheet(config: TournamentConfig): TournamentConfig {
  const players = officialPlayers();
  const sessions = config.sessions.map((session) => ({ ...session, matches: rebuildMatches(session, players) }));
  return {
    ...config,
    version: OFFICIAL_CONFIG_REVISION,
    status: "provisional",
    teams: {
      wix: { ...config.teams.wix, name: "Team WIX", shortName: "WIX", captainId: "matt-wixted" },
      jbone: { ...config.teams.jbone, name: "Team Justin", shortName: "J-BONE", captainId: "justin-uribe" },
    },
    players,
    sessions,
    updatedAt: new Date().toISOString(),
  };
}

function needsOfficialMigration(config: TournamentConfig) {
  if (config.version < OFFICIAL_CONFIG_REVISION) return true;
  if (config.players.length !== 20) return true;
  return config.players.some((player) => {
    const official = STRAND_PLAYERS.find((profile) => profile.id === player.id);
    const expectedTeam: TeamId = OFFICIAL_WIX_IDS.has(player.id) ? "wix" : "jbone";
    const expectedIndex = official?.eventIndex2026 ?? official?.manualIndex;
    return !official || player.teamId !== expectedTeam || expectedIndex === undefined || player.index !== expectedIndex;
  });
}

export async function getLiveConfig(): Promise<TournamentConfig> {
  if (!redisCredentials()) {
    const store = memoryStore();
    if (!store.config) store.config = migrateToOfficialSheet(createInitialTournamentConfig());
    else if (needsOfficialMigration(store.config)) store.config = migrateToOfficialSheet(store.config);
    return store.config;
  }

  const stored = parseJson<TournamentConfig>(await redis().get<string>(CONFIG_KEY));
  if (stored) {
    if (!needsOfficialMigration(stored)) return stored;
    const migrated = migrateToOfficialSheet(stored);
    await redis().set(CONFIG_KEY, JSON.stringify(migrated));
    return migrated;
  }

  const initial = migrateToOfficialSheet(createInitialTournamentConfig());
  await redis().set(CONFIG_KEY, JSON.stringify(initial));
  return initial;
}

export async function setLiveConfig(config: TournamentConfig) {
  if (!redisCredentials()) { memoryStore().config = config; return; }
  await redis().set(CONFIG_KEY, JSON.stringify(config));
}

export async function getLiveScores(config: TournamentConfig): Promise<Record<string, MatchScore>> {
  const matchIds = config.sessions.flatMap((session) => session.matches.map((match) => match.id));
  if (!redisCredentials()) {
    const current = memoryStore().scores;
    return Object.fromEntries(matchIds.filter((id) => current[id]).map((id) => [id, current[id]]));
  }
  const values = await redis().mget<(string | null)[]>(...matchIds.map((id) => `${SCORE_PREFIX}${id}`));
  return Object.fromEntries(matchIds.flatMap((id, index) => {
    const score = parseJson<MatchScore>(values[index]);
    return score ? [[id, score]] : [];
  }));
}

export async function getMatchScore(matchId: string): Promise<MatchScore> {
  if (!redisCredentials()) return memoryStore().scores[matchId] ?? { matchId, holes: {} };
  return parseJson<MatchScore>(await redis().get<string>(`${SCORE_PREFIX}${matchId}`)) ?? { matchId, holes: {} };
}

export async function setMatchScore(score: MatchScore) {
  if (!redisCredentials()) { memoryStore().scores[score.matchId] = score; return; }
  await redis().set(`${SCORE_PREFIX}${score.matchId}`, JSON.stringify(score));
}

export async function resetLiveScores(config: TournamentConfig) {
  const keys = config.sessions.flatMap((session) => session.matches.map((match) => `${SCORE_PREFIX}${match.id}`));
  if (!redisCredentials()) { memoryStore().scores = {}; return; }
  if (keys.length) await redis().del(...keys);
}
