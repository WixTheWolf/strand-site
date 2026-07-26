import type { HolePlan } from "./course-intelligence";

export type VisualCourseId = "gamble-sands" | "scarecrow" | "quicksands";

const GAMBLE_SANDS_MEMORY = [
  "Wide fairway. Pick a window and let it run.",
  "Pick a lane. Half-committed is how sixes hatch.",
  "Three-shot par. The green rejects almost-heroes.",
  "Yes, putter. No, we’re not joking.",
  "Left opens the green. Long-right opens a tab.",
  "Use the right bank. Gravity is on payroll.",
  "Grass first. The second shot is where we gamble.",
  "One ball right. Then somebody can get stupid.",
  "Play left of the pinch. Par is stealing here.",
  "Center green. The short club already did its part.",
  "Safe is wide left. Scoring is through the gap.",
  "Aim right and let the ground bring it back.",
  "Cover the ridge. The bowl does the rest.",
  "Wide right works. Make them try the hero carry.",
  "Center cut. The gauntlet starts now.",
  "Green first. Front-right is a trap.",
  "Choose your bite. Deep sand eats seconds.",
  "One ball safe. One ball finds the speed slot.",
] as const;

const SCARECROW_MEMORY = [
  "Pin left, play left. Otherwise use the right speed slot.",
  "Right slope saves. Left wash collects souvenirs.",
  "Tee ball right. Approach from left-center.",
  "Know the pin section. The trench is not a shortcut.",
  "Bank the layup. Then somebody can cover the pot.",
  "Right side owns the angle. Left only owns distance.",
  "Front pin, challenge right. Back pin, stay left.",
  "High right gives a view. Low left gives a prayer.",
  "Center green. Back-left is a sucker flag with scenery.",
  "Use the downhill. Stop it before the point.",
  "Center saddle. Wedge does not mean automatic.",
  "Safe ball left. Attack ball hugs the canyon.",
  "Right off the tee. Take enough club into the bowl.",
  "Right-center, then respect the shallow green.",
  "Pick a layup shelf. “Somewhere up there” is not a number.",
  "Front pin rides the left bank. Back pin needs the carry.",
  "Middle of the boomerang. Let it run right.",
  "Bite off only what you can carry. Then finish it.",
] as const;

const QUICKSANDS_MEMORY = [
  "Read the banks. Plinko is the whole point.",
  "Stock wedge, middle. Do not short-side an 85-yarder.",
  "Take enough club. The crater has no sympathy.",
  "Land front half and let it chase.",
  "Favorite wedge. Ignore the edge pin.",
  "Front open? Keep it on the ground.",
  "Flight first, club second. Wind owns the number.",
  "Front-edge number. Long is expensive.",
  "Use the sideboard. Straight at it is the sucker line.",
  "Stock swing. This is your weekend calibration.",
  "Middle shelf. Fancy is optional.",
  "Green light through the center. Ace-chase responsibly.",
  "Keep it low if the door is open.",
  "Best 100-yard swing. Finish like it counts.",
] as const;

const COURSE_HOLE_COUNTS: Record<VisualCourseId, number> = {
  "gamble-sands": 18,
  scarecrow: 18,
  quicksands: 14,
};

export const HOLE_PHOTO_SOURCES = [
  {
    courses: "Gamble Sands",
    label: "Official Gamble Sands hole-by-hole aerial tour",
    href: "https://www.youtube.com/playlist?list=PLJmCz9IET2S59tTFoHY_QTAtTEm0RJRuE",
  },
  {
    courses: "Scarecrow",
    label: "Patrick Koenig’s Every Hole at Scarecrow",
    href: "https://www.pjkoenig.com/golf-blog/2025/6/30/gamble-sands-has-fully-arrived",
  },
  {
    courses: "QuickSands",
    label: "Core Four Golf numbered course tour",
    href: "https://www.corefourgolf.com/Courses.aspx",
  },
] as const;

export function holeImage(courseId: VisualCourseId, holeNumber: number): string {
  const verifiedHole = Math.min(
    Math.max(Math.trunc(holeNumber), 1),
    COURSE_HOLE_COUNTS[courseId],
  );
  return `/courses/holes/${courseId}/hole-${String(verifiedHole).padStart(2, "0")}.jpg`;
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
    return "Scoring hole. Pick a line and commit.";
  }
  if (plan === "protect") {
    return "Par is excellent. Bogey may survive. Double cannot.";
  }
  return "Good decision wins this hole. Hero golf usually loses it.";
}
