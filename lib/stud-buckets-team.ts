export interface TeammateJob {
  title: string;
  mission: string;
  lockerRoom: string;
}

export const STUD_BUCKETS_JOBS: Record<string, TeammateJob> = {
  "matt-wixted": {
    title: "The Air-Traffic Controller",
    mission: "Keep the match state loud, the pairings clear and ten emotionally complicated aircraft out of the trees.",
    lockerRoom: "WIX does the beer math so nobody else has to. This is leadership, arithmetic and a public-safety initiative.",
  },
  "andrew-mager": {
    title: "The Adult in the Room",
    mission: "Supply gross pars, cover aggressive partners and make the other team beat real golf—not donated holes.",
    lockerRoom: "Every group needs one scorecard that does not look like a Wi‑Fi password. Drew has been issued the clipboard.",
  },
  "jordan-brodbeck": {
    title: "The Swiss Army Brewer",
    mission: "Bring complete mid-cap golf to any format, stabilize a high-stroke partner and own a meaningful Singles match.",
    lockerRoom: "Useful everywhere, dangerous when opened and somehow carrying three tools airport security should have found.",
  },
  "nick-sprowls": {
    title: "The Sleeping Giant",
    mission: "Turn a 16.9 event number into net pressure by finding the lower-differential gear already proven in his history.",
    lockerRoom: "If vintage Nick wakes up, avoid eye contact and quietly hand him the scorecard. Wildlife protocol applies.",
  },
  "jack-groot": {
    title: "The International Man of Fairway",
    mission: "Use destination-course experience to stay patient when firm turf, wind and unfamiliar sightlines get weird.",
    lockerRoom: "Jack has seen enough strange golf holes to know the correct response is rarely “swing harder,” though it remains everyone’s favorite proposal.",
  },
  "sam-blonski": {
    title: "The Net ATM",
    mission: "Convert steady bogey golf and a 24.5 allowance into a pile of uncomfortable net pars.",
    lockerRoom: "Bogey is legal tender when it comes with a stroke. Insert opponent, enter PIN and withdraw one deeply annoying point.",
  },
  "nick-kane": {
    title: "The Garmin Witness Protection Program",
    mission: "Use 120 rounds of experience, stroke value and hot-putter upside beside a dependable gross ball.",
    lockerRoom: "Garmin confirms he golfs constantly. Garmin has declined further comment on the grounds it may incriminate both parties.",
  },
  "pat-morse": {
    title: "The Stroke-Hole Bandit",
    mission: "Bring the fresh low-to-mid-90s form, take every available pop and turn ordinary bogeys into match-play robbery.",
    lockerRoom: "A bogey with a stroke is basically a tax-free birdie. P‑MO understands finance and is prepared to commit light accounting fraud.",
  },
  "tim-hummel": {
    title: "The Veteran Thief",
    mission: "Use Strand experience, calm decisions and mid-teen ceiling rounds to steal the holes opponents assume they own.",
    lockerRoom: "Tim has seen this movie before. The ending usually features someone on the other team whispering, “How the hell are we two down?”",
  },
  "rhett-fahrney": {
    title: "The Undefeated Mystery",
    mission: "Lean on championship pedigree, keep the assignment simple and make limited scouting information work against the opponent.",
    lockerRoom: "Three trips, three wins and almost no current film. Rhett is less a player profile than an unidentified weather system.",
  },
};

export const STUD_BUCKETS_GOLD = [
  {
    title: "Grass before glory",
    tip: "In every partner format, put one ball in play before anyone auditions for a YouTube thumbnail.",
  },
  {
    title: "The flag is a suggestion",
    tip: "Center green pays rent. Short-sided hero golf is an expensive hobby and we already paid for the trip.",
  },
  {
    title: "Use the floor",
    tip: "Putter, hybrid and low iron are real short-game clubs here. Ego adds loft; firm fescue adds strokes.",
  },
  {
    title: "Know your pops",
    tip: "If you do not know where you receive strokes, you are donating the only free thing at Gamble Sands.",
  },
  {
    title: "Say the match out loud",
    tip: "Confirm front, back and overall status every three holes. Beer math is undefeated and consistently wrong.",
  },
  {
    title: "Waste sand, not panic",
    tip: "The sandy areas are waste areas. Ground the club, take a practice swing and save the dramatic bunker face for photos.",
  },
  {
    title: "Make them finish",
    tip: "A visible par changes decisions. Keep the ball alive and let the opponent manufacture the disaster.",
  },
  {
    title: "No emotional carryover",
    tip: "A lost hole is one point. Do not turn it into a limited-series documentary spanning the next four holes.",
  },
  {
    title: "Hydrate before ugly",
    tip: "Drink and eat before the swing starts resembling a folding chair falling down stairs.",
  },
  {
    title: "Win without apologizing",
    tip: "Nobody asks whether a 1-up victory was aesthetically pleasing. Put the point on ice and keep walking.",
  },
] as const;

export function teammateJob(playerId: string): TeammateJob {
  return STUD_BUCKETS_JOBS[playerId] ?? {
    title: "The Point Collector",
    mission: "Make committed decisions, keep the ball alive and force the opponent to earn every hole.",
    lockerRoom: "The job description is simple: fewer disasters, more points, better stories afterward.",
  };
}
