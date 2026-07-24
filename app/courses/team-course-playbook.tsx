"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  CHAMPIONSHIP_COURSES,
  courseHandicap,
  planLabel,
  strokesOnHole,
  type ChampionshipCourseIntel,
} from "@/lib/course-intelligence";
import { buildSaberBoard } from "@/lib/sabermetrics";
import type { PlayerDraftStats } from "@/lib/types";

type ChampionshipCourseId = "gamble-sands" | "scarecrow";

const TEAM_RULES = [
  {
    title: "Pick a landing spot",
    note: "Firm fescue makes the first bounce and rollout part of every yardage. Carry-only thinking will finish long.",
  },
  {
    title: "Green center beats flag",
    note: "Short-siding is the expensive mistake. Use slopes to improve a center target instead of firing directly at edges.",
  },
  {
    title: "Keep one ball alive",
    note: "In every partner format, the first playable ball buys permission for the second player to attack.",
  },
  {
    title: "Angle beats distance",
    note: "The longest drive is not automatically the best ball. Select the approach lane that exposes the largest usable green.",
  },
  {
    title: "Use the ground",
    note: "Putter, hybrid and chipped irons are scoring clubs from well off the green. Air is only one route.",
  },
  {
    title: "Deep sand is a penalty",
    note: "Avoid diagonal faces and waste areas even when the fairway looks enormous. Bogey is recoverable; repeated bunker shots are not.",
  },
  {
    title: "Know the pin section",
    note: "Scarecrow especially changes with front, middle and back locations. Read the sheet before choosing a tee line.",
  },
  {
    title: "Play the match",
    note: "A received stroke is a net-par target, not permission for a hero shot. Make the opponent beat the number.",
  },
];

const FORMAT_PLANS = [
  {
    round: "R1",
    course: "Gamble Sands",
    format: "Fourball · 80%",
    points: "15 points",
    plan:
      "Floor first. The steady player builds net par; the partner attacks contours only after a playable ball is established. Never have both balls short-sided.",
  },
  {
    round: "R2",
    course: "Scarecrow",
    format: "Shamble · 75%",
    points: "15 points",
    plan:
      "Choose the drive by angle, lie and sightline—not raw yardage. Bank one conservative tee ball, then let the second player challenge the scoring lane.",
  },
  {
    round: "R3",
    course: "Scarecrow",
    format: "Singles · 80%",
    points: "30 points",
    plan:
      "This is 40% of the event. Protect doubles, use strokes to build net pars and make the opponent take the first unnecessary risk.",
  },
  {
    round: "R4",
    course: "Gamble Sands",
    format: "2-Man Scramble · 35%/15%",
    points: "15 points",
    plan:
      "Set the order before every tee: reliable ball first, green-light swing second. On approaches, bank the green before attacking a feeder or tucked flag.",
  },
];

const PRACTICE_BLOCKS = [
  {
    title: "Ground-game ladder",
    when: "2× per week · 25 min",
    reps: [
      "Ten balls each with putter, hybrid and 7-iron from 5–20 yards off a green.",
      "Land every shot on one towel; record the average carry-to-roll ratio.",
      "Finish with nine up-and-down attempts using only the lowest-risk club.",
    ],
  },
  {
    title: "Flight + release matrix",
    when: "2× per week · 30 min",
    reps: [
      "Build stock, low and high carry numbers for 70, 100, 130 and 160 yards.",
      "Hit five balls downwind and into wind without changing the target.",
      "Write the club and landing adjustment that produced the smallest miss.",
    ],
  },
  {
    title: "Big-green speed",
    when: "3× per week · 20 min",
    reps: [
      "Three-ball lag ladder from 30, 50 and 70 feet; every ball must finish inside 6 feet.",
      "Putt five balls each direction across the strongest slope you can find.",
      "Finish by making 20 consecutive putts from 3 feet with a full routine.",
    ],
  },
  {
    title: "Partner decision reps",
    when: "Every team practice",
    reps: [
      "Say “safe” or “attack” before each tee shot—never decide during the swing.",
      "After both drives, choose the ball by green access and miss zone before checking distance.",
      "Play six holes where a double loses two holes; train against compounding mistakes.",
    ],
  },
];

function formatIndex(player: PlayerDraftStats | null) {
  if (!player || player.indexNum === null) return "—";
  return `${player.indexNum.toFixed(1)}${player.eventIndexCapped ? "*" : ""}`;
}

function holesWithStrokes(course: ChampionshipCourseIntel, handicap: number) {
  return course.holes
    .filter((hole) => strokesOnHole(handicap, hole.strokeIndex) > 0)
    .map((hole) => hole.number);
}

function holeList(values: number[]) {
  return values.length ? values.join(" · ") : "None";
}

function planTone(plan: "attack" | "swing" | "protect") {
  if (plan === "attack") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (plan === "protect") return "border-rose-200 bg-rose-50 text-rose-900";
  return "border-amber-200 bg-amber-50 text-amber-900";
}

function CourseDnaCard({
  course,
  onOpenCourse,
}: {
  course: ChampionshipCourseIntel;
  onOpenCourse: (courseId: ChampionshipCourseId) => void;
}) {
  const tee = course.tees.find((item) => item.name === course.defaultTee) ?? course.tees[0];
  const attack = course.holes.filter((hole) => hole.plan === "attack").map((hole) => hole.number);
  const protect = course.holes.filter((hole) => hole.plan === "protect").map((hole) => hole.number);
  const identity = course.id === "gamble-sands"
    ? {
        command: "Land short. Let it run.",
        rewards: "Creativity · rollout control · partner aggression",
        danger: "Diagonal sand · long/right misses · forgetting the ground route",
      }
    : {
        command: "Choose the angle before the club.",
        rewards: "Position · distance control · mistake avoidance",
        danger: "Wrong-side drives · smaller targets · infinity edges",
      };

  return (
    <article className="overflow-hidden rounded-[1.7rem] border border-black/10 bg-white shadow-sm">
      <div className="relative h-52 overflow-hidden bg-[#12352b]">
        <Image src={course.image} alt={`${course.name} course`} fill className="object-cover opacity-75" sizes="(min-width: 1024px) 50vw, 100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/50">{course.tournamentRounds}</div>
          <h3 className="mt-1 text-3xl font-medium tracking-[-0.045em]">{course.name}</h3>
        </div>
      </div>
      <div className="p-5 md:p-6">
        <div className="rounded-2xl bg-[#153a30] p-4 text-white">
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#d8c3a1]">One command</div>
          <div className="mt-1 text-xl font-medium">{identity.command}</div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-black/8">
          {[
            [tee.yards.toLocaleString(), `${tee.name} yards`],
            [tee.rating.toFixed(1), "rating"],
            [String(tee.slope), "slope"],
          ].map(([value, label]) => (
            <div key={label} className="bg-[#f7f5f0] p-3 text-center">
              <div className="font-mono text-lg font-semibold">{value}</div>
              <div className="mt-1 text-[8px] font-semibold uppercase tracking-[0.13em] text-black/35">{label}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-3 text-xs leading-5">
          <div><b className="text-black/75">Rewards:</b> <span className="text-black/55">{identity.rewards}</span></div>
          <div><b className="text-black/75">Danger:</b> <span className="text-black/55">{identity.danger}</span></div>
          <div><b className="text-emerald-800">Attack:</b> <span className="font-mono text-black/60">{holeList(attack)}</span></div>
          <div><b className="text-rose-800">Protect:</b> <span className="font-mono text-black/60">{holeList(protect)}</span></div>
        </div>

        <button
          type="button"
          onClick={() => onOpenCourse(course.id)}
          className="mt-6 w-full rounded-xl bg-black px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white"
        >
          Open all 18 holes
        </button>
      </div>
    </article>
  );
}

export default function TeamCoursePlaybook({
  players,
  loadingPlayers,
  onOpenCourse,
}: {
  players: PlayerDraftStats[];
  loadingPlayers: boolean;
  onOpenCourse: (courseId: ChampionshipCourseId) => void;
}) {
  const [playerId, setPlayerId] = useState("matt-wixted");
  const selectedPlayer = players.find((player) => player.id === playerId) ?? players[0] ?? null;
  const board = useMemo(() => players.length ? buildSaberBoard(players) : [], [players]);

  const courseMaps = CHAMPIONSHIP_COURSES.map((course) => {
    const tee = course.tees.find((item) => item.name === course.defaultTee) ?? course.tees[0];
    const courseHc = selectedPlayer?.indexNum == null
      ? null
      : courseHandicap(selectedPlayer.indexNum, tee, course.par);
    const at80 = courseHc === null ? null : Math.round(courseHc * 0.8);
    const at75 = courseHc === null ? null : Math.round(courseHc * 0.75);
    return {
      course,
      tee,
      courseHc,
      at80,
      at75,
      holes80: at80 === null ? [] : holesWithStrokes(course, at80),
      holes75: at75 === null ? [] : holesWithStrokes(course, at75),
    };
  });

  const gambleLeaders = [...board].sort((a, b) => b.gambleFit - a.gambleFit).slice(0, 5);
  const scarecrowLeaders = [...board].sort((a, b) => b.scarecrowFit - a.scarecrowFit).slice(0, 5);

  return (
    <>
      <section className="relative overflow-hidden bg-[#0b2b24] text-white">
        <Image src="/courses/gamble-sands.jpg" alt="Gamble Sands above the Columbia River" fill priority className="object-cover opacity-30" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#092922] via-[#092922]/92 to-[#092922]/45" />
        <div className="relative mx-auto grid min-h-[600px] max-w-[1400px] items-end gap-10 px-5 py-14 md:px-8 md:py-20 lg:grid-cols-[1.12fr_0.88fr]">
          <div>
            <div className="inline-flex rounded-full border border-white/15 bg-white/8 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/65">
              Team field guide · Aug 20–23
            </div>
            <h1 className="mt-6 max-w-[12ch] text-5xl font-medium leading-[0.92] tracking-[-0.065em] sm:text-6xl md:text-7xl">
              The plan that wins holes.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/65 md:text-lg">
              Both championship courses, all 36 decisions, every format, personal stroke maps and the exact preparation plan—built into one mobile field guide.
            </p>
            <div className="mt-8 flex flex-wrap gap-2 text-[9px] font-semibold uppercase tracking-[0.14em]">
              {["Land short", "Use the slope", "One ball safe", "Center green", "Protect doubles"].map((item) => (
                <span key={item} className="rounded-full border border-white/14 bg-black/15 px-3 py-2 text-white/70">{item}</span>
              ))}
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-white/12 bg-black/20 p-5 backdrop-blur-md md:p-6">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d8c3a1]">Team promise</div>
            <p className="mt-3 text-2xl font-medium leading-tight tracking-[-0.035em]">
              We will not lose holes by making the same mistake twice.
            </p>
            <ol className="mt-6 space-y-4">
              {[
                "Say the target and preferred miss before every full swing.",
                "In partner golf, establish safety before buying aggression.",
                "After a bad shot, recover to the largest target—not the flag.",
                "Use the live stroke map; never guess who gets a shot.",
              ].map((item, index) => (
                <li key={item} className="grid grid-cols-[1.8rem_1fr] gap-3 text-sm leading-6 text-white/65">
                  <span className="font-mono text-white/30">0{index + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
            <button type="button" onClick={() => window.print()} className="mt-7 w-full rounded-xl bg-[#d8c3a1] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#0b2b24] print:hidden">
              Print / save field guide
            </button>
          </div>
        </div>
      </section>

      <section id="course-dna" className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
        <div className="max-w-3xl">
          <p className="label">Course DNA</p>
          <h2 className="section-title mt-3">Same family. Different assignment.</h2>
          <p className="mt-4 text-sm leading-6 text-black/55">
            Both are wide, firm and built for options. Gamble Sands rewards imaginative ground control; Scarecrow uses steeper land, smaller greens and pin-dependent angles to punish the wrong kind of width.
          </p>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {CHAMPIONSHIP_COURSES.map((course) => (
            <CourseDnaCard key={course.id} course={course} onOpenCourse={onOpenCourse} />
          ))}
        </div>
      </section>

      <section className="border-y border-black/8 bg-white">
        <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr]">
            <div>
              <p className="label">Eight team rules</p>
              <h2 className="section-title mt-3">Our decision system.</h2>
              <p className="mt-4 text-sm leading-6 text-black/55">
                These are more important than memorizing 36 perfect shots. They travel across both courses and every format.
              </p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-2xl bg-black/8 sm:grid-cols-2">
              {TEAM_RULES.map((rule, index) => (
                <article key={rule.title} className="bg-[#f7f5f0] p-5">
                  <div className="font-mono text-[10px] text-[#9c6436]">{String(index + 1).padStart(2, "0")}</div>
                  <h3 className="mt-2 font-medium">{rule.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-black/52">{rule.note}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="stroke-map" className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
        <div className="rounded-[2rem] bg-[#153a30] p-5 text-white md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d8c3a1]">Personal stroke plan</p>
              <h2 className="mt-2 text-3xl font-medium tracking-[-0.045em]">Find your number before the first tee.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                Select yourself to see the course handicap and format allowances from the planned Sands tees.
              </p>
            </div>
            <select
              value={selectedPlayer?.id ?? ""}
              onChange={(event) => setPlayerId(event.target.value)}
              disabled={loadingPlayers || !players.length}
              className="min-w-64 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none"
              aria-label="Select player for team course plan"
            >
              {loadingPlayers ? <option>Loading roster…</option> : null}
              {[...players].sort((a, b) => (a.indexNum ?? 99) - (b.indexNum ?? 99)).map((player) => (
                <option key={player.id} value={player.id} className="text-black">
                  {player.name} · {formatIndex(player)}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-2">
            {courseMaps.map(({ course, tee, courseHc, at80, at75, holes80, holes75 }) => (
              <article key={course.id} className="rounded-[1.4rem] border border-white/12 bg-black/15 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">{tee.name} tees · {tee.yards.toLocaleString()} yards</div>
                    <h3 className="mt-1 text-xl font-medium">{course.name}</h3>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-3xl font-semibold">{courseHc ?? "—"}</div>
                    <div className="text-[8px] uppercase tracking-[0.15em] text-white/35">course HC</div>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/10">
                  <div className="bg-[#153a30] p-4">
                    <div className="text-[9px] uppercase tracking-[0.14em] text-white/35">
                      {course.id === "gamble-sands" ? "Fourball · 80%" : "Shamble · 75%"}
                    </div>
                    <div className="mt-1 font-mono text-2xl font-semibold">
                      {course.id === "gamble-sands" ? at80 ?? "—" : at75 ?? "—"}
                    </div>
                    <div className="mt-2 text-[10px] leading-4 text-white/45">
                      Stroke holes: {holeList(course.id === "gamble-sands" ? holes80 : holes75)}
                    </div>
                  </div>
                  <div className="bg-[#153a30] p-4">
                    {course.id === "gamble-sands" ? (
                      <>
                        <div className="text-[9px] uppercase tracking-[0.14em] text-white/35">Scramble allowance</div>
                        <div className="mt-1 font-mono text-2xl font-semibold">Pair</div>
                        <div className="mt-2 text-[10px] leading-4 text-white/45">35% low HC + 15% high HC</div>
                      </>
                    ) : (
                      <>
                        <div className="text-[9px] uppercase tracking-[0.14em] text-white/35">Singles · 80%</div>
                        <div className="mt-1 font-mono text-2xl font-semibold">{at80 ?? "—"}</div>
                        <div className="mt-2 text-[10px] leading-4 text-white/45">Stroke holes: {holeList(holes80)}</div>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-5 text-[10px] leading-5 text-white/38">
            Preparation estimate only. In the real match, the lowest allowance in the group plays from zero and everyone else receives the difference; the live scorecard is authoritative. Scramble uses 35% of the low course handicap plus 15% of the high.
          </p>
        </div>
      </section>

      <section id="formats" className="border-y border-black/8 bg-[#ece7dc]">
        <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
          <div className="max-w-3xl">
            <p className="label">75-point game plan</p>
            <h2 className="section-title mt-3">The format changes the right shot.</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {FORMAT_PLANS.map((item) => (
              <article key={item.round} className="rounded-[1.5rem] border border-black/8 bg-white p-5 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/35">{item.round} · {item.course}</div>
                    <h3 className="mt-1 text-xl font-medium">{item.format}</h3>
                  </div>
                  <span className="rounded-full bg-[#f7f5f0] px-3 py-1.5 font-mono text-[10px] text-black/45">{item.points}</span>
                </div>
                <p className="mt-4 text-sm leading-6 text-black/58">{item.plan}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="label">Course-fit board</p>
            <h2 className="section-title mt-3">Who each course rewards.</h2>
            <p className="mt-4 text-sm leading-6 text-black/55">
              This is preparation guidance, not a guarantee. Missing shot-level data stays neutral; confidence is shown in the full course view.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { label: "Gamble Sands", leaders: gambleLeaders, fitKey: "gamble" as const },
              { label: "Scarecrow", leaders: scarecrowLeaders, fitKey: "scarecrow" as const },
            ].map(({ label, leaders, fitKey }) => (
              <article key={label} className="overflow-hidden rounded-[1.4rem] border border-black/10 bg-white">
                <div className="bg-[#153a30] px-5 py-4 text-white">
                  <div className="text-[9px] uppercase tracking-[0.18em] text-white/40">Top course fit</div>
                  <h3 className="mt-1 text-xl font-medium">{label}</h3>
                </div>
                {leaders.map((metric, index) => (
                  <div key={metric.player.id} className="grid grid-cols-[2rem_1fr_auto] items-center border-b border-black/6 px-4 py-3 text-sm last:border-0">
                    <span className="font-mono text-black/30">{index + 1}</span>
                    <span><b className="font-medium">{metric.player.nickname}</b><span className="ml-2 text-[10px] text-black/35">{formatIndex(metric.player)}</span></span>
                    <span className="font-mono font-semibold">{(fitKey === "gamble" ? metric.gambleFit : metric.scarecrowFit).toFixed(0)}</span>
                  </div>
                ))}
                {!leaders.length ? <div className="p-6 text-center text-sm text-black/40">Loading fit model…</div> : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="critical-holes" className="border-y border-black/8 bg-white">
        <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
          <div className="max-w-3xl">
            <p className="label">36-hole decision map</p>
            <h2 className="section-title mt-3">Know where to spend aggression.</h2>
            <p className="mt-4 text-sm leading-6 text-black/55">
              Green means the architecture gives you a real scoring route. Red means par or net par is a good result. Amber means the live match and pin should make the decision.
            </p>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {CHAMPIONSHIP_COURSES.map((course) => (
              <article key={course.id} className="rounded-[1.5rem] border border-black/10 bg-[#f7f5f0] p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/35">{course.tournamentRounds}</div>
                    <h3 className="mt-1 text-2xl font-medium">{course.name}</h3>
                  </div>
                  <button type="button" onClick={() => onOpenCourse(course.id)} className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#153a30] underline underline-offset-4">
                    Full detail
                  </button>
                </div>
                <div className="mt-5 grid grid-cols-6 gap-2 sm:grid-cols-9">
                  {course.holes.map((hole) => (
                    <div key={hole.number} title={`${hole.headline}: ${hole.preferredMiss}`} className={`rounded-xl border p-2 text-center ${planTone(hole.plan)}`}>
                      <div className="font-mono text-sm font-semibold">{hole.number}</div>
                      <div className="mt-1 text-[8px] uppercase opacity-60">P{hole.par}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 grid gap-2">
                  {course.holes.filter((hole) => hole.number >= 15 || hole.strokeIndex <= 3).slice(0, 5).map((hole) => (
                    <div key={hole.number} className="grid grid-cols-[2.2rem_1fr] items-start gap-3 rounded-xl bg-white p-3">
                      <span className="font-mono text-sm font-semibold">#{hole.number}</span>
                      <div>
                        <div className="text-xs font-medium">{planLabel(hole.plan)} · {hole.headline}</div>
                        <div className="mt-1 text-[10px] leading-4 text-black/45">{hole.preferredMiss}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="practice" className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[0.66fr_1.34fr]">
          <div>
            <p className="label">Preparation plan</p>
            <h2 className="section-title mt-3">Train the shots the resort asks for.</h2>
            <p className="mt-4 text-sm leading-6 text-black/55">
              Brewster in August is typically hot and dry, and the courses are designed to run firm. A precise long-range forecast is not reliable yet, so prepare trajectories and landing numbers instead of one expected wind.
            </p>
            <div className="mt-6 rounded-2xl bg-[#153a30] p-5 text-white">
              <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#d8c3a1]">Pack for the assignment</div>
              <p className="mt-2 text-xs leading-5 text-white/55">
                Light layer · sun protection · lip balm · two gloves · large towel · water + electrolytes · rangefinder · permanent marker · one reliable ground-game club.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {PRACTICE_BLOCKS.map((block) => (
              <article key={block.title} className="rounded-[1.4rem] border border-black/10 bg-white p-5">
                <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#9c6436]">{block.when}</div>
                <h3 className="mt-2 text-xl font-medium">{block.title}</h3>
                <ul className="mt-4 space-y-3">
                  {block.reps.map((rep) => (
                    <li key={rep} className="flex gap-3 text-xs leading-5 text-black/55">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#153a30]" />
                      <span>{rep}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-black/8 bg-[#153a30] text-white">
        <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
          <div className="max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d8c3a1]">Thursday calibration</p>
            <h2 className="mt-3 text-4xl font-medium tracking-[-0.05em]">Turn the warm-up into an advantage.</h2>
          </div>
          <div className="mt-8 grid gap-px overflow-hidden rounded-2xl bg-white/12 md:grid-cols-4">
            {[
              ["QuickSands", "Record one trusted carry, one rollout ratio and one bank-shot club. The 60–180 yard range is your wedge/short-iron laboratory."],
              ["Cascades", "Lag from 30, 50 and 70 feet. Measure the pace at which gravity takes over and choose putter vs hybrid from the fringe."],
              ["Range", "Hit five low drivers and five stock drivers. Mark the carry difference; firm turf will supply the rest."],
              ["Team huddle", "Share four notes only: green speed, wind adjustment, best ground club and the miss that must be avoided."],
            ].map(([title, note], index) => (
              <article key={title} className="bg-[#153a30] p-5">
                <div className="font-mono text-[10px] text-white/25">0{index + 1}</div>
                <h3 className="mt-2 font-medium">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-white/45">{note}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 max-w-4xl text-[10px] leading-5 text-white/35">
            Climate guidance is planning context, not a tournament forecast. Review the actual hourly wind, temperature, tee markers and pin sheet each morning.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-[1400px] px-5 py-10 md:px-8">
          <p className="max-w-5xl text-xs leading-5 text-black/45">
            Course strategy is paraphrased from Gamble Sands, David McLay Kidd and Nick Schaan. Official scorecards control yardage, rating, slope, par and stroke index; daily conditions control the final decision.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            <a href="https://www.gamblesands.com/gamble-sands/" target="_blank" rel="noreferrer" className="text-xs font-semibold uppercase tracking-[0.13em] text-[#14352a] underline decoration-black/20 underline-offset-4">Official Gamble Sands overview ↗</a>
            <a href="https://www.gamblesands.com/scarecrow/" target="_blank" rel="noreferrer" className="text-xs font-semibold uppercase tracking-[0.13em] text-[#14352a] underline decoration-black/20 underline-offset-4">Official Scarecrow overview ↗</a>
            <a href="https://www.gamblesands.com/scarecrow-inside-the-design-mind/" target="_blank" rel="noreferrer" className="text-xs font-semibold uppercase tracking-[0.13em] text-[#14352a] underline decoration-black/20 underline-offset-4">Designer hole-by-hole ↗</a>
          </div>
        </div>
      </section>
    </>
  );
}
