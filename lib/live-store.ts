import "server-only";

import { Redis } from "@upstash/redis";

import {
  createInitialTournamentConfig,
  type MatchScore,
  type TournamentConfig,
} from "./live-scoring";

const CONFIG_KEY = "strand:2026:live:config:v1";
const SCORE_PREFIX = "strand:2026:live:score:v1:";

type MemoryStore = {
  config?: TournamentConfig;
  scores: Record<string, MatchScore>;
};

declare global {
  var __strandLiveStore: MemoryStore | undefined;
}

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
  sharedRedis ??= Redis.fromEnv({
    automaticDeserialization: false,
    readYourWrites: true,
  });
  return sharedRedis;
}

function parseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function liveStorageMode(): "shared" | "preview" {
  return redisCredentials() ? "shared" : "preview";
}

export async function getLiveConfig(): Promise<TournamentConfig> {
  if (!redisCredentials()) {
    const store = memoryStore();
    if (!store.config) store.config = createInitialTournamentConfig();
    return store.config;
  }
  const stored = parseJson<TournamentConfig>(await redis().get<string>(CONFIG_KEY));
  if (stored) return stored;
  const initial = createInitialTournamentConfig();
  await redis().set(CONFIG_KEY, JSON.stringify(initial));
  return initial;
}

export async function setLiveConfig(config: TournamentConfig) {
  if (!redisCredentials()) {
    memoryStore().config = config;
    return;
  }
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
  if (!redisCredentials()) {
    memoryStore().scores[score.matchId] = score;
    return;
  }
  await redis().set(`${SCORE_PREFIX}${score.matchId}`, JSON.stringify(score));
}

export async function resetLiveScores(config: TournamentConfig) {
  const keys = config.sessions.flatMap((session) => session.matches.map((match) => `${SCORE_PREFIX}${match.id}`));
  if (!redisCredentials()) {
    memoryStore().scores = {};
    return;
  }
  if (keys.length) await redis().del(...keys);
}
