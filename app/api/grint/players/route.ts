import { NextResponse } from "next/server";
import { buildPlayerStats, rankPlayers } from "@/lib/draft-engine";
import { buildSaberBoard, completeDraft } from "@/lib/sabermetrics";
import { fetchGhinScores } from "@/lib/ghin";
import { fetchGrintHandicap, fetchGrintScores } from "@/lib/grint";
import { resolvePlayerGrint } from "@/lib/grint-resolve";
import { withPrivateDataLink } from "@/lib/player-data-links";
import { PLAYER_DATA_SNAPSHOT, PLAYER_DATA_SNAPSHOT_CAPTURED_AT } from "@/lib/player-data-snapshot";
import { ERIC_THERRIEN, isCaptain, STRAND_PLAYERS } from "@/lib/players";
import type { PlayerDraftStats, RecentRound } from "@/lib/types";

/**
 * Up to 60 posted rounds — authorized live GHIN first, then TheGrint, then the
 * consented performance-only snapshot. Direct account identifiers never enter
 * the client payload or snapshot.
 */
async function fetchRecentRounds(
  playerId: string,
  ghinNumber: string | null | undefined,
  grintId: string | null | undefined,
): Promise<{ rounds: RecentRound[]; source: PlayerDraftStats["recentRoundsSource"] }> {
  if (ghinNumber) {
    const ghinRounds = await fetchGhinScores(ghinNumber, 60);
    if (ghinRounds.length) return { rounds: ghinRounds, source: "ghin" };
  }
  if (grintId) {
    const grintRounds = await fetchGrintScores(grintId, 60);
    if (grintRounds.length) return { rounds: grintRounds, source: "grint" };
  }
  const snapshot = PLAYER_DATA_SNAPSHOT[playerId]?.rounds;
  if (snapshot?.length) return { rounds: snapshot, source: "snapshot" };
  return { rounds: [], source: null };
}

export const dynamic = "force-dynamic";

/** Run async work over items with a bounded concurrency, preserving order. */
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

/** Strip account and location identifiers from every public API branch. */
function publicPlayer(player: PlayerDraftStats): PlayerDraftStats {
  return {
    ...player,
    email: undefined,
    grintId: null,
    grintUsername: undefined,
    grintSearchTerms: undefined,
    grintLocation: undefined,
    grintUsernameResolved: undefined,
    grintProfileUrl: null,
    location: undefined,
    origin: undefined,
    ghinNumber: null,
    ghinNumberResolved: null,
  };
}

export async function GET() {
  // Resolve players a few at a time — GHIN throttles a 20-way burst of
  // login/search/score requests, which was intermittently blanking the data.
  const stats = await mapLimit(STRAND_PLAYERS, 4, async (player) => {
    const lookupPlayer = withPrivateDataLink(player);
    const resolved = await resolvePlayerGrint(lookupPlayer);
    const snapshot = PLAYER_DATA_SNAPSHOT[player.id];
    const handicap = resolved.handicap ?? snapshot?.handicap ?? null;
    const stats = buildPlayerStats(player, handicap, {
      location: resolved.match?.location,
      username: resolved.match?.username ?? player.grintUsername,
      dataSource: resolved.handicap ? resolved.dataSource : snapshot?.handicap ? "snapshot" : resolved.dataSource,
      grintProfileUrl: resolved.grintProfileUrl,
      ghinNumber: resolved.ghinNumber,
      ghinIndex: resolved.ghinIndex,
      ghinLowIndex: resolved.ghinLowIndex,
      ghinLowIndexDate: resolved.ghinLowIndexDate,
      ghinRevisionDate: resolved.ghinRevisionDate,
      ghinSoftCap: resolved.ghinSoftCap,
      ghinHardCap: resolved.ghinHardCap,
      ghinStatus: resolved.ghinStatus,
    });
    const recent = await fetchRecentRounds(
      player.id,
      resolved.ghinNumber ?? lookupPlayer.ghinNumber,
      lookupPlayer.grintId ?? resolved.match?.id,
    );
    return { ...stats, recentRounds: recent.rounds, recentRoundsSource: recent.source };
  });

  const ranked = rankPlayers(stats);
  const saberBoard = buildSaberBoard(ranked);
  const recommendations = saberBoard
    .filter((metric) => !isCaptain(metric.player.id))
    .map((metric, index) => ({
      pick: index + 1,
      playerId: metric.player.id,
      rationale: metric.evidence.join(" • "),
    }));
  // Official 2026 order: J-BONE has every odd pick; WIX has every even pick.
  const projection = completeDraft(ranked, [], saberBoard);
  const teamA = projection.mine;
  const teamB = projection.opponent;

  let blazeHandicap = null;
  try {
    const blazeLookup = withPrivateDataLink(ERIC_THERRIEN);
    if (blazeLookup.grintId) {
      blazeHandicap = await fetchGrintHandicap(blazeLookup.grintId);
    }
  } catch {
    blazeHandicap = null;
  }

  const linked = stats.filter((player) => player.dataSource === "live").length;
  const ghin = stats.filter((player) => player.dataSource === "ghin").length;
  const snapshot = stats.filter((player) => player.dataSource === "snapshot").length;
  const manual = stats.filter((player) => player.dataSource === "manual").length;
  const missing = stats.filter((player) => player.dataSource === "missing").length;
  const snapshotHandicaps = stats.filter((player) => PLAYER_DATA_SNAPSHOT[player.id]?.handicap).length;
  const withGrintProfile = stats.filter((player) =>
    player.grintProfileUrl || PLAYER_DATA_SNAPSHOT[player.id]?.handicap,
  ).length;
  const roundsLoaded = stats.reduce((sum, player) => sum + (player.recentRounds?.length ?? 0), 0);
  const withRounds = stats.filter((player) => (player.recentRounds?.length ?? 0) > 0).length;
  const withCourseRatings = stats.filter((player) =>
    player.recentRounds?.some((round) => round.courseRating != null && round.slopeRating != null),
  ).length;
  const withShotStats = stats.filter((player) =>
    player.recentRounds?.some((round) => round.shotStats != null),
  ).length;
  const liveRoundPlayers = stats.filter((player) =>
    player.recentRoundsSource === "ghin" || player.recentRoundsSource === "grint",
  ).length;
  const snapshotRoundPlayers = stats.filter((player) => player.recentRoundsSource === "snapshot").length;
  const aggregateRoundPlayers = stats.filter((player) => player.reportedScoring?.sampleSize).length;
  const aggregateRoundsReported = stats.reduce(
    (sum, player) => sum + (player.reportedScoring?.sampleSize ?? 0),
    0,
  );
  const withScoringEvidence = stats.filter(
    (player) => (player.recentRounds?.length ?? 0) > 0 || (player.reportedScoring?.sampleSize ?? 0) > 0,
  ).length;
  const eventHandicapPlayers = stats.filter((player) => player.eventIndex2026 !== undefined).length;

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    source: `2026 roster sheet / TheGrint / GHIN / Garmin — ${eventHandicapPlayers}/20 event handicaps locked, ${ghin}/20 GHIN-verified, ${roundsLoaded} scorecards + ${aggregateRoundsReported} aggregate rounds`,
    summary: {
      live: linked,
      ghin,
      snapshot,
      manual,
      missing,
      withGrintProfile,
      snapshotHandicaps,
      snapshotCapturedAt: PLAYER_DATA_SNAPSHOT_CAPTURED_AT,
      withGhin: stats.filter((p) => p.ghinNumberResolved).length,
      withRounds,
      roundsLoaded,
      withCourseRatings,
      withShotStats,
      liveRoundPlayers,
      snapshotRoundPlayers,
      aggregateRoundPlayers,
      aggregateRoundsReported,
      withScoringEvidence,
      eventHandicapPlayers,
    },
    // Account IDs and contact/profile metadata are identifiers, not
    // performance metrics. Keep them server-side even when live lookups
    // resolve successfully.
    players: ranked.map(publicPlayer),
    recommendations,
    optimalTeams: { A: teamA.map(publicPlayer), B: teamB.map(publicPlayer) },
    rosterNote: {
      out: ERIC_THERRIEN.name,
      in: "Brian Kerns",
      blazeHandicap,
    },
  });
}
