import Image from "next/image";

import { getPlayerPhoto } from "@/lib/player-assets";
import { STRAND_PLAYERS } from "@/lib/players";
import { STUD_BUCKETS_TEAM } from "@/lib/stud-buckets";

const TEAM = STUD_BUCKETS_TEAM.playerIds
  .map((id) => STRAND_PLAYERS.find((player) => player.id === id))
  .filter(Boolean);

export default function TeamHero() {
  return (
    <section className="relative isolate min-h-[900px] overflow-hidden bg-[#071b18] text-white lg:min-h-[840px]">
      <Image
        src="/courses/holes/gamble-sands/hole-02.jpg"
        alt=""
        fill
        preload
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,19,16,.48)_0%,rgba(4,19,16,.72)_48%,#071b18_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(227,154,80,.24),transparent_34%)]" />

      <div className="relative mx-auto flex min-h-[900px] max-w-7xl flex-col justify-between px-5 pb-8 pt-10 sm:px-8 sm:pb-12 sm:pt-14 lg:min-h-[840px] lg:pt-20">
        <div className="grid items-center gap-4 lg:grid-cols-[1.08fr_.72fr] lg:gap-8">
          <div className="order-2 max-w-4xl lg:order-1">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/16 bg-black/25 px-4 py-2.5 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#efbd88] shadow-[0_0_18px_rgba(239,189,136,.8)]" />
              <span>
                <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-[#efbd88]">
                  Brewster Boys only
                </span>
                <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.15em] text-white/38">
                  The Strand · Gamble Sands · 2026
                </span>
              </span>
            </div>
            <h1 className="mt-7 max-w-4xl text-[clamp(3.45rem,8vw,7.4rem)] font-semibold leading-[0.84] tracking-[-0.075em]">
              Ten boys. One job.
              <span className="block text-[#efbd88]">Bring the damn</span>
              thing home.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-white/66 sm:text-lg sm:leading-8">
              Play the smart shot. Back your partner. Make them earn every point.
              That&apos;s the whole plan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#caddie"
                className="rounded-full bg-[#e39a50] px-6 py-3 text-[10px] font-black uppercase tracking-[0.17em] text-[#10251e] transition hover:-translate-y-0.5 hover:bg-[#efbd88]"
              >
                Get the call
              </a>
              <a
                href="#team-metrics"
                className="rounded-full border border-white/22 bg-white/8 px-6 py-3 text-[10px] font-black uppercase tracking-[0.17em] text-white backdrop-blur transition hover:bg-white/14"
              >
                Know your job
              </a>
            </div>
          </div>

          <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <div className="relative">
              <div className="absolute inset-[12%] rounded-full bg-[#e39a50]/20 blur-3xl" />
              <Image
                src="/brand/brewster-boys-cutout.png"
                alt="Brewster Boys team logo"
                width={768}
                height={768}
                loading="eager"
                sizes="(max-width: 640px) 68vw, (max-width: 1024px) 360px, 35vw"
                className="relative h-auto w-[min(68vw,300px)] drop-shadow-[0_28px_50px_rgba(0,0,0,.42)] sm:w-[360px] lg:w-full lg:max-w-[470px]"
              />
              <span className="relative mx-auto -mt-2 block w-fit rounded-full border border-white/14 bg-[#071b18]/82 px-3 py-2 text-[8px] font-bold uppercase tracking-[0.16em] text-white/48 backdrop-blur-md">
                Est. near the first cooler
              </span>
            </div>
          </div>
        </div>

        <div className="mt-14">
          <div className="mb-4 flex items-center justify-between gap-4">
            <span className="text-[8px] font-bold uppercase tracking-[0.18em] text-white/34">
              Official Gamble Sands aerial · Hole 2
            </span>
            <span className="hidden text-[8px] font-bold uppercase tracking-[0.18em] text-white/26 sm:block">
              Play loose · finish strong
            </span>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/12 bg-white/12 sm:grid-cols-4">
            {[
              ["10", "Boys"],
              ["50", "Holes mapped"],
              ["38", "Wins the cup"],
              ["1", "Team"],
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
