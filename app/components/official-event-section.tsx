import Reveal from "./reveal";
import {
  ON_COURSE_COMPETITIONS,
  ON_COURSE_RULES,
  PAYOUTS,
  ROOM_ASSIGNMENTS,
  ROUND_FORMATS,
  TEE_GIFT_COST,
  TOURNAMENT_BUY_IN,
  TOURNAMENT_POT,
} from "@/lib/tournament";

export default function OfficialEventSection() {
  return (
    <section id="official-rules" className="divider bg-[#0e2a23] text-white">
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
        <Reveal className="max-w-3xl">
          <p className="label text-[#efbd88]">Final 2026 Event Sheet</p>
          <h2 className="section-title mt-3 text-white">If the group chat disagrees with this, the group chat loses.</h2>
          <p className="mt-4 text-sm leading-6 text-white/60">
            Official Strand weekend rules, schedule and money. QuickSands Thursday is a 14-hole par-3 warm-up and is not Strand sanctioned. The four rounds below are the tournament.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-3 lg:grid-cols-2">
          {ROUND_FORMATS.map((round) => (
            <article key={round.round} className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#efbd88]">Round {round.round}</p>
                  <h3 className="mt-1 text-xl font-bold">{round.format} · {round.course}</h3>
                  <p className="mt-1 text-xs text-white/45">{round.day}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-2 font-mono text-xs font-black text-[#10201b]">{round.teeTime}</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/62">{round.note}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-3 lg:grid-cols-3">
          <article className="rounded-2xl border border-white/10 bg-white/[0.055] p-5 lg:col-span-2">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#efbd88]">On-course contests</p>
            <div className="mt-4 space-y-3">
              {ON_COURSE_COMPETITIONS.map((item) => <p key={item} className="text-sm leading-6 text-white/65">• {item}</p>)}
            </div>
            <div className="mt-5 rounded-xl bg-[#efbd88] p-4 text-[#10201b]">
              <p className="text-[10px] font-black uppercase tracking-[0.17em]">Do not screw this up</p>
              <p className="mt-1 text-sm font-black">Closest-to-pin = PAR 3s only. Friday morning: all 4 at Gamble Sands. Saturday morning: all 5 at Scarecrow. Nine total.</p>
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#efbd88]">Money</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-white/55">Tee gift</span><strong>${TEE_GIFT_COST}</strong></div>
              <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-white/55">Buy-in / man</span><strong>${TOURNAMENT_BUY_IN}</strong></div>
              <div className="flex justify-between"><span className="text-white/55">Tournament pot</span><strong>${TOURNAMENT_POT.toLocaleString()}</strong></div>
            </div>
            <div className="mt-5 space-y-2">
              {PAYOUTS.map((item) => (
                <div key={item.category} className="rounded-xl bg-black/20 p-3">
                  <p className="text-xs text-white/50">{item.category}</p>
                  <p className="mt-0.5 text-sm font-bold">{item.payout}</p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="mt-10 grid gap-3 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#efbd88]">Custom Strand rules</p>
            <div className="mt-4 space-y-3">
              {ON_COURSE_RULES.map((rule) => <p key={rule} className="text-sm leading-6 text-white/65">• {rule}</p>)}
            </div>
            <div className="mt-5 rounded-xl bg-black/25 p-4 text-sm font-bold leading-6 text-[#f5d8b9]">
              Last group picks up the stakes / markers. Every scorecard goes to Justin after the round. Future historians deserve paperwork.
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#efbd88]">Rooms · new lodging near Scarecrow</p>
            <p className="mt-2 text-xs leading-5 text-white/45">Double King Rooms · shuttles between courses.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {ROOM_ASSIGNMENTS.map((room, index) => (
                <div key={room} className="rounded-xl bg-black/20 p-3 text-sm"><span className="mr-2 font-mono text-[#efbd88]">{index + 1}.</span>{room}</div>
              ))}
            </div>
            <p className="mt-4 text-xs text-white/45">Sunday checkout: <strong className="text-white">11:00 AM</strong>. Departure logistics discussed in person.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
