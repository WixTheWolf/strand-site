import { MY_CAPTAIN, OPPONENT_CAPTAIN } from "./mock-draft";

export const CAPTAINS = {
  wix: {
    ...MY_CAPTAIN,
    teamName: "Team WIX",
    picks: 9,
    role: "Captain",
  },
  justin: {
    ...OPPONENT_CAPTAIN,
    teamName: "Team J-BONE",
    picks: 9,
    role: "Captain",
  },
} as const;

export const CAPTAIN_DRAFT_RULES = [
  "Two captains: Matt Wixted (WIX) and Justin Uribe (J-BONE).",
  "Traditional draft — captains alternate in the same order every round; each selects 9 players and plays on their own team (10 per side).",
  "~One month before The Strand: live captain draft locks both rosters.",
  "Use Draft Lab to model picks before the live draw.",
];

export const MATCHMAKER_RULES = [
  "Thursday night at Gamble Sands — after opening ceremony, captains run The Matchmaker.",
  "WIX vs J-BONE set round-by-round pairings and matchups for all four rounds.",
  "Pairings post live to this board; leaderboard links activate after reveal.",
];

/** @deprecated Use CAPTAIN_DRAFT_RULES + MATCHMAKER_RULES */
export const TEAM_DRAFT_RULES = [...CAPTAIN_DRAFT_RULES, ...MATCHMAKER_RULES];

/** Canonical match formats — strandinvitational.life/competition */
export const STRAND_FORMAT = [
  "Quicksands Warm-Up — TBD",
  "Round 1 — Foursomes",
  "Round 2 — Shamble",
  "Round 3 — Singles",
  "Round 4 — Two Man Scramble",
  "All matches are 3 points: 1 point front, 1 point back, 1 point overall.",
];

export const ROUND_FORMATS = [
  {
    round: 1,
    day: "Friday • August 21",
    course: "Gamble Sands",
    format: "Foursomes",
    teeTime: "8:20 AM",
    note: "Alternate-shot foursomes match play. Lunch at 1:00 PM.",
  },
  {
    round: 2,
    day: "Friday • August 21",
    course: "Scarecrow",
    format: "Shamble",
    teeTime: "2:45 PM",
    note: "Two-man shamble. Dinner at 8:00 PM.",
  },
  {
    round: 3,
    day: "Saturday • August 22",
    course: "Scarecrow",
    format: "Singles",
    teeTime: "9:00 AM",
    note: "Individual match play. Low Net and 2nd Low Net prizes this round. Lunch at 2:00 PM.",
  },
  {
    round: 4,
    day: "Saturday • August 22",
    course: "Gamble Sands",
    format: "Two Man Scramble",
    teeTime: "3:00 PM",
    note: "Closing team battle. Closing ceremony and awards dinner at 8:00 PM.",
  },
];

/** Full weekend flow — strandinvitational.life/the-plan */
export const WEEKEND_SCHEDULE = [
  {
    day: "Thursday • August 20",
    time: "5:00 PM",
    title: "QuickSands Warm-Up",
    note: "Format TBD — 14 par-3 warm-up at QuickSands, then dinner and opening ceremony.",
  },
  {
    day: "Thursday • August 20",
    time: "7:00 PM",
    title: "Dinner",
    note: "Danny Boy Bar & Grill.",
  },
  {
    day: "Thursday • August 20",
    time: "8:00 PM",
    title: "Opening Ceremony + The Matchmaker",
    note: "Captains reveal round pairings for the weekend.",
  },
  {
    day: "Friday • August 21",
    time: "8:20 AM",
    title: "Round 1 — Foursomes @ Gamble Sands",
    note: "Team match play opens on the original 18.",
  },
  {
    day: "Friday • August 21",
    time: "1:00 PM",
    title: "Lunch",
    note: "The Barn.",
  },
  {
    day: "Friday • August 21",
    time: "2:45 PM",
    title: "Round 2 — Shamble @ Scarecrow",
    note: "Two-man shamble with Columbia River views.",
  },
  {
    day: "Friday • August 21",
    time: "8:00 PM",
    title: "Dinner",
    note: "Danny Boy.",
  },
  {
    day: "Saturday • August 22",
    time: "9:00 AM",
    title: "Round 3 — Singles @ Scarecrow",
    note: "Individual matches — Low Net prizes on the line.",
  },
  {
    day: "Saturday • August 22",
    time: "2:00 PM",
    title: "Lunch",
    note: "The Barn.",
  },
  {
    day: "Saturday • August 22",
    time: "3:00 PM",
    title: "Round 4 — Two Man Scramble @ Gamble Sands",
    note: "Closing team scramble on Gamble Sands.",
  },
  {
    day: "Saturday • August 22",
    time: "8:00 PM",
    title: "Closing Ceremony & Awards Dinner",
    note: "Champions, payouts, and the stories get less accurate from here.",
  },
  {
    day: "Sunday • August 23",
    time: "AM",
    title: "Depart",
    note: "Checkout 10:00 AM. Load up and head home.",
  },
];

export const LOGISTICS_NOTES = [
  "Fly into Spokane, WA (GEG) — Thursday morning arrivals.",
  "Gamble Sands • 200 Sand Trails Road, Brewster, WA 98812.",
  "New hotel at Scarecrow — short shuttle from original onsite lodging (booked out).",
  "Check-in Thursday 3:00 PM. Check-out Sunday 10:00 AM.",
  "Rooming is player-coordinated — double king rooms, 2 or 4 per room.",
];

export const HANDICAP_RULES = [
  "All four rounds use USGA / WHS handicap indexes via TheGrint / GHIN.",
  "Handicap ceiling of 25 — anyone with a higher index plays as a 25.",
  "Course handicap calculated from slope and rating at each tee box.",
  "Match play: strokes allocated hole-by-hole based on stroke index.",
  "Foursomes: team handicap per draw (confirm at The Matchmaker).",
  "Scramble / shamble: team handicap 35% low + 15% high.",
  "Singles: full course handicap difference between opponents.",
];

/** On-course rules — strandinvitational.life/competition */
export const ON_COURSE_RULES = [
  "Play all penalties like lateral hazard — 1 stroke penalty.",
  "Drops occur where the ball last crossed land / inbounds. Two club lengths. When in doubt, ask your opponent.",
  "Scrambles — 1 club length and can place. Must stay in same turf.",
  "Play quickly — keep up with the group in front of you. Two minute search for lost balls.",
  "Breakfast ball off the first hole of the day only.",
  "Gimmies must be conceded. What would Gord do (WWGD).",
  "Have FUN!!!",
];

export const MATCH_PLAY_RULES = [
  "All matches are 3 points: 1 point front, 1 point back, 1 point overall.",
  "Every man throws in $100, creating a $1,600 pot.",
  ...ON_COURSE_RULES,
];

/** Canonical Strand 2026 rules — single source of truth for site + draft model */
export const STRAND_RULES = [...HANDICAP_RULES, ...MATCH_PLAY_RULES];

/** League handicap ceiling — anyone with a higher index plays as a 25 */
export const HANDICAP_CAP = 25;

/** Index as it plays under the Strand ceiling */
export function playingIndex(index: number): number {
  return Math.min(index, HANDICAP_CAP);
}

/** Scramble / shamble team handicap formula (WHS-style) */
export const SCRAMBLE_LOW_WEIGHT = 0.35;
export const SCRAMBLE_HIGH_WEIGHT = 0.15;

export function scrambleTeamHandicap(lowCourseHc: number, highCourseHc: number): number {
  return lowCourseHc * SCRAMBLE_LOW_WEIGHT + highCourseHc * SCRAMBLE_HIGH_WEIGHT;
}
