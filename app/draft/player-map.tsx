"use client";

import { useMemo, useState } from "react";
import {
  GAMBLE_SANDS,
  MAP_BOUNDS,
  PLAYER_LOCATIONS,
  projectToSvg,
} from "@/lib/player-locations";
import type { PlayerDraftStats } from "@/lib/types";
import type { DraftPick, DraftSide } from "@/lib/mock-draft";

const WIDTH = 900;
const HEIGHT = 520;

interface PlayerMapProps {
  players: PlayerDraftStats[];
  picks?: DraftPick[];
  highlightedId?: string | null;
  onSelectPlayer?: (playerId: string) => void;
  interactive?: boolean;
}

function formatIndex(player: PlayerDraftStats) {
  if (player.indexNum !== null) return player.indexNum.toFixed(1);
  if (player.estimatedIndex) return `~${player.estimatedIndex}`;
  return "—";
}

export default function PlayerMap({
  players,
  picks = [],
  highlightedId = null,
  onSelectPlayer,
  interactive = true,
}: PlayerMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<"full" | "socal">("full");

  const draftedMap = useMemo(() => {
    const map = new Map<string, DraftSide>();
    picks.forEach((pick) => map.set(pick.playerId, pick.side));
    return map;
  }, [picks]);

  const bounds = zoom === "socal"
    ? { minLat: 33.4, maxLat: 34.5, minLng: -119.2, maxLng: -117.8 }
    : MAP_BOUNDS;

  const points = useMemo(() => {
    return players
      .map((player) => {
        const loc = PLAYER_LOCATIONS[player.id];
        if (!loc) return null;
        const { x, y } = projectToSvg(loc.lat, loc.lng, bounds, WIDTH, HEIGHT);
        return { player, loc, x, y, side: draftedMap.get(player.id) };
      })
      .filter(Boolean) as Array<{
      player: PlayerDraftStats;
      loc: (typeof PLAYER_LOCATIONS)[string];
      x: number;
      y: number;
      side?: DraftSide;
    }>;
  }, [players, bounds, draftedMap]);

  const tournamentPoint = projectToSvg(
    GAMBLE_SANDS.lat,
    GAMBLE_SANDS.lng,
    bounds,
    WIDTH,
    HEIGHT,
  );

  const activeId = hoveredId ?? highlightedId;

  return (
    <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-[#14352a]/50">Player map</div>
          <h2 className="mt-1 font-serif text-3xl">Where the field lives</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setZoom("full")}
            className={`rounded-xl px-3 py-2 text-xs uppercase tracking-[0.14em] ${
              zoom === "full" ? "bg-[#14352a] text-white" : "border border-[#14352a]/15"
            }`}
          >
            Full map
          </button>
          <button
            onClick={() => setZoom("socal")}
            className={`rounded-xl px-3 py-2 text-xs uppercase tracking-[0.14em] ${
              zoom === "socal" ? "bg-[#14352a] text-white" : "border border-[#14352a]/15"
            }`}
          >
            SoCal cluster
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full min-w-[640px] rounded-[1.5rem] bg-[#e8f0ea]">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#14352a" strokeOpacity="0.06" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width={WIDTH} height={HEIGHT} fill="url(#grid)" />

          {/* Coastline hint */}
          <path
            d="M 40 420 Q 180 360 280 300 T 520 180 T 860 80"
            fill="none"
            stroke="#14352a"
            strokeOpacity="0.12"
            strokeWidth="3"
          />

          {/* Tournament destination */}
          <g transform={`translate(${tournamentPoint.x}, ${tournamentPoint.y})`}>
            <polygon points="0,-14 12,10 -12,10" fill="#14352a" />
            <text y="28" textAnchor="middle" className="fill-[#14352a] text-[11px] font-semibold">
              Gamble Sands
            </text>
          </g>

          {points.map(({ player, loc, x, y, side }) => {
            const isActive = activeId === player.id;
            const isDrafted = Boolean(side);
            const fill =
              side === "mine" ? "#14352a" : side === "justin" ? "#c45c26" : player.heat === "heating" ? "#e85d04" : "#5a8f7b";

            return (
              <g
                key={player.id}
                transform={`translate(${x}, ${y})`}
                className={interactive ? "cursor-pointer" : ""}
                onMouseEnter={() => setHoveredId(player.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => interactive && onSelectPlayer?.(player.id)}
              >
                <circle
                  r={isActive ? 14 : 10}
                  fill={fill}
                  opacity={isDrafted ? 0.95 : 0.88}
                  stroke={isActive ? "#fff" : "white"}
                  strokeWidth={isActive ? 3 : 2}
                />
                <text y="4" textAnchor="middle" className="fill-white text-[9px] font-bold">
                  {player.initials}
                </text>
                {isActive && (
                  <g transform="translate(16, -28)">
                    <rect x="0" y="0" width="148" height="58" rx="10" fill="#14352a" opacity="0.94" />
                    <text x="10" y="18" className="fill-white text-[11px] font-semibold">
                      {player.nickname} • {formatIndex(player)}
                    </text>
                    <text x="10" y="34" className="fill-white/75 text-[10px]">
                      {loc.city}
                    </text>
                    <text x="10" y="48" className="fill-white/60 text-[9px]">
                      #{player.draftRank} • {player.heat}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs uppercase tracking-[0.14em] text-[#14352a]/65">
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#14352a]" /> Your team (WIX)</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#c45c26]" /> Justin (J-BONE)</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#e85d04]" /> Heating up</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#5a8f7b]" /> Available</span>
      </div>
    </div>
  );
}