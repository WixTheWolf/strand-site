"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { getPlayerPhoto } from "@/lib/player-assets";
import { STRAND_PLAYERS } from "@/lib/players";
import type { PlayerDraftStats } from "@/lib/types";

function formatIndex(player: PlayerDraftStats) {
  if (player.indexNum !== null) return player.indexNum.toFixed(1);
  if (player.estimatedIndex) return `~${player.estimatedIndex}`;
  if (player.manualIndex !== undefined) return `${player.manualIndex.toFixed(1)}*`;
  return "—";
}

export default function PlayersHandicapSection() {
  const [players, setPlayers] = useState<PlayerDraftStats[] | null>(null);
  const [source, setSource] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/grint/players")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load handicaps");
        return res.json();
      })
      .then((data) => {
        setPlayers(data.players);
        setSource(data.source);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  const playerMap = useMemo(() => {
    const map = new Map<string, PlayerDraftStats>();
    players?.forEach((player) => map.set(player.id, player));
    return map;
  }, [players]);

  return (
    <section id="players" className="divider bg-white">
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label">Players</p>
            <h2 className="section-title mt-3">The field</h2>
          </div>
          <p className="text-xs text-black/40">
            {source || (error ? "Handicap sync unavailable" : "Loading GHIN data…")}
          </p>
        </div>

        <div className="grid gap-px bg-[#e2ddd3] sm:grid-cols-2 lg:grid-cols-4">
          {STRAND_PLAYERS.map((profile) => {
            const live = playerMap.get(profile.id);
            const index = live ? formatIndex(live) : "…";

            return (
              <article key={profile.id} className="group bg-white">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#111]">
                  {getPlayerPhoto(profile.id) ? (
                    <Image
                      src={getPlayerPhoto(profile.id)!}
                      alt={profile.name}
                      fill
                      className={`object-cover transition duration-500 group-hover:scale-[1.03] ${profile.id === "brian-kerns" ? "object-center scale-110" : "object-top"}`}
                      sizes="(max-width: 640px) 100vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl font-medium text-white/30">
                      {profile.initials}
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-12">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/50">
                      {profile.nickname}
                    </p>
                    <h3 className="text-lg font-medium text-white">{profile.name}</h3>
                  </div>
                  <div className="absolute right-3 top-3 bg-white px-2.5 py-1.5 text-center">
                    <div className="text-lg font-medium leading-none">{index}</div>
                    <div className="text-[9px] uppercase tracking-[0.12em] text-black/40">Index</div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs leading-relaxed text-black/55 line-clamp-3">{profile.blurb}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
