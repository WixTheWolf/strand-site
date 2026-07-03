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
        username: resolved.match?.username ?? player.grintUsername,
        dataSource: resolved.dataSource,
        grintProfileUrl: resolved.grintProfileUrl,
        ghinNumber: resolved.ghinNumber,
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
  const manual = stats.filter((player) => player.dataSource === "manual").length;
  const missing = stats.filter((player) => player.dataSource === "missing").length;
  const withGrintProfile = stats.filter((player) => player.grintProfileUrl).length;

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    source: `TheGrint / GHIN — ${linked}/20 live${manual ? `, ${manual} captain-verified` : ""}${missing ? `, ${missing} pending link` : ""}`,
    summary: {
      live: linked,
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