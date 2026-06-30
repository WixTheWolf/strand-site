import { NextResponse } from "next/server";
import { buildPlayerStats, getOptimalDraftOrder, getOptimalTeam, rankPlayers } from "@/lib/draft-engine";
import { fetchGrintHandicap } from "@/lib/grint";
import { ERIC_THERRIEN, STRAND_PLAYERS } from "@/lib/players";

export const dynamic = "force-dynamic";

export async function GET() {
  const stats = await Promise.all(
    STRAND_PLAYERS.map(async (player) => {
      if (!player.grintId) {
        return buildPlayerStats(player, null);
      }

      try {
        const handicap = await fetchGrintHandicap(player.grintId);
        return buildPlayerStats(player, handicap);
      } catch {
        return buildPlayerStats(player, null);
      }
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

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    source: "TheGrint live handicap lookup",
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