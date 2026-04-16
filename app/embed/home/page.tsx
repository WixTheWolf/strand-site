export default function StrandGoogleEmbedHomeFred() {
  const logoSrc = "/logo.png";
  const heroSrc = "/hero.jpg";

  const nav = ["Home", "The Strand", "The Plan", "Players", "Logistics", "Competition"];

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

  const quickLinks = [
    ["Live Scoring", "Leaderboard hub and scoring instructions"],
    ["The Plan", "Weekend flow, rounds, and timing"],
    ["Competition", "Format, rules, payouts, and team play"],
    ["The Strand", "Archive years, winners, and memories"],
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
      <section className="mx-auto max-w-[1500px] p-4 md:p-6">
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
                  <span key={item}>{item}</span>
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
                    href="#live-scoring"
                    className="rounded-2xl bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#14352a]"
                  >
                    View Live Scoring
                  </a>
                  <a
                    href="#archive"
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
                    <h2 className="mt-3 font-serif text-4xl leading-tight">Fred’s site, cleaner wrapper</h2>
                    <p className="mt-4 text-sm leading-7 text-white/78">
                      This embed keeps the Strand voice and content priorities from the original site while upgrading layout,
                      spacing, hierarchy, and polish for a stronger homepage presentation inside Google Sites.
                    </p>

                    <div className="mt-6 space-y-3">
                      {quickLinks.map(([title, note]) => (
                        <div
                          key={title}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-4"
                        >
                          <div>
                            <div className="text-sm">{title}</div>
                            <div className="mt-1 text-xs text-white/60">{note}</div>
                          </div>
                          <div className="text-xs text-white/55">Open →</div>
                        </div>
                      ))}
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

      <section className="mx-auto max-w-[1500px] px-4 pb-6 md:px-6">
        <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
          <div className="text-[11px] uppercase tracking-[0.22em] text-[#14352a]/55">Course Highlights</div>
          <h2 className="mt-3 font-serif text-4xl">Three courses, one ridiculous golf escape</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-[#14352a]/10 bg-[#f7f3ea] p-5">
              <h3 className="font-serif text-2xl">QuickSands</h3>
              <p className="mt-3 text-sm leading-7 text-[#14352a]/72">
                Grab a handful of wedges, irons and a putter. Bring your friends. Hang on for a wild ride down into the valley of
                David McLay Kidd’s creative mind. QuickSands offers a rollicking golf experience over 14 par-3 holes from 60 to 180 yards.
              </p>
            </div>
            <div className="rounded-2xl border border-[#14352a]/10 bg-[#f7f3ea] p-5">
              <h3 className="font-serif text-2xl">Gamble Sands</h3>
              <p className="mt-3 text-sm leading-7 text-[#14352a]/72">
                Pure fun. Always thrilling. Wide fairways run firm and fast, encouraging imagination and creativity the way the world’s
                great links courses do.
              </p>
            </div>
            <div className="rounded-2xl border border-[#14352a]/10 bg-[#f7f3ea] p-5">
              <h3 className="font-serif text-2xl">Scarecrow</h3>
              <p className="mt-3 text-sm leading-7 text-[#14352a]/72">
                Breathtaking and visually compelling with sweeping Columbia River views. A second 18-hole course with its own identity,
                built on steeper land and designed to create adventure.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 pb-6 md:px-6">
        <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
          <div className="text-[11px] uppercase tracking-[0.22em] text-[#14352a]/55">Dining</div>
          <h2 className="mt-3 font-serif text-4xl">Danny Boy and The Barn</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#14352a]/10 p-5">
              <h3 className="font-serif text-2xl">Danny Boy</h3>
              <p className="mt-3 text-sm leading-7 text-[#14352a]/72">
                Danny Boy offers a dinner-only menu centered on classic, high-quality grill fare. Signature items include the Tower of Tots,
                Danny Boy Burger, Ribeye, Prime Rib and Fish and Chips, plus ice-cold beer, signature cocktails, and a curated wine list.
              </p>
            </div>
            <div className="rounded-2xl border border-[#14352a]/10 p-5">
              <h3 className="font-serif text-2xl">The Barn</h3>
              <p className="mt-3 text-sm leading-7 text-[#14352a]/72">
                The Barn is open all day with breakfast sandwiches, burritos, pizzas, mix-and-match sliders, hearty sandwiches, daily specials,
                and enough bar space to keep the whole property moving.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="archive" className="mx-auto max-w-[1500px] px-4 pb-6 md:px-6">
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
            This embed version keeps Fred’s homepage content priorities and voice, then wraps it in a cleaner, more premium front-end layer.
          </p>
        </div>
      </section>
    </main>
  );
}
