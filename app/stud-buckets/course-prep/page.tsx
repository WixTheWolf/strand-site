import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";

import AccessGate from "../access-gate";
import TeamPrepMetrics from "./team-prep-metrics";
import {
  CHAMPIONSHIP_COURSES,
  COURSE_SOURCE_NOTE,
  QUICKSANDS_HOLES,
  planLabel,
  type ChampionshipCourseIntel,
  type HolePlan,
} from "@/lib/course-intelligence";
import {
  STUD_BUCKETS_ACCESS_COOKIE,
  studBucketsAccessConfigured,
  verifyStudBucketsSession,
} from "@/lib/stud-buckets-auth";

export const metadata: Metadata = {
  title: "Stud Buckets Game Plan | The Strand 2026",
  description: "Private course preparation and team strategy for the Stud Buckets.",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const FEATURED_HOLES: Record<ChampionshipCourseIntel["id"], number[]> = {
  "gamble-sands": [2, 8, 12, 13, 17, 18],
  scarecrow: [1, 5, 9, 12, 15, 18],
};

const COURSE_PREP: Record<ChampionshipCourseIntel["id"], string[]> = {
  "gamble-sands": [
    "Build a carry-and-release wedge chart from 80–160 yards. The landing number matters more than the final yardage.",
    "Practice three low options from 10–40 yards: putter, hybrid bump and low-checking wedge.",
    "Rehearse one committed driver shape. Width helps, but diagonal sand punishes the two-way miss.",
    "Lag putt from 35–60 feet over slopes. First-putt speed will decide more holes than flag hunting.",
  ],
  scarecrow: [
    "Practice center-green shots from 145–195 yards. Smaller targets and long par 3s punish short-sided misses.",
    "Train side selection from the tee: right or left must be chosen from the pin location, not from habit.",
    "Hit uneven-lie approaches and controlled three-quarter shots. The ground moves more than it appears.",
    "Make 6–10 footers under consequence. Singles will be won by finishing holes, not by winning the driving contest.",
  ],
};

const FOUR_WEEK_PLAN = [
  {
    week: "Week 1",
    title: "Build the numbers",
    work: "Confirm driver carry, stock shape and wedge carries at 80, 100, 120, 140 and 160. Record actual carry—not range-ball optimism.",
  },
  {
    week: "Week 2",
    title: "Own the ground",
    work: "Two sessions of putter, hybrid and low-wedge shots from tight turf. Add 30–60 foot lag putting and downhill speed control.",
  },
  {
    week: "Week 3",
    title: "Practice the formats",
    work: "Play nine holes of best ball or shamble. Announce safe ball, green light and match status before every aggressive shot.",
  },
  {
    week: "Week 4",
    title: "Sharpen, then arrive fresh",
    work: "Short pressure practice, no swing rebuild. Prioritize sleep, walking tolerance, hydration and pain-free mobility for 36-hole days.",
  },
];

const NON_NEGOTIABLES = [
  ["One ball in grass", "In partner formats, the first job is permission. Once one ball is playable, the second player can attack."],
  ["Center is a weapon", "These greens create three-putts and impossible recoveries. Twenty-five feet is often a winning shot."],
  ["Use the floor", "Firm turf, feeder slopes and open entrances reward low shots. Aerial-only golf leaves shots behind."],
  ["Kill doubles", "The opponent should have to earn every point. Punch out, take medicine and keep bogey in the hole."],
];

const FIRST_TEE_CARD = [
  "Know the match and who receives strokes before the first shot.",
  "Say the plan out loud: safe ball, target side, preferred miss and green-light player.",
  "Commit to one start line. No steering after choosing the aggressive route.",
  "Read landing area, wind and rollout—not only the flag and GPS number.",
  "After every hole: confirm match status, reset and move. No emotional carryover.",
];

const PACK_LIST = [
  "Two pairs of broken-in golf shoes",
  "Extra socks and blister care",
  "Electrolytes and on-course calories",
  "Sunscreen, lip protection and sunglasses",
  "Light rain/wind layer",
  "Athletic tape and personal recovery gear",
  "Rangefinder plus charged phone/power bank",
  "One reliable ball model for the full weekend",
];

const PLAN_STYLE: Record<HolePlan, string> = {
  attack: "border-amber-300/35 bg-amber-200/10 text-amber-100",
  swing: "border-sky-300/30 bg-sky-200/10 text-sky-100",
  protect: "border-emerald-300/30 bg-emerald-200/10 text-emerald-100",
};

function planCount(course: ChampionshipCourseIntel, plan: HolePlan) {
  return course.holes.filter((hole) => hole.plan === plan).length;
}

function CourseSection({ course }: { course: ChampionshipCourseIntel }) {
  const tee = course.tees.find((item) => item.name === course.defaultTee) ?? course.tees[0];
  const featured = FEATURED_HOLES[course.id]
    .map((number) => course.holes.find((hole) => hole.number === number))
    .filter((hole): hole is NonNullable<typeof hole> => Boolean(hole));

  return (
    <section id={course.id} className="scroll-mt-24 border-t border-black/8 bg-[#f4f0e7] py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9a6031]">{course.tournamentRounds}</p>
            <h2 className="mt-3 text-5xl font-semibold tracking-[-0.065em] md:text-7xl">{course.name}</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-black/58">{course.design}</p>
            <div className="mt-7 grid grid-cols-3 gap-2">
              {[
                [`${tee.yards.toLocaleString()}`, `${tee.name} yards`],
                [`${course.par}`, "Par"],
                [`${tee.rating} / ${tee.slope}`, "Rating / slope"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-black/8 bg-white p-4">
                  <div className="text-2xl font-semibold tracking-[-0.04em]">{value}</div>
                  <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-black/35">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[340px] overflow-hidden rounded-[2rem] bg-[#102a23] shadow-xl md:min-h-[460px]">
            <Image src={course.image} alt={`${course.name} golf course`} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 60vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/5" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">Winning formula</div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {course.winningFormula.map((line, index) => (
                  <div key={line} className="flex gap-3 rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur-sm">
                    <span className="font-mono text-xs text-[#efbd88]">0{index + 1}</span>
                    <p className="text-xs leading-5 text-white/78">{line}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
          <article className="rounded-[2rem] bg-[#071b18] p-6 text-white md:p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#efbd88]">Prepare for this course</p>
            <div className="mt-6 space-y-5">
              {COURSE_PREP[course.id].map((item, index) => (
                <div key={item} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/8 font-mono text-[10px] text-[#efbd88]">{index + 1}</span>
                  <p className="text-sm leading-6 text-white/62">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-3 gap-2 border-t border-white/10 pt-6">
              {(["attack", "swing", "protect"] as HolePlan[]).map((plan) => (
                <div key={plan} className="rounded-2xl bg-white/[0.055] p-4 text-center">
                  <div className="text-3xl font-semibold text-[#efbd88]">{planCount(course, plan)}</div>
                  <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/38">{planLabel(plan)}</div>
                </div>
              ))}
            </div>
          </article>

          <article>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a6031]">Six holes to know cold</p>
                <h3 className="mt-2 text-3xl font-semibold tracking-[-0.045em] md:text-4xl">Match-deciding assignments</h3>
              </div>
              <Link href="/courses" className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#31594d]">Open all 18 holes →</Link>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {featured.map((hole) => (
                <div key={hole.number} className="rounded-[1.5rem] border border-black/8 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#102a23] font-mono text-sm font-bold text-white">{hole.number}</span>
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/35">Par {hole.par} · SI {hole.strokeIndex}</div>
                        <h4 className="text-base font-semibold">{hole.headline}</h4>
                      </div>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.14em] ${PLAN_STYLE[hole.plan]}`}>{planLabel(hole.plan)}</span>
                  </div>
                  <p className="mt-4 text-xs leading-5 text-black/55">{hole.strategy}</p>
                  <div className="mt-4 rounded-xl bg-[#f4f0e7] px-3 py-3 text-xs leading-5 text-black/52"><strong className="text-black/72">Match call:</strong> {hole.matchPlay}</div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default async function CoursePrepPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(STUD_BUCKETS_ACCESS_COOKIE)?.value;
  const authorized = verifyStudBucketsSession(session);

  if (!authorized) {
    return <AccessGate configured={studBucketsAccessConfigured()} />;
  }

  const quickMin = Math.min(...QUICKSANDS_HOLES.map((hole) => hole.mappedYards));
  const quickMax = Math.max(...QUICKSANDS_HOLES.map((hole) => hole.mappedYards));

  return (
    <div id="top" className="min-h-screen bg-[#f4f0e7] text-[#10201b]">
      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#071b18]/95 text-white backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-3 md:px-8">
          <Link href="/stud-buckets" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e39a50] text-sm font-black text-[#10251e]">SB</span>
            <span><span className="block text-[9px] uppercase tracking-[0.2em] text-white/38">Private team field guide</span><span className="block text-sm font-semibold">Stud Buckets</span></span>
          </Link>
          <nav className="hidden items-center gap-5 text-[9px] font-bold uppercase tracking-[0.15em] text-white/55 lg:flex">
            <Link href="#team-metrics">Our team</Link>
            <Link href="#gamble-sands">Gamble Sands</Link>
            <Link href="#scarecrow">Scarecrow</Link>
            <Link href="#practice">Practice</Link>
            <Link href="#first-tee">First tee</Link>
          </nav>
          <Link href="/live" className="rounded-full border border-white/12 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.17em] text-white/58">Live scoring</Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#071b18] text-white">
          <Image src="/courses/gamble-sands.jpg" alt="Gamble Sands fairways above the Columbia River" fill priority className="object-cover opacity-30" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071b18] via-[#071b18]/90 to-[#071b18]/55" />
          <div className="relative mx-auto max-w-[1440px] px-5 py-20 md:px-8 md:py-28">
            <div className="max-w-4xl">
              <div className="inline-flex rounded-full border border-[#e39a50]/30 bg-[#e39a50]/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.22em] text-[#efbd88]">Private · Stud Buckets only · study this</div>
              <h1 className="mt-7 max-w-[11ch] text-6xl font-semibold leading-[0.88] tracking-[-0.075em] sm:text-7xl md:text-8xl">Win before we arrive.</h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-white/62 md:text-lg">The complete Stud Buckets assignment: our ten-man metric board, WIX and J-BONE captain benchmark, personal strokes, 36 course decisions and the work required before Gamble Sands.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="#team-metrics" className="rounded-full bg-[#e39a50] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#10251e]">Open our team board</Link>
                <Link href="#first-tee" className="rounded-full border border-white/16 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/78">Save the first-tee card</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-black/8 bg-white">
          <div className="mx-auto grid max-w-[1440px] gap-px bg-black/8 md:grid-cols-4">
            {NON_NEGOTIABLES.map(([title, copy], index) => (
              <article key={title} className="bg-white p-6 md:p-7">
                <div className="font-mono text-[10px] text-[#9a6031]">0{index + 1}</div>
                <h2 className="mt-4 text-xl font-semibold">{title}</h2>
                <p className="mt-2 text-xs leading-5 text-black/50">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <TeamPrepMetrics />

        {CHAMPIONSHIP_COURSES.map((course) => <CourseSection key={course.id} course={course} />)}

        <section className="bg-[#102a23] py-16 text-white md:py-24">
          <div className="mx-auto grid max-w-[1440px] gap-8 px-5 md:px-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#efbd88]">Thursday · QuickSands</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.055em] md:text-6xl">This is calibration, not a throwaway round.</h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/55">The mapped 14-hole card runs {quickMin}–{quickMax} yards. Use it to learn the turf, wind, release and wedge numbers before team points begin.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["Carry", "Write down the true carry for the first five solid wedge shots."],
                ["Release", "Track how far each trajectory runs after landing on firm turf."],
                ["Wind", "Compare feel, flag and actual ball flight. Trust the ball."],
                ["Ground club", "Choose the most reliable club from off the green: putter, hybrid or low wedge."],
                ["Green speed", "Roll long putts uphill and downhill before chasing short putts."],
                ["Routine", "Play the final three holes with full match routine and no casual second ball."],
              ].map(([title, copy], index) => (
                <div key={title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-5">
                  <div className="font-mono text-[10px] text-[#efbd88]">0{index + 1}</div>
                  <h3 className="mt-3 text-xl font-semibold">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/48">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="practice" className="scroll-mt-24 py-16 md:py-24">
          <div className="mx-auto max-w-[1440px] px-5 md:px-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9a6031]">Four-week runway</p>
            <h2 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.055em] md:text-6xl">Practice what the courses will actually ask for.</h2>
            <div className="mt-10 grid gap-4 lg:grid-cols-4">
              {FOUR_WEEK_PLAN.map((item, index) => (
                <article key={item.week} className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#9a6031]">{item.week}</span><span className="font-mono text-[10px] text-black/25">0{index + 1}</span></div>
                  <h3 className="mt-5 text-2xl font-semibold">{item.title}</h3>
                  <p className="mt-4 text-sm leading-6 text-black/52">{item.work}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-black/8 bg-white py-16 md:py-24">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-5 md:px-8 lg:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9a6031]">36-hole readiness</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.055em]">Do not lose Saturday in the hotel room.</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-black/52">Friday and Saturday are double-round days. Equipment, feet, food and hydration are performance variables—not housekeeping.</p>
              <div className="mt-8 grid gap-2 sm:grid-cols-2">
                {PACK_LIST.map((item) => <div key={item} className="flex items-start gap-3 rounded-xl bg-[#f4f0e7] px-4 py-3 text-xs leading-5 text-black/58"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#31594d]" />{item}</div>)}
              </div>
            </div>
            <div className="rounded-[2rem] bg-[#071b18] p-7 text-white md:p-9">
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#efbd88]">Between rounds</div>
              <div className="mt-6 space-y-5">
                {[
                  ["Refuel immediately", "Carbohydrate, protein, fluids and sodium before sitting down for a long lunch."],
                  ["Change the contact points", "Dry socks, fresh shirt and a second pair of shoes prevent small problems becoming swing changes."],
                  ["Ten-minute reset", "Hips, calves, thoracic rotation and breathing. No exhausting workout and no hour-long range rebuild."],
                  ["Review only decisions", "Talk target, club and match communication—not every bad swing from the morning."],
                ].map(([title, copy], index) => (
                  <div key={title} className="flex gap-4"><span className="font-mono text-xs text-[#efbd88]">0{index + 1}</span><div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-xs leading-5 text-white/48">{copy}</p></div></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="first-tee" className="scroll-mt-24 bg-[#e39a50] py-16 md:py-24">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-5 md:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#10251e]/55">Screenshot this</p>
              <h2 className="mt-3 text-5xl font-semibold tracking-[-0.065em] text-[#10251e] md:text-7xl">The first-tee card.</h2>
              <p className="mt-5 max-w-lg text-sm leading-6 text-[#10251e]/65">Five reminders before every team match. Simple enough to remember when the wind is up and the beer math starts.</p>
            </div>
            <div className="overflow-hidden rounded-[2rem] bg-[#071b18] text-white shadow-2xl">
              {FIRST_TEE_CARD.map((item, index) => (
                <div key={item} className="flex gap-5 border-b border-white/8 p-5 last:border-0 md:p-6"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e39a50] font-mono text-xs font-bold text-[#10251e]">{index + 1}</span><p className="pt-1 text-sm leading-6 text-white/68">{item}</p></div>
              ))}
            </div>
          </div>
        </section>

        <footer className="bg-[#071b18] px-5 py-10 text-white md:px-8">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div><div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/32">Stud Buckets</div><div className="mt-2 text-2xl font-semibold">Prepare smarter. Arrive fresh. Take 38.</div></div>
            <p className="max-w-xl text-xs leading-5 text-white/32">{COURSE_SOURCE_NOTE}</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
