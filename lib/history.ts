export interface StrandTournament {
  year: number;
  slug: string;
  destination: string;
  label: string;
  winnerTeam: string;
  loserTeam: string;
  winnerScore: string;
  loserScore: string;
  courses: string[];
  winnerRoster: string[];
  loserRoster: string[];
  summary: string;
  sourceUrl: string;
}

/** Canonical archive from strandinvitational.life/the-strand/* */
export const STRAND_TOURNAMENTS: StrandTournament[] = [
  {
    year: 2025,
    slug: "monterey-2025",
    destination: "Monterey, CA",
    label: "Monterey 2025",
    winnerTeam: "Team Taliban",
    loserTeam: "Team GilGords",
    winnerScore: "33.5",
    loserScore: "26.5",
    courses: ["Pasatiempo", "Pacific Grove", "Poppy Hills", "Bayonet", "Black Horse"],
    winnerRoster: [
      "Matt Schroeder (C)",
      "Fred Geisinger",
      "Justin Uribe",
      "Nick Sprowls",
      "Jason Olson",
      "Nick Kane",
      "Matt Onorato",
      "Pat Morse",
    ],
    loserRoster: [
      "Jordan Brodbeck (C)",
      "Andrew Mager",
      "Matt Wixted",
      "Ryan D'Arcy",
      "Tim Hummel",
      "Kevin Gordon",
      "Brett Comfort",
      "Sam Blonski",
    ],
    summary: "Team Taliban took Monterey 33.5 to 26.5 — the deepest documented Strand archive yet.",
    sourceUrl: "https://www.strandinvitational.life/the-strand/monterey-2025",
  },
  {
    year: 2024,
    slug: "ojai-2024",
    destination: "Ojai, CA",
    label: "Ojai 2024",
    winnerTeam: "Team D'Arce",
    loserTeam: "Team Nick",
    winnerScore: "25",
    loserScore: "23",
    courses: ["Sandpiper Golf Club", "Soule Park", "Ojai Valley Inn"],
    winnerRoster: [
      "Ryan D'Arcy (C)",
      "Fred Geisinger",
      "Matt Wixted",
      "Tim Hummel",
      "Kevin Gordon",
      "Matt Onorato",
      "Jay",
      "Nick Kane",
    ],
    loserRoster: [
      "Drew",
      "Justin Uribe",
      "Nick Sprowls",
      "Geoff",
      "Jason Olson",
      "Brett Comfort",
      "Sam Blonski",
      "Rhett Fahrney",
    ],
    summary: "Captain D'Arcy's squad edged Team Nick 25–23 in a razor-close Ojai finish.",
    sourceUrl: "https://www.strandinvitational.life/the-strand/ojai-2024",
  },
  {
    year: 2023,
    slug: "st-george-2023",
    destination: "St. George, UT",
    label: "St. George 2023",
    winnerTeam: "Pussy Beaters",
    loserTeam: "Striping Greens",
    winnerScore: "30",
    loserScore: "18",
    courses: ["The Ledges", "Sky Mountain", "Sand Hollow"],
    winnerRoster: [
      "Fred Geisinger",
      "Matt Schroeder",
      "Nick Sprowls",
      "Tim Hummel",
      "Jordan Brodbeck",
      "Matt Onorato",
      "Nick Kane",
      "Rhett Fahrney",
    ],
    loserRoster: [
      "Drew",
      "Punz",
      "Justin Uribe",
      "Matt Wixted",
      "Brett Comfort",
      "Jason Olson",
      "Kevin Gordon",
      "Pat Morse",
    ],
    summary: "Pussy Beaters blew the doors off 30–18 — classic Strand chaos in Utah.",
    sourceUrl: "https://www.strandinvitational.life/the-strand/st-george-2023",
  },
  {
    year: 2022,
    slug: "rams-hill-2022",
    destination: "Rams Hill, CA",
    label: "Rams Hill 2022",
    winnerTeam: "Team Fred",
    loserTeam: "Team Drew",
    winnerScore: "Team B!",
    loserScore: "—",
    courses: ["Rams Hill"],
    winnerRoster: [
      "Fred Geisinger",
      "Tim Hummel",
      "Justin Uribe",
      "Ryan F.",
      "Jason Olson",
      "Shaun Eipper",
      "Matt Onorato",
      "Kevin Gordon",
    ],
    loserRoster: [
      "Andrew Mager",
      "Matt Schroeder",
      "Ross",
      "Ryan D'Arcy",
      "Matt Wixted",
      "Jordan Brodbeck",
      "Geoff",
      "Nick Kane",
    ],
    summary: "Team Fred (Team B) took Rams Hill — the site's scoreboard just says Team B!",
    sourceUrl: "https://www.strandinvitational.life/the-strand/rams-hill-2022",
  },
  {
    year: 2021,
    slug: "la-quinta-2021",
    destination: "La Quinta, CA",
    label: "La Quinta 2021",
    winnerTeam: "Brooks Is a Bully",
    loserTeam: "Rory's a Crier",
    winnerScore: "Team Brooks!",
    loserScore: "—",
    courses: ["Desert Willow Firecliff", "Desert Willow Mountain View", "La Quinta Dunes"],
    winnerRoster: [
      "Lowell",
      "Fred Geisinger",
      "Punz",
      "Jason Olson",
      "Jordan Brodbeck",
      "Nick Sprowls",
      "Matt Onorato",
      "Rhett Fahrney",
    ],
    loserRoster: [
      "Drew",
      "A. Wix",
      "Justin Uribe",
      "Matt Schroeder",
      "Shaun Eipper",
      "Sam Blonski",
      "Matt Wixted",
      "Kevin Gordon",
    ],
    summary: "Brooks Is a Bully won La Quinta — Team Brooks! on the official record.",
    sourceUrl: "https://www.strandinvitational.life/the-strand/la-quinta-2021",
  },
  {
    year: 2020,
    slug: "palm-desert-2020",
    destination: "Palm Desert, CA",
    label: "Palm Desert 2020",
    winnerTeam: "TBD",
    loserTeam: "TBD",
    winnerScore: "—",
    loserScore: "—",
    courses: ["Palm Desert area"],
    winnerRoster: [],
    loserRoster: [],
    summary: "Archive page exists but full results were not posted on the legacy site.",
    sourceUrl: "https://www.strandinvitational.life/the-strand/palm-desert-2020",
  },
  {
    year: 2019,
    slug: "indio-2019",
    destination: "Indio, CA",
    label: "Indio 2019",
    winnerTeam: "TBD",
    loserTeam: "TBD",
    winnerScore: "—",
    loserScore: "—",
    courses: ["Indio area"],
    winnerRoster: [],
    loserRoster: [],
    summary: "Archive page exists but full results were not posted on the legacy site.",
    sourceUrl: "https://www.strandinvitational.life/the-strand/indio-2019",
  },
  {
    year: 2018,
    slug: "palm-springs-2018",
    destination: "Palm Springs, CA",
    label: "Palm Springs 2018",
    winnerTeam: "Drew / Kev",
    loserTeam: "Justin / Rhett",
    winnerScore: "49 pts",
    loserScore: "38 pts",
    courses: ["Omni Rancho Las Palmas", "La Quinta Dunes"],
    winnerRoster: ["Drew", "Kevin Gordon"],
    loserRoster: ["Justin Uribe", "Rhett Fahrney"],
    summary:
      "Inaugural Strand used a pairing-points format. Drew/Kev led at 49; Lowell/Jordan 46; Fred/Eric 42; Justin/Rhett 38.",
    sourceUrl: "https://www.strandinvitational.life/the-strand/palm-springs-2018",
  },
];

/** Normalize roster names to 2026 player IDs where possible */
const NAME_TO_ID: Record<string, string> = {
  "andrew mager": "andrew-mager",
  andrew: "andrew-mager",
  mager: "andrew-mager",
  "matt wixted": "matt-wixted",
  wix: "matt-wixted",
  "a. wix": "matt-wixted",
  "fred geisinger": "fred-geisinger",
  fred: "fred-geisinger",
  "justin uribe": "justin-uribe",
  justin: "justin-uribe",
  "nick sprowls": "nick-sprowls",
  nick: "nick-sprowls",
  sprowls: "nick-sprowls",
  "nick kane": "nick-kane",
  kane: "nick-kane",
  "matt onorato": "matt-onorato",
  "matty o.": "matt-onorato",
  "marty o.": "matt-onorato",
  "matt o.": "matt-onorato",
  "pat morse": "pat-morse",
  pat: "pat-morse",
  "matt schroeder": "matt-schroeder",
  schroe: "matt-schroeder",
  "tony schroe": "matt-schroeder",
  "ryan d'arcy": "ryan-darcy",
  "d'arcy": "ryan-darcy",
  darcy: "ryan-darcy",
  "jordan brodbeck": "jordan-brodbeck",
  gord: "jordan-brodbeck",
  jordan: "jordan-brodbeck",
  "tim hummel": "tim-hummel",
  hummel: "tim-hummel",
  "sam blonski": "sam-blonski",
  blonski: "sam-blonski",
  blon: "sam-blonski",
  "brett comfort": "brett-comfort",
  brett: "brett-comfort",
  "jason olson": "jason-olson",
  jason: "jason-olson",
  "rhett fahrney": "rhett-fahrney",
  rhett: "rhett-fahrney",
  "kevin gordon": "kevin-gordon",
  kev: "kevin-gordon",
  "shaun eipper": "shaun-eipper",
  shaun: "shaun-eipper",
  "jack groot": "jack-groot",
  jack: "jack-groot",
  "brian kerns": "brian-kerns",
  kerns: "brian-kerns",
  lowell: "matt-lowell",
  drew: "drew",
  eric: "eric-therrien",
  geoff: "geoff",
  punz: "punz",
  jay: "jay",
  ross: "ross",
  brooks: "brooks",
};

function normalizeName(raw: string): string {
  return raw
    .replace(/\(C\)/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function rosterNameToId(name: string): string | null {
  const key = normalizeName(name);
  return NAME_TO_ID[key] ?? null;
}

export interface PlayerStrandRecord {
  playerId: string;
  name: string;
  wins: number;
  losses: number;
  appearances: number;
  winPct: number | null;
  years: { year: number; result: "W" | "L"; team: string }[];
}

export function buildPlayerRecords(players: { id: string; name: string }[]): PlayerStrandRecord[] {
  const records = new Map<string, PlayerStrandRecord>();

  for (const player of players) {
    records.set(player.id, {
      playerId: player.id,
      name: player.name,
      wins: 0,
      losses: 0,
      appearances: 0,
      winPct: null,
      years: [],
    });
  }

  for (const event of STRAND_TOURNAMENTS) {
    if (!event.winnerRoster.length || event.winnerTeam === "TBD") continue;

    const winnerIds = new Set<string>();
    const loserIds = new Set<string>();

    for (const name of event.winnerRoster) {
      const id = rosterNameToId(name);
      if (id) winnerIds.add(id);
    }
    for (const name of event.loserRoster) {
      const id = rosterNameToId(name);
      if (id) loserIds.add(id);
    }

    for (const id of winnerIds) {
      const rec = records.get(id);
      if (!rec) continue;
      rec.wins += 1;
      rec.appearances += 1;
      rec.years.push({ year: event.year, result: "W", team: event.winnerTeam });
    }
    for (const id of loserIds) {
      if (winnerIds.has(id)) continue;
      const rec = records.get(id);
      if (!rec) continue;
      rec.losses += 1;
      rec.appearances += 1;
      rec.years.push({ year: event.year, result: "L", team: event.loserTeam });
    }
  }

  return [...records.values()]
    .map((rec) => ({
      ...rec,
      winPct: rec.appearances ? Math.round((rec.wins / rec.appearances) * 100) : null,
    }))
    .sort((a, b) => b.wins - a.wins || b.appearances - a.appearances);
}

export const CHAMPIONS_BOARD = STRAND_TOURNAMENTS.filter((t) => t.winnerTeam !== "TBD").map((t) => ({
  year: t.year,
  label: t.label,
  winner: t.winnerTeam,
  score: t.winnerScore !== "—" ? `${t.winnerScore}–${t.loserScore}` : t.winnerScore,
}));
