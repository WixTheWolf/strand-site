import { NextResponse } from "next/server";
import {
  getLiveConfig,
  getLiveScores,
  getMatchScore,
  liveStorageMode,
  resetLiveScores,
  setLiveConfig,
  setMatchScore,
} from "@/lib/live-store";
import {
  validateTournamentConfig,
  type HoleScore,
  type TournamentConfig,
} from "@/lib/live-scoring";

export const dynamic = "force-dynamic";

function noStore<T>(payload: T, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

function cleanNumber(value: unknown): number | null {
  if (value === null || value === "" || value === undefined) return null;
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 20 ? number : null;
}

function sanitizeHole(input: unknown, allowedPlayerIds: string[]): HoleScore {
  const raw = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const playerGrossInput = raw.playerGross && typeof raw.playerGross === "object"
    ? raw.playerGross as Record<string, unknown>
    : {};
  const teamGrossInput = raw.teamGross && typeof raw.teamGross === "object"
    ? raw.teamGross as Record<string, unknown>
    : {};
  const selectedDrive = typeof raw.selectedDrivePlayerId === "string" && allowedPlayerIds.includes(raw.selectedDrivePlayerId)
    ? raw.selectedDrivePlayerId
    : null;
  return {
    playerGross: Object.fromEntries(allowedPlayerIds.map((id) => [id, cleanNumber(playerGrossInput[id])])),
    teamGross: { wix: cleanNumber(teamGrossInput.wix), jbone: cleanNumber(teamGrossInput.jbone) },
    selectedDrivePlayerId: selectedDrive,
  };
}

function adminAuthorized(pin: unknown) {
  const expected = process.env.STRAND_SCORING_ADMIN_PIN;
  if (!expected && liveStorageMode() === "preview") return pin === "preview";
  return Boolean(expected && typeof pin === "string" && pin === expected);
}

export async function GET() {
  try {
    const config = await getLiveConfig();
    const scores = await getLiveScores(config);
    return noStore({
      config,
      scores,
      storageMode: liveStorageMode(),
      polledAt: new Date().toISOString(),
    });
  } catch (error) {
    return noStore({ error: error instanceof Error ? error.message : "Unable to load live scoring." }, 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const action = body.action;
    const config = await getLiveConfig();

    if (action === "update-hole") {
      const matchId = typeof body.matchId === "string" ? body.matchId : "";
      const hole = Number(body.hole);
      const match = config.sessions.flatMap((session) => session.matches).find((item) => item.id === matchId);
      if (!match || !Number.isInteger(hole) || hole < 1 || hole > 18) return noStore({ error: "Invalid match or hole." }, 400);
      const score = await getMatchScore(matchId);
      const allowedPlayerIds = [...match.teamWixPlayerIds, ...match.teamJbonePlayerIds];
      score.holes[hole] = sanitizeHole(body.score, allowedPlayerIds);
      score.scorerName = typeof body.scorerName === "string" ? body.scorerName.trim().slice(0, 40) : score.scorerName;
      score.updatedAt = new Date().toISOString();
      await setMatchScore(score);
      const session = config.sessions.find((item) => item.id === match.sessionId);
      if (!session) return noStore({ error: "Session not found." }, 500);
      return noStore({ ok: true, score, storageMode: liveStorageMode() });
    }

    if (action === "replace-config") {
      if (!adminAuthorized(body.pin)) return noStore({ error: "Captain PIN required." }, 401);
      const next = body.config as TournamentConfig;
      const errors = validateTournamentConfig(next);
      if (errors.length) return noStore({ error: "Schedule validation failed.", details: errors }, 400);
      next.version = config.version + 1;
      next.updatedAt = new Date().toISOString();
      await setLiveConfig(next);
      return noStore({ ok: true, config: next, storageMode: liveStorageMode() });
    }

    if (action === "reset-scores") {
      if (!adminAuthorized(body.pin)) return noStore({ error: "Captain PIN required." }, 401);
      await resetLiveScores(config);
      return noStore({ ok: true, storageMode: liveStorageMode() });
    }

    return noStore({ error: "Unknown scoring action." }, 400);
  } catch (error) {
    return noStore({ error: error instanceof Error ? error.message : "Unable to update live scoring." }, 500);
  }
}
