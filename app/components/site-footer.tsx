import Link from "next/link";
import { CHAMPIONS_BOARD } from "@/lib/history";
import Marquee from "./marquee";
import Reveal from "./reveal";

export default function SiteFooter() {
  const championItems = CHAMPIONS_BOARD.map((row) => `🏆 ${row.label} — ${row.winner}`);

  return (
    <footer className="overflow-hidden bg-[#111] text-white">
      <div className="border-b border-white/10">
        <Marquee
          items={championItems}
          speed="44s"
          className="py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white/45"
        />
      </div>
      <div className="mx-auto max-w-[1400px] px-5 pb-10 pt-16 md:px-8 md:pt-24">
        <Reveal>
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="label text-white/40">Strand Invitational</div>
              <p className="mt-2 max-w-sm text-sm text-white/55">
                Gamble Sands · August 20–23, 2026 · Brewster, Washington
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-white/55">
              <Link href="/draft" className="nav-link hover:text-white">
                Draft Lab
              </Link>
              <a href="#travel" className="nav-link hover:text-white">
                The Pass
              </a>
              <a href="#history" className="nav-link hover:text-white">
                Archive
              </a>
              <a
                href="https://www.strandinvitational.life"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link hover:text-white"
              >
                Original site
              </a>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal className="mx-auto max-w-[1400px] px-5 md:px-8">
        <div aria-hidden className="wordmark-outline -mb-[0.16em] whitespace-nowrap text-center">
          THE STRAND
        </div>
      </Reveal>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-5 py-5 text-[11px] uppercase tracking-[0.18em] text-white/30 md:flex-row md:items-center md:justify-between md:px-8">
          <span>Est. 2018 · WIX vs J-BONE</span>
          <span>What would Gord do</span>
        </div>
      </div>
    </footer>
  );
}
