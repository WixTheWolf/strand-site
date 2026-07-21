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
  tournamentRounds: "R1 Foursomes · R4 Two-Man Scramble",
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
    { plan: "swing", headline: "Learn the ground game", strategy: "Do not try to overpower the opener. Choose a landing window in the broad fairway and expect a long release; the first hole is the course telling you that carry yardage is only half the equation.", preferredMiss: "Green grass with a clean view; accept a longer approach.", matchPlay: "Start with a boring ball in play. Make the opponent prove the speed first." },
    { plan: "attack", headline: "Plateau or center-line bunker", strategy: "The safe play is right to the plateau for a short pitch. The aggressive play challenges the center-line bunker and uses the downslope beyond it to feed toward the green. Do not choose a half-committed layup.", preferredMiss: "Right plateau, below the hole's main trouble.", matchPlay: "In partner golf, first ball right; second can chase the green." },
    { plan: "protect", headline: "Elevated green rejects misses", strategy: "This is the rare elevated target on the course. Only go in two if the shot can finish on the putting surface; surrounding contours repel near-misses instead of gathering them.", preferredMiss: "Lay up to a full, comfortable pitch number.", matchPlay: "A disciplined three-shot par beats a failed hero shot." },
    { plan: "attack", headline: "Putter is genuinely in play", strategy: "Nothing blocks the ground route and every contour helps the ball reach a green that falls away. From a suitable tee and calm line, putter or a low running iron can be smarter than flying a wedge.", preferredMiss: "Short and on the ground line, never forcing spin.", matchPlay: "Show the safe runner first; make the other side answer." },
    { plan: "protect", headline: "Left creates the green view", strategy: "The hole mixes cape and leven ideas: work left for the cleanest look past the front-right mound. The target sits close to a severe fall beyond and right, so control rollout into the green.", preferredMiss: "Short-left. Long or right can leave the property fast.", matchPlay: "Par is a win often enough. Do not short-side the team." },
    { plan: "swing", headline: "Use the giant right kicker", strategy: "The direct shot is available, but the high-percentage route lands well short on the right hillside and lets the ball feed onto the green. Higher handicaps should use the slope without apology.", preferredMiss: "Anywhere on the right feeder slope.", matchPlay: "Take the free slope unless a direct birdie look is required." },
    { plan: "attack", headline: "Ignore the inside-right ego line", strategy: "The dramatic carry over the wash looks tempting but adds little off the tee. Find grass first, then use the second shot as the aggressive decision on this reachable par 5.", preferredMiss: "Center-left fairway, away from the inside wash.", matchPlay: "Safety off the tee preserves the chance to attack with shot two." },
    { plan: "attack", headline: "A par 3½ with two solutions", strategy: "The no-drama route plays down the conventional fairway to the right, then turns a pitch almost 90 degrees onto the green. The bold route uses firm turf to bound a tee ball onto the falling surface.", preferredMiss: "Pin-high right leaves a simple pitch and easy par.", matchPlay: "One teammate banks right; the second earns permission to go." },
    { plan: "protect", headline: "Plays longer than the card", strategy: "The approach is severely uphill. Fairway contours narrow and feed toward a hidden deep bunker on the right, so less than driver to the wide-left area short of the crossing bunker is often correct.", preferredMiss: "Left and short of the pinch point.", matchPlay: "Treat par as a stolen point, especially into wind." },
    { plan: "swing", headline: "Short club, wild green", strategy: "Carry the open sand and favor the heart of the green. Helpful bowl contours exist, but the putting surface is deliberately severe because the tee shot is short and downhill.", preferredMiss: "Center or long-side turf; never short in the sand.", matchPlay: "Avoid the flag-side miss. A two-putt may still require work." },
    { plan: "swing", headline: "Width with a hidden price", strategy: "Way left is safe and leaves a reasonable long approach. The scoring line threads the narrow gap between the inside bunker and pot bunker for a wedge. Pick a lane before taking the club back.", preferredMiss: "Wide left if the aggressive window is uncomfortable.", matchPlay: "Use strokes to choose safety; press only when the match demands it." },
    { plan: "attack", headline: "Layup bunker forces a decision", strategy: "A pot bunker occupies the obvious layup distance. If attacking, aim well right of the putting surface and let the contours bring the ball left onto the green rather than firing straight at it.", preferredMiss: "Wide right, pin-high, on the feeding ground.", matchPlay: "Excellent scramble green: safety ball, then full green-light." },
    { plan: "attack", headline: "Cover the ridge, find the bowl", strategy: "The punchbowl green is blind behind a natural ridge. From the fairway, the clubhouse is the broad line; a ball that covers the ridge can release down even when the pin itself is invisible.", preferredMiss: "Short of the ridge at a useful wedge number if laying up.", matchPlay: "The chase shot is worth it when a partner is already safe." },
    { plan: "swing", headline: "Take the wide side", strategy: "The split fairway offers a difficult left carry for the best angle and an easier right route with a shallower, uphill approach. The percentage play is broad right, then use the backboard behind the green.", preferredMiss: "Right fairway and deep enough into the backboard.", matchPlay: "Make the other side prove the heroic left carry first." },
    { plan: "protect", headline: "The match-play gauntlet begins", strategy: "There is no automatic bailout on the first of Kidd's three intended match-deciding holes. Commit to a complete tee-shot shape and favor the center of the usable target over a speculative angle.", preferredMiss: "Center turf. Avoid turning indecision into a two-way miss.", matchPlay: "If ahead, force the opponent to create the drama." },
    { plan: "protect", headline: "Front-right is removed", strategy: "A bunker deliberately takes away the tempting front-right feeder. Play to the body of the green; a back flag requires carrying the protecting feature rather than trying to skirt it.", preferredMiss: "Middle-left portion of the green complex.", matchPlay: "Green first. This is not the hole to manufacture a recovery." },
    { plan: "protect", headline: "Do not enter the endless sand", strategy: "A huge diagonal sand face runs for more than 200 yards. Decide how much to bite off, but favor the grass side: a miss in the deep, soft sand can require multiple recovery shots along the same hazard.", preferredMiss: "The broad grass side opposite the diagonal bunker.", matchPlay: "Protect against double. A steady bogey can still halve a hard hole." },
    { plan: "attack", headline: "Bombs away into the speed slot", strategy: "The closing par 5 is permission to swing. A roughly 20-yard speed slot can turn a good drive into an iron approach; missing it still leaves a very manageable par path.", preferredMiss: "Broad fairway—distance matters more than a perfect angle.", matchPlay: "One in grass, one hunting the speed slot. Finish aggressively." },
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
    { plan: "attack", headline: "Blind, broad and fast", strategy: "Aim over the pot bunker and favor the right speed slot for most pins. A left flag changes the assignment: stay left so the green's contours do not block the approach.", preferredMiss: "Right fairway for most pins; left only for a left hole location.", matchPlay: "Commit to the pin-side lane before the blind tee shot." },
    { plan: "protect", headline: "Right slope saves, left wash kills", strategy: "The putting surface is more than 50 yards deep. Use the large right slope as a bailout and keep the ball away from the wash on the left.", preferredMiss: "Right feeder slope; never left into the wash.", matchPlay: "Center-green distance control beats flag hunting." },
    { plan: "swing", headline: "Challenge right, approach from left", strategy: "Keep the tee shot right and close to the bunkers. The next shot climbs over a ridge to a bunkerless green; the best entry works across the left blowout, while a far-right layup leaves a shallow target.", preferredMiss: "Right off the tee, then left-center for the approach angle.", matchPlay: "Break the par 5 into two clear decisions; do not drift between lanes." },
    { plan: "protect", headline: "Straight through the Biarritz", strategy: "This long par 3 can play directly into or with the wind. A trench divides the long, narrow green and is itself pinnable. Straightness matters more than attacking from the air; the ground route is open.", preferredMiss: "On the green's long axis, short of the wrong section.", matchPlay: "Know the pin section. A 40-foot putt across the trench is not routine." },
    { plan: "attack", headline: "Cover the pot bunker for the kick", strategy: "Waste sand dominates the right side. A small left-center pot bunker takes about 260 yards to cover from the tips; beating it uphill can kick a tee ball onto the middle of the green.", preferredMiss: "Short-left of the center bunker, not in the right waste.", matchPlay: "In shamble, bank a layup before someone tries the carry." },
    { plan: "attack", headline: "One-hundred-yard-wide choice", strategy: "The right-bunker line creates the best angle. The blind left route finds a speed slot but then asks for another carry over sand into the green.", preferredMiss: "Near the right-side bunkers with a clear second shot.", matchPlay: "Distance on the left is not automatically position." },
    { plan: "swing", headline: "Pin location changes the tee line", strategy: "The blind carry over the right blowout can run near the front for front or middle-left pins. For a back pin, the visible left route produces the friendlier approach.", preferredMiss: "Right for a front pin; left for a back pin.", matchPlay: "Read the pin sheet before choosing aggression." },
    { plan: "swing", headline: "High-right clarity or low-left blindness", strategy: "High right gives a clear view; low left is blind. Apparent front bunkers sit farther from the green than they look, and right-to-left contours can feed a running approach onto the surface.", preferredMiss: "High-right with vision and a feeding angle.", matchPlay: "Visibility is valuable in singles—make the opponent solve the blind line." },
    { plan: "protect", headline: "Infinity edge, center target", strategy: "The green is broad and shallow with severe infinity-edge consequences. Helpful contours live short and right; the bold back-left flag demands exact carry. Middle green leaves a makeable two-putt assignment.", preferredMiss: "Center or short-right; never chase the back-left edge casually.", matchPlay: "Take 25–30 feet and move on. This is a classic sucker flag." },
    { plan: "swing", headline: "Downhill rollercoaster", strategy: "The long par 4 falls toward a point green above sandy waste. A tee shot tight to the right shortens the hole and catches the most useful contours.", preferredMiss: "Right-center fairway, not through the downhill runout.", matchPlay: "Use the slope for distance; keep the approach below the point." },
    { plan: "protect", headline: "Tiny-looking saddle target", strategy: "The green appears smaller than it is and sits between two river views, surrounded by sand. Short-right may feed onto the surface, but the percentage target is the center of the saddle.", preferredMiss: "Short-right feeder, avoiding the surrounding sand.", matchPlay: "Wedge distance does not make this automatic. Green first." },
    { plan: "attack", headline: "Canyon edge unlocks the par 5", strategy: "The shortest par 5 runs beside the wash on the right. Challenge that edge for a short-iron second. The safer left route leaves a blind shot over a sandy ridge to a half-pipe green that is shallow from that angle.", preferredMiss: "Right-center turf without crossing the canyon edge.", matchPlay: "Best shamble attack hole: safe left ball, aggressive right ball." },
    { plan: "swing", headline: "Right side owns the angle", strategy: "Drive as far right as confidence allows for the cleanest look into a bowl green. The front-right false front rejects weak approaches; a backstop waits behind and flatter recovery ground sits left.", preferredMiss: "Left of the green or into the backstop, not on the false front.", matchPlay: "Take enough club. Short-right turns a routine par into work." },
    { plan: "protect", headline: "The 500-yard amusement ride", strategy: "Challenge the blowout short-right from the tee for the best view, then let the ball ride downhill toward the very wide, shallow green. Bailing left may stop before the green becomes visible.", preferredMiss: "Right-center beyond the saddle; respect the shallow target.", matchPlay: "A long par 4 is still just one hole—do not compound a cautious drive." },
    { plan: "attack", headline: "Three layups or one heroic line", strategy: "Carry the left bunkers for extra run. If the small green is not reachable, choose one of the distinct layup shelves instead of simply advancing the ball without a number.", preferredMiss: "A planned layup shelf with a full pitch.", matchPlay: "One partner secures position; the other earns the eagle try." },
    { plan: "protect", headline: "Use high-left—until the pin says no", strategy: "For a front pin, land high-left short of the bunker and feed down to the putting surface. A back pin requires carrying the same bunker rather than trying to use the slope around it.", preferredMiss: "High-left for front pins; center for back pins.", matchPlay: "Pin depth completely changes the correct shot." },
    { plan: "swing", headline: "Sling the boomerang", strategy: "A solid tee shot carries the existing wash to a wide fairway. The green bends like a boomerang; a low approach into the middle can catch the corner and run deep to the right.", preferredMiss: "Middle of the green complex, using the bend.", matchPlay: "The ground route turns average proximity into a real weapon." },
    { plan: "attack", headline: "Bite off the cliff and finish", strategy: "The drivable closer invites a line over the right cliff. Take on only the amount you can carry; the landing slope runs toward a long, moderately wide green and creates a genuine birdie-or-better chance.", preferredMiss: "Safe fairway left of the heroic right edge.", matchPlay: "If the match reaches 18, one ball safe and one ball fully committed." },
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
  { number: 1, par: 3, mappedYards: 135, name: "Plinko", plan: "Read the banks before the flag. Start toward the widest front landing area and let the ground choose the final line." },
  { number: 2, par: 3, mappedYards: 85, plan: "Favor a stock partial wedge to the center. This is distance-control practice, not permission to short-side yourself." },
  { number: 3, par: 3, mappedYards: 105, name: "Crater", plan: "The known blind uphill carry demands commitment. Take enough club to clear the face and make the center of the bowl the target." },
  { number: 4, par: 3, mappedYards: 115, plan: "Choose a medium flight that lands on the front half. Let release—not extra spin—solve the final yards." },
  { number: 5, par: 3, mappedYards: 95, plan: "Use the favorite wedge number and ignore a flag on an edge. Ten feet below the hole is better than a failed hero shot." },
  { number: 6, par: 3, mappedYards: 105, plan: "Test the ground option if the entrance is open: hybrid, chipped iron or putter can remove wind and strike variance." },
  { number: 7, par: 3, mappedYards: 105, plan: "Same mapped number, different assignment: use the wind to pick trajectory first and club second." },
  { number: 8, par: 3, mappedYards: 150, plan: "Play the front-edge number and accept a longer first putt. Long is the expensive miss on firm short-course turf." },
  { number: 9, par: 3, mappedYards: 125, name: "Corkscrew", plan: "Aim away from the cup and use the strongest visible sideboard. The contour, not a direct aerial line, is the scoring route." },
  { number: 10, par: 3, mappedYards: 100, plan: "Make this the calibration hole: one stock swing, center target, and note the exact carry and release for the weekend." },
  { number: 11, par: 3, mappedYards: 105, plan: "Middle of the usable shelf wins. Change trajectory only when the wind or daily pin clearly rewards it." },
  { number: 12, par: 3, mappedYards: 85, plan: "A true green-light number—but attack through the center line so the hole-in-one chase cannot create a big miss." },
  { number: 13, par: 3, mappedYards: 85, plan: "If the turf entrance is open, use the club that keeps the ball closest to the ground. Rehearse the shot Gamble Sands will ask for all weekend." },
  { number: 14, par: 3, mappedYards: 100, plan: "Close with the most trusted 100-yard shape. Treat it as a pressure rep: full routine, exact start line, no second guess." },
];

export const COURSE_SOURCE_NOTE =
  "Verified July 21, 2026. Yardages, ratings, slopes, pars and stroke indexes come from Gamble Sands scorecards. Strategy is paraphrased from the resort, its designers and the architect playing lesson; daily wind, tee markers and hole locations remain decisive.";

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
