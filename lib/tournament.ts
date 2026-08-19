import { MY_CAPTAIN, OPPONENT_CAPTAIN } from "./mock-draft";

/** Captain draft: Thursday, July 23 at 6:00 PM Pacific. */
export const DRAFT_AT = new Date("2026-07-23T18:00:00-07:00").getTime();

export const CAPTAINS = {
  wix: { ...MY_CAPTAIN, teamName: "Team WIX", picks: 9, role: "Captain" },
  justin: { ...OPPONENT_CAPTAIN, teamName: "Team Justin", picks: 9, role: "Captain" },
} as const;

export const CAPTAIN_DRAFT_RULES = [
  "Two captains: Matt Wixted (WIX) and Justin Uribe (J-BONE).",
  "Straight alternating draft — not a snake. J-BONE owns picks 1, 3, 5…17; WIX owns 2, 4, 6…18.",
  "Each captain selects 9 players and plays on his own team (10 per side).",
  "Captain draft locks both 10-man rosters before tournament week.",
];

export const MATCHMAKER_RULES = [
  "Opening Ceremony is after QuickSands and dinner Thursday; location TBD.",
  "Welcome, tee gifts, review format/scoring/rules, then captains pick matchups.",
  "WIX vs J-BONE set round-by-round pairings and matchups for the four sanctioned rounds.",
];

/** @deprecated Use CAPTAIN_DRAFT_RULES + MATCHMAKER_RULES */
export const TEAM_DRAFT_RULES = [...CAPTAIN_DRAFT_RULES, ...MATCHMAKER_RULES];

export const STRAND_FORMAT = [
  "Thursday QuickSands — 14-hole par-3 warm-up; not Strand sanctioned; format TBD.",
  "Round 1 — Fourball",
  "Round 2 — Two-Man Shamble",
  "Round 3 — Singles",
  "Round 4 — Two-Man Scramble",
  "Each match is worth 3 points: 1 front, 1 back, 1 overall.",
];

export const ROUND_FORMATS = [
  { round: 1, day: "Friday • August 21", course: "Gamble Sands", format: "Fourball", teeTime: "8:30 AM", note: "18 holes · carts · range balls. Friday morning on-course contests: Long Drive on No. 3 plus KP on all four par 3s." },
  { round: 2, day: "Friday • August 21", course: "Scarecrow", format: "Two-Man Shamble", teeTime: "2:45 PM", note: "18 holes · carts · range balls. Official schedule-table time is 2:45 PM." },
  { round: 3, day: "Saturday • August 22", course: "Scarecrow", format: "Singles", teeTime: "9:05 AM", note: "18 holes · carts · range balls. Five par-3 KPs, one Long Drive (hole TBD), Low Net and 2nd Low Net." },
  { round: 4, day: "Saturday • August 22", course: "Gamble Sands", format: "Two-Man Scramble", teeTime: "3:00 PM", note: "18 holes · carts · range balls. Lunch and drinks before the round; Closing Ceremony Dinner at the house afterward." },
] as const;

export const WEEKEND_SCHEDULE = [
  { day: "Thursday • August 20", time: "5:00 PM", title: "QuickSands Warm-Up", note: "14 par-3 holes · format TBD · not Strand sanctioned." },
  { day: "Thursday • August 20", time: "After golf + dinner", title: "Opening Ceremony", note: "Location TBD · welcome, tee gifts, rules/scoring review and matchup selection." },
  { day: "Friday • August 21", time: "8:30 AM", title: "Round 1 — Fourball @ Gamble Sands", note: "18 holes · carts · range balls · Long Drive No. 3 · KP on all four par 3s." },
  { day: "Friday • August 21", time: "2:45 PM", title: "Round 2 — Two-Man Shamble @ Scarecrow", note: "18 holes · carts · range balls. Page 2 rounds this to 3 PM; the official schedule table lists 2:45 PM." },
  { day: "Saturday • August 22", time: "9:05 AM", title: "Round 3 — Singles @ Scarecrow", note: "18 holes · carts · range balls · five KPs · Long Drive hole TBD · Low Net and 2nd Low Net." },
  { day: "Saturday • August 22", time: "Before 3:00 PM", title: "Lunch + drinks", note: "Before the final Gamble Sands round." },
  { day: "Saturday • August 22", time: "3:00 PM", title: "Round 4 — Two-Man Scramble @ Gamble Sands", note: "18 holes · carts · range balls." },
  { day: "Saturday • August 22", time: "After golf", title: "Closing Ceremony Dinner", note: "Dinner at the house." },
  { day: "Sunday • August 23", time: "11:00 AM", title: "Checkout", note: "Departure logistics will be discussed in person." },
] as const;

export const LOGISTICS_NOTES = [
  "Gamble Sands · 200 Sands Trail Road, Brewster, WA 98812.",
  "New lodging near Scarecrow · Double King Rooms · shuttles run between courses.",
  "Sunday checkout is 11:00 AM.",
  "Last group: pick up all stakes / contest markers.",
  "Turn all scorecards into Justin after every round.",
];

export const ROOM_ASSIGNMENTS = [
  "Fred / Andrew",
  "Jack / Kerns",
  "Justin / Jason",
  "Shaun / Schroe",
  "Gord / Blon",
  "D’Arcy / Hummel",
  "Matt O. / Pat",
  "Kev / Rhett",
  "Sprowls / Brett / Wix / Kane (not a suite)",
] as const;

/** Previously confirmed playing-allowance configuration used by the scoring engine.
 * The final event PDF does not restate these percentages, so user-facing official-rules
 * copy should not present these as being sourced from that PDF. */
export const HANDICAP_RULES = [
  "Official tournament indexes are the values on the final Strand sheet; GHIN handicaps update daily.",
  "Handicap ceiling is 25 for tournament play.",
  "Course handicap and match strokes are calculated from the configured event indexes and course stroke indexes.",
];

export const ON_COURSE_RULES = [
  "Play all penalties like lateral hazard — 1 stroke penalty.",
  "Drop where the ball last crossed land / inbounds. When in doubt, ask your opponent.",
  "Scrambles — 1 club length and can place. Must stay in the same turf.",
  "Play quickly and keep up with the group in front. Lost-ball search limit is 2 minutes.",
  "Breakfast ball off the first hole of the day only.",
  "Gimmies are acceptable. What would Gord do (WWGD).",
  "Have FUN!!!",
] as const;

export const ON_COURSE_COMPETITIONS = [
  "Closest to the Pin: every par 3 in the two morning rounds — 9 total (4 Friday Gamble Sands + 5 Saturday Scarecrow).",
  "Longest Drive: one in each morning round — Friday Gamble Sands No. 3; Saturday Scarecrow hole TBD. Drive MUST finish in the fairway.",
  "Low Net and 2nd Low Net: Saturday Singles at Scarecrow only.",
  "Last group picks up the contest stakes / markers.",
] as const;

export const PAYOUTS = [
  { category: "Winning Team", payout: "$157.50 per person" },
  { category: "Par-3 Closest to Pin", payout: "$35 each · 9 total" },
  { category: "Longest Drive", payout: "$55 each · 2 total" },
  { category: "Low Net · Singles only", payout: "$70" },
  { category: "2nd Low Net · Singles only", payout: "$30" },
] as const;

export const TOURNAMENT_BUY_IN = 105;
export const TOURNAMENT_POT = 2100;
export const TEE_GIFT_COST = 25;

export const MATCH_PLAY_RULES = [
  "All sanctioned matches are 3 points: 1 point front, 1 point back, 1 point overall.",
  "Every man throws in $105, creating a $2,100 tournament pot.",
  ...ON_COURSE_RULES,
] as const;

export const STRAND_RULES = [...HANDICAP_RULES, ...MATCH_PLAY_RULES];

export const HANDICAP_CAP = 25;
export function playingIndex(index: number): number { return Math.min(index, HANDICAP_CAP); }

/** Existing scoring-engine weights retained from the previously confirmed tournament configuration. */
export const SCRAMBLE_LOW_WEIGHT = 0.35;
export const SCRAMBLE_HIGH_WEIGHT = 0.15;
export function scrambleTeamHandicap(lowCourseHc: number, highCourseHc: number): number {
  return lowCourseHc * SCRAMBLE_LOW_WEIGHT + highCourseHc * SCRAMBLE_HIGH_WEIGHT;
}
