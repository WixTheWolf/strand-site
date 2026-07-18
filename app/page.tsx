import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import CoursesSection from "./components/courses-section";
import { BackToTop, Countdown, Magnetic, ScrollProgress } from "./components/fx";
import HistorySection from "./components/history-section";
import Marquee from "./components/marquee";
import PlayersHandicapSection from "./components/players-handicap-section";
import Reveal from "./components/reveal";
import SiteFooter from "./components/site-footer";
import SiteHeader from "./components/site-header";
import TravelSection from "./components/travel-section";
import {
  CAPTAINS,
  MATCHMAKER_RULES,
  ON_COURSE_RULES,
  ROUND_FORMATS,
  STRAND_FORMAT,
  WEEKEND_SCHEDULE,
} from "@/lib/tournament";

const HERO_IMAGE = "/courses/gamble-sands.jpg";

const TICKER_ITEMS = [
  "The Strand Invitational",
  "Gamble Sands · Brewster WA",
  "Aug 20–23 2026",
  "WIX vs J-BONE",
  "20 players · 2 teams",
  "Four rounds · 3-point matches",
  "Since 2018",
];

const TRIP_FACTS = [
  { label: "When", value: "Aug 20–23, 2026" },
  { label: "Where", value: "Gamble Sands, Brewster WA" },
  { label: "Field", value: "20 players · 2 teams" },
  { label: "Captains", value: "WIX vs J-BONE" },
];

const COSTS = [
  ["Golf (4 rounds)", "$970"],
  ["Lodging (2/room)", "$570"],
  ["Lodging (4/room)", "$285"],
  ["Est. total", "$1,600–1,700"],
];

/** Per-letter staggered headline line */
function HeroLine({ text, base }: { text: string; base: number }) {
  return (
    <span className="hero-line" aria-hidden>
      {Array.from(text).map((char, i) => (
        <span
          key={`${char}-${i}`}
          className="hero-letter"
          style={{ "--d": `${base + i * 28}ms` } as CSSProperties}
        >
          {char === " " ? " " : char}
        </span>
      ))}
    </span>
  );
}

function GolfBall({ id, className, size = 44 }: { id: string; className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 44 44" width={size} height={size} className={className} aria-hidden>
      <circle cx="22" cy="22" r="20" fill="rgba(255,255,255,0.9)" />
      <circle cx="22" cy="22" r="20" fill={`url(#${id})`} />
      <defs>
        <radialGradient id={id} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.35)" />
        </radialGradient>
      </defs>
      {[
        [14, 14], [22, 12], [30, 14], [12, 22], [20, 20], [28, 20], [34, 24],
        [16, 28], [24, 27], [31, 31], [20, 34],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" fill="rgba(0,0,0,0.14)" />
      ))}
    </svg>
  );
}

export default function HomePage() {
  return (
    <>
      <ScrollProgress />
      <SiteHeader />

      <main className="bg-[#f7f5f0] text-[#111]">
        {/* Hero */}
        <section id="home" className="relative min-h-[100svh] overflow-hidden">
          <Image
            src={HERO_IMAGE}
            alt="Gamble Sands fairway above the Columbia River"
            fill
            priority
            className="hero-media object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/20" />

          <div className="relative mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-end px-5 pb-24 pt-28 md:px-8 md:pb-28">
            <p className="hero-fade label mb-4 text-white/70" style={{ "--d": "250ms" } as CSSProperties}>
              Gamble Sands · August 20–23, 2026
            </p>
            <h1 className="headline max-w-[14ch] text-white">
              <span className="sr-only">Golf trip. Boys trip. Since 2018.</span>
              <HeroLine text="Golf trip." base={60} />
              <HeroLine text="Boys trip." base={220} />
              <HeroLine text="Since 2018." base={380} />
            </h1>
            <p
              className="hero-fade mt-6 max-w-md text-base leading-relaxed text-white/80 md:text-lg"
              style={{ "--d": "550ms" } as CSSProperties}
            >
              Three David McLay Kidd courses on sandy Columbia Basin soil. Walk to the first tee,
              live scoring on TheGrint, and a Thursday night pairings reveal that sets the tone.
            </p>
            <div className="hero-fade mt-8 flex flex-wrap items-center gap-3" style={{ "--d": "700ms" } as CSSProperties}>
              <Magnetic>
                <a href="#players" className="btn-primary">
                  The Field
                </a>
              </Magnetic>
              <Magnetic>
                <Link href="/draft" className="btn-ghost">
                  Draft Lab
                </Link>
              </Magnetic>
            </div>

            <div className="hero-fade mt-8" style={{ "--d": "850ms" } as CSSProperties}>
              <Countdown />
            </div>

            <GolfBall id="ball-a" className="float-slow pointer-events-none absolute right-[12%] top-[22%] hidden opacity-70 lg:block" size={40} />
            <GolfBall id="ball-b" className="float-slower pointer-events-none absolute right-[26%] top-[42%] hidden opacity-40 lg:block" size={24} />

            <div
              className="hero-fade absolute bottom-24 right-5 hidden md:bottom-28 md:right-8 md:block"
              style={{ "--d": "900ms" } as CSSProperties}
            >
              <div className="scroll-cue flex flex-col items-center gap-2 text-white/70">
                <span className="text-[9px] uppercase tracking-[0.3em]">Scroll</span>
                <span className="h-8 w-px bg-white/50" />
              </div>
            </div>
          </div>

          {/* Ticker */}
          <div className="absolute inset-x-0 bottom-0 border-t border-white/12 bg-black/30 backdrop-blur-sm">
            <Marquee
              items={TICKER_ITEMS}
              speed="36s"
              className="py-3 text-[11px] font-medium uppercase tracking-[0.22em] text-white/70"
            />
          </div>
        </section>

        {/* Trip facts strip */}
        <section id="trip" className="divider">
          <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-px bg-[#e2ddd3] md:grid-cols-4">
            {TRIP_FACTS.map((fact, i) => (
              <Reveal key={fact.label} delay={i * 70} className="bg-[#f7f5f0]">
                <div className="group px-5 py-8 transition-colors duration-300 hover:bg-white md:px-8">
                  <div className="label">{fact.label}</div>
                  <div className="mt-2 text-sm font-medium md:text-base">{fact.value}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Schedule */}
        <section id="schedule" className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
          <Reveal className="mb-12 max-w-lg">
            <p className="label">Weekend</p>
            <h2 className="section-title mt-3">Four rounds. One resort.</h2>
          </Reveal>

          <Reveal className="relative">
            <span
              aria-hidden
              className="timeline-rail absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-[#1a3c34]/25 md:block"
            />
            <div className="grid gap-px bg-[#e2ddd3] md:grid-cols-2">
              {WEEKEND_SCHEDULE.map((item, i) => (
                <Reveal key={`${item.day}-${item.time}`} delay={(i % 2) * 90}>
                  <div className="group h-full bg-[#f7f5f0] p-6 transition-colors duration-300 hover:bg-white md:p-8">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="label transition-colors duration-300 group-hover:text-[#1a3c34]">{item.day}</span>
                      <span className="font-mono text-xs text-black/45">{item.time}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-medium">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-black/55">{item.note}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>

          <Reveal className="mt-12">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <p className="label mb-4">Formats</p>
                <ul className="space-y-2 text-sm text-black/65">
                  {STRAND_FORMAT.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="label mb-4">Rounds</p>
                <ul className="space-y-3">
                  {ROUND_FORMATS.map((round) => (
                    <li key={round.round} className="flex items-baseline justify-between gap-4 text-sm">
                      <span className="font-medium">
                        R{round.round} · {round.format}
                      </span>
                      <span className="text-black/45">{round.course}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </section>

        <PlayersHandicapSection />
        <CoursesSection />
        <TravelSection />

        {/* Ceremony + costs */}
        <section className="divider bg-white">
          <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
            <div className="grid gap-16 lg:grid-cols-2">
              <Reveal>
                <p className="label">Thursday Night</p>
                <h2 className="section-title mt-3">The Matchmaker</h2>
                <p className="mt-4 text-sm leading-relaxed text-black/55">
                  Captain draft locks rosters ~one month out. Thursday is pairings only —
                  {CAPTAINS.wix.nickname} vs {CAPTAINS.justin.nickname} set every matchup live.
                </p>
                <ul className="mt-6 space-y-2 text-sm text-black/65">
                  {MATCHMAKER_RULES.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
                <div className="mt-8 space-y-2 border-t border-black/8 pt-6 text-sm">
                  <div className="flex justify-between">
                    <span className="font-mono text-black/45">7:00 PM</span>
                    <span>Dinner</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-black/45">8:00 PM</span>
                    <span>Opening ceremony</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="font-mono text-black/45">8:15 PM</span>
                    <span>The Matchmaker</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-black/45">8:30 PM</span>
                    <span>Pairings posted</span>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={120}>
                <p className="label">Stay & Pay</p>
                <h2 className="section-title mt-3">Onsite everything</h2>
                <p className="mt-4 text-sm leading-relaxed text-black/55">
                  New hotel at Scarecrow. Danny Boy for dinner, The Barn all day. Rooms have double
                  king beds — coordinate splits on your own.
                </p>
                <div className="mt-8 space-y-3">
                  {COSTS.map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between border-b border-black/8 pb-3 text-sm"
                    >
                      <span className="text-black/55">{label}</span>
                      <span className="font-mono font-medium">{value}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-black/40">
                  Per person · tax included · flights, transport, and food separate
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* On-course rules */}
        <section className="divider">
          <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-8">
            <Reveal>
              <p className="label mb-6">On Course</p>
              <div className="flex flex-wrap gap-x-8 gap-y-3">
                {ON_COURSE_RULES.map((rule) => (
                  <span key={rule} className="text-sm text-black/65">
                    {rule}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Draft Lab CTA */}
        <section className="relative min-h-[60vh] overflow-hidden">
          <Image
            src="/courses/scarecrow.jpg"
            alt="Scarecrow aerial with Columbia River and mountain views"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-10 right-0 select-none text-[22vw] font-semibold leading-none tracking-tighter text-white/[0.06]"
          >
            2026
          </div>
          <div className="relative mx-auto max-w-[1400px] px-5 py-24 md:px-8 md:py-36">
            <Reveal>
              <p className="label text-white/60">Draft Lab</p>
              <h2 className="section-title mt-3 max-w-md text-white">
                Model your roster before the captain draft.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/70">
                Mock drafts, win probability, format-by-format edges, and saved what-if scenarios
                with live TheGrint handicaps for all 20 players.
              </p>
              <Link href="/draft" className="btn-primary mt-8 bg-white text-black hover:opacity-90">
                Open Draft Lab
              </Link>
            </Reveal>
          </div>
        </section>

        <HistorySection />
      </main>

      <SiteFooter />
      <BackToTop />
    </>
  );
}
