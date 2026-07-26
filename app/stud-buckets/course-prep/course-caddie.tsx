"use client";

import Image from "next/image";
import { useState } from "react";

import InteractiveScorecard, {
  type ScorecardCourseId as CourseId,
  type ScorecardFormatId as FormatId,
  type ScorecardHole as CaddieHole,
} from "./interactive-scorecard";
import {
  CHAMPIONSHIP_COURSES,
  QUICKSANDS_HOLES,
  type HolePlan,
} from "@/lib/course-intelligence";
import {
  holeImage,
  holeMemory,
  planTranslation,
  type VisualCourseId,
} from "@/lib/course-humor";

type TabId = "caddie" | "scorecards" | "prep";
type ShotId = "tee" | "approach" | "short-game" | "putt";
type SituationId = "standard" | "protect" | "safe" | "must-win";
type LightId = "green" | "yellow" | "red";

const FORMATS: { id: FormatId; label: string; short: string }[] = [
  { id: "singles", label: "Singles", short: "80%" },
  { id: "fourball", label: "Fourball", short: "80%" },
  { id: "shamble", label: "Shamble", short: "75%" },
  { id: "scramble", label: "2v2 Scramble", short: "35/15" },
];

const SHOTS: { id: ShotId; label: string }[] = [
  { id: "tee", label: "Tee shot" },
  { id: "approach", label: "Approach" },
  { id: "short-game", label: "Around green" },
  { id: "putt", label: "Putt" },
];

const RESORT_RULES = [
  ["Sand is waste", "Ground the club, rehearse the swing and move loose stuff. Easy."],
  ["Grass is the line", "The desert is a red penalty area. Maintained grass marks the edge. Take relief and keep moving."],
  ["Carry is half the number", "This turf runs. Pick a landing spot and rollout—not just a laser number."],
  ["Pin sheet first", "The pin can change the tee line, especially on Scarecrow. Check it before choosing a club."],
];

const COURSE_KEYS = [
  ["Gamble Sands", "Use the floor. Play for angles. Attack 2, 8, 12, 13 and 18—after one ball finds grass."],
  ["Scarecrow", "The pin picks the lane. Favor center green, use the slopes and keep doubles off the card."],
  ["QuickSands", "Calibrate carry, rollout and wind. The same wedge number can play three different ways."],
  ["Cascades", "Dial 20-, 40- and 60-foot speed, then finish with 6–10 footers under pressure."],
];

const LIGHT_STYLE: Record<LightId, { label: string; note: string; shell: string; badge: string; dot: string }> = {
  green: {
    label: "Green light",
    note: "Go. No steering.",
    shell: "border-emerald-700/20 bg-emerald-50",
    badge: "bg-emerald-700 text-white",
    dot: "bg-emerald-500",
  },
  yellow: {
    label: "Yellow light",
    note: "Go only if the number and lie agree.",
    shell: "border-amber-600/20 bg-amber-50",
    badge: "bg-amber-500 text-[#281b08]",
    dot: "bg-amber-400",
  },
  red: {
    label: "Red light",
    note: "Take the big number off the card.",
    shell: "border-rose-700/20 bg-rose-50",
    badge: "bg-rose-700 text-white",
    dot: "bg-rose-500",
  },
};

function quickPlan(number: number): HolePlan {
  if ([2, 5, 10, 12, 13, 14].includes(number)) return "attack";
  if ([3, 8, 9].includes(number)) return "protect";
  return "swing";
}

function quickDifficulty(number: number, yards: number) {
  const base = yards <= 90 ? 1 : yards <= 110 ? 2 : yards <= 130 ? 3 : yards <= 150 ? 4 : 5;
  return Math.min(5, base + ([3, 9].includes(number) ? 1 : 0));
}

function championshipDifficulty(strokeIndex?: number) {
  if (!strokeIndex) return 3;
  return Math.max(1, 6 - Math.ceil(strokeIndex / 4));
}

function scoringChance(plan: HolePlan) {
  if (plan === "attack") return 5;
  if (plan === "swing") return 3;
  return 1;
}

function getLight(plan: HolePlan, format: FormatId, situation: SituationId, shot: ShotId): LightId {
  let score = plan === "attack" ? 2 : plan === "swing" ? 1 : 0;

  if (format === "scramble" && shot !== "putt") score += 0.5;
  if (situation === "protect") score -= 1;
  if (situation === "safe" || situation === "must-win") score += 1;
  if (shot === "putt" && plan === "protect") score += 0.5;

  if (score >= 2) return "green";
  if (score >= 1) return "yellow";
  return "red";
}

function shotCall(hole: CaddieHole, shot: ShotId, light: LightId) {
  if (shot === "tee" && hole.par === 3) {
    return "Play the landing number, not the flag. Pick the flight, allow for release and commit.";
  }

  if (shot === "tee") {
    if (light === "green") return "Take the scoring line. Confirm carry and rollout, then send it.";
    if (light === "yellow") return "Choose the side that opens the next shot. Challenge only if carry and wind agree.";
    return "Find grass. The next shot matters more than ten extra yards.";
  }

  if (shot === "approach") {
    if (light === "green") return "Attack through the fat side and let the slope feed it in.";
    if (light === "yellow") return "Center line unless a feeder is obvious. Do not short-side us.";
    return "Hit the safe section or lay up to a number. No miracle auditions.";
  }

  if (shot === "short-game") {
    if (light === "green") return "Front open? Use putter, hybrid or a low runner.";
    if (light === "yellow") return "Land it on the right shelf and let it run. Add loft only if you need it.";
    return "Use the widest landing area. A long putt beats another chip.";
  }

  if (light === "green") return "Give it a chance. Good speed, committed line, tap-in coming back.";
  if (light === "yellow") return "Pace first. Read the last third and roll it.";
  return "Two-putt wins. Leave it inside three feet and walk.";
}

function formatCall(format: FormatId, situation: SituationId, hole: CaddieHole) {
  if (format === "singles") {
    if (situation === "protect") return `You’re ahead. Fairways, greens, hand him the problem. ${hole.matchPlay}`;
    if (situation === "must-win") return `Need the hole. Widen the target one step—never two. ${hole.matchPlay}`;
    return `No rescue ball. Hit the shot you own. ${hole.matchPlay}`;
  }

  if (format === "fourball") {
    if (situation === "safe") return `Partner’s alive. Now you can hunt. ${hole.matchPlay}`;
    if (situation === "must-win") return `One ball finishes. One ball hunts. ${hole.matchPlay}`;
    return `Do not miss together. Put a score on the board first. ${hole.matchPlay}`;
  }

  if (format === "shamble") {
    if (situation === "safe") return `Drive is banked. Now improve the angle or distance. ${hole.matchPlay}`;
    return `First ball finds grass. Second ball gets aggressive. ${hole.matchPlay}`;
  }

  if (situation === "safe") return `Ball is safe. Next swing is full green light. ${hole.matchPlay}`;
  if (situation === "must-win") return `Pick roles: one secures the next shot, one chases it. ${hole.matchPlay}`;
  return `First ball earns permission. Second ball spends it. ${hole.matchPlay}`;
}

function situationOptions(format: FormatId) {
  if (format === "singles") {
    return [
      { id: "standard" as const, label: "All square" },
      { id: "protect" as const, label: "Protect lead" },
      { id: "must-win" as const, label: "Need hole" },
    ];
  }

  return [
    { id: "standard" as const, label: "Standard" },
    { id: "protect" as const, label: "Need safety" },
    { id: "safe" as const, label: "Ball is safe" },
    { id: "must-win" as const, label: "Need hole" },
  ];
}

function RatingDots({ value, color }: { value: number; color: "dark" | "green" }) {
  return (
    <div className="flex gap-1" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((dot) => (
        <span
          key={dot}
          className={`h-2 w-2 rounded-full ${dot <= value ? (color === "green" ? "bg-emerald-600" : "bg-[#102a23]") : "bg-black/10"}`}
        />
      ))}
    </div>
  );
}

export default function CourseCaddie() {
  const [tab, setTab] = useState<TabId>("caddie");
  const [courseId, setCourseId] = useState<CourseId>("gamble-sands");
  const [holeNumber, setHoleNumber] = useState(1);
  const [teeName, setTeeName] = useState("Sands");
  const [format, setFormat] = useState<FormatId>("fourball");
  const [shot, setShot] = useState<ShotId>("tee");
  const [situation, setSituation] = useState<SituationId>("standard");

  const championshipCourse = CHAMPIONSHIP_COURSES.find((course) => course.id === courseId);
  const tee = championshipCourse?.tees.find((item) => item.name === teeName) ?? championshipCourse?.tees.find((item) => item.name === championshipCourse.defaultTee);

  const courseHoles: CaddieHole[] = (() => {
    if (courseId === "quicksands") {
      return QUICKSANDS_HOLES.map((quick) => ({
        number: quick.number,
        par: quick.par,
        yards: quick.mappedYards,
        plan: quickPlan(quick.number),
        headline: quick.name ? `${quick.name}: use the contour` : "One number. One swing.",
        strategy: quick.plan,
        preferredMiss: "Middle of the usable green. Confirm today’s marker, wind and pin.",
        matchPlay: "One ball. Full routine. No reload.",
      }));
    }

    const course = championshipCourse ?? CHAMPIONSHIP_COURSES[0];
    const selectedTee = course.tees.find((item) => item.name === teeName) ?? course.tees.find((item) => item.name === course.defaultTee) ?? course.tees[0];
    return course.holes.map((hole) => ({
      ...hole,
      yards: selectedTee.holeYards[hole.number - 1],
    }));
  })();
  const holeCount = courseHoles.length;
  const selectedHole = courseHoles.find((hole) => hole.number === holeNumber) ?? courseHoles[0];

  const difficulty = courseId === "quicksands"
    ? quickDifficulty(selectedHole.number, selectedHole.yards)
    : championshipDifficulty(selectedHole.strokeIndex);
  const opportunity = scoringChance(selectedHole.plan);
  const light = getLight(selectedHole.plan, format, situation, shot);
  const lightStyle = LIGHT_STYLE[light];
  const situations = situationOptions(format);

  function selectCourse(nextCourse: CourseId) {
    setCourseId(nextCourse);
    setHoleNumber(1);
    const nextChampionshipCourse = CHAMPIONSHIP_COURSES.find((course) => course.id === nextCourse);
    if (nextChampionshipCourse) setTeeName(nextChampionshipCourse.defaultTee);
  }

  function selectFormat(nextFormat: FormatId) {
    setFormat(nextFormat);
    setSituation("standard");
  }

  function openFullCaddie(nextHole: number) {
    setHoleNumber(nextHole);
    setTab("caddie");
    window.requestAnimationFrame(() => {
      document.getElementById("caddie")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <main id="caddie" className="min-h-[calc(100vh-64px)] scroll-mt-20 bg-[#f4f0e7]">
      <div className="sticky top-[61px] z-40 border-b border-black/8 bg-[#f4f0e7]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl gap-1 px-4 py-2 sm:px-6">
          {([
            ["caddie", "Caddie call"],
            ["scorecards", "Scorecards"],
            ["prep", "Rules"],
          ] as [TabId, string][]).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex-1 rounded-xl px-3 py-3 text-[10px] font-bold uppercase tracking-[0.15em] transition ${
                tab === id ? "bg-[#102a23] text-white shadow-sm" : "text-black/45 hover:bg-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "caddie" ? (
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
          <section className="rounded-[1.75rem] border border-black/8 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9a6031]">On-course caddie</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Give me the shot. I’ll give you the call.</h1>
                <p className="mt-2 max-w-xl text-xs leading-5 text-black/45">
                  Pick the hole, format and situation. Then stop scrolling and hit it.
                </p>
              </div>
              <span className="hidden rounded-full bg-[#edf3ef] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#31594d] sm:block">Fee · one cold beer</span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-black/38">Course</span>
                <select
                  value={courseId}
                  onChange={(event) => selectCourse(event.target.value as CourseId)}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-[#f4f0e7] px-3 py-3 text-sm font-semibold outline-none focus:border-[#31594d]"
                >
                  <option value="gamble-sands">Gamble Sands</option>
                  <option value="scarecrow">Scarecrow</option>
                  <option value="quicksands">QuickSands</option>
                </select>
              </label>

              <label className="block">
                <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-black/38">Hole</span>
                <select
                  value={holeNumber}
                  onChange={(event) => setHoleNumber(Number(event.target.value))}
                  className="mt-2 w-full rounded-xl border border-black/10 bg-[#f4f0e7] px-3 py-3 text-sm font-semibold outline-none focus:border-[#31594d]"
                >
                  {Array.from({ length: holeCount }, (_, index) => index + 1).map((number) => (
                    <option key={number} value={number}>Hole {number}</option>
                  ))}
                </select>
              </label>

              {championshipCourse ? (
                <label className="block">
                  <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-black/38">Tee</span>
                  <select
                    value={tee?.name ?? championshipCourse.defaultTee}
                    onChange={(event) => setTeeName(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-black/10 bg-[#f4f0e7] px-3 py-3 text-sm font-semibold outline-none focus:border-[#31594d]"
                  >
                    {championshipCourse.tees.map((item) => (
                      <option key={item.name} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                </label>
              ) : (
                <div className="rounded-xl border border-black/8 bg-[#f4f0e7] px-3 py-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-black/38">Distance</span>
                  <div className="mt-2 text-sm font-semibold">{selectedHole.yards} mapped yards</div>
                </div>
              )}
            </div>
          </section>

          <section className="mt-4 rounded-[1.75rem] border border-black/8 bg-white p-4 sm:p-6">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-black/38">Format</p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {FORMATS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectFormat(item.id)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    format === item.id ? "border-[#31594d] bg-[#edf3ef] text-[#173d32]" : "border-black/8 bg-white text-black/55"
                  }`}
                >
                  <span className="block text-xs font-semibold">{item.label}</span>
                  <span className="mt-1 block font-mono text-[9px] opacity-55">{item.short} hcp</span>
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-black/38">Shot</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {SHOTS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setShot(item.id)}
                      className={`rounded-full border px-4 py-2.5 text-[10px] font-bold ${
                        shot === item.id ? "border-[#102a23] bg-[#102a23] text-white" : "border-black/10 text-black/48"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-black/38">Situation</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {situations.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSituation(item.id)}
                      className={`rounded-full border px-4 py-2.5 text-[10px] font-bold ${
                        situation === item.id ? "border-[#9a6031] bg-[#9a6031] text-white" : "border-black/10 text-black/48"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className={`mt-4 overflow-hidden rounded-[1.75rem] border shadow-sm ${lightStyle.shell}`}>
            <div className="relative h-64 overflow-hidden sm:h-80">
              <Image
                src={holeImage(courseId as VisualCourseId, selectedHole.number)}
                alt={`${courseId === "gamble-sands" ? "Official aerial view" : "Verified view"} of ${courseId === "quicksands" ? "QuickSands" : championshipCourse?.name} hole ${selectedHole.number}`}
                fill
                sizes="(max-width: 768px) 100vw, 1152px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/18 to-black/10" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white sm:p-7">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#efbd88]">
                    {courseId === "quicksands" ? "QuickSands" : championshipCourse?.name} · {courseId === "gamble-sands" ? "official aerial" : "verified hole view"}
                  </div>
                  <div className="mt-2 flex items-end gap-3">
                    <span className="font-mono text-7xl font-semibold leading-none tracking-[-0.08em] sm:text-8xl">
                      {selectedHole.number}
                    </span>
                    <span className="pb-2 font-mono text-xs text-white/56">
                      Par {selectedHole.par} · {selectedHole.yards} yds
                    </span>
                  </div>
                </div>
                <div className={`rounded-full px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.17em] ${lightStyle.badge}`}>
                  {lightStyle.label}
                </div>
              </div>
            </div>
            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.17em] text-black/42">
                    <span className={`h-2.5 w-2.5 rounded-full ${lightStyle.dot}`} />
                    {courseId === "quicksands" ? "QuickSands" : championshipCourse?.name} · Hole {selectedHole.number}
                  </div>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">{selectedHole.headline}</h2>
                  <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#9a6031]">
                    {holeMemory(courseId as VisualCourseId, selectedHole.number)}
                  </p>
                </div>
                {selectedHole.strokeIndex ? <div className="rounded-full border border-black/10 px-3 py-2 font-mono text-[9px] text-black/42">SI {selectedHole.strokeIndex}</div> : null}
              </div>

              <div className="mt-6 rounded-2xl bg-white/72 p-5">
                <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-black/38">The call · {SHOTS.find((item) => item.id === shot)?.label}</div>
                <p className="mt-2 text-lg font-semibold leading-7 text-[#102a23]">{shotCall(selectedHole, shot, light)}</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-black/38">{lightStyle.note}</p>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <article className="rounded-2xl bg-white/62 p-5">
                  <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#9a6031]">Hole plan</div>
                  <p className="mt-2 text-sm leading-6 text-black/62">{selectedHole.strategy}</p>
                </article>
                <article className="rounded-2xl bg-white/62 p-5">
                  <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#31594d]">Good miss</div>
                  <p className="mt-2 text-sm leading-6 text-black/62">{selectedHole.preferredMiss}</p>
                </article>
              </div>

              <article className="mt-3 rounded-2xl bg-[#102a23] p-5 text-white">
                <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#efbd88]">{FORMATS.find((item) => item.id === format)?.label} · format note</div>
                <p className="mt-2 text-sm leading-6 text-white/72">{formatCall(format, situation, selectedHole)}</p>
                <p className="mt-3 border-t border-white/10 pt-3 text-xs font-semibold leading-5 text-[#efbd88]">
                  {planTranslation(selectedHole.plan)}
                </p>
              </article>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-black/8 bg-white/55 p-4">
                  <div className="text-[8px] font-bold uppercase tracking-[0.16em] text-black/35">Difficulty</div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <RatingDots value={difficulty} color="dark" />
                    <span className="font-mono text-xs font-bold">{difficulty}/5</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-black/8 bg-white/55 p-4">
                  <div className="text-[8px] font-bold uppercase tracking-[0.16em] text-black/35">Scoring chance</div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <RatingDots value={opportunity} color="green" />
                    <span className="font-mono text-xs font-bold">{opportunity}/5</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <p className="mt-4 px-2 text-center text-[10px] leading-5 text-black/38">
            Recheck wind, lie and pin. Then trust the call and swing.
          </p>
        </div>
      ) : null}

      {tab === "scorecards" ? (
        <InteractiveScorecard
          courseId={courseId}
          courseName={courseId === "quicksands" ? "QuickSands" : championshipCourse?.name ?? "Gamble Sands"}
          format={format}
          holes={courseHoles}
          teeName={championshipCourse ? tee?.name ?? championshipCourse.defaultTee : undefined}
          teeOptions={championshipCourse?.tees}
          onCourseChange={selectCourse}
          onFormatChange={selectFormat}
          onTeeChange={setTeeName}
          onOpenFullCaddie={openFullCaddie}
        />
      ) : null}

      {tab === "prep" ? (
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-9">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9a6031]">Four things worth knowing</p>
            <h1 className="mt-1 text-4xl font-semibold tracking-[-0.055em]">Read this once. Save a couple doubles.</h1>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {RESORT_RULES.map(([title, copy], index) => (
              <article key={title} className="rounded-2xl border border-black/8 bg-white p-5">
                <div className="font-mono text-[10px] text-[#9a6031]">0{index + 1}</div>
                <h2 className="mt-3 text-xl font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-black/52">{copy}</p>
              </article>
            ))}
          </div>

          <div className="mt-8">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9a6031]">Course memory</p>
            <div className="mt-3 overflow-hidden rounded-2xl border border-black/8 bg-white">
              {COURSE_KEYS.map(([title, copy]) => (
                <article key={title} className="border-b border-black/8 p-5 last:border-0">
                  <h2 className="text-lg font-semibold">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-black/52">{copy}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-[1.75rem] bg-[#102a23] p-6 text-white">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#efbd88]">The 15-second caddie check</p>
            <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                "Wind, lie, pin.",
                "Landing spot and rollout.",
                "Name the good miss.",
                "Club, picture, swing.",
              ].map((item, index) => (
                <li key={item} className="rounded-xl border border-white/10 bg-white/[0.055] p-4">
                  <span className="font-mono text-[10px] text-[#efbd88]">0{index + 1}</span>
                  <p className="mt-2 text-sm leading-5 text-white/72">{item}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : null}
    </main>
  );
}
