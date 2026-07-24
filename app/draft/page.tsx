import Link from "next/link";
import DraftBoard from "./draft-board";
import DraftHeader from "../components/draft-header";
import { Countdown } from "../components/fx";
import { DRAFT_AT } from "@/lib/tournament";

export const metadata = {
  title: "Strand War Room | Captain WIX",
  description:
    "Private captain war room for Gamble Sands 2026 — sabermetrics, format projections, pairing optimization, and live draft simulation.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DraftPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#111]">
      <DraftHeader
        title="Draft Lab"
        extraLink={{ href: "/draft/best-team", label: "Player data" }}
      />
      <div className="bg-[#1a3c34] text-white">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/60">Draft night</div>
            <div className="mt-1 text-sm font-medium uppercase tracking-[0.14em]">
              Thursday, July 23 · 6:00 PM Pacific — J-BONE is on the clock first
            </div>
            <Link
              href="/draft/plan"
              className="mt-2 inline-block rounded-xl border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-white/20"
            >
              📋 WIX pick plan →
            </Link>
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
