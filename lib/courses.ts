export interface StrandCourse {
  id: string;
  name: string;
  architect: string;
  image: string;
  tagline: string;
  facts: string[];
  playedIn: string;
}

export const GAMBLE_SANDS_FACTS = [
  "Best New Course 2014 — David McLay Kidd's desert links vision on sandy Columbia Basin soil.",
  "Firm fescue fairways built for creativity, imagination, and running ground game.",
  "Walk-to-the-first-tee resort — coffee, breakfast, then straight onto the course.",
  "Three award-winning courses on property: Gamble Sands, Scarecrow, and QuickSands.",
  "Onsite hotel at Scarecrow, Danny Boy dinner, The Barn all-day dining, and custom cocktail canning for the course.",
  "200 Sand Trails Road, Brewster, WA 98812 — Columbia River valley views for days.",
];

export const STRAND_COURSES: StrandCourse[] = [
  {
    id: "gamble-sands",
    name: "Gamble Sands",
    architect: "David McLay Kidd",
    image: "/courses/gamble-sands-hero.jpg",
    tagline: "Pure fun, always thrilling — wide fairways, firm ground, and links-style creativity.",
    facts: [
      "The original 18 that launched the resort in 2014.",
      "Wide fairways run firm and fast — McLay Kidd wants you to play your best golf here.",
      "Encourages imagination on every approach, like the world's greatest links.",
      "Round 1 four-ball and Round 4 shamble are played here in 2026.",
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
      "Round 2 scramble and Round 3 singles in 2026.",
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
  {
    id: "danny-boy",
    name: "Danny Boy Bar & Grill",
    architect: "Resort dining",
    image: "/courses/danny-boy.jpg",
    tagline: "Dinner-only classics — Tower of Tots, ribeye, prime rib, and ice-cold beer.",
    facts: [
      "Signature grill fare with ingredients from onsite Gebbers Farms.",
      "Creative cocktails and sommelier-curated wine list.",
      "Thursday dinner at 7:00 PM kicks off the opening ceremony weekend.",
    ],
    playedIn: "Thursday dinner • 7:00 PM",
  },
  {
    id: "the-barn",
    name: "The Barn",
    architect: "Resort dining",
    image: "/courses/the-barn.jpg",
    tagline: "All-day fuel — breakfast burritos, pizza, sliders, and course-ready cocktails.",
    facts: [
      "Grab-and-go golf staples for early tee times.",
      "Custom cocktail canning machine — take drinks to the course in your cooler.",
      "More than doubled the resort's bar space for the full Strand weekend.",
    ],
    playedIn: "Breakfast & lunch all weekend",
  },
];

export const GALLERY_IMAGES = [
  { src: "/courses/gamble-sands-hero.jpg", alt: "Gamble Sands panoramic fairways and desert landscape", caption: "Gamble Sands" },
  { src: "/courses/scarecrow.jpg", alt: "Scarecrow course with Columbia River views", caption: "Scarecrow" },
  { src: "/courses/quicksands.jpg", alt: "QuickSands par-3 course", caption: "QuickSands" },
  { src: "/courses/gamble-sands-course.jpg", alt: "Gamble Sands rolling dunes", caption: "Links-style ground game" },
  { src: "/courses/the-barn.jpg", alt: "The Barn dining at Gamble Sands", caption: "The Barn" },
  { src: "/courses/danny-boy.jpg", alt: "Danny Boy Bar and Grill", caption: "Danny Boy" },
];
