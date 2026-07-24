"use client";

import { useState } from "react";

import {
  CHAMPIONSHIP_COURSES,
  QUICKSANDS_HOLES,
  planLabel,
  type ChampionshipCourseIntel,
  type HolePlan,
} from "@/lib/course-intelligence";

type TabId = "caddie" | "holes" | "prep";
type CourseId = ChampionshipCourseIntel["id"] | "quicksands";
type FormatId = "singles" | "fourball" | "shamble" | "scramble";
type ShotId = "tee" | "approach" | "short-game" | "putt";
type SituationId = "standard" | "protect" | "safe" | "must-win";
type LightId = "green" | "yellow" | "red";

interface CaddieHole {
  number: number;
  par: number;
  yards: number;
  strokeIndex?: number;
  plan: HolePlan;
  headline: string;
  strategy: string;
  preferredMiss: string;
  matchPlay: string;
}

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
  ["Sand is not a bunker", "All sandy areas are waste areas. Ground the club, take practice swings and remove loose impediments."],
  ["Grass marks the boundary", "Desert areas are red penalty areas. The edge is where maintained grass meets desert."],
  ["Carry is half the number", "Firm, fast fescue makes landing slope, bounce and runout part of every club choice."],
  ["Pin sheet before club", "Front/back and left/right pins can reverse the correct tee line—especially on Scarecrow."],
];

const COURSE_KEYS = [
  ["Gamble Sands", "Wide is not random. Choose the side that creates the angle, use the floor, and save aggression for 2, 8, 12, 13 and 18."],
  ["Scarecrow", "Smaller targets and visual deception reward center-green discipline. The pin location decides the preferred lane."],
  ["QuickSands", "Calibrate true carry, release and wind. The landing contour is more useful than the number painted on the marker."],
  ["Cascades", "Use the putting course as a speed lab: 20-, 40- and 60-foot pace, sidehill reads, then 6–10 footers under consequence."],
];

const LIGHT_STYLE: Record<LightId, { label: string; note: string; shell: string; badge: string; dot: string }> = {
  green: {
    label: "Green light",
    note: "Commit to the scoring line.",
    shell: "border-emerald-700/20 bg-emerald-50",
    badge: "bg-emerald-700 text-white",
    dot: "bg-emerald-500",
  },
  yellow: {
    label: "Yellow light",
    note: "Attack only when the condition is met.",
    shell: "border-amber-600/20 bg-amber-50",
    badge: "bg-amber-500 text-[#281b08]",
    dot: "bg-amber-400",
  },
  red: {
    label: "Red light",
    note: "No hero shot. Protect the hole.",
    shell: "border-rose-700/20 bg-rose-50",
    badge: "bg-rose-700 text-white",
    dot: "bg-rose-500",
  },
};

const PLAN_STYLE: Record<HolePlan, string> = {
  attack: "border-emerald-700/20 bg-emerald-50 text-emerald-900",
  swing: "border-amber-600/20 bg-amber-50 text-amber-900",
  protect: "border-rose-700/20 bg-rose-50 text-rose-900",
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
    return "Choose the landing number, flight and expected release before choosing the club. The flag is not automatically the target.";
  }

  if (shot === "tee") {
    if (light === "green") return "Take the scoring lane with one committed shape. Confirm the carry and runout; then swing without steering it.";
    if (light === "yellow") return "Choose the side that creates the next angle. Take the aggressive lane only if carry, wind and landing width all agree.";
    return "Find maintained grass first. Distance is secondary; the next shot must stay playable.";
  }

  if (shot === "approach") {
    if (light === "green") return "Attack through the fattest usable part of the target and let the feeder slope or release move the ball toward the hole.";
    if (light === "yellow") return "Use the center line unless the pin and ground contour clearly create a safe feeder. Do not short-side the team.";
    return "Play for the correct green section or a full layup number. A routine next shot beats a spectacular recovery.";
  }

  if (shot === "short-game") {
    if (light === "green") return "Use the simplest scoring route. If the entrance is open, putter, hybrid or a low runner removes strike and wind variance.";
    if (light === "yellow") return "Get the ball onto the correct shelf with predictable rollout. Choose landing spot before loft.";
    return "Take double bogey out of play: use the widest landing area and accept a longer putt.";
  }

  if (light === "green") return "Give the make a chance, but keep the comeback inside three feet. Start line plus capture speed—no timid swipe.";
  if (light === "yellow") return "Pace first. Read the final third, choose a start line, and finish the stroke.";
  return "Two-putt is the win. Die it into a three-foot circle and refuse the three-putt.";
}

function formatCall(format: FormatId, situation: SituationId, hole: CaddieHole) {
  if (format === "singles") {
    if (situation === "protect") return `You own the advantage. Make the opponent beat par. ${hole.matchPlay}`;
    if (situation === "must-win") return `You need the hole, not a highlight. Expand the target one level—but keep the big miss off the card. ${hole.matchPlay}`;
    return `No partner rescue: choose the shot you can repeat under pressure. ${hole.matchPlay}`;
  }

  if (format === "fourball") {
    if (situation === "safe") return `Partner is alive. You have permission to take the scoring line. ${hole.matchPlay}`;
    if (situation === "must-win") return `One ball finishes the hole; the other attacks the point. ${hole.matchPlay}`;
    return `Do not send both balls to the same trouble. Establish a score before increasing risk. ${hole.matchPlay}`;
  }

  if (format === "shamble") {
    if (situation === "safe") return `A playable drive is banked. Use the second tee ball to improve angle or distance. ${hole.matchPlay}`;
    return `The first job is a usable team drive. Once it exists, the next player can challenge the aggressive lane. ${hole.matchPlay}`;
  }

  if (situation === "safe") return `The first ball created permission. The second player attacks with full commitment. ${hole.matchPlay}`;
  if (situation === "must-win") return `Choose roles before the shot: one ball establishes the next position, one ball chases the ceiling. ${hole.matchPlay}`;
  return `First ball creates permission; second ball spends it. Never hit two half-aggressive shots. ${hole.matchPlay}`;
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
  const holeCount = courseId === "quicksands" ? QUICKSANDS_HOLES.length : 18;
  const tee = championshipCourse?.tees.find((item) => item.name === teeName) ?? championshipCourse?.tees.find((item) => item.name === championshipCourse.defaultTee);

  const selectedHole: CaddieHole = (() => {
    if (courseId === "quicksands") {
      const quick = QUICKSANDS_HOLES.find((item) => item.number === holeNumber) ?? QUICKSANDS_HOLES[0];
      return {
        number: quick.number,
        par: quick.par,
        yards: quick.mappedYards,
        plan: quickPlan(quick.number),
        headline: quick.name ? `${quick.name}: read the contour` : "One number, one committed flight",
        strategy: quick.plan,
        preferredMiss: "Center of the usable putting surface. Confirm the daily marker, wind and pin before choosing the club.",
        matchPlay: "Treat the rep like points count: one routine, one ball and no casual reload.",
      };
    }

    const course = championshipCourse ?? CHAMPIONSHIP_COURSES[0];
    const hole = course.holes.find((item) => item.number === holeNumber) ?? course.holes[0];
    const selectedTee = course.tees.find((item) => item.name === teeName) ?? course.tees.find((item) => item.name === course.defaultTee) ?? course.tees[0];
    return {
      ...hole,
      yards: selectedTee.holeYards[hole.number - 1],
    };
  })();

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

  function openHole(nextCourse: CourseId, nextHole: number) {
    selectCourse(nextCourse);
    setHoleNumber(nextHole);
    setTab("caddie");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f4f0e7]">
      <div className="sticky top-[61px] z-40 border-b border-black/8 bg-[#f4f0e7]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl gap-1 px-4 py-2 sm:px-6">
          {([
            ["caddie", "Caddie"],
            ["holes", "All holes"],
            ["prep", "Rules & prep"],
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
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9a6031]">On-course answer</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">What shot are we hitting?</h1>
              </div>
              <span className="hidden rounded-full bg-[#edf3ef] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#31594d] sm:block">Four inputs · one call</span>
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
            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.17em] text-black/42">
                    <span className={`h-2.5 w-2.5 rounded-full ${lightStyle.dot}`} />
                    {courseId === "quicksands" ? "QuickSands" : championshipCourse?.name} · Hole {selectedHole.number}
                  </div>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">{selectedHole.headline}</h2>
                  <p className="mt-2 font-mono text-xs text-black/48">
                    Par {selectedHole.par} · {selectedHole.yards} yds{selectedHole.strokeIndex ? ` · SI ${selectedHole.strokeIndex}` : ""}
                  </p>
                </div>
                <div className={`rounded-full px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.17em] ${lightStyle.badge}`}>
                  {lightStyle.label}
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-white/72 p-5">
                <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-black/38">The call · {SHOTS.find((item) => item.id === shot)?.label}</div>
                <p className="mt-2 text-lg font-semibold leading-7 text-[#102a23]">{shotCall(selectedHole, shot, light)}</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-black/38">{lightStyle.note}</p>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <article className="rounded-2xl bg-white/62 p-5">
                  <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#9a6031]">Hole truth</div>
                  <p className="mt-2 text-sm leading-6 text-black/62">{selectedHole.strategy}</p>
                </article>
                <article className="rounded-2xl bg-white/62 p-5">
                  <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#31594d]">Best miss</div>
                  <p className="mt-2 text-sm leading-6 text-black/62">{selectedHole.preferredMiss}</p>
                </article>
              </div>

              <article className="mt-3 rounded-2xl bg-[#102a23] p-5 text-white">
                <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#efbd88]">{FORMATS.find((item) => item.id === format)?.label} cue</div>
                <p className="mt-2 text-sm leading-6 text-white/72">{formatCall(format, situation, selectedHole)}</p>
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
            Reconfirm today&apos;s marker, wind, lie and pin. This tool makes the decision smaller; it does not overrule what your eyes see.
          </p>
        </div>
      ) : null}

      {tab === "holes" ? (
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-9">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9a6031]">Fast scan</p>
              <h1 className="mt-1 text-4xl font-semibold tracking-[-0.055em]">Rate every hole.</h1>
              <p className="mt-2 text-sm text-black/48">Tap any hole to load it into the Caddie with the current format.</p>
            </div>
            <select
              value={courseId}
              onChange={(event) => selectCourse(event.target.value as CourseId)}
              className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold outline-none"
            >
              <option value="gamble-sands">Gamble Sands</option>
              <option value="scarecrow">Scarecrow</option>
              <option value="quicksands">QuickSands</option>
            </select>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(courseId === "quicksands" ? QUICKSANDS_HOLES : championshipCourse?.holes ?? []).map((rawHole) => {
              const plan = courseId === "quicksands" ? quickPlan(rawHole.number) : (rawHole as ChampionshipCourseIntel["holes"][number]).plan;
              const yards = courseId === "quicksands"
                ? (rawHole as (typeof QUICKSANDS_HOLES)[number]).mappedYards
                : (tee?.holeYards[rawHole.number - 1] ?? 0);
              const strokeIndex = "strokeIndex" in rawHole ? rawHole.strokeIndex : undefined;
              const holeDifficulty = courseId === "quicksands" ? quickDifficulty(rawHole.number, yards) : championshipDifficulty(strokeIndex);
              return (
                <button
                  key={rawHole.number}
                  type="button"
                  onClick={() => openHole(courseId, rawHole.number)}
                  className="rounded-2xl border border-black/8 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-black/16"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#102a23] font-mono text-sm font-bold text-white">{rawHole.number}</span>
                      <div>
                        <div className="text-sm font-semibold">Par {rawHole.par} · {yards} yds</div>
                        <div className="mt-1 text-[9px] uppercase tracking-[0.13em] text-black/35">Difficulty {holeDifficulty}/5</div>
                      </div>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] ${PLAN_STYLE[plan]}`}>{planLabel(plan)}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <RatingDots value={holeDifficulty} color="dark" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#31594d]">Open caddie →</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {tab === "prep" ? (
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-9">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9a6031]">Remember four things</p>
            <h1 className="mt-1 text-4xl font-semibold tracking-[-0.055em]">Rules that save shots.</h1>
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
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#efbd88]">Thirty-second decision</p>
            <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                "Confirm pin, wind and lie.",
                "Choose landing area and release.",
                "Name the best miss.",
                "Pick club, flight and commit.",
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
