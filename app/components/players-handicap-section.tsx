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

const sourceStyles: Record<PlayerDraftStats["dataSource"], string> = {
  live: "bg-emerald-50 text-emerald-800 border-emerald-200",
  ghin: "bg-blue-50 text-blue-900 border-blue-200",
  manual: "bg-amber-50 text-amber-900 border-amber-200",
  estimated: "bg-sky-50 text-sky-900 border-sky-200",
  missing: "bg-rose-50 text-rose-900 border-rose-200",
};

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
    <section id="players" className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-[#14352a]/60">Players</div>
          <h2 className="mt-2 font-serif text-4xl">The field, with live handicaps</h2>
          <p className="mt-3 max-w-2xl text-[#14352a]/75">
            Handicap indexes pulled from TheGrint / GHIN where linked. GHIN-verified indexes show home club; * marks captain-verified only.
          </p>
        </div>
        <div className="rounded-2xl border border-[#14352a]/10 bg-white px-4 py-3 text-sm text-[#14352a]/70 shadow-sm">
          {source || (error ? "Handicap sync unavailable" : "Loading GHIN data…")}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {STRAND_PLAYERS.map((profile) => {
          const live = playerMap.get(profile.id);
          const index = live ? formatIndex(live) : "…";
          const dataSource = live?.dataSource ?? "missing";

          return (
            <div
              key={profile.id}
              className="overflow-hidden rounded-[1.75rem] border border-[#14352a]/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[#14352a]">
                {getPlayerPhoto(profile.id) ? (
                  <Image
                    src={getPlayerPhoto(profile.id)!}
                    alt={profile.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 640px) 100vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-serif text-5xl text-white/80">
                    {profile.initials}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#14352a]/90 to-transparent px-5 pb-4 pt-16">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/70">{profile.nickname}</div>
                  <div className="font-serif text-2xl text-white">{profile.name}</div>
                </div>
                <div className="absolute right-4 top-4 rounded-2xl bg-white/95 px-3 py-2 text-center shadow">
                  <div className="font-serif text-2xl text-[#14352a]">{index}</div>
                  <div className="text-[10px] uppercase tracking-[0.14em] text-[#14352a]/50">Index</div>
                </div>
              </div>

              <div className="p-6">
              <p className="text-sm leading-6 text-[#14352a]/78">{profile.blurb}</p>

              <div className="mt-4 space-y-2 border-t border-[#14352a]/8 pt-4 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#14352a]/50">TheGrint</span>
                  {live?.grintProfileUrl ? (
                    <a
                      href={live.grintProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate font-medium text-[#14352a] underline decoration-[#14352a]/25"
                    >
                      {live.grintUsernameResolved ?? profile.grintUsername ?? "Profile"}
                    </a>
                  ) : profile.grintId ? (
                    <span className="font-medium">ID {profile.grintId}</span>
                  ) : (
                    <span className="text-[#14352a]/45">Not linked</span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#14352a]/50">GHIN club</span>
                  <span className="text-right">{profile.ghinClub ?? (live?.dataSource === "live" ? "TheGrint linked" : "—")}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#14352a]/50">GHIN #</span>
                  <span className="font-medium">
                    {live?.ghinNumberResolved ?? profile.ghinNumber ?? "Verify at draw"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#14352a]/50">Location</span>
                  <span>{profile.location ?? "—"}</span>
                </div>
              </div>

              {live ? (
                <div className="mt-3">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${sourceStyles[dataSource]}`}>
                    {dataSource}
                  </span>
                </div>
              ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
