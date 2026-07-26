export type HolePlan = "attack" | "swing" | "protect";

export interface CourseTee {
  name: string;
  color: string;
  yards: number;
  rating: number;
  slope: number;
  holeYards: number[];
}

export interface HoleIntel {
  number: number;
  par: number;
  strokeIndex: number;
  plan: HolePlan;
  headline: string;
  strategy: string;
  preferredMiss: string;
  matchPlay: string;
}

export interface ChampionshipCourseIntel {
  id: "gamble-sands" | "scarecrow";
  name: string;
  shortName: string;
  architect: string;
  image: string;
  par: number;
  defaultTee: string;
  tournamentRounds: string;
  design: string;
  winningFormula: string[];
  tees: CourseTee[];
  holes: HoleIntel[];
  sources: { label: string; href: string }[];
}

export interface QuickSandsHole {
  number: number;
  par: 3;
  mappedYards: number;
  name?: string;
  plan: string;
}

const GAMBLE_PARS = [4, 4, 5, 3, 4, 3, 5, 4, 4, 3, 4, 4, 5, 4, 4, 3, 4, 5];
const GAMBLE_SI = [7, 11, 1, 15, 5, 13, 3, 17, 9, 14, 6, 18, 12, 2, 8, 10, 4, 16];

const SCARECROW_PARS = [4, 3, 5, 3, 4, 5, 4, 4, 3, 4, 3, 5, 4, 4, 5, 3, 4, 4];
const SCARECROW_SI = [3, 9, 11, 5, 17, 15, 1, 7, 13, 4, 18, 16, 8, 2, 10, 12, 6, 14];

function holes(
  pars: number[],
  strokeIndexes: number[],
  detail: Omit<HoleIntel, "number" | "par" | "strokeIndex">[],
): HoleIntel[] {
  return detail.map((hole, index) => ({
    ...hole,
    number: index + 1,
    par: pars[index],
    strokeIndex: strokeIndexes[index],
  }));
}

export const GAMBLE_SANDS_INTEL: ChampionshipCourseIntel = {
  id: "gamble-sands",
  name: "Gamble Sands",
  shortName: "The Sands",
  architect: "David McLay Kidd · 2014",
  image: "/courses/gamble-sands.jpg",
  par: 72,
  defaultTee: "Sands",
  tournamentRounds: "R1 Fourball · R4 Two-Man Scramble",
  design:
    "The original is enormous, firm and fast. Wide corridors create choices rather than automatic safety: the aggressive line usually crosses diagonal sand for a shorter, cleaner angle; the conservative line leaves more club and a more complicated green entry.",
  winningFormula: [
    "Trust rollout. Pick landing spots, not just carry numbers.",
    "Use putter, hybrid and low runners from well off the green.",
    "Bank the easy par; spend aggression on 2, 8, 12, 13 and 18.",
    "In partner formats, put one ball in grass before challenging diagonal sand.",
  ],
  tees: [
    { name: "Medal", color: "#d46a86", yards: 7151, rating: 73.4, slope: 120, holeYards: [430, 340, 632, 165, 501, 264, 493, 310, 421, 147, 426, 327, 562, 445, 470, 220, 420, 578] },
    { name: "Back", color: "#dc7130", yards: 6664, rating: 70.7, slope: 114, holeYards: [397, 297, 623, 161, 483, 230, 456, 305, 380, 132, 402, 296, 538, 393, 453, 193, 411, 514] },
    { name: "Sands", color: "#769650", yards: 6389, rating: 69.4, slope: 111, holeYards: [397, 297, 519, 161, 483, 216, 456, 305, 354, 132, 372, 306, 538, 385, 368, 193, 393, 514] },
    { name: "Regular", color: "#f0f0ec", yards: 6113, rating: 68.6, slope: 109, holeYards: [364, 258, 519, 142, 456, 216, 439, 280, 354, 119, 372, 306, 507, 385, 368, 166, 393, 469] },
    { name: "Intermediate", color: "#e7ca45", yards: 5623, rating: 66.0, slope: 103, holeYards: [315, 232, 499, 131, 428, 190, 411, 241, 341, 94, 351, 291, 471, 330, 315, 169, 372, 442] },
    { name: "Forward", color: "#d6504a", yards: 4804, rating: 66.4, slope: 102, holeYards: [296, 187, 464, 116, 387, 103, 329, 213, 293, 81, 317, 194, 411, 254, 285, 138, 339, 397] },
  ],
  holes: holes(GAMBLE_PARS, GAMBLE_SI, [
    { plan: "swing", headline: "Let it run", strategy: "Pick a window in the wide fairway and expect a big release. Carry is only half the number.", preferredMiss: "Any grass with a clean look. Longer in is fine.", matchPlay: "Start boring. Learn the speed before they do." },
    { plan: "attack", headline: "Right is safe. Center is fast.", strategy: "Right plateau leaves a pitch. The center-bunker line catches the downslope toward the green. Pick one.", preferredMiss: "Right plateau.", matchPlay: "First ball right. Second can chase." },
    { plan: "protect", headline: "Three shots is smart", strategy: "Only go in two if you can finish on the green. The slopes spit back near-misses.", preferredMiss: "Lay up to your favorite wedge.", matchPlay: "Three-shot par beats hero six." },
    { plan: "attack", headline: "Use the floor", strategy: "The front is open and the green falls away. Putter or low iron is live.", preferredMiss: "Short on the ground line.", matchPlay: "Show the runner and make them answer." },
    { plan: "protect", headline: "Left opens the door", strategy: "Play left for the clean angle. Long or right runs away fast.", preferredMiss: "Short-left.", matchPlay: "Par applies pressure. Do not short-side." },
    { plan: "swing", headline: "Ride the right bank", strategy: "Land on the big right bank and let gravity feed it.", preferredMiss: "Anywhere on the right slope.", matchPlay: "Use the free slope unless the hole is must-win." },
    { plan: "attack", headline: "Grass first", strategy: "Ignore the flashy inside carry. Find grass, then attack with shot two.", preferredMiss: "Center-left fairway.", matchPlay: "Safe drive keeps eagle alive." },
    { plan: "attack", headline: "Right is par. Direct is birdie.", strategy: "Safe route is right with a pitch. Bold route uses firm turf onto the green.", preferredMiss: "Pin-high right.", matchPlay: "One right. One goes." },
    { plan: "protect", headline: "Left of the pinch", strategy: "The uphill approach plays longer. Tee to wide-left short of the pinch.", preferredMiss: "Left and short.", matchPlay: "Par steals a point here." },
    { plan: "swing", headline: "Center beats cute", strategy: "Carry the sand and hit center green. The putting surface is the defense.", preferredMiss: "Center or long-side turf.", matchPlay: "Flag-side misses lose." },
    { plan: "swing", headline: "Pick a lane", strategy: "Wide left is safe. The narrow gap leaves wedge. Decide before the swing.", preferredMiss: "Wide left.", matchPlay: "Press only if the match needs it." },
    { plan: "attack", headline: "Aim right. Feed left.", strategy: "If attacking, aim right of the green and ride the slope left.", preferredMiss: "Wide right, pin-high.", matchPlay: "Safe ball first. Then green light." },
    { plan: "attack", headline: "Cover the ridge", strategy: "Use the clubhouse line, cover the blind ridge and let the punchbowl collect it.", preferredMiss: "Lay up short of the ridge to a full number.", matchPlay: "Partner safe? Chase it." },
    { plan: "swing", headline: "Wide right works", strategy: "Right is easy and wide. Left is harder but owns the better angle.", preferredMiss: "Right fairway or long into the backboard.", matchPlay: "Make them prove the left carry." },
    { plan: "protect", headline: "Start the gauntlet", strategy: "Pick one tee-shot shape and aim at center turf.", preferredMiss: "Center cut.", matchPlay: "If ahead, make them create the drama." },
    { plan: "protect", headline: "Green first", strategy: "Play to the body of the green. A back pin requires the full carry.", preferredMiss: "Middle-left.", matchPlay: "No recovery contest here." },
    { plan: "protect", headline: "Choose your bite", strategy: "Decide how much diagonal sand to cross, then favor grass. Deep sand can cost two swings.", preferredMiss: "Broad grass side.", matchPlay: "Take double off the table." },
    { plan: "attack", headline: "Find the speed slot", strategy: "Swing away. The speed slot adds yards, but the whole fairway works.", preferredMiss: "Any grass.", matchPlay: "One safe. One chasing speed." },
  ]),
  sources: [
    { label: "Official course overview", href: "https://www.gamblesands.com/gamble-sands/" },
    { label: "Official 2025 scorecard", href: "https://www.gamblesands.com/wp-content/uploads/2025/07/GS-Scorecard.pdf" },
    { label: "David McLay Kidd playing lesson", href: "https://thegolfnewsnet.com/golfgetaways/2019/01/16/talking-golfgetaways-127-david-mclay-kidd-gamble-sands-131434/" },
  ],
};

export const SCARECROW_INTEL: ChampionshipCourseIntel = {
  id: "scarecrow",
  name: "Scarecrow",
  shortName: "Scarecrow",
  architect: "David McLay Kidd + Nick Schaan · 2025",
  image: "/courses/scarecrow.jpg",
  par: 71,
  defaultTee: "Sands",
  tournamentRounds: "R2 Shamble · R3 Singles",
  design:
    "Scarecrow is a sibling, not a twin: the fairways remain generous, but the property is steeper and more compact, greens are smaller, sand is broken into clusters, and the routing repeatedly climbs knobs, saddles and river-view ridges.",
  winningFormula: [
    "Choose the correct side from the tee; width without angle is a trap.",
    "Use slopes around smaller greens instead of attacking every flag in the air.",
    "Protect the par 3s and spend aggression on 1, 5, 12, 15 and 18.",
    "For Saturday singles, patience and double-bogey avoidance outrank raw distance.",
  ],
  tees: [
    { name: "Medal", color: "#d46a86", yards: 6921, rating: 73.9, slope: 131, holeYards: [395, 198, 547, 220, 311, 581, 422, 467, 169, 478, 158, 489, 430, 500, 575, 205, 408, 368] },
    { name: "Back", color: "#dc7130", yards: 6501, rating: 71.1, slope: 127, holeYards: [367, 179, 534, 201, 300, 566, 385, 434, 160, 446, 142, 461, 415, 484, 538, 182, 382, 325] },
    { name: "Sands", color: "#769650", yards: 6261, rating: 70.0, slope: 122, holeYards: [367, 153, 506, 184, 283, 566, 385, 434, 148, 434, 126, 461, 415, 463, 502, 156, 382, 296] },
    { name: "Regular", color: "#f0f0ec", yards: 6061, rating: 69.1, slope: 119, holeYards: [338, 153, 506, 184, 283, 541, 351, 404, 148, 434, 126, 438, 400, 463, 502, 156, 338, 296] },
    { name: "Intermediate", color: "#e7ca45", yards: 5204, rating: 65.3, slope: 113, holeYards: [318, 130, 462, 133, 217, 510, 319, 368, 134, 381, 110, 383, 330, 375, 459, 128, 214, 233] },
    { name: "Forward", color: "#d6504a", yards: 4656, rating: 66.9, slope: 110, holeYards: [293, 120, 379, 117, 183, 469, 304, 314, 104, 362, 94, 340, 277, 351, 449, 105, 187, 208] },
  ],
  holes: holes(SCARECROW_PARS, SCARECROW_SI, [
    { plan: "attack", headline: "The pin picks the lane", strategy: "Most pins: aim over the pot bunker into the right speed slot. Left pin: stay left.", preferredMiss: "Right fairway unless the flag is left.", matchPlay: "Choose the lane before the blind swing." },
    { plan: "protect", headline: "Right slope. Never left.", strategy: "Use the big right slope. The left wash is dead.", preferredMiss: "Right feeder or center green.", matchPlay: "Center-green speed beats flag hunting." },
    { plan: "swing", headline: "Right, then left-center", strategy: "Tee ball near the right bunkers. Approach from left-center for the full green.", preferredMiss: "Right off the tee; left-center into the green.", matchPlay: "Two decisions. Do not drift between lanes." },
    { plan: "protect", headline: "Know the pin section", strategy: "The Biarritz trench splits the green. Play straight to the correct section; the ground route is open.", preferredMiss: "On the green’s long axis.", matchPlay: "Avoid the 40-footer across the trench." },
    { plan: "attack", headline: "Cover the pot or lay up", strategy: "Lay up short-left, or fully cover the center pot and catch the kick.", preferredMiss: "Short-left, away from the right waste.", matchPlay: "Bank a layup before the carry." },
    { plan: "attack", headline: "Right owns the angle", strategy: "Favor the right bunkers for the clean second. Left may run, but the approach stays blind.", preferredMiss: "Near the right bunkers.", matchPlay: "Distance without a view is not position." },
    { plan: "swing", headline: "Read the pin sheet", strategy: "Front or middle pin: challenge right. Back pin: use the visible left route.", preferredMiss: "Right for front; left for back.", matchPlay: "Pin first. Aggression second." },
    { plan: "swing", headline: "High right gives a view", strategy: "High right sees the green. Low left is blind. Let the slope feed a low approach.", preferredMiss: "High-right.", matchPlay: "In Singles, visibility is pressure." },
    { plan: "protect", headline: "Center the infinity green", strategy: "Play center or short-right. Back-left demands a perfect carry and is rarely worth it.", preferredMiss: "Center or short-right.", matchPlay: "Take 25 feet and move on." },
    { plan: "swing", headline: "Use the downhill", strategy: "Tee it right-center for speed and angle. Keep the approach below the point.", preferredMiss: "Right-center before the runout.", matchPlay: "Let the slope shorten it." },
    { plan: "protect", headline: "Center saddle", strategy: "The green looks tiny. Aim center; short-right can feed.", preferredMiss: "Center or short-right.", matchPlay: "Wedge does not make it automatic." },
    { plan: "attack", headline: "Hug the canyon—carefully", strategy: "The right edge leaves short iron. Left is safe but blind.", preferredMiss: "Right-center turf, not canyon.", matchPlay: "Safe ball left. Attack ball right." },
    { plan: "swing", headline: "Right side, enough club", strategy: "Drive right for the clean bowl angle. Carry the false front; long has a backstop.", preferredMiss: "Left of the green or into the backstop.", matchPlay: "Short-right creates work." },
    { plan: "protect", headline: "Right-center and ride", strategy: "Challenge the short-right blowout, then use the downhill. The green is wide and shallow.", preferredMiss: "Right-center beyond the saddle.", matchPlay: "One hard hole. Do not make it two." },
    { plan: "attack", headline: "Pick a layup shelf", strategy: "Cover the left bunkers for extra run. If you are not going, lay up to a full number.", preferredMiss: "A chosen shelf.", matchPlay: "One secures position. One chases." },
    { plan: "protect", headline: "Pin depth changes everything", strategy: "Front pin: feed from high-left. Back pin: carry the bunker.", preferredMiss: "High-left front; center back.", matchPlay: "No lazy pin check." },
    { plan: "swing", headline: "Use the boomerang", strategy: "Hit the middle and let a low ball follow the green right.", preferredMiss: "Middle of the green complex.", matchPlay: "The ground route is the weapon." },
    { plan: "attack", headline: "Bite what you can carry", strategy: "Choose the right-cliff carry you own. The slope runs it toward the green.", preferredMiss: "Safe fairway left.", matchPlay: "One safe. One fully committed." },
  ]),
  sources: [
    { label: "Official course overview", href: "https://www.gamblesands.com/scarecrow/" },
    { label: "Official scorecard", href: "https://www.gamblesands.com/wp-content/uploads/2025/07/SC-Final-Proof.pdf" },
    { label: "Designer hole-by-hole", href: "https://gamblesandsdigital.com/Scarecrow-CourseOverview/2" },
  ],
};

export const CHAMPIONSHIP_COURSES = [GAMBLE_SANDS_INTEL, SCARECROW_INTEL] as const;

/**
 * QuickSands distances are the mapped 14-hole card published by Hole19.
 * Gamble Sands describes the course as 60–180 yards and explicitly says the
 * point is to read the ground, so these numbers are planning references—not a
 * promise of the day's tee marker or pin.
 */
export const QUICKSANDS_HOLES: QuickSandsHole[] = [
  { number: 1, par: 3, mappedYards: 135, name: "Plinko", plan: "Read the banks. Start at the widest front opening and let the ground work." },
  { number: 2, par: 3, mappedYards: 85, plan: "Stock partial wedge to the middle. Do not short-side 85 yards." },
  { number: 3, par: 3, mappedYards: 105, name: "Crater", plan: "Take enough club to clear the blind face. Center of the crater." },
  { number: 4, par: 3, mappedYards: 115, plan: "Medium flight to the front half. Let it release." },
  { number: 5, par: 3, mappedYards: 95, plan: "Favorite wedge to the middle. Ignore the edge pin." },
  { number: 6, par: 3, mappedYards: 105, plan: "Front open? Try hybrid, low iron or putter." },
  { number: 7, par: 3, mappedYards: 105, plan: "Pick the flight from the wind, then choose the club." },
  { number: 8, par: 3, mappedYards: 150, plan: "Play the front-edge number. Long is expensive." },
  { number: 9, par: 3, mappedYards: 125, name: "Corkscrew", plan: "Use the strongest sideboard. Straight at the cup is the sucker line." },
  { number: 10, par: 3, mappedYards: 100, plan: "Stock swing, center target. Note the carry and release." },
  { number: 11, par: 3, mappedYards: 105, plan: "Middle shelf. Change flight only if the wind demands it." },
  { number: 12, par: 3, mappedYards: 85, plan: "Green light through the center line." },
  { number: 13, par: 3, mappedYards: 85, plan: "Keep it low if the turf entrance is open." },
  { number: 14, par: 3, mappedYards: 100, plan: "Best 100-yard shape. Full routine. Finish." },
];

export const COURSE_SOURCE_NOTE =
  "Verified July 24, 2026. Yardages, ratings, slopes, pars, stroke indexes and local rules come from Gamble Sands scorecards. Strategy is paraphrased from the resort, its designers and the architect playing lesson; daily wind, tee markers and hole locations remain decisive.";

export function courseHandicap(index: number, tee: CourseTee, par: number): number {
  return Math.round(index * (tee.slope / 113) + (tee.rating - par));
}

export function strokesOnHole(courseHandicapValue: number, strokeIndex: number): number {
  if (courseHandicapValue <= 0) return 0;
  return Math.max(0, Math.ceil((courseHandicapValue - strokeIndex + 1) / 18));
}

export function planLabel(plan: HolePlan): string {
  if (plan === "attack") return "Green light";
  if (plan === "protect") return "Protect par";
  return "Swing hole";
}
