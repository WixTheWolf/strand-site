import Image from "next/image";

import { getPlayerPhoto } from "@/lib/player-assets";
import { STRAND_PLAYERS } from "@/lib/players";
import { STUD_BUCKETS_TEAM } from "@/lib/stud-buckets";

const TEAM = STUD_BUCKETS_TEAM.playerIds
  .map((id) => STRAND_PLAYERS.find((player) => player.id === id))
  .filter(Boolean);

export default function TeamHero() {
  return (
    <section className="relative isolate min-h-[760px] overflow-hidden bg-[#071b18] text-white sm:min-h-[820px]">
      <Image
        src="/courses/scarecrow.jpg"
        alt=""
        fill
        preload
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,19,16,.2)_0%,rgba(4,19,16,.56)_42%,#071b18_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(227,154,80,.18),transparent_34%)]" />

      <div className="relative mx-auto flex min-h-[760px] max-w-7xl flex-col justify-between px-5 pb-8 pt-24 sm:min-h-[820px] sm:px-8 sm:pb-12 sm:pt-32">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-black/20 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#e39a50]" />
            Stud Buckets eyes only
          </div>
          <h1 className="mt-7 max-w-4xl text-[clamp(3.7rem,10vw,8.6rem)] font-semibold leading-[0.82] tracking-[-0.075em]">
            Win the trip
            <span className="block text-[#efbd88]">before J‑BONE</span>
            finds the snacks.
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-white/66 sm:text-lg sm:leading-8">
            A private 50-hole caddie, ten-man field manual and scientifically irresponsible amount
            of confidence. The golf advice is real. The emotional stability is still being tested.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#caddie"
              className="rounded-full bg-[#e39a50] px-6 py-3 text-[10px] font-black uppercase tracking-[0.17em] text-[#10251e] transition hover:-translate-y-0.5 hover:bg-[#efbd88]"
            >
              Open the caddie
            </a>
            <a
              href="#team-metrics"
              className="rounded-full border border-white/22 bg-white/8 px-6 py-3 text-[10px] font-black uppercase tracking-[0.17em] text-white backdrop-blur transition hover:bg-white/14"
            >
              Meet the questionable experts
            </a>
          </div>
        </div>

        <div className="mt-14">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/12 bg-white/12 sm:grid-cols-4">
            {[
              ["10", "Buckets"],
              ["50", "Holes decoded"],
              ["38", "Points to glory"],
              ["0", "Hero doubles allowed"],
            ].map(([value, label]) => (
              <div key={label} className="bg-[#071b18]/82 p-4 backdrop-blur-xl sm:p-5">
                <div className="font-mono text-3xl font-semibold text-[#efbd88]">{value}</div>
                <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.15em] text-white/38">
                  {label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
            {TEAM.map((player) => {
              if (!player) return null;
              const photo = getPlayerPhoto(player.id);
              return (
                <a
                  key={player.id}
                  href="#team-metrics"
                  className="group relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/12 bg-white/8 sm:h-28 sm:w-24"
                  aria-label={`View ${player.nickname}'s team assignment`}
                >
                  {photo ? (
                    <Image
                      src={photo}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-cover object-top grayscale-[25%] transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071b18] via-transparent to-transparent" />
                  <span className="absolute inset-x-1 bottom-2 text-center text-[8px] font-black uppercase tracking-[0.12em] text-white">
                    {player.nickname}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
