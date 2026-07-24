export const STUD_BUCKETS_TEAM = {
  id: "wix",
  name: "Stud Buckets",
  shortName: "BUCKETS",
  captainId: "matt-wixted",
  playerIds: [
    "matt-wixted",
    "andrew-mager",
    "jordan-brodbeck",
    "nick-sprowls",
    "jack-groot",
    "sam-blonski",
    "nick-kane",
    "pat-morse",
    "tim-hummel",
    "rhett-fahrney",
  ],
} as const;

export const JBONE_TEAM = {
  id: "jbone",
  name: "Team J-BONE",
  shortName: "J-BONE",
  captainId: "justin-uribe",
  playerIds: [
    "justin-uribe",
    "fred-geisinger",
    "matt-schroeder",
    "ryan-darcy",
    "kevin-gordon",
    "jason-olson",
    "brett-comfort",
    "brian-kerns",
    "matt-onorato",
    "shaun-eipper",
  ],
} as const;

export const STUD_BUCKETS_ACCESS_COOKIE = "strand-stud-buckets-access";
export const COURSE_INTEL_ACCESS_COOKIE = "strand-course-intel-access";

export const PATH_TO_38 = [
  {
    format: "fourball",
    round: "Round 1",
    label: "Fourball",
    course: "Gamble Sands",
    points: 15,
    target: 8,
    directive: "Build five dependable floors. One steady ball stays alive while the partner attacks.",
  },
  {
    format: "shamble",
    round: "Round 2",
    label: "Shamble",
    course: "Scarecrow",
    points: 15,
    target: 8,
    directive: "Pair driving reliability with net leverage. Choose the drive that creates the best angle, not the longest story.",
  },
  {
    format: "singles",
    round: "Round 3",
    label: "Singles",
    course: "Scarecrow",
    points: 30,
    target: 14,
    directive: "Win the middle of the board. Avoid donating holes and force opponents to earn every point.",
  },
  {
    format: "scramble",
    round: "Round 4",
    label: "2-Man Scramble",
    course: "Gamble Sands",
    points: 15,
    target: 8,
    directive: "Use complementary pairs: one ball in play, one green-light swing, then putt aggressively from inside the correct line.",
  },
] as const;

export const TEAM_STANDARDS = [
  "Know your exact strokes before the first tee. Confusion is a self-inflicted penalty.",
  "Keep one ball alive before anyone plays hero. Pressure comes from making the opponent finish holes.",
  "Say the match state out loud after every three holes. No silent scoreboard math.",
  "Pick targets from the safest side of the hole. Gamble Sands rewards angles more than raw distance.",
  "In partner formats, communicate before every shot: safe ball, attack ball, miss side and putt order.",
  "Reset after every hole. A lost point is one point, not permission to lose the next three.",
] as const;

export type StudBucketsFormat = (typeof PATH_TO_38)[number]["format"];
