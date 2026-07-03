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

export const TEAM_DRAFT_RULES = [
  "Two captains: Matt Wixted (WIX) and Justin Uribe (J-BONE).",
  "Snake draft — each captain selects 9 players; captains play on their own teams (10 per side).",
  "Teams revealed Thursday night after the opening ceremony.",
  "Use Draft Lab to model picks before the live draw.",
];

export const ROUND_FORMATS = [
  {
    round: 1,
    day: "Friday • August 21",
    course: "Gamble Sands",
    format: "Four-Ball",
    teeTime: "8:20 AM",
    note: "Best ball match play. PGA handicap strokes applied per hole.",
  },
  {
    round: 2,
    day: "Friday • August 21",
    course: "Scarecrow",
    format: "Two-Man Scramble",
    teeTime: "2:45 PM",
    note: "Both players hit, pick best ball. One club length, same turf.",
  },
  {
    round: 3,
    day: "Saturday • August 22",
    course: "Scarecrow",
    format: "Singles",
    teeTime: "9:00 AM",
    note: "Individual match play. Low Net and 2nd Low Net prizes apply this round.",
  },
  {
    round: 4,
    day: "Saturday • August 22",
    course: "Gamble Sands",
    format: "Two-Man Shamble",
    teeTime: "3:00 PM",
    note: "Tee shot scramble, then own ball in. Closing team battle.",
  },
];

export const HANDICAP_RULES = [
  "All four rounds use USGA / WHS handicap indexes via TheGrint / GHIN.",
  "Course handicap calculated from slope and rating at each tee box.",
  "Match play: strokes allocated hole-by-hole based on stroke index.",
  "Four-ball: each player plays own ball; best net score counts.",
  "Scramble / shamble: team handicap typically 35% low + 15% high (confirm at draw).",
  "Singles: full course handicap difference between opponents.",
];

export const MATCH_PLAY_RULES = [
  "Match play is 1 point for front, back, and overall — 3 points total per match.",
  "Every man throws in $100, creating a $1,600 pot.",
  "Play all penalties like a lateral hazard with a one-stroke penalty.",
  "Drops occur where the ball last crossed land or inbounds. When in doubt, ask your opponent.",
  "Scrambles get one club length and can place, but must stay on the same turf.",
  "Play quickly and keep up with the group in front. Lost-ball search limit is 2 minutes.",
  "Breakfast ball off the first hole of the day only.",
  "Gimmies are acceptable. In moments of moral fog, ask: What Would Gord Do?",
];
