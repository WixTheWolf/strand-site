export default function StrandV6FullSite() {
  const logoSrc = "/logo.png";
  const heroSrc = "/hero.jpg";

  const nav = [
    { label: "Home", href: "#home" },
    { label: "The Strand", href: "#the-strand" },
    { label: "The Plan", href: "#the-plan" },
    { label: "Players", href: "#players" },
    { label: "Logistics", href: "#logistics" },
    { label: "Competition", href: "#competition" },
  ];

  const quickFacts = [
    ["Destination", "Gamble Sands"],
    ["Location", "Brewster, WA"],
    ["Dates", "August 20–23, 2026"],
    ["Courses", "Gamble Sands • Scarecrow • QuickSands"],
    ["Field", "20 players"],
    ["Scoring", "TheGrint live leaderboard"],
  ];

  const champions = [
    ["2025", "Team Taliban"],
    ["2024", "Team D'Arce"],
    ["2023", "Pussy Beaters"],
    ["2022", "Team B"],
    ["2021", "Brooks Is a Bully"],
    ["2018", "Drew / Kev"],
  ];

  const planCards = [
    {
      title: "Thursday",
      time: "Arrival + Ceremony",
      body: "Fly into Spokane, get the convoy to Gamble Sands, play QuickSands around 5:00 PM, then roll into dinner and the opening ceremony.",
    },
    {
      title: "Friday",
      time: "Round 1 + Round 2",
      body: "Gamble Sands in the morning, Scarecrow in the afternoon. Full competition mode with enough daylight to either recover or double down.",
    },
    {
      title: "Saturday",
      time: "Round 3 + Round 4",
      body: "Scarecrow in the morning, Gamble Sands in the afternoon, then the closing push into dinner, awards, and whatever version of the truth survives the night.",
    },
    {
      title: "Sunday",
      time: "Departure",
      body: "Check out, load up, and head home before the score recaps become mythology.",
    },
  ];

  const playerCards = [
    ["Fred Geisinger", "Chief planner, spreadsheet artist, and original architect of the Strand archive itself."],
    ["Matt Wixted", "Natural athlete, former Most Improved, and one of the creative hands helping push the next version of the site and brand forward."],
    ["Jordan Brodbeck", "Heart-and-soul guy with elite vibes, low-net energy, and enough influence to justify an entire WWGD framework."],
    ["Justin Uribe", "Former baseball standout turned golf alpha with executive-chef range and real competitive heat."],
    ["Matt Schroeder", "Walking rulebook, golf purist, and one of the guys most likely to remember the exact format when everyone else is freelancing."],
    ["Kevin Gordon", "Sneakily nasty golf game, supreme post-round chill, and a permanent role in the moral philosophy of gimmies."],
  ];

  const logisticsCards = [
    {
      title: "Travel",
      body: "Thursday morning arrivals into Spokane are the move. From there, rent cars and head to Gamble Sands at 200 Sand Trails Road, Brewster, WA 98812.",
    },
    {
      title: "Lodging",
      body: "The group is staying at the new hotel at the Scarecrow course. Double king rooms. Two to a room is the feel-good play. Four to a room is the budget play.",
    },
    {
      title: "Dining",
      body: "Danny Boy and The Barn make this an all-onsite experience. Dinner, breakfast, sandwiches, pizza, drinks, and no real reason to leave property once the weekend begins.",
    },
    {
      title: "Cost",
      body: "QuickSands is $70. First round of the day is $275. Replay is $175. Golf total is $970 per person, with golf and lodging roughly $1,600–1,700 all-in before flights, transport, and food extras.",
    },
  ];

  const competitionCards = [
    {
      title: "Format",
      body: "QuickSands warm-up Thursday. Round 1 Foursomes. Round 2 Shamble. Round 3 Singles. Round 4 Two-Man Scramble.",
    },
    {
      title: "Side Games",
      body: "Closest to the Pin on every par 3, Longest Drive in the fairway, Low Net and 2nd Low Net in singles only.",
    },
    {
      title: "Rules",
      body: "3 points per match: front, back, and overall. Lateral hazard treatment, 2 club lengths where applicable, 2-minute lost-ball search, breakfast ball on the first hole only, and WWGD when morality gets foggy.",
    },
    {
      title: "Payouts",
      body: "Winning Team $150 per person. Closest to the Pin $30 each. Longest Drive $30 each. Low Net $70. 2nd Low Net $30.",
    },
  ];

  const archivePreview = [
    {
      year: "Monterey 2025",
      winner: "Team Taliban",
      summary: "Team Taliban won 33.5 to 26.5 in the deepest and most fully documented Strand archive yet.",
    },
    {
      year: "Ojai 2024",
      winner: "Team D'Arce",
      summary: "A razor-close 25 to 23 finish that proved the event had real competitive history, not just vibes.",
    },
    {
      year: "St. George 2023",
      winner: "Pussy Beaters",
      summary: "A 30 to 18 blowout and a full-strength example of classic Strand team chaos.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f6f2ea] text-[#14352a]">
      <section id="home" className="mx-auto max-w-[1500px] p-4 md:p-6">
        <div className="relative overflow-hidden rounded-[2rem] shadow-2xl">
          <div className="absolute inset-0">
            <img src={heroSrc} alt="Gamble Sands hero" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,28,22,0.82),rgba(12,28,22,0.56),rgba(12,28,22,0.2))]" />
          </div>

          <div className="relative z-10 px-5 py-5 md:px-8 md:py-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center gap-4 text-white">
                <img
                  src={logoSrc}
                  alt="The Strand Invitational logo"
                  className="h-14 w-auto object-contain brightness-0 invert"
                />
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-white/70">Est. 2018</div>
                  <div className="font-serif text-2xl leading-none md:text-3xl">
                    THE STRAND
                    <br />
                    INVITATIONAL
                  </div>
                </div>
              </div>

              <nav className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.18em] text-white/85">
                {nav.map((item) => (
                  <a key={item.label} href={item.href} className="hover:text-white">
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-white/80 backdrop-blur">
                  Welcome to the Strand Invitational
                </div>

                <h1 className="mt-5 max-w-5xl font-serif text-5xl leading-[0.92] text-white md:text-7xl">
                  Toeing the line between golf trip and boys trip since 2018.
                </h1>

                <div className="mt-8 max-w-3xl rounded-[1.75rem] border border-white/15 bg-white/10 p-5 text-white backdrop-blur">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">Destination</div>
                  <div className="mt-2 font-serif text-4xl">Gamble Sands</div>
                  <div className="mt-3 text-lg text-white/84">Brewster, WA • August 20–23, 2026</div>
                </div>

                <p className="mt-7 max-w-4xl text-lg leading-8 text-white/86 md:text-xl">
                  From its inception as Best New Course in 2014, Gamble Sands set out to offer a golf escape unlike any other.
                  And more than a decade later, your unforgettable experience starts with two David McLay Kidd-designed 18-hole
                  courses. Both are built on sandy soil with firm fescue grasses seeking — dare we say demanding — your creativity.
                </p>

                <p className="mt-5 max-w-4xl text-base leading-8 text-white/82 md:text-lg">
                  There are few things more enjoyable than waking up, grabbing a coffee or breakfast, and walking to the first tee.
                  But that’s exactly what Gamble Sands offers with its three award-winning courses, as well as its acclaimed putting course.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <a
                    href="#competition"
                    className="rounded-2xl bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#14352a]"
                  >
                    View Competition
                  </a>
                  <a
                    href="#the-strand"
                    className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur"
                  >
                    View Archive
                  </a>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {quickFacts.map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur"
                    >
                      <div className="text-[11px] uppercase tracking-[0.18em] text-white/65">{label}</div>
                      <div className="mt-2 text-base leading-6">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/65">Past Champions</div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {champions.map(([year, winner]) => (
                      <div key={year} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white">
                        <div className="text-[10px] uppercase tracking-[0.16em] text-white/55">{year}</div>
                        <div className="mt-2 text-sm leading-5">{winner}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="rounded-[2rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <div className="rounded-[1.5rem] bg-[#14352a]/95 p-6 text-white">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-white/60">Tournament Hub</div>
                    <h2 className="mt-3 font-serif text-4xl leading-tight">Fred’s site, fully upgraded</h2>
                    <p className="mt-4 text-sm leading-7 text-white/78">
                      Same soul, stronger chassis. This Vercel version keeps Fred’s content priorities and voice, but gives the event a cleaner,
                      sharper, more flexible front end than Google Sites can really support.
                    </p>

                    <div className="mt-6 space-y-3">
                      <a href="#live-scoring" className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-4">
                        <div>
                          <div className="text-sm">Live Scoring</div>
                          <div className="mt-1 text-xs text-white/60">Leaderboard hub and scoring instructions</div>
                        </div>
                        <div className="text-xs text-white/55">Open →</div>
                      </a>
                      <a href="#the-plan" className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-4">
                        <div>
                          <div className="text-sm">The Plan</div>
                          <div className="mt-1 text-xs text-white/60">Weekend flow, rounds, and timing</div>
                        </div>
                        <div className="text-xs text-white/55">Open →</div>
                      </a>
                      <a href="#competition" className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-4">
                        <div>
                          <div className="text-sm">Competition</div>
                          <div className="mt-1 text-xs text-white/60">Format, rules, payouts, and team play</div>
                        </div>
                        <div className="text-xs text-white/55">Open →</div>
                      </a>
                      <a href="#the-strand" className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-4">
                        <div>
                          <div className="text-sm">The Strand</div>
                          <div className="mt-1 text-xs text-white/60">Archive years, winners, and memories</div>
                        </div>
                        <div className="text-xs text-white/55">Open →</div>
                      </a>
                    </div>

                    <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-white/75">
                      “It’s a golf life and we’ve all chose to live it.”
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="the-plan" className="mx-auto max-w-[1500px] px-4 pb-6 md:px-6">
        <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
          <div className="text-[11px] uppercase tracking-[0.22em] text-[#14352a]/55">The Plan</div>
          <h2 className="mt-3 font-serif text-4xl">Weekend flow</h2>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-[#14352a]/75">
            The original site breaks the weekend down clearly. This version just gives it better spacing, better scanning, and fewer ways to get lost.
          </p>
          <div className="mt-6 grid gap-4 lg:grid-cols-4">
            {planCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-[#14352a]/10 bg-[#f7f3ea] p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-[#14352a]/50">{card.time}</div>
                <h3 className="mt-2 font-serif text-2xl">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#14352a]/72">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="players" className="mx-auto max-w-[1500px] px-4 pb-6 md:px-6">
        <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
          <div className="text-[11px] uppercase tracking-[0.22em] text-[#14352a]/55">Players</div>
          <h2 className="mt-3 font-serif text-4xl">The field, with actual personality</h2>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-[#14352a]/75">
            This should stay in Fred’s voice: sharp, funny, affectionate, occasionally roasting, always human.
          </p>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {playerCards.map(([name, bio]) => (
              <div key={name} className="rounded-2xl border border-[#14352a]/10 p-5">
                <h3 className="font-serif text-2xl">{name}</h3>
                <p className="mt-3 text-sm leading-7 text-[#14352a]/72">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="logistics" className="mx-auto max-w-[1500px] px-4 pb-6 md:px-6">
        <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
          <div className="text-[11px] uppercase tracking-[0.22em] text-[#14352a]/55">Logistics</div>
          <h2 className="mt-3 font-serif text-4xl">Travel, lodging, food, and money</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-4">
            {logisticsCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-[#14352a]/10 bg-[#f7f3ea] p-5">
                <h3 className="font-serif text-2xl">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#14352a]/72">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="competition" className="mx-auto max-w-[1500px] px-4 pb-6 md:px-6">
        <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
          <div className="text-[11px] uppercase tracking-[0.22em] text-[#14352a]/55">Competition</div>
          <h2 className="mt-3 font-serif text-4xl">Formats, rules, side games, payouts</h2>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-[#14352a]/75">
            The Competition page is already one of the strongest parts of Fred’s site. This version keeps the same structure and makes it easier to scan under pressure.
          </p>
          <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {competitionCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-[#14352a]/10 bg-[#f7f3ea] p-5">
                <h3 className="font-serif text-2xl">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#14352a]/72">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="the-strand" className="mx-auto max-w-[1500px] px-4 pb-6 md:px-6">
        <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
          <div className="text-[11px] uppercase tracking-[0.22em] text-[#14352a]/55">The Strand</div>
          <h2 className="mt-3 font-serif text-4xl">Archive preview</h2>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-[#14352a]/75">
            The original site already proves this event has a real lineage. These archive cards should mirror that structure and keep Fred’s year-by-year voice intact.
          </p>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {archivePreview.map((card) => (
              <div key={card.year} className="rounded-2xl border border-[#14352a]/10 bg-[#f7f3ea] p-5">
                <div className="font-serif text-3xl">{card.year}</div>
                <div className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[#14352a]/50">Champion</div>
                <div className="mt-2 text-lg">{card.winner}</div>
                <p className="mt-4 text-sm leading-7 text-[#14352a]/72">{card.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="live-scoring" className="mx-auto max-w-[1500px] px-4 pb-6 md:px-6">
        <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
          <div className="text-[11px] uppercase tracking-[0.22em] text-[#14352a]/55">Live Scoring</div>
          <h2 className="mt-3 font-serif text-4xl">TheGrint lives here later</h2>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-[#14352a]/75">
            This block is intentionally ready for your real leaderboard links once teams and pairings are locked. Keep the Strand site as the front door, and let TheGrint do the scoring math in the background.
          </p>
        </div>
      </section>

      <section id="credits" className="mx-auto max-w-[1500px] px-4 pb-8 md:px-6">
        <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
          <div className="text-[11px] uppercase tracking-[0.22em] text-[#14352a]/55">Credits</div>
          <h2 className="mt-3 font-serif text-4xl">Built on Fred’s foundation</h2>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-[#14352a]/75">
            Original Strand website concept, writing, archive structure, and media groundwork by Fred Geisinger.
            This Vercel version keeps Fred’s content priorities and voice, then wraps them in a cleaner, more premium front-end layer.
          </p>
        </div>
      </section>
    </main>
  );
}
