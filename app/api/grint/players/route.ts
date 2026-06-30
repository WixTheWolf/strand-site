import { NextResponse } from "next/server";
import { buildPlayerStats, getOptimalDraftOrder, getOptimalTeam, rankPlayers } from "@/lib/draft-engine";
import { fetchGrintHandicap } from "@/lib/grint";
import { resolvePlayerGrint } from "@/lib/grint-resolve";
import { ERIC_THERRIEN, STRAND_PLAYERS } from "@/lib/players";

export const dynamic = "force-dynamic";

export async function GET() {
  const stats = await Promise.all(
    STRAND_PLAYERS.map(async (player) => {
      const resolved = await resolvePlayerGrint(player);
      return buildPlayerStats(player, resolved.handicap, {
        location: resolved.match?.location,
        username: resolved.match?.username,
        dataSource: resolved.dataSource,
      });
    }),
  );

  const ranked = rankPlayers(stats);
  const recommendations = getOptimalDraftOrder(stats);
  const teamA = getOptimalTeam(stats, "A");
  const teamB = getOptimalTeam(stats, "B");

  let blazeHandicap = null;
  try {
    if (ERIC_THERRIEN.grintId) {
      blazeHandicap = await fetchGrintHandicap(ERIC_THERRIEN.grintId);
    }
  } catch {
    blazeHandicap = null;
  }

  const linked = stats.filter((player) => player.dataSource === "live").length;

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    source: `TheGrint / GHIN — ${linked}/20 players linked`,
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