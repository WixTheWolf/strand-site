import "server-only";

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
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

async function redisCommand<T>(command: (string | number)[]): Promise<T> {
  const credentials = redisCredentials();
  if (!credentials) throw new Error("Shared live scoring storage is not configured.");
  const response = await fetch(credentials.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${credentials.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Live scoring storage returned ${response.status}.`);
  const payload = await response.json() as { result?: T; error?: string };
  if (payload.error) throw new Error(payload.error);
  return payload.result as T;
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
  const stored = parseJson<TournamentConfig>(await redisCommand<string | null>(["GET", CONFIG_KEY]));
  if (stored) return stored;
  const initial = createInitialTournamentConfig();
  await redisCommand(["SET", CONFIG_KEY, JSON.stringify(initial)]);
  return initial;
}

export async function setLiveConfig(config: TournamentConfig) {
  if (!redisCredentials()) {
    memoryStore().config = config;
    return;
  }
  await redisCommand(["SET", CONFIG_KEY, JSON.stringify(config)]);
}

export async function getLiveScores(config: TournamentConfig): Promise<Record<string, MatchScore>> {
  const matchIds = config.sessions.flatMap((session) => session.matches.map((match) => match.id));
  if (!redisCredentials()) {
    const current = memoryStore().scores;
    return Object.fromEntries(matchIds.filter((id) => current[id]).map((id) => [id, current[id]]));
  }
  const values = await redisCommand<(string | null)[]>(["MGET", ...matchIds.map((id) => `${SCORE_PREFIX}${id}`)]);
  return Object.fromEntries(matchIds.flatMap((id, index) => {
    const score = parseJson<MatchScore>(values[index]);
    return score ? [[id, score]] : [];
  }));
}

export async function getMatchScore(matchId: string): Promise<MatchScore> {
  if (!redisCredentials()) return memoryStore().scores[matchId] ?? { matchId, holes: {} };
  return parseJson<MatchScore>(await redisCommand<string | null>(["GET", `${SCORE_PREFIX}${matchId}`])) ?? { matchId, holes: {} };
}

export async function setMatchScore(score: MatchScore) {
  if (!redisCredentials()) {
    memoryStore().scores[score.matchId] = score;
    return;
  }
  await redisCommand(["SET", `${SCORE_PREFIX}${score.matchId}`, JSON.stringify(score)]);
}

export async function resetLiveScores(config: TournamentConfig) {
  const keys = config.sessions.flatMap((session) => session.matches.map((match) => `${SCORE_PREFIX}${match.id}`));
  if (!redisCredentials()) {
    memoryStore().scores = {};
    return;
  }
  if (keys.length) await redisCommand(["DEL", ...keys]);
}
