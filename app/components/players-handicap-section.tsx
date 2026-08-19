"use client";

import Image from "next/image";
import { getPlayerPhoto } from "@/lib/player-assets";
import { STRAND_PLAYERS } from "@/lib/players";
import { TiltCard } from "./fx";
import Reveal from "./reveal";

export default function PlayersHandicapSection() {
  return (
    <section id="players" className="divider bg-white">
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
        <Reveal className="mb-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="label">Players</p>
              <h2 className="section-title mt-3">The official field</h2>
            </div>
            <p className="max-w-md text-xs leading-5 text-black/40">
              Tournament indexes from the final Strand 2026 event sheet. GHIN handicaps update daily; these remain the official site values until a newer event sheet is issued.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-px bg-[#e2ddd3] sm:grid-cols-2 lg:grid-cols-4">
          {STRAND_PLAYERS.map((profile, i) => {
            const index = profile.eventIndex2026 !== undefined ? profile.eventIndex2026.toFixed(1) : "—";
            return (
              <Reveal key={profile.id} delay={(i % 4) * 70} className="bg-white">
                <TiltCard className="h-full">
                  <article className="group h-full bg-white">
                    <div className="relative aspect-[3/4] overflow-hidden bg-[#111]">
                      {getPlayerPhoto(profile.id) ? (
                        <Image src={getPlayerPhoto(profile.id)!} alt={profile.name} fill className={`photo-tone object-cover transition duration-500 group-hover:scale-[1.04] ${profile.id === "brian-kerns" ? "object-center scale-110" : "object-top"}`} sizes="(max-width: 640px) 100vw, 25vw" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl font-medium text-white/30">{profile.initials}</div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-12">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/50">{profile.nickname}</p>
                        <h3 className="text-lg font-medium text-white">{profile.name}</h3>
                      </div>
                      <div className="absolute right-3 top-3 bg-white px-2.5 py-1.5 text-center">
                        <div className="text-lg font-medium leading-none">{index}</div>
                        <div className="text-[9px] uppercase tracking-[0.12em] text-black/40">Event HI</div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs leading-relaxed text-black/55 line-clamp-3">{profile.blurb}</p>
                    </div>
                  </article>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
