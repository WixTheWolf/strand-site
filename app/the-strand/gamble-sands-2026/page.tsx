import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import DraftHeader from "../../components/draft-header";
import { BackToTop, CountUp, Magnetic, ScrollProgress } from "../../components/fx";
import Marquee from "../../components/marquee";
import Reveal from "../../components/reveal";
import RosterCard from "../../components/roster-card";
import SiteFooter from "../../components/site-footer";
import { GALLERY_2026 } from "@/lib/gallery-2026";
import { rosterPlayers, STRAND_2026, TEAM_JUSTIN_2026_IDS, TEAM_WIX_2026_IDS } from "@/lib/strand-2026";
import { ROUND_FORMATS, WEEKEND_SCHEDULE } from "@/lib/tournament";

export const metadata = {
  title: "Gamble Sands 2026 | The Strand Invitational",
  description:
    "The ninth Strand Invitational — Team Justin takes the cup at Gamble Sands. Rosters, the weekend, the courses, and the photo album.",
};

const TICKER = [
  "Gamble Sands 2026",
  "The Ninth Strand",
  "Champions · Team Justin",
  "Gamble Sands · Scarecrow · QuickSands",
  "Aug 20–23, 2026",
];

const COURSES = [
  { name: "Gamble Sands", img: "/courses/gamble-sands.jpg", note: "Rounds 1 & 4 — fourball opener, scramble closer, both above the Columbia." },
  { name: "Scarecrow", img: "/courses/scarecrow.jpg", note: "Rounds 2 & 3 — shamble Friday, singles Saturday. Where the matches turned." },
  { name: "QuickSands", img: "/courses/quicksands.jpg", note: "Thursday's 14-hole par-3 warm-up, straight into dinner and The Matchmaker." },
];

const PLACEHOLDER_TILES = [
  "First tee energy",
  "The Matchmaker",
  "Scarecrow views",
  "Saturday singles",
  "The closing scramble",
  "Trophy time",
  "Danny Boy debriefs",
  "The Barn",
  "Travel day",
];

export default function GambleSands2026Page() {
  const teamJustin = rosterPlayers(TEAM_JUSTIN_2026_IDS);
  const teamWix = rosterPlayers(TEAM_WIX_2026_IDS);

  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#111]">
      <ScrollProgress />
      <DraftHeader title="Gamble Sands 2026" extraLink={{ href: "/", label: "Home" }} />

      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden bg-[#1a3c34] text-white">
        <Image
          src="/courses/gamble-sands.jpg"
          alt="Gamble Sands above the Columbia River"
          fill
          priority
          sizes="100vw"
          className="hero-media object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#102721] via-[#1a3c34]/60 to-transparent" />
        <div className="relative mx-auto max-w-[1400px] px-5 pb-16 pt-20 md:px-8 md:pb-24 md:pt-28">
          <p className="hero-fade label text-white/65" style={{ "--d": "150ms" } as CSSProperties}>
            The Ninth Strand · {STRAND_2026.dates}
          </p>
          <h1 className="headline mt-4 max-w-[14ch] text-white">
            <span className="gold-shimmer">Team Justin</span> takes the Sands.
          </h1>
          <p className="hero-fade mt-6 max-w-xl text-base leading-relaxed text-white/80" style={{ "--d": "450ms" } as CSSProperties}>
            Fourball, shamble, singles, and a closing scramble across {STRAND_2026.courses.join(", ")} —
            and when the dust settled over Brewster, J-BONE&apos;s ten had the cup. The ledger below is
            captain-verified; the photos are incoming.
          </p>
          <div className="hero-fade mt-8 flex flex-wrap gap-3" style={{ "--d": "600ms" } as CSSProperties}>
            <Magnetic><a href="#album" className="btn-primary bg-white text-black hover:opacity-90">Photo album</a></Magnetic>
            <Magnetic><a href="#rosters" className="btn-ghost border-white/30 text-white">The rosters</a></Magnetic>
          </div>
        </div>
        <div className="relative border-t border-white/12 bg-black/25 backdrop-blur-sm">
          <Marquee items={TICKER} speed="34s" className="py-3 text-[11px] font-medium uppercase tracking-[0.22em] text-white/70" />
        </div>
      </section>

      {/* ---------------- Fast facts ---------------- */}
      <section className="divider">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-px bg-[#e2ddd3] md:grid-cols-4">
          {[
            { label: "Rounds", value: 4 },
            { label: "Points on the line", value: 75 },
            { label: "Players", value: 20 },
            { label: "Holes incl. QuickSands", value: 86 },
          ].map((stat, i) => (
            <Reveal key={stat.label} delay={i * 70} className="bg-[#f7f5f0]">
              <div className="px-5 py-8 md:px-8">
                <div className="label">{stat.label}</div>
                <div className="mt-2 text-3xl font-medium tracking-[-0.03em]"><CountUp value={stat.value} /></div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Rosters ---------------- */}
      <section id="rosters" className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-24">
        <Reveal className="mb-10 max-w-lg">
          <p className="label">The field</p>
          <h2 className="section-title mt-3">Ten on ten.</h2>
        </Reveal>
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal><RosterCard title="Team Justin" subtitle="2026 Champions" players={teamJustin} champion /></Reveal>
          <Reveal delay={120}><RosterCard title="Team WIX" subtitle="Runners-up" players={teamWix} /></Reveal>
        </div>
      </section>

      {/* ---------------- The weekend ---------------- */}
      <section className="divider bg-white">
        <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-24">
          <Reveal className="mb-10 max-w-lg">
            <p className="label">The weekend</p>
            <h2 className="section-title mt-3">Thursday to Sunday, as played.</h2>
          </Reveal>
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
            <Reveal>
              <ul className="space-y-0">
                {WEEKEND_SCHEDULE.map((item) => (
                  <li key={`${item.day}-${item.time}-${item.title}`} className="flex gap-4 border-b border-black/6 py-4 text-sm last:border-0">
                    <span className="w-28 shrink-0 font-mono text-xs text-black/40">{item.day.split("•")[0].trim()}<br />{item.time}</span>
                    <span><strong className="font-medium">{item.title}</strong><span className="block text-black/50">{item.note}</span></span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={120}>
              <div className="space-y-4">
                {ROUND_FORMATS.map((round) => (
                  <div key={round.round} className="rounded-[1.5rem] border border-black/10 bg-[#f7f5f0] p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="label">Round {round.round} · {round.course}</span>
                      <span className="font-mono text-xs text-black/40">{round.teeTime}</span>
                    </div>
                    <div className="mt-2 text-lg font-medium">{round.format}</div>
                    <p className="mt-1 text-sm text-black/55">{round.note}</p>
                  </div>
                ))}
                <div className="flex items-center gap-4 rounded-[1.5rem] border border-[#c9a227]/40 bg-[#c9a227]/8 p-5">
                  <Image src="/brand/brewster-boys-cutout.png" alt="Brewster Boys crest" width={72} height={72} className="h-16 w-16 object-contain" />
                  <p className="text-sm text-black/65">
                    <strong className="font-medium">The Brewster Boys.</strong> Twenty guys, one river
                    canyon, and a crest nobody voted on. Est. August 2026.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Courses ---------------- */}
      <section className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-24">
        <Reveal className="mb-10 max-w-lg">
          <p className="label">The venues</p>
          <h2 className="section-title mt-3">Three courses over the Columbia.</h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {COURSES.map((course, i) => (
            <Reveal key={course.name} delay={i * 90}>
              <div className="group overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm">
                <div className="relative h-52 overflow-hidden">
                  <Image src={course.img} alt={course.name} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium">{course.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-black/55">{course.note}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-8">
          <Link href="/courses" className="text-xs uppercase tracking-[0.14em] text-black/45 underline-offset-4 hover:text-black hover:underline">
            Full hole-by-hole course intel →
          </Link>
        </Reveal>
      </section>

      {/* ---------------- Photo album ---------------- */}
      <section id="album" className="divider bg-[#1a3c34] text-white">
        <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-24">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-lg">
              <p className="label text-white/60">The album</p>
              <h2 className="section-title mt-3 text-white">Proof it happened.</h2>
              <p className="mt-4 text-sm leading-relaxed text-white/65">
                {GALLERY_2026.length
                  ? "Shot on phones, judged forever."
                  : "The frames are reserved — trip photos are being collected and drop in here as they land."}
              </p>
            </div>
          </Reveal>
          {GALLERY_2026.length ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {GALLERY_2026.map((photo) => (
                <Reveal key={photo.src} className={photo.wide ? "col-span-2" : ""}>
                  <figure className="group relative overflow-hidden rounded-[1.5rem]">
                    <Image
                      src={photo.src}
                      alt={photo.caption ?? "Gamble Sands 2026"}
                      width={1200}
                      height={900}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {photo.caption && (
                      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-10 text-xs text-white/85">
                        {photo.caption}
                      </figcaption>
                    )}
                  </figure>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {PLACEHOLDER_TILES.map((tile, i) => (
                <Reveal key={tile} delay={(i % 3) * 80}>
                  <div className="dimples-light flex aspect-[4/3] items-end rounded-[1.5rem] border border-white/12 bg-white/4 p-4 transition-colors duration-300 hover:bg-white/8">
                    <span className="text-xs uppercase tracking-[0.16em] text-white/45">{tile}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------- Footer CTA ---------------- */}
      <section className="mx-auto max-w-[1400px] px-5 py-16 text-center md:px-8 md:py-20">
        <Reveal>
          <p className="label">Up next</p>
          <h2 className="section-title mt-3">The 10-Year Strand · 2027</h2>
          <div className="mt-6">
            <Magnetic><Link href="/#next" className="btn-primary">See what&apos;s coming</Link></Magnetic>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
      <BackToTop />
    </div>
  );
}
