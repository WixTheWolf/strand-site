export interface StrandCourse {
  id: string;
  name: string;
  architect: string;
  image: string;
  tagline: string;
  facts: string[];
  playedIn: string;
}

export interface StrandDining {
  id: string;
  name: string;
  kind: string;
  tagline: string;
  facts: string[];
  when: string;
  menu: string[];
}

export const GAMBLE_SANDS_FACTS = [
  "Best New Course 2014 — David McLay Kidd's desert links vision on sandy Columbia Basin soil.",
  "Firm fescue fairways built for creativity, imagination, and running ground game.",
  "Walk-to-the-first-tee resort — coffee, breakfast, then straight onto the course.",
  "Three award-winning courses on property: Gamble Sands, Scarecrow, and QuickSands.",
  "Onsite hotel at Scarecrow, Danny Boy dinner, The Barn all-day dining, and custom cocktail canning for the course.",
  "200 Sand Trails Road, Brewster, WA 98812 — Columbia River valley views for days.",
];

/**
 * Course photo assignments verified against the actual image contents:
 * gamble-sands.jpg — wide fescue fairway on the bluff directly above the Columbia River
 * scarecrow.jpg — panoramic aerial across the steeper benchland with river and mountains
 * quicksands.jpg — sunset cluster of short par-3 greens and sprawling bunkers
 */
export const STRAND_COURSES: StrandCourse[] = [
  {
    id: "gamble-sands",
    name: "Gamble Sands",
    architect: "David McLay Kidd",
    image: "/courses/gamble-sands.jpg",
    tagline: "Pure fun, always thrilling — wide fairways, firm ground, and links-style creativity.",
    facts: [
      "The original 18 that launched the resort in 2014.",
      "Wide fairways run firm and fast — McLay Kidd wants you to play your best golf here.",
      "Encourages imagination on every approach, like the world's greatest links.",
      "Round 1 foursomes and Round 4 scramble are played here in 2026.",
    ],
    playedIn: "Rounds 1 & 4 • Friday & Saturday",
  },
  {
    id: "scarecrow",
    name: "Scarecrow",
    architect: "David McLay Kidd & Nick Schaan",
    image: "/courses/scarecrow.jpg",
    tagline: "Breathtaking Columbia River views — steeper landscape, its own identity.",
    facts: [
      "Second 18 at the resort, opened a decade after the original.",
      "McLay Kidd and design partner Nick Schaan competed creatively on the routing.",
      "One of the most visually compelling courses in North America.",
      "Round 2 shamble and Round 3 singles in 2026.",
    ],
    playedIn: "Rounds 2 & 3 • Friday & Saturday",
  },
  {
    id: "quicksands",
    name: "QuickSands",
    architect: "David McLay Kidd",
    image: "/courses/quicksands.jpg",
    tagline: "14 par-3 amusement park — wedges, bank shots, and pure short-game chaos.",
    facts: [
      "Walking-only 14-hole par-3 course from 60 to 180 yards.",
      "Tee boxes, bank shots, and every short-game shot you can imagine.",
      "Thursday 5:00 PM warm-up round before dinner and opening ceremony.",
      "The perfect tone-setter before The Matchmaker pairings reveal.",
    ],
    playedIn: "Thursday warm-up • 5:00 PM",
  },
];

/** Resort dining — rendered editorially (no stand-in photos; swap real shots into /public/courses when we have them) */
export const STRAND_DINING: StrandDining[] = [
  {
    id: "danny-boy",
    name: "Danny Boy Bar & Grill",
    kind: "Dinner house",
    tagline: "Dinner-only classics above the first tee — ice-cold beer and a sommelier-curated list.",
    facts: [
      "Signature grill fare with ingredients from onsite Gebbers Farms.",
      "Creative cocktails and sommelier-curated wine list.",
      "Thursday dinner at 7:00 PM kicks off the opening ceremony weekend.",
    ],
    when: "Thu & Fri dinner • 7:00 / 8:00 PM",
    menu: ["Tower of Tots", "Ribeye", "Prime Rib", "Ice-cold beer"],
  },
  {
    id: "the-barn",
    name: "The Barn",
    kind: "All-day fuel",
    tagline: "Grab-and-go golf staples, canned course cocktails, and both tournament lunches.",
    facts: [
      "Grab-and-go golf staples for early tee times.",
      "Custom cocktail canning machine — take drinks to the course in your cooler.",
      "More than doubled the resort's bar space for the full Strand weekend.",
    ],
    when: "Breakfast & lunch all weekend",
    menu: ["Breakfast burritos", "Pizza", "Sliders", "Canned cocktails"],
  },
];

/** Verified course photography only */
export const GALLERY_IMAGES = [
  {
    src: "/courses/gamble-sands.jpg",
    alt: "Gamble Sands fairway on the bluff above the Columbia River",
    caption: "Gamble Sands",
  },
  {
    src: "/courses/scarecrow.jpg",
    alt: "Scarecrow aerial with Columbia River and mountain views",
    caption: "Scarecrow",
  },
  {
    src: "/courses/quicksands.jpg",
    alt: "QuickSands par-3 course greens and bunkers at sunset",
    caption: "QuickSands",
  },
];
