export interface StrandCourse {
  id: string;
  name: string;
  architect: string;
  image: string;
  tagline: string;
  facts: string[];
  playedIn: string;
}

export interface MenuItem { name: string; note?: string; }
export interface MenuSection { title: string; items: MenuItem[]; }
export interface StrandDining {
  id: string;
  name: string;
  kind: string;
  tagline: string;
  facts: string[];
  when: string;
  hours: string;
  menu: MenuSection[];
}

export const GAMBLE_SANDS_FACTS = [
  "Best New Course 2014 — David McLay Kidd's desert links vision on sandy Columbia Basin soil.",
  "Firm fescue fairways built for creativity, imagination, and running ground game.",
  "Three courses on property: Gamble Sands, Scarecrow, and QuickSands.",
  "New lodging is near Scarecrow, with shuttles between courses.",
  "200 Sands Trail Road, Brewster, WA 98812 — Columbia River valley views for days.",
];

export const STRAND_COURSES: StrandCourse[] = [
  {
    id: "gamble-sands",
    name: "Gamble Sands",
    architect: "David McLay Kidd",
    image: "/courses/gamble-sands.jpg",
    tagline: "Pure fun, always thrilling — wide fairways, firm ground, and links-style creativity.",
    facts: [
      "The original 18 that launched the resort in 2014.",
      "Wide fairways run firm and fast — use landing spots and ground contours.",
      "Official 2026 Round 1: Fourball, Friday 8:30 AM.",
      "Official 2026 Round 4: Two-Man Scramble, Saturday 3:00 PM.",
    ],
    playedIn: "R1 Friday 8:30 AM · R4 Saturday 3:00 PM",
  },
  {
    id: "scarecrow",
    name: "Scarecrow",
    architect: "David McLay Kidd & Nick Schaan",
    image: "/courses/scarecrow.jpg",
    tagline: "Breathtaking Columbia River views — steeper landscape, its own identity.",
    facts: [
      "Second 18 at the resort, opened a decade after the original.",
      "Steeper terrain, smaller targets and heavy use of ground contours.",
      "Official 2026 Round 2: Two-Man Shamble, Friday 2:45 PM.",
      "Official 2026 Round 3: Singles, Saturday 9:05 AM.",
    ],
    playedIn: "R2 Friday 2:45 PM · R3 Saturday 9:05 AM",
  },
  {
    id: "quicksands",
    name: "QuickSands",
    architect: "David McLay Kidd",
    image: "/courses/quicksands.jpg",
    tagline: "14 par-3 holes — wedges, bank shots, and short-game chaos.",
    facts: [
      "14-hole par-3 course.",
      "Thursday August 20 at 5:00 PM.",
      "Warm-up only — NOT Strand sanctioned.",
      "Format TBD. Opening Ceremony follows QuickSands and dinner; location TBD.",
    ],
    playedIn: "Thursday warm-up · 5:00 PM · not sanctioned",
  },
];

/** Dining descriptions are informational only. Tournament meal times are governed by the final event sheet. */
export const STRAND_DINING: StrandDining[] = [
  {
    id: "danny-boy",
    name: "Danny Boy Bar & Grill",
    kind: "Dinner house",
    tagline: "Dinner option on property with regional food, beer, wine and cocktails.",
    facts: [
      "On-property dinner option.",
      "The final Strand sheet does not lock a restaurant or exact dinner time for Thursday or Friday.",
      "Thursday Opening Ceremony occurs after QuickSands and dinner; location TBD.",
    ],
    when: "Use current resort hours · no official Strand reservation time listed",
    hours: "Confirm with resort",
    menu: [],
  },
  {
    id: "the-barn",
    name: "The Barn",
    kind: "All-day fuel",
    tagline: "On-property option for breakfast, snacks, lunch and drinks.",
    facts: [
      "Useful for pre-round and between-round fuel.",
      "Official sheet only specifies lunch and drinks before Saturday's 3 PM Gamble Sands round.",
      "Do not rely on old site meal times; follow tournament-day instructions.",
    ],
    when: "Saturday lunch + drinks before 3:00 PM Round 4",
    hours: "Confirm with resort",
    menu: [],
  },
];

export const GALLERY_IMAGES = [
  { src: "/courses/gamble-sands.jpg", alt: "Gamble Sands fairway on the bluff above the Columbia River", caption: "Gamble Sands" },
  { src: "/courses/scarecrow.jpg", alt: "Scarecrow aerial with Columbia River and mountain views", caption: "Scarecrow" },
  { src: "/courses/quicksands.jpg", alt: "QuickSands par-3 course greens and bunkers at sunset", caption: "QuickSands" },
];
