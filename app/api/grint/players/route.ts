import { NextResponse } from "next/server";
import { buildPlayerStats, getOptimalDraftOrder, getOptimalTeam, rankPlayers, simulateOptimalDraft } from "@/lib/draft-engine";
import { fetchGhinScores } from "@/lib/ghin";
import { fetchGrintHandicap, fetchGrintScores } from "@/lib/grint";
import { GHIN_ROUNDS_SNAPSHOT } from "@/lib/ghin-snapshot";
import { resolvePlayerGrint } from "@/lib/grint-resolve";
import { ERIC_THERRIEN, STRAND_PLAYERS } from "@/lib/players";
import type { PlayerDraftStats, RecentRound } from "@/lib/types";

/**
 * Last five posted rounds — live GHIN first, then TheGrint, then a captured
 * snapshot so recent form stays visible even when GHIN rate-limits the live
 * lookups (critical for draft day).
 */
async function fetchRecentRounds(
  playerId: string,
  ghinNumber: string | null | undefined,
  grintId: string | null | undefined,
): Promise<{ rounds: RecentRound[]; source: PlayerDraftStats["recentRoundsSource"] }> {
  if (ghinNumber) {
    const ghinRounds = await fetchGhinScores(ghinNumber, 5);
    if (ghinRounds.length) return { rounds: ghinRounds, source: "ghin" };
  }
  if (grintId) {
    const grintRounds = await fetchGrintScores(grintId, 5);
    if (grintRounds.length) return { rounds: grintRounds, source: "grint" };
  }
  const snapshot = GHIN_ROUNDS_SNAPSHOT[playerId];
  if (snapshot?.length) return { rounds: snapshot, source: "ghin" };
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
    const resolved = await resolvePlayerGrint(player);
    const stats = buildPlayerStats(player, resolved.handicap, {
      location: resolved.match?.location,
      username: resolved.match?.username ?? player.grintUsername,
      dataSource: resolved.dataSource,
      grintProfileUrl: resolved.grintProfileUrl,
      ghinNumber: resolved.ghinNumber,
      ghinIndex: resolved.ghinIndex,
    });
    const recent = await fetchRecentRounds(
      player.id,
      resolved.ghinNumber ?? player.ghinNumber,
      player.grintId ?? resolved.match?.id,
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
    if (ERIC_THERRIEN.grintId) {
      blazeHandicap = await fetchGrintHandicap(ERIC_THERRIEN.grintId);
    }
  } catch {
    blazeHandicap = null;
  }

  const linked = stats.filter((player) => player.dataSource === "live").length;
  const ghin = stats.filter((player) => player.dataSource === "ghin").length;
  const manual = stats.filter((player) => player.dataSource === "manual").length;
  const missing = stats.filter((player) => player.dataSource === "missing").length;
  const withGrintProfile = stats.filter((player) => player.grintProfileUrl).length;

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
    },
    players: ranked,
    recommendations,
    optimalTeams: { A: teamA, B: teamB },
    rosterNote: {
      out: ERIC_THERRIEN.name,
      in: "Brian Kerns",
      blazeHandicap,
    },
  });
}