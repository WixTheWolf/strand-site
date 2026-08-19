import Link from "next/link";
import DraftHeader from "../../components/draft-header";
import { PLAYER_READS, PICK_PLAN, PLAN_META } from "@/lib/scouting-report";

export const metadata = {
  title: "WIX Draft Plan | Strand War Room",
  description: "Pre-draft scouting capsules and the even-pick plan for the 2026 captain draft.",
  robots: { index: false, follow: false },
};

const tierStyles: Record<string, string> = {
  "take-now": "border-emerald-300 bg-emerald-50 text-emerald-900",
  target: "border-amber-300 bg-amber-50 text-amber-900",
  value: "border-sky-300 bg-sky-50 text-sky-900",
  late: "border-stone-300 bg-stone-100 text-stone-700",
  avoid: "border-rose-200 bg-rose-50 text-rose-800",
};

export default function DraftPlanPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#111]">
      <DraftHeader title="WIX Draft Plan" extraLink={{ href: "/draft", label: "War room" }} />
      <div className="mx-auto max-w-5xl px-5 py-10 md:px-8">
        <p className="label">Captain&apos;s scouting card</p>
        <h1 className="section-title mt-3">The even-pick plan</h1>
        <p className="mt-3 max-w-3xl text-sm text-black/55">{PLAN_META.summary}</p>
        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-black/40">
          Model {PLAN_META.model} · data through {PLAN_META.dataThrough} · handicaps locked to the 2026 roster sheet
        </p>

        <h2 className="mt-10 text-xl font-medium">Round-by-round targets (WIX picks 2, 4, 6 … 18)</h2>
        <div className="mt-4 space-y-3">
          {PICK_PLAN.map((round) => (
            <div key={round.pick} className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="text-sm font-semibold uppercase tracking-[0.14em]">Pick #{round.pick}</div>
                <div className="text-xs text-black/45">{round.context}</div>
              </div>
              <div className="mt-2 text-lg font-medium">{round.primary}</div>
              <div className="mt-1 text-sm text-black/60">{round.rationale}</div>
              <div className="mt-2 text-xs text-black/50">
                <span className="font-semibold uppercase tracking-[0.12em]">Fallbacks:</span> {round.fallbacks}
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-12 text-xl font-medium">Player capsules (board order)</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {PLAYER_READS.map((read) => (
            <div key={read.nickname} className={`rounded-[1.5rem] border p-5 ${tierStyles[read.tier] ?? tierStyles.late}`}>
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-base font-semibold">{read.nickname}</div>
                <div className="font-mono text-sm">{read.index}</div>
              </div>
              <div className="mt-1 text-xs uppercase tracking-[0.16em] opacity-70">{read.headline}</div>
              <p className="mt-2 text-sm leading-relaxed opacity-90">{read.capsule}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-black/55">
          Live picks still run through the{" "}
          <Link href="/draft" className="underline">
            war room
          </Link>{" "}
          — its decision desk re-ranks after every selection. This page is the pre-committed plan so the room can&apos;t
          rattle you.
        </p>
      </div>
    </div>
  );
}
