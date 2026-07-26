import type { HolePlan } from "./course-intelligence";

export type VisualCourseId = "gamble-sands" | "scarecrow" | "quicksands";

const GAMBLE_SANDS_MEMORY = [
  "Your carry number has already filed for partial unemployment.",
  "A short par 4 and a long chance to invent a preventable six.",
  "Patience and testosterone are currently in arbitration.",
  "Small number. Enormous opportunity to insult yourself.",
  "The fairway is wider than your alibi. Use it.",
  "Your long iron may become emotionally unavailable.",
  "Cut the corner only if your driver signed the waiver.",
  "Drivable—golf architecture’s favorite way to say “please ruin this.”",
  "Make the turn with dignity. Witnesses are present.",
  "A short par 3 with full authority to embarrass a grown man.",
  "Center turf: boring, legal and suspiciously effective.",
  "Just enough sand to bait the entire group chat.",
  "The green is reachable. Your common sense remains day-to-day.",
  "Two fairways, one brain. Pick a lane before the backswing.",
  "Par is available without submitting a trick-shot audition.",
  "The slope works for free and gives better advice than your friends.",
  "Late-round decisions: where electrolytes become character references.",
  "Last chance to be a hero—or at least look competent near the clubhouse.",
] as const;

const SCARECROW_MEMORY = [
  "The fairway is hiding, not missing. Aim like an adult.",
  "Left is death. Right is golf. Analysis complete.",
  "The par 5 is flirting with you. Stay respectful.",
  "A low runner is acceptable. A shank into another ZIP code is not.",
  "Driveable green. Triple-tier putting surface. Zero refunds.",
  "Gravity is your longest club. Stop trying to out-swing geology.",
  "There is more room right. Your eyes are drama queens.",
  "Two large shots required. Please arrive with both.",
  "Look at the river after the shot. The river cannot help you make par.",
  "Snack shack behind you. Consequences ahead.",
  "Chicken Point: swing committed, cluck privately.",
  "The canyon edge offers a shorter second and a longer obituary.",
  "Enjoy the view, then carry the right bunker like you meant it.",
  "Five hundred yards on the card; amusement park on the ground.",
  "Blind ridge. Pick a line and stop hosting a committee meeting.",
  "Downhill ace chance. The hole-in-one speech remains premature.",
  "Pin first, tee line second. No vibes-based navigation.",
  "Driveable cliff-edge finisher. Apparently there is a final exam.",
] as const;

const QUICKSANDS_MEMORY = [
  "First wedge. First chance to start lying about how close it was.",
  "Short enough to attack; evil enough to remember.",
  "The yardage says wedge. The contour says read the terms.",
  "A bank shot is golf when the architect says so.",
  "Green light. Your ego is not the yardage device.",
  "Flight it. The wind has been waiting all morning to meet you.",
  "Middle green: unsexy, solvent and still alive.",
  "This tiny hole has a fully developed personality disorder.",
  "Longer than it looks, meaner than it needs to be.",
  "Stock swing. Center target. Boring brilliance.",
  "Do not turn a wedge into a recovery montage.",
  "Aceable. Also triple-able. Golf is a beautiful illness.",
  "One clean number. No committee meetings.",
  "Finish with commitment; the drinks are already judging you.",
] as const;

const IMAGE_POSITIONS = [
  "38% 50%",
  "50% 42%",
  "64% 48%",
  "72% 56%",
  "30% 62%",
  "55% 66%",
  "78% 45%",
  "44% 58%",
  "60% 36%",
] as const;

export function courseImage(courseId: VisualCourseId): string {
  if (courseId === "scarecrow") return "/courses/scarecrow.jpg";
  if (courseId === "quicksands") return "/courses/quicksands.jpg";
  return "/courses/gamble-sands.jpg";
}

export function holeImagePosition(holeNumber: number): string {
  return IMAGE_POSITIONS[(holeNumber - 1) % IMAGE_POSITIONS.length];
}

export function holeMemory(courseId: VisualCourseId, holeNumber: number): string {
  const memory =
    courseId === "scarecrow"
      ? SCARECROW_MEMORY
      : courseId === "quicksands"
        ? QUICKSANDS_MEMORY
        : GAMBLE_SANDS_MEMORY;

  return memory[(holeNumber - 1) % memory.length];
}

export function planTranslation(plan: HolePlan): string {
  if (plan === "attack") {
    return "The drawbridge is down. Enter confidently without firing your ball into the moat.";
  }
  if (plan === "protect") {
    return "Par is wearing a tuxedo. Bogey may still get into the club. Double is denied at the rope.";
  }
  return "This hole offers two choices: golf, or a story everybody hears again at dinner.";
}

