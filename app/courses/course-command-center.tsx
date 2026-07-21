"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CHAMPIONSHIP_COURSES,
  COURSE_SOURCE_NOTE,
  QUICKSANDS_HOLES,
  courseHandicap,
  planLabel,
  strokesOnHole,
  type ChampionshipCourseIntel,
  type HoleIntel,
} from "@/lib/course-intelligence";
import { buildSaberBoard } from "@/lib/sabermetrics";
import type { PlayerDraftStats } from "@/lib/types";

type CourseView = "gamble-sands" | "scarecrow" | "quicksands" | "cascades";
type HoleFilter = "all" | "front" | "back" | "attack" | "closing";
type CourseFormat = "foursomes" | "scramble" | "shamble" | "singles";

interface DraftPayload {
  players: PlayerDraftStats[];
}

const COURSE_TABS: { id: CourseView; label: string; note: string }[] = [
  { id: "gamble-sands", label: "Gamble Sands", note: "R1 + R4" },
  { id: "scarecrow", label: "Scarecrow", note: "R2 + R3" },
  { id: "quicksands", label: "QuickSands", note: "Warm-up" },
  { id: "cascades", label: "Cascades", note: "Putting lab" },
];

const FILTERS: { id: HoleFilter; label: string }[] = [
  { id: "all", label: "All 18" },
  { id: "front", label: "Front 9" },
  { id: "back", label: "Back 9" },
  { id: "attack", label: "Green lights" },
  { id: "closing", label: "Closing 4" },
];

const FORMAT_LABEL: Record<CourseFormat, string> = {
  foursomes: "R1 · Foursomes",
  scramble: "R4 · Two-Man Scramble",
  shamble: "R2 · Shamble",
  singles: "R3 · Singles",
};

function formatIndex(player: PlayerDraftStats) {
  if (player.indexNum === null) return "—";
  return `${player.indexNum.toFixed(1)}${player.eventIndexCapped ? "*" : ""}`;
}

function planClasses(plan: HoleIntel["plan"]) {
  if (plan === "attack") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (plan === "protect") return "border-rose-200 bg-rose-50 text-rose-900";
  return "border-amber-200 bg-amber-50 text-amber-900";
}

function filteredHoles(course: ChampionshipCourseIntel, filter: HoleFilter) {
  if (filter === "front") return course.holes.slice(0, 9);
  if (filter === "back") return course.holes.slice(9);
  if (filter === "attack") return course.holes.filter((hole) => hole.plan === "attack");
  if (filter === "closing") return course.holes.slice(14);
  return course.holes;
}

function formatInstruction(format: CourseFormat, hole: HoleIntel, strokes: number) {
  if (format === "singles") {
    if (strokes > 0) {
      return `You receive ${strokes === 1 ? "a stroke" : `${strokes} strokes`} here. Build a net par and force the opponent to make a gross score.`;
    }
    return "No handicap stroke here. Fairway-and-green pressure is more valuable than a speculative flag line.";
  }
  if (format === "shamble") {
    return hole.plan === "attack"
      ? "First drive finds grass; second drive attacks the high-value lane. Choose the best angle, not automatically the longest ball."
      : "Prioritize two playable drives. The selected ball must leave both partners a useful second shot.";
  }
  if (format === "scramble") {
    return hole.plan === "attack"
      ? "First player banks a playable ball; second gets full permission to chase the contour or carry."
      : "Do not turn two chances into zero. Secure the center target before changing gears.";
  }
  return hole.plan === "protect"
    ? "Alternate shot magnifies every miss. Choose the lane that leaves your partner a normal next shot."
    : "Foursomes priority: grass, preferred angle, predictable leave. Heroics require match pressure—not boredom.";
}

function StrokeDots({ count }: { count: number }) {
  if (!count) return <span className="text-black/25">—</span>;
  return (
    <span className="inline-flex gap-1" aria-label={`${count} handicap stroke${count === 1 ? "" : "s"}`}>
      {Array.from({ length: count }).map((_, index) => (
        <span key={index} className="h-2 w-2 rounded-full bg-[#9c6436]" />
      ))}
    </span>
  );
}

function ChampionshipGuide({
  course,
  players,
  loadingPlayers,
}: {
  course: ChampionshipCourseIntel;
  players: PlayerDraftStats[];
  loadingPlayers: boolean;
}) {
  const [teeName, setTeeName] = useState(course.defaultTee);
  const [playerId, setPlayerId] = useState("matt-wixted");
  const [filter, setFilter] = useState<HoleFilter>("all");
  const [format, setFormat] = useState<CourseFormat>(course.id === "gamble-sands" ? "foursomes" : "shamble");

  const tee = course.tees.find((item) => item.name === teeName) ?? course.tees[0];
  const selectedPlayer = players.find((player) => player.id === playerId) ?? players[0] ?? null;
  const selectedCourseHandicap = selectedPlayer?.indexNum == null
    ? null
    : courseHandicap(selectedPlayer.indexNum, tee, course.par);
  const visibleHoles = filteredHoles(course, filter);
  const formats: CourseFormat[] = course.id === "gamble-sands"
    ? ["foursomes", "scramble"]
    : ["shamble", "singles"];

  const board = useMemo(() => {
    if (!players.length) return [];
    const metrics = buildSaberBoard(players);
    return [...metrics].sort((a, b) => (
      course.id === "gamble-sands" ? b.gambleFit - a.gambleFit : b.scarecrowFit - a.scarecrowFit
    ));
  }, [course.id, players]);

  const strokedHoles = selectedCourseHandicap == null
    ? 0
    : course.holes.filter((hole) => strokesOnHole(selectedCourseHandicap, hole.strokeIndex) > 0).length;
  const doubleStrokeHoles = selectedCourseHandicap == null
    ? 0
    : course.holes.filter((hole) => strokesOnHole(selectedCourseHandicap, hole.strokeIndex) > 1).length;

  return (
    <>
      <section className="relative overflow-hidden bg-[#102d25] text-white">
        <Image src={course.image} alt={`${course.name} at Gamble Sands`} fill priority className="object-cover opacity-45" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#102d25] via-[#102d25]/88 to-[#102d25]/20" />
        <div className="relative mx-auto grid min-h-[520px] max-w-[1400px] items-end gap-12 px-5 py-16 md:px-8 lg:grid-cols-[1fr_0.7fr] lg:py-20">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/50">{course.architect}</p>
            <h1 className="mt-3 text-5xl font-medium tracking-[-0.055em] md:text-7xl">{course.name}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/72">{course.design}</p>
            <div className="mt-7 inline-flex border border-white/15 bg-black/20 px-4 py-3 text-xs uppercase tracking-[0.18em] text-white/75 backdrop-blur-sm">
              {course.tournamentRounds}
            </div>
          </div>
          <div className="border border-white/14 bg-black/20 p-6 backdrop-blur-md">
            <div className="text-[10px] uppercase tracking-[0.24em] text-[#d9c5a6]">Winning formula</div>
            <ol className="mt-4 space-y-4">
              {course.winningFormula.map((line, index) => (
                <li key={line} className="grid grid-cols-[2rem_1fr] gap-3 text-sm leading-6 text-white/78">
                  <span className="font-mono text-white/35">0{index + 1}</span>
                  <span>{line}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-b border-black/8 bg-white">
        <div className="mx-auto max-w-[1400px] px-5 py-10 md:px-8">
          <div className="grid gap-8 xl:grid-cols-[1fr_1fr]">
            <div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="label">Tournament tee lab</p>
                  <h2 className="mt-2 text-2xl font-medium tracking-[-0.03em]">Pick a tee. See the whole course change.</h2>
                </div>
                <span className="text-xs text-black/40">Event tee not yet confirmed</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {course.tees.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setTeeName(item.name)}
                    className={`flex items-center gap-2 border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                      tee.name === item.name ? "border-black bg-black text-white" : "border-black/10 bg-[#f7f5f0] hover:border-black/35"
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full border border-black/15" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </button>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-px bg-black/10">
                <div className="bg-[#f7f5f0] p-4"><div className="text-[10px] uppercase tracking-[0.18em] text-black/40">Yardage</div><div className="mt-1 font-mono text-xl font-semibold">{tee.yards.toLocaleString()}</div></div>
                <div className="bg-[#f7f5f0] p-4"><div className="text-[10px] uppercase tracking-[0.18em] text-black/40">Rating</div><div className="mt-1 font-mono text-xl font-semibold">{tee.rating.toFixed(1)}</div></div>
                <div className="bg-[#f7f5f0] p-4"><div className="text-[10px] uppercase tracking-[0.18em] text-black/40">Slope</div><div className="mt-1 font-mono text-xl font-semibold">{tee.slope}</div></div>
              </div>
            </div>

            <div className="bg-[#14352a] p-6 text-white">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">Personal stroke map</p>
                  <h2 className="mt-2 text-2xl font-medium tracking-[-0.03em]">Know exactly where your shots fall.</h2>
                </div>
                <select
                  value={selectedPlayer?.id ?? ""}
                  onChange={(event) => setPlayerId(event.target.value)}
                  disabled={loadingPlayers || !players.length}
                  className="min-w-52 border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white outline-none"
                  aria-label="Select player for course handicap"
                >
                  {loadingPlayers ? <option>Loading roster…</option> : null}
                  {[...players].sort((a, b) => (a.indexNum ?? 99) - (b.indexNum ?? 99)).map((player) => (
                    <option key={player.id} value={player.id} className="text-black">
                      {player.name} · {formatIndex(player)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-px bg-white/12">
                <div className="bg-[#14352a] p-4"><div className="text-[10px] uppercase tracking-[0.18em] text-white/40">2026 index</div><div className="mt-1 font-mono text-xl font-semibold">{selectedPlayer ? formatIndex(selectedPlayer) : "—"}</div></div>
                <div className="bg-[#14352a] p-4"><div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Course HC</div><div className="mt-1 font-mono text-xl font-semibold">{selectedCourseHandicap ?? "—"}</div></div>
                <div className="bg-[#14352a] p-4"><div className="text-[10px] uppercase tracking-[0.18em] text-white/40">Stroke holes</div><div className="mt-1 font-mono text-xl font-semibold">{selectedCourseHandicap == null ? "—" : strokedHoles}</div></div>
              </div>
              <p className="mt-4 text-xs leading-5 text-white/48">
                WHS course handicap = Index × Slope ÷ 113 + Rating − Par, rounded. {doubleStrokeHoles > 0 ? `${doubleStrokeHoles} holes receive a second stroke.` : "No holes receive a second stroke at this setup."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="label">Hole command center</p>
            <h2 className="section-title mt-3">Every number. Every miss. Every decision.</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {formats.map((item) => (
              <button key={item} type="button" onClick={() => setFormat(item)} className={`border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] ${format === item ? "border-[#14352a] bg-[#14352a] text-white" : "border-black/10 bg-white"}`}>
                {FORMAT_LABEL[item]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-7 overflow-x-auto border border-black/10 bg-white">
          <table className="w-full min-w-[1040px] border-collapse text-center text-xs">
            <tbody>
              <tr className="border-b border-black/8 bg-[#14352a] text-white">
                <th className="sticky left-0 z-10 bg-[#14352a] px-4 py-3 text-left text-[10px] uppercase tracking-[0.18em]">Hole</th>
                {course.holes.map((hole) => <th key={hole.number} className="px-3 py-3 font-mono">{hole.number}</th>)}
                <th className="px-4 py-3 font-mono">Tot</th>
              </tr>
              <tr className="border-b border-black/8">
                <th className="sticky left-0 z-10 bg-white px-4 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-black/40">Par</th>
                {course.holes.map((hole) => <td key={hole.number} className="px-3 py-3 font-mono">{hole.par}</td>)}
                <td className="px-4 py-3 font-mono font-semibold">{course.par}</td>
              </tr>
              <tr className="border-b border-black/8 bg-[#f7f5f0]">
                <th className="sticky left-0 z-10 bg-[#f7f5f0] px-4 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-black/40">{tee.name}</th>
                {tee.holeYards.map((yards, index) => <td key={course.holes[index].number} className="px-3 py-3 font-mono">{yards}</td>)}
                <td className="px-4 py-3 font-mono font-semibold">{tee.yards}</td>
              </tr>
              <tr className="border-b border-black/8">
                <th className="sticky left-0 z-10 bg-white px-4 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-black/40">Stroke index</th>
                {course.holes.map((hole) => <td key={hole.number} className="px-3 py-3 font-mono text-black/55">{hole.strokeIndex}</td>)}
                <td className="px-4 py-3">—</td>
              </tr>
              <tr>
                <th className="sticky left-0 z-10 bg-white px-4 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-black/40">Your strokes</th>
                {course.holes.map((hole) => <td key={hole.number} className="px-3 py-3"><StrokeDots count={selectedCourseHandicap == null ? 0 : strokesOnHole(selectedCourseHandicap, hole.strokeIndex)} /></td>)}
                <td className="px-4 py-3 font-mono font-semibold">{selectedCourseHandicap ?? "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button key={item.id} type="button" onClick={() => setFilter(item.id)} className={`border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${filter === item.id ? "border-black bg-black text-white" : "border-black/10 bg-white"}`}>
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {visibleHoles.map((hole) => {
            const strokes = selectedCourseHandicap == null ? 0 : strokesOnHole(selectedCourseHandicap, hole.strokeIndex);
            return (
              <article key={hole.number} className="overflow-hidden border border-black/10 bg-white shadow-[0_14px_40px_rgba(17,17,17,0.04)]">
                <div className="grid md:grid-cols-[9rem_1fr]">
                  <div className="flex min-h-36 flex-col justify-between bg-[#14352a] p-5 text-white">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">Hole</div>
                      <div className="mt-1 font-mono text-5xl font-semibold tracking-[-0.06em]">{hole.number}</div>
                    </div>
                    <div className="space-y-1 font-mono text-xs text-white/65">
                      <div>Par {hole.par}</div>
                      <div>{tee.holeYards[hole.number - 1]} yards</div>
                      <div>SI {hole.strokeIndex}</div>
                    </div>
                  </div>
                  <div className="p-5 md:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className={`border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${planClasses(hole.plan)}`}>{planLabel(hole.plan)}</span>
                      <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-black/40">Net strokes <StrokeDots count={strokes} /></span>
                    </div>
                    <h3 className="mt-4 text-xl font-medium tracking-[-0.025em]">{hole.headline}</h3>
                    <p className="mt-3 text-sm leading-6 text-black/62">{hole.strategy}</p>
                    <div className="mt-5 grid gap-px bg-black/8 sm:grid-cols-2">
                      <div className="bg-[#f7f5f0] p-4">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-black/38">Preferred miss</div>
                        <p className="mt-2 text-xs leading-5 text-black/65">{hole.preferredMiss}</p>
                      </div>
                      <div className="bg-[#f7f5f0] p-4">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-black/38">{FORMAT_LABEL[format]}</div>
                        <p className="mt-2 text-xs leading-5 text-black/65">{formatInstruction(format, hole, strokes)}</p>
                      </div>
                    </div>
                    <p className="mt-4 border-l-2 border-[#9c6436] pl-3 text-xs italic leading-5 text-black/48">{hole.matchPlay}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-black/8 bg-[#ede8df]">
        <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-8 md:py-18">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="label">Strand Sabr course fit</p>
              <h2 className="section-title mt-3">Who this course rewards.</h2>
              <p className="mt-4 text-sm leading-6 text-black/55">
                Fit blends current scoring, consistency, ceiling, ball striking, putting, activity and evidence confidence. It is a draft signal—not a claim that missing shot-level data exists.
              </p>
              <Link href="/draft" className="mt-6 inline-flex border-b border-black pb-1 text-xs font-semibold uppercase tracking-[0.16em]">Open the full war room</Link>
            </div>
            <div className="overflow-hidden border border-black/10 bg-white">
              <div className="grid grid-cols-[3rem_1fr_5rem_5rem] border-b border-black/8 bg-[#14352a] px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-white/55">
                <span>Rank</span><span>Player</span><span className="text-right">Fit</span><span className="text-right">Conf.</span>
              </div>
              {board.slice(0, 10).map((metric, index) => {
                const fit = course.id === "gamble-sands" ? metric.gambleFit : metric.scarecrowFit;
                return (
                  <div key={metric.player.id} className="grid grid-cols-[3rem_1fr_5rem_5rem] items-center border-b border-black/6 px-4 py-3 text-sm last:border-b-0">
                    <span className="font-mono text-black/35">{String(index + 1).padStart(2, "0")}</span>
                    <span className="min-w-0"><span className="font-medium">{metric.player.name}</span><span className="ml-2 text-xs text-black/38">{formatIndex(metric.player)}</span></span>
                    <span className="text-right font-mono font-semibold">{fit.toFixed(0)}</span>
                    <span className="text-right font-mono text-black/45">{metric.confidence.toFixed(0)}%</span>
                  </div>
                );
              })}
              {!board.length ? <div className="p-8 text-center text-sm text-black/45">Loading player-fit model…</div> : null}
            </div>
          </div>
        </div>
      </section>

      <SourceRail course={course} />
    </>
  );
}

function SourceRail({ course }: { course: ChampionshipCourseIntel }) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1400px] px-5 py-10 md:px-8">
        <p className="max-w-4xl text-xs leading-5 text-black/45">{COURSE_SOURCE_NOTE}</p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {course.sources.map((source) => (
            <a key={source.href} href={source.href} target="_blank" rel="noreferrer" className="text-xs font-semibold uppercase tracking-[0.13em] text-[#14352a] underline decoration-black/20 underline-offset-4 hover:decoration-black">
              {source.label} ↗
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickSandsGuide() {
  const mappedTotal = QUICKSANDS_HOLES.reduce((sum, hole) => sum + hole.mappedYards, 0);
  return (
    <>
      <section className="relative overflow-hidden bg-[#402c20] text-white">
        <Image src="/courses/quicksands.jpg" alt="QuickSands short course at sunset" fill priority className="object-cover opacity-50" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2b211b]/95 via-[#2b211b]/70 to-transparent" />
        <div className="relative mx-auto flex min-h-[520px] max-w-[1400px] items-end px-5 py-16 md:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/50">David McLay Kidd · 14 par 3s · Thursday 5:00 PM</p>
            <h1 className="mt-3 text-5xl font-medium tracking-[-0.055em] md:text-7xl">QuickSands</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/72">Not a miniature championship course—a short-game amusement park. The resort explicitly wants players to putt from tees, bank shots off slopes and choose imagination over a stock yardage.</p>
            <div className="mt-7 flex flex-wrap gap-px bg-white/15">
              {[['Holes', '14'], ['Par', '42'], ['Official range', '60–180 yds'], ['Mapped card', `${mappedTotal.toLocaleString()} yds`]].map(([label, value]) => (
                <div key={label} className="min-w-36 bg-black/25 p-4 backdrop-blur-sm"><div className="text-[10px] uppercase tracking-[0.18em] text-white/40">{label}</div><div className="mt-1 font-mono text-lg font-semibold">{value}</div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-14 md:px-8 md:py-18">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="label">Thursday laboratory</p>
            <h2 className="section-title mt-3">Four clubs. Fourteen reads.</h2>
            <p className="mt-4 text-sm leading-6 text-black/55">Bring a putter, a favorite wedge, a flighted wedge/short iron and a hybrid or 7-iron for the ground game. The mapped distances below are planning references; the resort&apos;s stated 60–180-yard range, daily markers, wind and pin locations control the actual shot.</p>
            <div className="mt-6 border border-black/10 bg-white p-5">
              <div className="text-[10px] uppercase tracking-[0.18em] text-black/40">The weekend advantage</div>
              <p className="mt-2 text-sm leading-6 text-black/65">Record one carry number, one rollout ratio and one trusted bank-shot club. Those observations transfer directly to Gamble Sands&apos; giant contours and Scarecrow&apos;s smaller, sloped targets.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {QUICKSANDS_HOLES.map((hole) => (
              <article key={hole.number} className="border border-black/10 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div><span className="font-mono text-3xl font-semibold">{String(hole.number).padStart(2, "0")}</span>{hole.name ? <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9c6436]">{hole.name}</div> : null}</div>
                  <div className="text-right"><div className="text-[10px] uppercase tracking-[0.16em] text-black/38">Mapped</div><div className="mt-1 font-mono text-lg">{hole.mappedYards} yds</div></div>
                </div>
                <p className="mt-4 text-sm leading-6 text-black/60">{hole.plan}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="border-y border-black/8 bg-[#14352a] text-white">
        <div className="mx-auto grid max-w-[1400px] gap-px bg-white/12 px-5 py-12 md:grid-cols-4 md:px-8">
          {[
            ["1 · Plinko", "Known working name; read the banks before choosing the flag line."],
            ["3 · Crater", "Known working name; a committed uphill carry beats a timid guess."],
            ["9 · Corkscrew", "Known working name; the sideboard is the route, not decoration."],
            ["Donut", "Officially named feature; the resort has not published a stable hole-number map."],
          ].map(([title, note]) => <div key={title} className="bg-[#14352a] p-5"><div className="text-sm font-medium">{title}</div><p className="mt-2 text-xs leading-5 text-white/48">{note}</p></div>)}
        </div>
      </section>
      <section className="bg-white"><div className="mx-auto max-w-[1400px] px-5 py-10 md:px-8"><p className="text-xs leading-5 text-black/45">{COURSE_SOURCE_NOTE} QuickSands mapped distances are from Hole19&apos;s 14-hole card and may differ from the day&apos;s markers.</p><div className="mt-4 flex flex-wrap gap-6"><a href="https://www.gamblesands.com/quicksands/" target="_blank" rel="noreferrer" className="text-xs font-semibold uppercase tracking-[0.13em] text-[#14352a] underline underline-offset-4">Official QuickSands overview ↗</a><a href="https://www.hole19golf.com/courses/gamble-sands-golf-quick-sands" target="_blank" rel="noreferrer" className="text-xs font-semibold uppercase tracking-[0.13em] text-[#14352a] underline underline-offset-4">Mapped 14-hole card ↗</a></div></div></section>
    </>
  );
}

function CascadesGuide() {
  return (
    <>
      <section className="bg-[#111] text-white">
        <div className="mx-auto grid min-h-[500px] max-w-[1400px] items-end gap-12 px-5 py-16 md:px-8 lg:grid-cols-[1fr_0.72fr] lg:py-20">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/40">100,000 square feet · 175 yards · no fixed routing</p>
            <h1 className="mt-3 text-5xl font-medium tracking-[-0.055em] md:text-7xl">Cascades</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">Because the resort moves hole locations and creates a new course daily, honest hole-by-hole advice does not exist. The competitive value is a putting calibration session on the same firm fescue family you will face all weekend.</p>
          </div>
          <div className="border border-white/12 p-6">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#d9c5a6]">Do this before dinner</div>
            <ol className="mt-4 space-y-4 text-sm leading-6 text-white/65">
              <li><span className="mr-3 font-mono text-white/30">01</span>Three-ball lag ladder from 30, 50 and 70 feet.</li>
              <li><span className="mr-3 font-mono text-white/30">02</span>Five putts each direction across the strongest side slope.</li>
              <li><span className="mr-3 font-mono text-white/30">03</span>Ten balls from just off the surface: putter, hybrid, 7-iron, wedge.</li>
              <li><span className="mr-3 font-mono text-white/30">04</span>Finish with nine holes of two-putt-or-better match play under pressure.</li>
            </ol>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1400px] px-5 py-14 md:px-8"><div className="grid gap-px bg-black/10 md:grid-cols-3">{[
        ["Speed", "Measure how far a normal 20-foot stroke rolls on the day's fescue."],
        ["Break", "Find the point where pace stops holding the line and gravity takes over."],
        ["Ground club", "Choose the one non-putter that gives the most predictable fringe rollout."],
      ].map(([title, note]) => <div key={title} className="bg-white p-7"><div className="text-xl font-medium">{title}</div><p className="mt-3 text-sm leading-6 text-black/55">{note}</p></div>)}</div></section>
      <section className="bg-white"><div className="mx-auto max-w-[1400px] px-5 py-10 md:px-8"><a href="https://www.gamblesands.com/cascades/" target="_blank" rel="noreferrer" className="text-xs font-semibold uppercase tracking-[0.13em] text-[#14352a] underline underline-offset-4">Official Cascades overview ↗</a></div></section>
    </>
  );
}

export default function CourseCommandCenter() {
  const [view, setView] = useState<CourseView>("gamble-sands");
  const [players, setPlayers] = useState<PlayerDraftStats[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadPlayers() {
      try {
        const response = await fetch("/api/grint/players");
        if (!response.ok) throw new Error("Player data unavailable");
        const payload = await response.json() as DraftPayload;
        if (active) setPlayers(payload.players);
      } catch {
        // The course guide remains complete without the optional player-fit layer.
      } finally {
        if (active) setLoadingPlayers(false);
      }
    }
    loadPlayers();
    return () => { active = false; };
  }, []);

  const selectedCourse = CHAMPIONSHIP_COURSES.find((course) => course.id === view);

  return (
    <main className="bg-[#f7f5f0] text-[#111]">
      <div className="sticky top-16 z-30 border-b border-black/8 bg-[#f7f5f0]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-5 py-3 md:px-8">
          {COURSE_TABS.map((tab) => (
            <button key={tab.id} type="button" onClick={() => setView(tab.id)} className={`min-w-max border px-4 py-2.5 text-left transition ${view === tab.id ? "border-black bg-black text-white" : "border-black/10 bg-white hover:border-black/30"}`}>
              <span className="block text-xs font-semibold uppercase tracking-[0.14em]">{tab.label}</span>
              <span className={`mt-0.5 block text-[10px] uppercase tracking-[0.12em] ${view === tab.id ? "text-white/45" : "text-black/35"}`}>{tab.note}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedCourse ? <ChampionshipGuide key={selectedCourse.id} course={selectedCourse} players={players} loadingPlayers={loadingPlayers} /> : null}
      {view === "quicksands" ? <QuickSandsGuide /> : null}
      {view === "cascades" ? <CascadesGuide /> : null}
    </main>
  );
}
