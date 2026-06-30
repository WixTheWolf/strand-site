import Link from "next/link";
import DraftBoard from "./draft-board";

export const metadata = {
  title: "Strand Draft Lab | Captain Mock Draft",
  description: "Interactive player map and multi-scenario captain mock draft vs Justin Uribe for Gamble Sands 2026",
};

export default function DraftPage() {
  return (
    <div className="min-h-screen bg-[#f7f3ea] text-[#14352a]">
      <header className="sticky top-0 z-40 border-b border-[#14352a]/10 bg-[#f7f3ea]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="The Strand Invitational logo" className="h-12 w-auto object-contain" />
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-[#14352a]/70">Gamble Sands 2026</div>
              <div className="font-serif text-2xl">Strand Draft Lab</div>
            </div>
          </div>
          <Link
            href="/"
            className="rounded-2xl border border-[#14352a]/15 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
          >
            ← Main site
          </Link>
        </div>
      </header>
      <DraftBoard />
    </div>
  );
}