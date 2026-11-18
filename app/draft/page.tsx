import Link from "next/link";
import DraftBoard from "./draft-board";
import DraftHeader from "../components/draft-header";

export const metadata = {
  title: "Draft Lab Archive | The Strand 2026",
  description:
    "The 2026 Strand draft archive — sabermetrics, format projections, pairing optimization, and the pre-draft pick plan, preserved from draft night.",
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
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/60">2026 Archive</div>
            <div className="mt-1 text-sm font-medium uppercase tracking-[0.14em]">
              Drafted July 23 · Team Justin won the cup at Gamble Sands
            </div>
            <Link
              href="/draft/plan"
              className="mt-2 inline-block rounded-xl border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-white/20"
            >
              📋 The WIX pick plan, as written →
            </Link>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/60">2027 Draft</div>
            <div className="mt-1 text-sm font-medium uppercase tracking-[0.14em]">TBA</div>
          </div>
        </div>
      </div>
      <DraftBoard />
    </div>
  );
}
