import { NextResponse } from "next/server";
import { buildPlayerStats, getOptimalDraftOrder, getOptimalTeam, rankPlayers, simulateOptimalDraft } from "@/lib/draft-engine";
import { fetchGhinScores } from "@/lib/ghin";
import { fetchGrintHandicap, fetchGrintScores } from "@/lib/grint";
import { resolvePlayerGrint } from "@/lib/grint-resolve";
import { withPrivateDataLink } from "@/lib/player-data-links";
import { ERIC_THERRIEN, STRAND_PLAYERS } from "@/lib/players";
import type { PlayerDraftStats, RecentRound } from "@/lib/types";

/**
 * Up to 60 posted rounds — live GHIN first, then TheGrint. Historical rounds
 * are never checked into source; they only flow from an authorized live
 * account connection.
 */
async function fetchRecentRounds(
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

export async function GET() {
  // Resolve players a few at a time — GHIN throttles a 20-way burst of
  // login/search/score requests, which was intermittently blanking the data.
  const stats = await mapLimit(STRAND_PLAYERS, 4, async (player) => {
    const lookupPlayer = withPrivateDataLink(player);
    const resolved = await resolvePlayerGrint(lookupPlayer);
    const stats = buildPlayerStats(player, resolved.handicap, {
      location: resolved.match?.location,
      username: resolved.match?.username ?? player.grintUsername,
      dataSource: resolved.dataSource,
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
      resolved.ghinNumber ?? lookupPlayer.ghinNumber,
      lookupPlayer.grintId ?? resolved.match?.id,
    );
    return { ...stats, recentRounds: recent.rounds, recentRoundsSource: recent.source };
  });

  const ranked = rankPlayers(stats);
  const recommendations = getOptimalDraftOrder(stats);
  const simulation = simulateOptimalDraft(stats, true);
  const teamA = getOptimalTeam(stats, "A", simulation);
  const teamB = getOptimalTeam(stats, "B", simulation);

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
  const manual = stats.filter((player) => player.dataSource === "manual").length;
  const missing = stats.filter((player) => player.dataSource === "missing").length;
  const withGrintProfile = stats.filter((player) => player.grintProfileUrl).length;
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

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    source: `TheGrint / GHIN — ${linked}/20 live, ${ghin}/20 GHIN-verified${manual ? `, ${manual} manual` : ""}${missing ? `, ${missing} pending` : ""}`,
    summary: {
      live: linked,
      ghin,
      manual,
      missing,
      withGrintProfile,
      withGhin: stats.filter((p) => p.ghinNumberResolved).length,
      withRounds,
      roundsLoaded,
      withCourseRatings,
      withShotStats,
      liveRoundPlayers,
      snapshotRoundPlayers,
    },
    // Account IDs and contact/profile metadata are identifiers, not
    // performance metrics. Keep them server-side even when live lookups
    // resolve successfully.
    players: ranked.map((player) => ({
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
    })),
    recommendations,
    optimalTeams: { A: teamA, B: teamB },
    rosterNote: {
      out: ERIC_THERRIEN.name,
      in: "Brian Kerns",
      blazeHandicap,
    },
  });
}
