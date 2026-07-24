import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";

import AccessGate from "../access-gate";
import {
  GAMBLE_SANDS_INTEL,
  SCARECROW_INTEL,
  type ChampionshipCourseIntel,
} from "@/lib/course-intelligence";
import {
  STUD_BUCKETS_ACCESS_COOKIE,
  studBucketsAccessConfigured,
  verifyStudBucketsSession,
} from "@/lib/stud-buckets-auth";

export const metadata: Metadata = {
  title: "The Winning Brief | Stud Buckets HQ",
  description: "One-page course strategy and preparation plan for the Stud Buckets at Gamble Sands and Scarecrow.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const COURSE_CALLS = {
  "gamble-sands": {
    identity: "Wide, firm and fast. The correct angle matters more than the prettiest drive.",
    attack: [2, 8, 12, 13, 18],
    protect: [3, 5, 9, 15, 16, 17],
    teamRule: "Put one ball in grass before anyone challenges diagonal sand or a speed slot.",
    greenRule: "Expect release. Land approaches short enough to use the ground instead of fighting it.",
  },
  scarecrow: {
    identity: "Smaller targets, more elevation and more angle-dependent tee shots. Width can still leave a bad approach.",
    attack: [1, 5, 12, 15, 18],
    protect: [2, 4, 9, 11, 14, 16],
    teamRule: "Choose the side of the fairway that fits the pin and the next shot—not simply the longest drive.",
    greenRule: "Use feeder slopes and backboards. Center-green golf wins more holes than flag hunting.",
  },
} as const;

const FORMAT_PLAN = [
  {
    round: "Round 1",
    format: "Fourball",
    course: "Gamble Sands",
    target: "8 of 15 points",
    rules: [
      "First player creates a live ball; the partner earns the aggressive line.",
      "Know every stroke hole before the tee. A net par can be a weapon.",
      "Do not both short-side the same green. Give the team two different ways to make par.",
    ],
  },
  {
    round: "Round 2",
    format: "Shamble",
    course: "Scarecrow",
    target: "8 of 15 points",
    rules: [
      "Pick the drive that creates the best angle—not the one that traveled five yards farther.",
      "On attack holes, bank one playable drive before the second player takes on the carry.",
      "After the drive, one player owns the middle of the green while the other can chase the flag.",
    ],
  },
  {
    round: "Round 3",
    format: "Singles",
    course: "Scarecrow",
    target: "14 of 30 points",
    rules: [
      "Win with patience. Bogey avoidance and conceded-putt pressure matter more than one spectacular shot.",
      "Say the match state after holes 3, 6, 9, 12 and 15. Never guess where you stand.",
      "When ahead, hit the shot that forces the opponent to create the drama.",
    ],
  },
  {
    round: "Round 4",
    format: "Two-Man Scramble",
    course: "Gamble Sands",
    target: "8 of 15 points",
    rules: [
      "Fairway finder first, green-light driver second.",
      "Choose approach positions that leave uphill or straight putts—not merely the closest yardage.",
      "On the green, the first putt supplies speed and line; the best reader and putter goes last.",
    ],
  },
];

const MUST_OWN_SHOTS = [
  ["Fairway-finder tee ball", "A controlled driver or fairway wood that removes the two-way miss."],
  ["Ground-game approach", "Putter, hybrid or 7–9 iron from well off the green with a predictable first bounce."],
  ["Flighted wedge", "Three repeatable carry numbers between roughly 50 and 110 yards."],
  ["Long-lag speed", "Thirty-to-sixty-foot putts finished inside a three-foot circle."],
  ["Pressure putts", "Four-to-eight feet with a full routine and no second guess."],
  ["Sand escape", "Advance the ball safely from deep or diagonal waste instead of trying to recover everything at once."],
];

const WEEKLY_PREP = [
  ["1 range session", "Tee-ball windows, one fairway-finder shape and one full-send shape."],
  ["1 short-game session", "Low-runner ladder plus three stock wedge carries."],
  ["1 putting session", "Half speed control, half four-to-eight-foot pressure makes."],
  ["1 scored round", "No mulligans. Track doubles, three-putts, penalty shots and successful recoveries."],
  ["1 recovery session", "Hips, back, shoulders and forearms. Arrive fresh enough for 36-hole days."],
];

const PACK_AND_RECOVER = [
  "Two gloves, extra socks, sunscreen, lip protection, blister tape and a small towel.",
  "Electrolytes and food you will actually eat between rounds—not a heroic diet experiment.",
  "Change socks and shirt between Friday rounds. Ten quiet minutes beats an hour of standing around.",
  "After each round: fluids, carbohydrates, protein, light mobility and sleep. The second round starts at the final putt of the first.",
];

function HoleChip({ course, number, tone }: { course: ChampionshipCourseIntel; number: number; tone: "attack" | "protect" }) {
  const hole = course.holes[number - 1];
  return (
    <div className={`rounded-2xl border p-4 ${tone === "attack" ? "border-amber-500/20 bg-amber-50" : "border-emerald-900/10 bg-emerald-50"}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs font-bold">#{hole.number} · Par {hole.par}</span>
        <span className={`text-[9px] font-bold uppercase tracking-[0.16em] ${tone === "attack" ? "text-amber-800" : "text-emerald-800"}`}>
          {tone === "attack" ? "Press" : "Protect"}
        </span>
      </div>
      <h4 className="mt-2 text-sm font-semibold">{hole.headline}</h4>
      <p className="mt-2 text-xs leading-5 text-black/55">{hole.matchPlay}</p>
    </div>
  );
}

function CourseSection({ course }: { course: ChampionshipCourseIntel }) {
  const calls = COURSE_CALLS[course.id];
  const tee = course.tees.find((item) => item.name === course.defaultTee) ?? course.tees[0];

  return (
    <section id={course.id} className="scroll-mt-24 overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-sm">
      <div className="relative min-h-[330px] overflow-hidden bg-[#0a2821] text-white">
        <Image src={course.image} alt={course.name} fill className="object-cover opacity-55" sizes="(max-width: 1024px) 100vw, 50vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071b18] via-[#071b18]/55 to-transparent" />
        <div className="relative flex min-h-[330px] flex-col justify-end p-6 md:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#efbd88]">{course.tournamentRounds}</p>
          <h2 className="mt-2 text-5xl font-semibold tracking-[-0.06em] md:text-6xl">{course.name}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/72">{calls.identity}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/65">
            <span className="rounded-full border border-white/15 bg-black/20 px-3 py-2">Par {course.par}</span>
            <span className="rounded-full border border-white/15 bg-black/20 px-3 py-2">{tee.yards.toLocaleString()} yards</span>
            <span className="rounded-full border border-white/15 bg-black/20 px-3 py-2">{tee.rating} / {tee.slope}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-px bg-black/8 lg:grid-cols-2">
        <div className="bg-white p-6 md:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a6031]">How to beat it</p>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl bg-[#f2efe7] p-5">
              <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-black/35">Team rule</div>
              <p className="mt-2 text-sm font-semibold leading-6">{calls.teamRule}</p>
            </div>
            <div className="rounded-2xl bg-[#f2efe7] p-5">
              <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-black/35">Green rule</div>
              <p className="mt-2 text-sm font-semibold leading-6">{calls.greenRule}</p>
            </div>
            <ul className="space-y-3">
              {course.winningFormula.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-black/58">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#9a6031]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-[#f8f6f0] p-6 md:p-8">
          <div className="grid gap-7">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-800">Green-light holes</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {calls.attack.map((number) => <HoleChip key={number} course={course} number={number} tone="attack" />)}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-800">Do not donate these</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {calls.protect.map((number) => <HoleChip key={number} course={course} number={number} tone="protect" />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function WinningBriefPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(STUD_BUCKETS_ACCESS_COOKIE)?.value;
  if (!verifyStudBucketsSession(session)) {
    return <AccessGate configured={studBucketsAccessConfigured()} />;
  }

  return (
    <div className="min-h-screen bg-[#f2efe7] text-[#10201b]">
      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#071b18]/95 text-white backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-3 md:px-8">
          <Link href="/stud-buckets" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e39a50] text-sm font-black text-[#10251e]">SB</span>
            <span><span className="block text-[9px] uppercase tracking-[0.2em] text-white/38">Stud Buckets HQ</span><span className="block text-sm font-semibold">The Winning Brief</span></span>
          </Link>
          <nav className="hidden gap-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55 lg:flex">
            <Link href="#courses">Courses</Link><Link href="#formats">Formats</Link><Link href="#practice">Practice</Link><Link href="#arrival">Arrival</Link>
          </nav>
          <Link href="/stud-buckets" className="rounded-full border border-white/12 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.17em] text-white/55">Back to HQ</Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#071b18] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(227,154,80,0.25),transparent_28%),radial-gradient(circle_at_85%_35%,rgba(72,123,105,0.25),transparent_35%)]" />
          <div className="relative mx-auto grid max-w-[1440px] gap-10 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <span className="inline-flex rounded-full border border-[#e39a50]/30 bg-[#e39a50]/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.22em] text-[#efbd88]">Read this before you pack</span>
              <h1 className="mt-7 max-w-[11ch] text-6xl font-semibold leading-[0.88] tracking-[-0.075em] sm:text-7xl md:text-8xl">Prepare for the golf we are actually playing.</h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-white/60">Gamble Sands rewards angles, rollout and disciplined aggression. Scarecrow punishes lazy targets and impatient singles golf. This is the one-page plan for both.</p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-md md:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#efbd88]">The four non-negotiables</p>
              <ol className="mt-5 space-y-4">
                {[
                  "Know your strokes before the first tee.",
                  "Keep one ball alive before the hero shot.",
                  "Use the ground instead of fighting firm turf.",
                  "Protect energy for the second round of the day.",
                ].map((item, index) => (
                  <li key={item} className="flex gap-4 text-sm leading-6 text-white/68"><span className="font-mono text-[#efbd88]">0{index + 1}</span>{item}</li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section id="courses" className="mx-auto max-w-[1440px] scroll-mt-24 px-5 py-16 md:px-8 md:py-24">
          <div className="mb-10 max-w-3xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a6031]">Course intelligence</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.055em] md:text-6xl">Two courses. Two different tests.</h2>
            <p className="mt-4 text-sm leading-6 text-black/52">The goal is not to memorize every contour. Memorize where to press, where to protect and what kind of miss still leaves the team alive.</p>
          </div>
          <div className="grid gap-8">
            <CourseSection course={GAMBLE_SANDS_INTEL} />
            <CourseSection course={SCARECROW_INTEL} />
          </div>
        </section>

        <section id="formats" className="scroll-mt-24 bg-[#0c2821] py-16 text-white md:py-24">
          <div className="mx-auto max-w-[1440px] px-5 md:px-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#efbd88]">Format playbook</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.055em] md:text-6xl">Play the format—not your normal Saturday round.</h2>
            <div className="mt-10 grid gap-4 lg:grid-cols-4">
              {FORMAT_PLAN.map((item) => (
                <article key={item.round} className="rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-6">
                  <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.16em] text-white/35"><span>{item.round}</span><span>{item.target}</span></div>
                  <h3 className="mt-5 text-2xl font-semibold">{item.format}</h3>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#efbd88]">{item.course}</p>
                  <ul className="mt-5 space-y-4">
                    {item.rules.map((rule) => <li key={rule} className="flex gap-3 text-sm leading-6 text-white/58"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e39a50]" />{rule}</li>)}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="practice" className="mx-auto max-w-[1440px] scroll-mt-24 px-5 py-16 md:px-8 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a6031]">Practice priorities</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.055em] md:text-6xl">Own these six shots.</h2>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {MUST_OWN_SHOTS.map(([title, detail], index) => (
                  <article key={title} className="rounded-2xl border border-black/8 bg-white p-5 shadow-sm">
                    <div className="font-mono text-[10px] text-[#9a6031]">0{index + 1}</div>
                    <h3 className="mt-3 text-lg font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-black/52">{detail}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] bg-[#071b18] p-6 text-white md:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#efbd88]">Weekly minimum</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">Do less—but make it specific.</h3>
              <div className="mt-7 space-y-3">
                {WEEKLY_PREP.map(([title, detail]) => (
                  <div key={title} className="rounded-2xl border border-white/8 bg-white/[0.05] p-4">
                    <div className="text-sm font-semibold">{title}</div>
                    <p className="mt-1 text-xs leading-5 text-white/48">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="arrival" className="border-y border-black/8 bg-white py-16 md:py-24">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-5 md:px-8 lg:grid-cols-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a6031]">QuickSands Thursday</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">Use it as a laboratory.</h2>
              <ul className="mt-6 space-y-3 text-sm leading-6 text-black/55">
                <li>Record how far wedges actually carry and release in the air and turf conditions.</li>
                <li>Test putter, hybrid and low-iron approaches from off the green.</li>
                <li>Learn the green speed. Do not turn the warm-up into an energy contest.</li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a6031]">Thirty-minute warm-up</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">Calibrate. Do not rebuild.</h2>
              <ol className="mt-6 space-y-3 text-sm leading-6 text-black/55">
                <li><strong>5 min:</strong> walk, hips, shoulders and easy rotation.</li>
                <li><strong>8 min:</strong> chips, low runners and three wedge carries.</li>
                <li><strong>7 min:</strong> long putts for speed, then six short putts.</li>
                <li><strong>10 min:</strong> build to full swings and finish with three committed tee balls.</li>
              </ol>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9a6031]">Pack and recover</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em]">Fresh legs win late points.</h2>
              <ul className="mt-6 space-y-3 text-sm leading-6 text-black/55">
                {PACK_AND_RECOVER.map((item) => <li key={item} className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#9a6031]" />{item}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-16 md:px-8 md:py-24">
          <div className="rounded-[2rem] bg-[#071b18] p-7 text-white md:flex md:items-center md:justify-between md:gap-8 md:p-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#efbd88]">The final instruction</p>
              <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.055em] md:text-6xl">Make them earn every hole.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/52">A boring ball in play creates pressure. A clear target creates freedom. A bad hole ends when the next tee shot begins.</p>
            </div>
            <div className="mt-7 flex flex-wrap gap-3 md:mt-0 md:justify-end">
              <Link href="/stud-buckets" className="rounded-full bg-[#e39a50] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#10251e]">Return to team HQ</Link>
              <Link href="/live" className="rounded-full border border-white/14 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">Open live scoring</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
