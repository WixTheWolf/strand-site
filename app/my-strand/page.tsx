import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import DraftHeader from "../components/draft-header";
import { Countdown } from "../components/fx";
import SiteFooter from "../components/site-footer";
import { PLAYER_DATA_SNAPSHOT } from "@/lib/player-data-snapshot";
import { STRAND_PLAYERS } from "@/lib/players";
import { POINTS_TO_WIN, TOTAL_TOURNAMENT_POINTS } from "@/lib/live-scoring";
import { DRAFT_AT, ROUND_FORMATS, WEEKEND_SCHEDULE } from "@/lib/tournament";
import MyStrandLiveStatus from "./live-status";
import TripDayCount from "./trip-day-count";

export const metadata: Metadata = {
  title: "My Strand | Gamble Sands 2026",
  description: "The all-in-one Strand 2026 command center for draft night, live scoring, player data, course strategy and the trip schedule.",
};

export const dynamic = "force-dynamic";

const scoredRounds = Object.values(PLAYER_DATA_SNAPSHOT).reduce(
  (total, snapshot) => total + snapshot.rounds.length,
  0,
);
const playersWithRounds = Object.values(PLAYER_DATA_SNAPSHOT).filter(
  (snapshot) => snapshot.rounds.length > 0,
).length;
const eventIndexes = STRAND_PLAYERS.filter(
  (player) => player.eventIndex2026 !== undefined,
).length;
const garminRounds = STRAND_PLAYERS.reduce(
  (total, player) => total + (player.reportedScoring?.sampleSize ?? 0),
  0,
);

const PIPELINE = ["Draft", "Teams", "Pairings", "Scorecards", "Leaderboard", "History"];

function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#183d33] transition hover:gap-3"
    >
      {children} <span aria-hidden>→</span>
    </Link>
  );
}

export default function MyStrandPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#111]">
      <DraftHeader title="My Strand" extraLink={{ href: "/live", label: "Open scoreboard" }} />

      <main>
        <section className="relative overflow-hidden bg-[#092922] text-white">
          <Image
            src="/courses/gamble-sands.jpg"
            alt="Gamble Sands above the Columbia River"
            fill
            priority
            className="object-cover opacity-30"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#092922] via-[#092922]/92 to-[#092922]/45" />
          <div className="relative mx-auto grid max-w-[1400px] gap-10 px-5 py-14 md:px-8 md:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/7 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/65">
                <span className="h-2 w-2 rounded-full bg-[#f06a2a]" /> Pre-draft command center
              </div>
              <h1 className="mt-6 max-w-[12ch] text-5xl font-medium leading-[0.92] tracking-[-0.065em] sm:text-6xl md:text-7xl">
                Everything you need to win.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/62 md:text-lg">
                One source of truth for the roster, draft, pairings, handicaps, course plan, live scoring and every point on the road to 38.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/draft" className="rounded-full bg-[#f06a2a] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-white">
                  Enter draft room
                </Link>
                <Link href="/courses" className="rounded-full border border-white/18 bg-white/6 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-white">
                  Study the courses
                </Link>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/12 bg-black/20 p-5 backdrop-blur-md md:p-6">
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">Next critical event</div>
              <h2 className="mt-2 text-2xl font-medium tracking-[-0.035em]">Captain draft · 6:00 PM Pacific</h2>
              <p className="mt-2 text-sm text-white/52">Thursday, July 23 · J-BONE has the first pick</p>
              <Countdown
                target={DRAFT_AT}
                doneText="The draft is live — J-BONE is on the clock"
                caption={["Until the", "captain draft"]}
                ariaLabel="Countdown to the Strand captain draft"
                className="mt-6 max-w-full overflow-x-auto pb-1"
              />
            </div>
          </div>
        </section>

        <section className="border-b border-black/8 bg-white">
          <div className="mx-auto max-w-[1400px] overflow-x-auto px-5 py-5 md:px-8">
            <ol className="flex min-w-[760px] items-center gap-2">
              {PIPELINE.map((stage, index) => (
                <li key={stage} className="flex flex-1 items-center gap-2">
                  <div className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl border px-3 py-3 ${index === 0 ? "border-[#183d33] bg-[#183d33] text-white" : "border-black/8 bg-[#f7f5f0]"}`}>
                    <span className={`font-mono text-[10px] ${index === 0 ? "text-[#c4b59a]" : "text-black/30"}`}>0{index + 1}</span>
                    <span className="truncate text-[10px] font-semibold uppercase tracking-[0.14em]">{stage}</span>
                  </div>
                  {index < PIPELINE.length - 1 ? <span className="text-black/25" aria-hidden>→</span> : null}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label">Today at a glance</p>
              <h2 className="mt-2 text-3xl font-medium tracking-[-0.045em] md:text-4xl">The tournament pulse</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-black/48">
              The dashboard changes with the event: draft first, then teams and pairings, then live match scoring.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-[1.5rem] border border-black/8 bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#f7f5f0] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#183d33]">Trip</span>
                <span className="font-mono text-[10px] text-black/35">Aug 20–23</span>
              </div>
              <div className="mt-6 text-5xl font-medium tracking-[-0.07em]"><TripDayCount /></div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">Days to Gamble Sands</div>
              <p className="mt-5 text-sm leading-6 text-black/55">
                Thursday begins with QuickSands at 5:00 PM, followed by dinner and The Matchmaker.
              </p>
              <div className="mt-6"><ArrowLink href="/#schedule">Full trip schedule</ArrowLink></div>
            </article>

            <article className="rounded-[1.5rem] border border-black/8 bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#f7f5f0] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#183d33]">Team match</span>
                <span className="font-mono text-[10px] text-black/35">25 matches</span>
              </div>
              <div className="mt-6 flex items-end gap-3">
                <div className="text-5xl font-medium tracking-[-0.07em]">{TOTAL_TOURNAMENT_POINTS}</div>
                <div className="pb-1 text-sm text-black/45">total points</div>
              </div>
              <p className="mt-5 text-sm leading-6 text-black/55">
                Every match is worth three: front nine, back nine and overall. {POINTS_TO_WIN} points wins outright.
              </p>
              <div className="mt-6"><ArrowLink href="/live">See the match board</ArrowLink></div>
            </article>

            <article className="rounded-[1.5rem] border border-black/8 bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#f7f5f0] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#183d33]">Course signal</span>
                <span className="font-mono text-[10px] text-black/35">2 championships</span>
              </div>
              <div className="mt-6 text-5xl font-medium tracking-[-0.07em]">36</div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">Holes mapped</div>
              <p className="mt-5 text-sm leading-6 text-black/55">
                Gamble Sands and Scarecrow have hole-by-hole targets, danger, miss zones and match-play calls.
              </p>
              <div className="mt-6"><ArrowLink href="/courses">Open course command</ArrowLink></div>
            </article>
          </div>
        </section>

        <section className="border-y border-black/8 bg-white">
          <div className="mx-auto grid max-w-[1400px] gap-4 px-5 py-12 md:px-8 md:py-16 lg:grid-cols-[0.9fr_1.1fr]">
            <MyStrandLiveStatus />

            <article className="rounded-[1.5rem] border border-black/8 bg-[#f7f5f0] p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="label">Data room</p>
                  <h2 className="mt-2 text-3xl font-medium tracking-[-0.045em]">Trust every number.</h2>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-900">Roster locked</span>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-black/8 sm:grid-cols-4">
                {[
                  [eventIndexes, "2026 indexes"],
                  [scoredRounds, "scorecards"],
                  [playersWithRounds, "players with rounds"],
                  [garminRounds, "Garmin aggregate"],
                ].map(([value, label]) => (
                  <div key={label} className="bg-white px-4 py-5">
                    <div className="font-mono text-2xl font-semibold tracking-[-0.05em]">{value}</div>
                    <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-black/35">{label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-white px-4 py-4 text-sm leading-6 text-black/55">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                Official event handicaps are separated from GHIN/TheGrint scoring evidence, Garmin aggregates and captain-reported estimates. Thin samples stay labeled.
              </div>
              <div className="mt-6"><ArrowLink href="/draft/best-team">Open player intelligence</ArrowLink></div>
            </article>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-5 py-12 md:px-8 md:py-16">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="label">The road to 38</p>
              <h2 className="mt-2 text-3xl font-medium tracking-[-0.045em] md:text-4xl">Four sessions. One scoreboard.</h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-black/52">
                The format engine applies the correct allowance before strokes are assigned hole by hole.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {ROUND_FORMATS.map((round) => (
                <Link key={round.round} href="/live" className="group rounded-2xl border border-black/8 bg-white p-5 transition hover:-translate-y-0.5 hover:border-black/25 hover:shadow-lg">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/35">Round {round.round} · {round.course}</span>
                    <span className="font-mono text-[10px] text-black/35">{round.teeTime}</span>
                  </div>
                  <h3 className="mt-3 text-xl font-medium">{round.format}</h3>
                  <p className="mt-2 text-xs leading-5 text-black/50">{round.note}</p>
                  <div className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#183d33] transition group-hover:translate-x-1">Match board →</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-black/8 bg-[#183d33] text-white">
          <div className="mx-auto grid max-w-[1400px] gap-8 px-5 py-12 md:grid-cols-[1fr_auto] md:items-center md:px-8 md:py-14">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c4b59a]">Next on the schedule</p>
              <h2 className="mt-2 text-3xl font-medium tracking-[-0.04em]">{WEEKEND_SCHEDULE[0].title}</h2>
              <p className="mt-2 text-sm text-white/52">{WEEKEND_SCHEDULE[0].day} · {WEEKEND_SCHEDULE[0].time} · {WEEKEND_SCHEDULE[0].note}</p>
            </div>
            <Link href="/#schedule" className="w-fit rounded-full bg-white px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#183d33]">
              View itinerary
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
