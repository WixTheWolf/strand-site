import PlayersHandicapSection from "./components/players-handicap-section";
import TravelSection from "./components/travel-section";
import CoursesSection from "./components/courses-section";
import HistorySection from "./components/history-section";
import { GALLERY_IMAGES } from "@/lib/courses";
import { CAPTAINS, CAPTAIN_DRAFT_RULES, MATCHMAKER_RULES, ROUND_FORMATS, STRAND_RULES } from "@/lib/tournament";

export default function StrandInvitationalSite() {
  // Deployable asset paths:
  // place your files in a public/ folder as:
  // public/logo.png
  // public/hero.jpg
  const strandLogoSrc = "/brand/strand-invitational.png";
  const eventLogoSrc = "/brand/gamble-sands-2026.png";
  const heroSrc = "/hero.jpg";

  const nav = [
    { label: "Home", href: "#home" },
    { label: "Leaderboard", href: "#leaderboard" },
    { label: "Schedule", href: "#schedule" },
    { label: "Players", href: "#players" },
    { label: "Travel", href: "#travel" },
    { label: "Stay & Pay", href: "#stay-pay" },
    { label: "Competitions", href: "#competitions" },
    { label: "Teams", href: "#teams" },
    { label: "Draft Lab", href: "/draft" },
    { label: "Courses", href: "#courses" },
    { label: "Gallery", href: "#gallery" },
    { label: "History", href: "#history" },
  ];

  const leaderboardLinks = [
    { title: "Gross Leaderboard", note: "Main tournament standings" },
    { title: "Team Matches", note: "Match play results and points" },
    { title: "Side Games", note: "Closest to the pin, longest drive, and net prizes" },
    { title: "Live Scoring Guide", note: "How players should enter and follow scores in TheGrint" },
  ];

  const leaderboardPreview = [
    { rank: 1, name: "Fred Geisinger", thru: "36", score: "-2", status: "Steady and dangerous" },
    { rank: 2, name: "Matt Wixted", thru: "36", score: "E", status: "Lurking with intent" },
    { rank: 3, name: "Kevin Gordon", thru: "36", score: "+1", status: "Still in the hunt" },
    { rank: 4, name: "Andrew Mager", thru: "36", score: "+2", status: "One run away" },
  ];

  const schedule = [
    { day: "Thursday • August 20", title: "QuickSands Warm-Up", time: "5:00 PM", note: "Kick off the trip with QuickSands, then roll straight into dinner and the opening ceremony." },
    { day: "Thursday • August 20", title: "Dinner + Opening Ceremony", time: "7:00 PM / 8:00 PM", note: "Dinner at 7, opening ceremony at 8, then The Matchmaker — captains reveal round pairings." },
    ...ROUND_FORMATS.map((round) => ({
      day: round.day,
      title: `Round ${round.round} • ${round.format}`,
      time: round.teeTime,
      note: `${round.course}. ${round.note}`,
    })),
    { day: "Sunday • August 23", title: "Departure", time: "AM", note: "Checkout, load up, and head home before the stories get even less accurate." },
  ];

  const tripFacts = [
    ["Dates", "August 20–23, 2026"],
    ["Destination", "Brewster, Washington"],
    ["Courses", "Gamble Sands • Scarecrow • QuickSands"],
    ["Field Size", "20 players • 2 teams of 10"],
    ["Captains", "Matt Wixted (WIX) vs Justin Uribe (J-BONE)"],
    ["Scoring", "TheGrint / GHIN • PGA handicap rules"],
    ["Vibe", "Golf trip meets boys trip"],
  ];

  const costs = [
    ["QuickSands", "$70"],
    ["First round of the day", "$275"],
    ["Replay round", "$175"],
    ["Golf total", "$970 per person"],
    ["Lodging (2 per room)", "$570 per person before tax"],
    ["Lodging (4 per room)", "$285 per person before tax"],
    ["Estimated golf + lodging", "$1,600–1,700 per person including tax"],
    ["Not included", "Flights, transportation, food"],
  ];

  const lodgingNotes = [
    "Staying at the new hotel at the Scarecrow course.",
    "Rooms have double king beds.",
    "Two to a room is the default feel-good choice.",
    "Four to a room is the budget choice.",
    "Rooming assignments are not being made centrally — players coordinate on their own.",
  ];

  const diningNotes = [
    "Danny Boy Bar and Grill",
    "The Barn for lunch and more casual meals",
    "Affordable onsite food options for the full trip",
    "Designed to be an all-onsite experience",
  ];

  const depositNotes = [
    "10% due upon booking",
    "Working up to 50% paid by 6 months before the event",
    "Final 50% due 30 days prior",
    "Golf and lodging should be fully paid before arrival",
    "Deposits are refundable up to 60 days out if an emergency pops up.",
  ];

  const paymentSteps = [
    "Venmo requests will go out when billed.",
    "Golf and lodging are expected to be settled before wheels touch Brewster.",
    "Flights, transportation, and food are handled separately.",
    "Coordinate room splits early if you want the cheaper option.",
  ];

  const formats = ROUND_FORMATS.map((round) => `Round ${round.round} • ${round.format} (${round.course})`);

  const competitions = [
    "Closest to the Pin on every par 3.",
    "Longest Drive must finish in the fairway.",
    "Low Net and 2nd Low Net are singles only.",
    "Last group picks up the stakes and markers and gives them to Justin or event leadership.",
    "All scorecards go back to Justin after the round.",
  ];

  const payoutRows = [
    ["Winning Team", "$150 per person"],
    ["Par 3 Closest to the Pin", "$30 each • 8 total"],
    ["Longest Drive", "$30 each • 2 total"],
    ["Low Net (Singles Only)", "$70"],
    ["2nd Low Net (Singles Only)", "$30"],
  ];

  const rules = STRAND_RULES;

  const ceremonyTimeline = [
    ["7:00 PM", "Dinner"],
    ["8:00 PM", "Opening ceremony"],
    ["8:15 PM", `The Matchmaker — ${CAPTAINS.wix.nickname} vs ${CAPTAINS.justin.nickname}`],
    ["8:30 PM", "Round 1 pairings posted"],
    ["8:45 PM", "Leaderboard links live"],
  ];

  const teamPlaceholders = [
    { title: CAPTAINS.wix.teamName, subtitle: `${CAPTAINS.wix.name} • Captain`, dark: true },
    { title: CAPTAINS.justin.teamName, subtitle: `${CAPTAINS.justin.name} • Captain`, dark: false },
  ];

  const pairingRounds = ROUND_FORMATS.map((round) => ({
    round: round.round,
    format: round.format,
    label: `Round ${round.round} • ${round.format}`,
    day: round.day,
    slots: round.format === "Singles" ? 10 : 5,
  }));

  return (
    <div className="min-h-screen bg-[#f7f3ea] text-[#14352a]">
      <header className="sticky top-0 z-40 border-b border-[#14352a]/10 bg-[#f7f3ea]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <img src={strandLogoSrc} alt="The Strand Invitational logo" className="h-14 w-auto object-contain" />
            <img src={eventLogoSrc} alt="Gamble Sands 2026 logo" className="hidden h-12 w-auto object-contain lg:block" />
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-[#14352a]/70">Est. 2018</div>
              <div className="font-serif text-2xl md:text-3xl">THE STRAND INVITATIONAL</div>
            </div>
          </div>
          <nav className="hidden flex-wrap gap-6 md:flex">
            {nav.map((item) => (
              <a key={item.label} href={item.href} className="text-sm uppercase tracking-[0.22em] hover:opacity-70">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section id="home" className="relative overflow-hidden border-b border-[#14352a]/10">
        <div className="absolute inset-0">
          <img src={heroSrc} alt="Gamble Sands course view" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,28,22,0.76),rgba(12,28,22,0.44),rgba(12,28,22,0.16))]" />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.15fr_0.85fr] md:py-24">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.28em] text-white/80 backdrop-blur">
              Gamble Sands • Scarecrow • QuickSands
            </div>
            <h1 className="max-w-4xl font-serif text-5xl leading-[0.95] text-white md:text-7xl">
              Toeing the line between golf trip and boys trip since 2018.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/85 md:text-xl">
              Set at Gamble Sands in Brewster, Washington, this year’s Strand brings together world-class golf, an all-onsite stay, live scoring, and the kind of weekend that keeps getting funnier in the retelling.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#leaderboard" className="rounded-2xl bg-white px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-[#14352a] shadow-lg transition hover:-translate-y-0.5">
                View Live Scoring
              </a>
              <a href="#teams" className="rounded-2xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-white backdrop-blur transition hover:bg-white/15">
                Ceremony + Pairings
              </a>
            </div>
            <div className="mt-10 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-3">
              {tripFacts.map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-4 shadow-sm backdrop-blur">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/65">{label}</div>
                  <div className="mt-2 font-medium text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-md">
              <div className="rounded-[1.5rem] bg-[#14352a]/92 p-6 text-white">
                <div className="text-xs uppercase tracking-[0.35em] text-white/65">Tournament Hub</div>
                <div className="mt-2 font-serif text-3xl">Live Leaderboard + Ceremony Flow</div>
                <p className="mt-3 text-white/80">
                  This build is structured around TheGrint scoring links and a Thursday-night pairings reveal, so the site feels alive before, during, and after the event.
                </p>
                <div className="mt-6 space-y-3">
                  {leaderboardLinks.map((label) => (
                    <a key={label.title} href="#leaderboard" className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm backdrop-blur transition hover:bg-white/15">
                      <div>
                        <div>{label.title}</div>
                        <div className="mt-1 text-xs text-white/60">{label.note}</div>
                      </div>
                      <span className="text-white/70">Open →</span>
                    </a>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-white/75">
                  Captain snake draft ~one month out locks rosters. Thursday night: opening ceremony, then
                  The Matchmaker pairings reveal — the site flips from teaser mode to battle board.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="leaderboard" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[#14352a]/60">Live Scoring</div>
            <h2 className="mt-2 font-serif text-4xl">TheGrint leaderboard portal</h2>
            <p className="mt-3 max-w-2xl text-[#14352a]/75">This section is designed for outbound leaderboard links. Replace the placeholder targets once the official event links exist.</p>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
            <div className="text-xs uppercase tracking-[0.28em] text-[#14352a]/55">Scoring links</div>
            <div className="mt-5 grid gap-3">
              {leaderboardLinks.map((cta) => (
                <button key={cta.title} className="rounded-2xl border border-[#14352a]/10 px-4 py-4 text-left transition hover:bg-[#14352a] hover:text-white">
                  <div className="font-medium">{cta.title}</div>
                  <div className="mt-1 text-sm opacity-70">{cta.note}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.28em] text-[#14352a]/55">Preview module</div>
                <div className="mt-1 font-serif text-2xl">Leaderboard snapshot</div>
              </div>
            </div>
            <div className="overflow-hidden rounded-[1.5rem] border border-[#14352a]/10">
              <div className="grid grid-cols-[70px_1.7fr_0.7fr_0.7fr_1fr] bg-[#14352a] px-4 py-3 text-xs uppercase tracking-[0.22em] text-white/70">
                <div>Rank</div>
                <div>Player</div>
                <div>Thru</div>
                <div>Score</div>
                <div>Note</div>
              </div>
              {leaderboardPreview.map((row) => (
                <div key={row.rank} className="grid grid-cols-[70px_1.7fr_0.7fr_0.7fr_1fr] border-t border-[#14352a]/8 px-4 py-4 text-sm md:text-base">
                  <div className="font-medium">{row.rank}</div>
                  <div>{row.name}</div>
                  <div>{row.thru}</div>
                  <div className="font-semibold">{row.score}</div>
                  <div className="text-[#14352a]/65">{row.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="schedule" className="border-y border-[#14352a]/10 bg-white/60">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="text-xs uppercase tracking-[0.3em] text-[#14352a]/60">Schedule</div>
          <h2 className="mt-2 font-serif text-4xl">Tournament weekend at a glance</h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {schedule.map((item) => (
              <div key={item.title} className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
                <div className="text-xs uppercase tracking-[0.2em] text-[#14352a]/55">{item.day}</div>
                <div className="mt-3 font-serif text-2xl">{item.title}</div>
                <div className="mt-2 font-medium">{item.time}</div>
                <p className="mt-4 text-[#14352a]/75">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PlayersHandicapSection />

      <CoursesSection />

      <TravelSection />

      <section id="stay-pay" className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-xs uppercase tracking-[0.3em] text-[#14352a]/60">Stay & Pay</div>
        <h2 className="mt-2 font-serif text-4xl">Costs, rooms, food, and the part where money leaves your body</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
            <div className="text-xs uppercase tracking-[0.22em] text-[#14352a]/55">Cost snapshot</div>
            <div className="mt-5 space-y-3">
              {costs.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 border-b border-[#14352a]/10 pb-3 text-sm last:border-b-0 last:pb-0">
                  <span className="text-[#14352a]/75">{label}</span>
                  <span className="font-medium text-[#14352a]">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
              <div className="text-xs uppercase tracking-[0.22em] text-[#14352a]/55">Lodging</div>
              <ul className="mt-4 space-y-3 text-sm text-[#14352a]/75">{lodgingNotes.map((item) => <li key={item}>• {item}</li>)}</ul>
            </div>
            <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
              <div className="text-xs uppercase tracking-[0.22em] text-[#14352a]/55">Dining</div>
              <ul className="mt-4 space-y-3 text-sm text-[#14352a]/75">{diningNotes.map((item) => <li key={item}>• {item}</li>)}</ul>
            </div>
            <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
              <div className="text-xs uppercase tracking-[0.22em] text-[#14352a]/55">Deposit schedule</div>
              <ul className="mt-4 space-y-3 text-sm text-[#14352a]/75">{depositNotes.map((item) => <li key={item}>• {item}</li>)}</ul>
            </div>
            <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
              <div className="text-xs uppercase tracking-[0.22em] text-[#14352a]/55">Payment notes</div>
              <ul className="mt-4 space-y-3 text-sm text-[#14352a]/75">{paymentSteps.map((item) => <li key={item}>• {item}</li>)}</ul>
            </div>
          </div>
        </div>
      </section>

      <section id="teams" className="border-y border-[#14352a]/10 bg-white/60">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-[#14352a]/60">Teams & Pairings</div>
              <h2 className="mt-2 font-serif text-4xl">Thursday night reveal board</h2>
            </div>
            <div className="rounded-2xl border border-[#14352a]/10 bg-white px-4 py-3 text-sm text-[#14352a]/70 shadow-sm">
              Pairings decided Thursday night at The Matchmaker
            </div>
          </div>
          <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-[#14352a]/10 bg-[#14352a] p-6 text-white shadow-sm">
                <div className="text-xs uppercase tracking-[0.22em] text-white/60">Ceremony timeline</div>
                <div className="mt-4 space-y-4">
                  {ceremonyTimeline.map(([time, event]) => (
                    <div key={time} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                      <div className="font-medium">{time}</div>
                      <div className="text-right text-white/75">{event}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
                <div className="text-xs uppercase tracking-[0.22em] text-[#14352a]/55">Captain draft</div>
                <p className="mt-2 text-xs text-[#14352a]/60">~One month before The Strand</p>
                <ul className="mt-4 space-y-3 text-sm text-[#14352a]/75">
                  {CAPTAIN_DRAFT_RULES.map((rule) => (
                    <li key={rule}>• {rule}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[2rem] border border-orange-200 bg-orange-50 p-6 shadow-sm">
                <div className="text-xs uppercase tracking-[0.22em] text-orange-800/70">The Matchmaker</div>
                <p className="mt-2 text-xs text-orange-900/65">Thursday night • Gamble Sands</p>
                <ul className="mt-4 space-y-3 text-sm text-orange-950/80">
                  {MATCHMAKER_RULES.map((rule) => (
                    <li key={rule}>• {rule}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {teamPlaceholders.map((team) => (
                  <div key={team.title} className={`rounded-[2rem] border p-6 shadow-sm ${team.dark ? "border-[#14352a] bg-[#14352a] text-white" : "border-[#14352a]/15 bg-white text-[#14352a]"}`}>
                    <div className="text-xs uppercase tracking-[0.22em] opacity-60">Roster locked at captain draft</div>
                    <div className="mt-2 font-serif text-3xl">{team.title}</div>
                    <div className="mt-2 text-sm opacity-75">{team.subtitle}</div>
                    <div className="mt-6 space-y-3">
                      {Array.from({ length: 10 }).map((_, index) => (
                        <div key={index} className={`rounded-2xl border px-4 py-3 text-sm ${team.dark ? "border-white/10 bg-white/10" : "border-[#14352a]/10 bg-[#f7f3ea]"}`}>
                          Player slot {index + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
                <div className="text-xs uppercase tracking-[0.22em] text-[#14352a]/55">Pairings board — revealed at The Matchmaker</div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {pairingRounds.map((round) => (
                    <div key={round.round} className="rounded-2xl border border-[#14352a]/10 bg-[#f7f3ea] p-4">
                      <div className="font-serif text-xl">{round.label}</div>
                      <div className="mt-1 text-xs text-[#14352a]/55">{round.day}</div>
                      <div className="mt-4 space-y-2">
                        {Array.from({ length: round.slots }).map((_, index) => (
                          <div key={index} className="rounded-xl border border-dashed border-[#14352a]/20 bg-white px-3 py-2 text-sm text-[#14352a]/50">
                            {round.format === "Singles" ? `Match ${index + 1}` : `Pairing ${index + 1}`} — TBD
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="competitions" className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-xs uppercase tracking-[0.3em] text-[#14352a]/60">Competitions</div>
        <h2 className="mt-2 font-serif text-4xl">Matches, money, and useful rules</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
              <div className="text-xs uppercase tracking-[0.22em] text-[#14352a]/55">On-course competitions</div>
              <ul className="mt-4 space-y-3 text-sm text-[#14352a]/75">{competitions.map((item) => <li key={item}>• {item}</li>)}</ul>
            </div>
            <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
              <div className="text-xs uppercase tracking-[0.22em] text-[#14352a]/55">Match play formats</div>
              <ul className="mt-4 space-y-3 text-sm text-[#14352a]/75">{formats.map((item) => <li key={item}>• {item}</li>)}</ul>
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
              <div className="text-xs uppercase tracking-[0.22em] text-[#14352a]/55">Payouts</div>
              <div className="mt-5 overflow-hidden rounded-[1.25rem] border border-[#14352a]/10">
                <div className="grid grid-cols-[1.4fr_0.9fr] bg-[#14352a] px-4 py-3 text-xs uppercase tracking-[0.2em] text-white/70">
                  <div>Category</div>
                  <div>Payout</div>
                </div>
                {payoutRows.map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[1.4fr_0.9fr] border-t border-[#14352a]/8 px-4 py-4 text-sm">
                    <div>{label}</div>
                    <div className="font-medium">{value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
              <div className="text-xs uppercase tracking-[0.22em] text-[#14352a]/55">Rules</div>
              <ul className="mt-4 space-y-3 text-sm text-[#14352a]/75">{rules.map((item) => <li key={item}>• {item}</li>)}</ul>
            </div>
          </div>
        </div>
      </section>

      <section id="draft-lab" className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-[2rem] border border-[#14352a]/10 bg-[#14352a] p-8 text-white shadow-sm md:p-10">
          <div className="text-xs uppercase tracking-[0.3em] text-white/60">Draft Lab</div>
          <h2 className="mt-2 font-serif text-4xl">Prep your roster before the captain draft</h2>
          <p className="mt-4 max-w-3xl text-white/80">
            Captain snake draft happens ~one month before The Strand. Thursday night is The Matchmaker —
            pairings only. Use Draft Lab now for mock snakes, skill graphs, and saved what-if scenarios
            with live TheGrint handicaps for all 20 players.
          </p>
          <a
            href="/draft"
            className="mt-6 inline-flex rounded-2xl bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#14352a]"
          >
            Open Draft Lab →
          </a>
        </div>
      </section>

      <section id="gallery" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[#14352a]/60">Gallery</div>
            <h2 className="mt-2 font-serif text-4xl">Gamble Sands visual mood board</h2>
          </div>
          <div className="rounded-2xl border border-[#14352a]/10 bg-white px-4 py-3 text-sm text-[#14352a]/70 shadow-sm">Course imagery loaded</div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {GALLERY_IMAGES.map((image) => (
            <div key={image.src} className="overflow-hidden rounded-[2rem] border border-[#14352a]/10 bg-white shadow-sm">
              <img src={image.src} alt={image.alt} className="h-64 w-full object-cover" />
              <div className="px-5 py-3 text-sm font-medium">{image.caption}</div>
            </div>
          ))}
        </div>
      </section>

      <HistorySection />

      <footer className="border-t border-[#14352a]/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img src={strandLogoSrc} alt="The Strand Invitational logo" className="h-10 w-auto object-contain" />
            <div>
              <div className="font-serif text-xl">THE STRAND INVITATIONAL</div>
              <div className="mt-1 text-sm text-[#14352a]/65">Premium tournament site prototype with TheGrint scoring-link architecture.</div>
            </div>
          </div>
          <div className="text-sm text-[#14352a]/55">
            Player photos, course imagery, and archive data sourced from strandinvitational.life. Logos by Wix.
          </div>
        </div>
      </footer>
    </div>
  );
}

