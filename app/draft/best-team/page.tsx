import Link from "next/link";
import BestTeamView from "../best-team-view";

export const metadata = {
  title: "Best Team | Strand Draft Lab",
  description: "Optimal WIX snake-draft roster and full player data sheet for Gamble Sands 2026",
};

export default function BestTeamPage() {
  return (
    <div className="min-h-screen bg-[#f7f3ea] text-[#14352a]">
      <header className="sticky top-0 z-40 border-b border-[#14352a]/10 bg-[#f7f3ea]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="The Strand Invitational logo" className="h-12 w-auto object-contain" />
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-[#14352a]/70">Gamble Sands 2026</div>
              <div className="font-serif text-2xl">Best Team</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/draft"
              className="rounded-2xl border border-[#14352a]/15 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
            >
              Mock draft
            </Link>
            <Link
              href="/"
              className="rounded-2xl border border-[#14352a]/15 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
            >
              Main site
            </Link>
          </div>
        </div>
      </header>
      <BestTeamView />
    </div>
  );
}