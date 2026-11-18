import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import CoursesSection from "./components/courses-section";
import { BackToTop, CountUp, Magnetic, ScrollProgress } from "./components/fx";
import { AmbienceToggle, CartJumpScene, HeroFilmLayer, LipOutScene, TeaserPlayer, TeeShotScene } from "./components/golf-cinema";
import HistorySection from "./components/history-section";
import Marquee from "./components/marquee";
import OfficialEventSection from "./components/official-event-section";
import PlayersHandicapSection from "./components/players-handicap-section";
import Reveal from "./components/reveal";
import RosterCard from "./components/roster-card";
import SiteFooter from "./components/site-footer";
import SiteHeader from "./components/site-header";
import TravelSection from "./components/travel-section";
import { CHAMPIONS_BOARD } from "@/lib/history";
import { rosterPlayers, STRAND_2026, TEAM_JUSTIN_2026_IDS, TEAM_WIX_2026_IDS } from "@/lib/strand-2026";
import { ROUND_FORMATS } from "@/lib/tournament";

const HERO_IMAGE = "/courses/gamble-sands.jpg";

const TICKER_ITEMS = [
  "The Strand Invitational",
  "2026 Champions · Team J-Bone",
  "Gamble Sands · Brewster WA",
  "Nine editions down",
  "2027 · The 10-Year Strand",
  "Destination TBA",
];

const ROUND_PHOTOS: Record<number, string> = {
  1: "/courses/holes/gamble-sands/hole-01.jpg",
  2: "/courses/holes/scarecrow/hole-02.jpg",
  3: "/courses/holes/scarecrow/hole-17.jpg",
  4: "/courses/holes/gamble-sands/hole-18.jpg",
};

function HeroLine({ text, base }: { text: string; base: number }) {
  return (
    <span className="hero-line" aria-hidden>
      {Array.from(text).map((char, i) => (
        <span key={`${char}-${i}`} className="hero-letter" style={{ "--d": `${base + i * 28}ms` } as CSSProperties}>
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

function PinFlag({ className, tone = "gold" }: { className?: string; tone?: "gold" | "white" }) {
  const flag = tone === "gold" ? "#c9a227" : "#f7f5f0";
  return (
    <svg viewBox="0 0 64 120" width={38} height={72} className={className} aria-hidden>
      <rect x="30" y="4" width="3" height="104" rx="1.5" fill="currentColor" opacity="0.65" />
      <path className="flag-wave" d="M33 8 L60 16 L33 26 Z" fill={flag} />
      <ellipse cx="31.5" cy="112" rx="14" ry="4" fill="currentColor" opacity="0.18" />
      <ellipse cx="31.5" cy="112" rx="6" ry="2.2" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

export default function HomePage() {
  const teamJustin = rosterPlayers(TEAM_JUSTIN_2026_IDS);
  const teamWix = rosterPlayers(TEAM_WIX_2026_IDS);
  const championsAsc = [...CHAMPIONS_BOARD].sort((a, b) => a.year - b.year);

  return (
    <>
      <ScrollProgress />
      <SiteHeader />
      <main className="bg-[#f7f5f0] text-[#111]">
        {/* ---------------- Hero: 2026 Champions ---------------- */}
        <section id="home" className="relative min-h-[100svh] overflow-hidden">
          <Image src={HERO_IMAGE} alt="Gamble Sands fairway above the Columbia River" fill priority className="hero-media object-cover" sizes="100vw" />
          <HeroFilmLayer />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/20" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_100%,rgba(201,162,39,0.18),transparent)]" />
          <div className="relative mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-end px-5 pb-24 pt-28 md:px-8 md:pb-28">
            <p className="hero-fade label mb-4 text-white/70" style={{ "--d": "250ms" } as CSSProperties}>
              The ninth Strand · {STRAND_2026.destination}
            </p>
            <h1 className="headline max-w-[16ch] text-white">
              <span className="sr-only">Team J-Bone. 2026 Champions.</span>
              <HeroLine text="Team J-Bone." base={60} />
              <span className="hero-line hero-fade" style={{ "--d": "520ms" } as CSSProperties} aria-hidden>
                <span className="gold-shimmer">2026 Champions.</span>
              </span>
            </h1>
            <p className="hero-fade mt-6 max-w-md text-base leading-relaxed text-white/80 md:text-lg" style={{ "--d": "650ms" } as CSSProperties}>
              Four rounds above the Columbia River and the cup went to J-BONE&apos;s side. Next on the tee:
              the <strong className="text-white">10-year Strand</strong> in 2027.
            </p>
            <div className="hero-fade mt-8 flex flex-wrap items-center gap-3" style={{ "--d": "800ms" } as CSSProperties}>
              <Magnetic><Link href={STRAND_2026.recapHref} className="btn-primary">Relive 2026</Link></Magnetic>
              <Magnetic><a href="#next" className="btn-ghost">The 10-Year Strand</a></Magnetic>
              <Magnetic><a href="#history" className="btn-ghost">Archive</a></Magnetic>
              <AmbienceToggle />
            </div>            <div className="hero-fade absolute bottom-24 right-5 hidden md:bottom-28 md:right-8 md:block" style={{ "--d": "900ms" } as CSSProperties}>
              <div className="scroll-cue flex flex-col items-center gap-2 text-white/70"><span className="text-[9px] uppercase tracking-[0.3em]">Scroll</span><span className="h-8 w-px bg-white/50" /></div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 border-t border-white/12 bg-black/30 backdrop-blur-sm">
            <Marquee items={TICKER_ITEMS} speed="36s" className="py-3 text-[11px] font-medium uppercase tracking-[0.22em] text-white/70" />
          </div>
        </section>

        {/* ---------------- Count-up stat band ---------------- */}
        <section id="trip" className="divider">
          <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-px bg-[#e2ddd3] md:grid-cols-4">
            {[
              { label: "Editions played", value: 9, suffix: "" },
              { label: "Points contested in 2026", value: 75, suffix: "" },
              { label: "Players in the field", value: 20, suffix: "" },
              { label: "Years of The Strand in 2027", value: 10, suffix: "" },
            ].map((stat, i) => (
              <Reveal key={stat.label} delay={i * 70} className="bg-[#f7f5f0]">
                <div className="group px-5 py-8 transition-colors duration-300 hover:bg-white md:px-8">
                  <div className="label">{stat.label}</div>
                  <div className="mt-2 text-3xl font-medium tracking-[-0.03em] md:text-4xl">
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------------- The 2026 result ---------------- */}
        <TeeShotScene />

        <section id="schedule" className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
          <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-lg">
              <p className="label">Gamble Sands 2026</p>
              <h2 className="section-title mt-3">The result.</h2>
              <p className="mt-4 text-sm leading-relaxed text-black/55">
                {STRAND_2026.dates} · {STRAND_2026.courses.join(" · ")}. No tally published — the cup
                says enough. Full story, round by round, on the recap page.
              </p>
            </div>
            <Magnetic><Link href={STRAND_2026.recapHref} className="btn-primary">Open the 2026 recap</Link></Magnetic>
          </Reveal>
          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal><RosterCard title="Team J-Bone" subtitle="2026 Champions" players={teamJustin} champion /></Reveal>
            <Reveal delay={120}><RosterCard title="Team WIX" subtitle="Runners-up" players={teamWix} /></Reveal>
          </div>
          <Reveal className="mt-10">
            <div className="grid gap-px overflow-hidden rounded-[2rem] border border-black/10 bg-[#e2ddd3] sm:grid-cols-2 xl:grid-cols-4">
              {ROUND_FORMATS.map((round) => (
                <div key={round.round} className="group relative isolate overflow-hidden bg-white">
                  <Image
                    src={ROUND_PHOTOS[round.round] ?? HERO_IMAGE}
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="-z-10 object-cover opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                  />
                  <div className="-z-10 absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/55" />
                  <div className="p-6 transition-colors duration-500 group-hover:text-white md:p-7">
                    <div className="label transition-colors duration-500 group-hover:text-white/70">R{round.round} · {round.course}</div>
                    <div className="mt-2 text-lg font-medium">{round.format}</div>
                    <div className="mt-1 text-xs text-black/45 transition-colors duration-500 group-hover:text-white/60">{round.day}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        <CartJumpScene />

        <OfficialEventSection />

        {/* ---------------- 10-Year Anniversary · 2027 ---------------- */}
        <section id="next" className="relative overflow-hidden bg-[#1a3c34] text-white">
          <div aria-hidden className="dimples-light pointer-events-none absolute inset-0 opacity-50" />
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-16 select-none text-[46vw] leading-none md:text-[30vw]">
            <span className="ten-outline">10</span>
          </div>
          <div className="relative mx-auto max-w-[1400px] px-5 py-24 md:px-8 md:py-36">
            <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <Reveal>
                <div className="flex items-center gap-3 text-white/80">
                  <PinFlag className="shrink-0" />
                  <p className="label text-white/60">Next on the tee</p>
                </div>
                <h2 className="section-title mt-4 text-white">
                  2027 · <span className="gold-shimmer">Ten years</span> of The Strand.
                </h2>
                <p className="mt-5 max-w-lg text-sm leading-relaxed text-white/70">
                  Palm Springs 2018 to Gamble Sands 2026 — nine editions, a different name on the cup
                  nearly every year, and one decade-long argument about handicaps. The 10th Strand gets
                  the anniversary it deserves. Destination and dates are being scouted now and will land
                  right here first.
                </p>
                <div className="mt-8 max-w-md space-y-3 text-sm">
                  <div className="flex justify-between border-b border-white/15 pb-3"><span className="text-white/55">Destination</span><strong>To be announced</strong></div>
                  <div className="flex justify-between border-b border-white/15 pb-3"><span className="text-white/55">Dates</span><strong>To be announced</strong></div>
                  <div className="flex justify-between"><span className="text-white/55">Edition</span><strong className="gold-shimmer">No. 10</strong></div>
                </div>
              </Reveal>
              <Reveal delay={120}>
                <div className="mb-8 flex justify-start lg:justify-end">
                  <Image
                    src="/brand/ten-year-crest.png"
                    alt="The Strand Invitational 10-year crest"
                    width={176}
                    height={176}
                    className="h-36 w-36 rounded-full border border-[#c9a227]/35 object-cover shadow-[0_0_60px_rgba(201,162,39,0.15)] md:h-44 md:w-44"
                  />
                </div>
                <p className="label mb-4 text-white/60">The road to ten</p>
                <div className="flex flex-wrap gap-2">
                  {championsAsc.map((row) => (
                    <div key={row.year} className="era-chip rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
                      <div className="font-mono text-xs text-white/50">{row.year}</div>
                      <div className="mt-1 text-sm font-medium">{row.winner}</div>
                    </div>
                  ))}
                  <div className="era-chip rounded-2xl border border-[#c9a227]/60 bg-[#c9a227]/10 px-4 py-3">
                    <div className="font-mono text-xs text-[#e8c86a]">2027</div>
                    <div className="gold-shimmer mt-1 text-sm font-semibold">Your name here</div>
                  </div>
                </div>
              </Reveal>
            </div>
            <Reveal className="mt-16 md:mt-20">
              <p className="label mb-4 text-white/60">The film · Destination unknown</p>
              <div className="mx-auto max-w-[1100px]">
                <TeaserPlayer />
              </div>
            </Reveal>
          </div>
          <LipOutScene />
        </section>

        <HistorySection />
        <PlayersHandicapSection />
        <CoursesSection />
        <TravelSection />
      </main>
      <SiteFooter /><BackToTop />
    </>
  );
}
