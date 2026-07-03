import Image from "next/image";
import Link from "next/link";
import CoursesSection from "./components/courses-section";
import HistorySection from "./components/history-section";
import PlayersHandicapSection from "./components/players-handicap-section";
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

const HERO_IMAGE = "/courses/scarecrow.jpg";

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

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main className="bg-[#f7f5f0] text-[#111]">
        {/* Hero */}
        <section id="home" className="relative min-h-[92vh]">
          <Image
            src={HERO_IMAGE}
            alt="Scarecrow course at Gamble Sands, Columbia River valley"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />

          <div className="relative mx-auto flex min-h-[92vh] max-w-[1400px] flex-col justify-end px-5 pb-16 pt-28 md:px-8 md:pb-24">
            <p className="label mb-4 text-white/70">Gamble Sands · August 2026</p>
            <h1 className="headline max-w-[14ch] text-white">
              Golf trip.<br />
              Boys trip.<br />
              Since 2018.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/80 md:text-lg">
              Three David McLay Kidd courses, one onsite resort, live scoring, and a Thursday night
              pairings reveal that sets the tone for the whole weekend.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#players" className="btn-primary">
                The Field
              </a>
              <Link href="/draft" className="btn-ghost">
                Draft Lab
              </Link>
            </div>
          </div>
        </section>

        {/* Trip facts strip */}
        <section id="trip" className="divider">
          <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-px bg-[#e2ddd3] md:grid-cols-4">
            {TRIP_FACTS.map((fact) => (
              <div key={fact.label} className="bg-[#f7f5f0] px-5 py-8 md:px-8">
                <div className="label">{fact.label}</div>
                <div className="mt-2 text-sm font-medium md:text-base">{fact.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Schedule */}
        <section id="schedule" className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
          <div className="mb-12 max-w-lg">
            <p className="label">Weekend</p>
            <h2 className="section-title mt-3">Four rounds. One resort.</h2>
          </div>

          <div className="grid gap-px bg-[#e2ddd3] md:grid-cols-2">
            {WEEKEND_SCHEDULE.map((item) => (
              <div key={item.title} className="bg-[#f7f5f0] p-6 md:p-8">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="label">{item.day}</span>
                  <span className="text-xs text-black/45">{item.time}</span>
                </div>
                <h3 className="mt-3 text-lg font-medium">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-black/55">{item.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
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
        </section>

        <PlayersHandicapSection />
        <CoursesSection />
        <TravelSection />

        {/* Ceremony + costs */}
        <section className="divider bg-white">
          <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
            <div className="grid gap-16 lg:grid-cols-2">
              <div>
                <p className="label">Thursday Night</p>
                <h2 className="section-title mt-3">The Matchmaker</h2>
                <p className="mt-4 text-sm leading-relaxed text-black/55">
                  Captain snake draft locks rosters ~one month out. Thursday is pairings only —
                  {CAPTAINS.wix.nickname} vs {CAPTAINS.justin.nickname} set every matchup live.
                </p>
                <ul className="mt-6 space-y-2 text-sm text-black/65">
                  {MATCHMAKER_RULES.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
                <div className="mt-8 space-y-2 border-t border-black/8 pt-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-black/45">7:00 PM</span>
                    <span>Dinner</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/45">8:00 PM</span>
                    <span>Opening ceremony</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-black/45">8:15 PM</span>
                    <span>The Matchmaker</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-black/45">8:30 PM</span>
                    <span>Pairings posted</span>
                  </div>
                </div>
              </div>

              <div>
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
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-black/40">
                  Per person · tax included · flights, transport, and food separate
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* On-course rules */}
        <section className="divider">
          <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-8">
            <p className="label mb-6">On Course</p>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {ON_COURSE_RULES.map((rule) => (
                <span key={rule} className="text-sm text-black/65">
                  {rule}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Draft Lab CTA */}
        <section className="relative min-h-[50vh] overflow-hidden">
          <Image
            src="/courses/gamble-sands-hero.jpg"
            alt="Gamble Sands fairways"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative mx-auto max-w-[1400px] px-5 py-24 md:px-8 md:py-32">
            <p className="label text-white/60">Draft Lab</p>
            <h2 className="section-title mt-3 max-w-md text-white">
              Model your roster before the captain draft.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/70">
              Mock snakes, skill graphs, and saved what-if scenarios with live TheGrint handicaps for
              all 20 players.
            </p>
            <Link href="/draft" className="btn-primary mt-8 bg-white text-black hover:opacity-90">
              Open Draft Lab
            </Link>
          </div>
        </section>

        <HistorySection />
      </main>

      <SiteFooter />
    </>
  );
}
