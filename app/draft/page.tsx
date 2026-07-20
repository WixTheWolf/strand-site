import DraftBoard from "./draft-board";
import DraftHeader from "../components/draft-header";
import { Countdown } from "../components/fx";

// Draft night: Thursday, July 23 at 5:00 PM Pacific — J-BONE won the flip
const DRAFT_AT = new Date("2026-07-23T17:00:00-07:00").getTime();

export const metadata = {
  title: "Strand Draft Lab | Captain Mock Draft",
  description:
    "Interactive captain mock draft vs Justin Uribe for Gamble Sands 2026 — skill graphs, scenarios, and live TheGrint handicaps.",
};

export default function DraftPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#111]">
      <DraftHeader
        title="Draft Lab"
        extraLink={{ href: "/draft/best-team", label: "Best team" }}
      />
      <div className="bg-[#1a3c34] text-white">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/60">Draft night</div>
            <div className="mt-1 text-sm font-medium uppercase tracking-[0.14em]">
              Thursday, July 23 · 5:00 PM Pacific — J-BONE is on the clock first
            </div>
          </div>
          <Countdown
            target={DRAFT_AT}
            doneText="On the clock — J-BONE is up"
            caption={["Until the", "draft"]}
            ariaLabel="Countdown to the draft"
          />
        </div>
      </div>
      <DraftBoard />
    </div>
  );
}
