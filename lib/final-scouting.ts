import type { PlayerSaberMetrics, StrandFormat } from "./sabermetrics";

const FORMAT_LABELS: Record<StrandFormat, string> = {
  fourball: "Fourball",
  shamble: "Shamble",
  singles: "Singles",
  scramble: "2-Man Scramble",
};

const FORMAT_ORDER: StrandFormat[] = ["fourball", "shamble", "singles", "scramble"];

interface ScoutCopy {
  role: string;
  bestCase: string;
  deployment: string;
  caution: string;
}

/**
 * The optimistic case is deliberately separated from the model score. It gives
 * the captain the strongest defensible argument for each player without hiding
 * the reason that argument might fail.
 */
const FINAL_SCOUT_COPY: Record<string, ScoutCopy> = {
  "andrew-mager": {
    role: "Gross-score anchor",
    bestCase:
      "The lowest event handicap in the draft pool is the cleanest way to buy dependable gross pars. If his recent low-differential flashes travel, Andrew can cover an aggressive partner and still protect a singles point.",
    deployment:
      "Pair with a high-handicap ceiling player in Fourball or Shamble; keep him away from another low-handicap player unless the board forces it.",
    caution:
      "Only five recent cards are available, and the scoring average is a little higher than the 5.6 index.",
  },
  "fred-geisinger": {
    role: "Pressure anchor",
    bestCase:
      "Five Strand titles plus the deepest travel-course file make Fred the most proven pressure asset. If the 7.7 plays near his demonstrated best, he creates gross-score cover in every team format and is hard to fade in Singles.",
    deployment:
      "Use as the lead player beside a volatile or high-handicap partner, then give him a meaningful Singles matchup.",
    caution:
      "His newest differentials mostly sit above 7.7, so the pick pays for floor, experience and format flexibility more than a hot-form discount.",
  },
  "nick-sprowls": {
    role: "Net-leverage swing",
    bestCase:
      "The historical score file contains multiple differentials well below the 16.9 event number. If that ceiling survives the layoff, Sprowls is the board’s clearest path to stealing net holes without sacrificing gross-score competence.",
    deployment:
      "Pair with a steady low-handicap player and prioritize Fourball plus Singles, where the 80% allowance preserves most of the upside.",
    caution:
      "The detailed scoring record ends in 2024, so this is a ceiling bet—not a current-form claim.",
  },
  "matt-schroeder": {
    role: "Mid-cap stabilizer",
    bestCase:
      "Five 2026 differentials are tightly clustered, giving Schroeder a predictable mid-cap floor. A modest two-stroke improvement turns that stability into a useful net contributor, backed by two Strand titles.",
    deployment:
      "Use as the cover player next to a volatile scorer in Fourball or as a steady Shamble partner.",
    caution:
      "Every available 2026 differential is above the 13.3 event index, so the upside requires a small form rebound.",
  },
  "jack-groot": {
    role: "Course-tested glue",
    bestCase:
      "Jack owns a deep file across demanding destination courses and has repeatedly posted mid-teen or better differentials. That travel-tested profile can hold up when the wind, turf and unfamiliar sightlines expose less experienced players.",
    deployment:
      "Deploy as a flexible second player in any 2v2 format; favor Scarecrow sessions if you value mistake avoidance and course patience.",
    caution:
      "Recent results mix strong mid-teen rounds with several 20-plus differentials, so partner cover still matters.",
  },
  "jordan-brodbeck": {
    role: "Complete mid-cap",
    bestCase:
      "Jordan combines one of the largest detailed samples with four championships and real 2026 ceiling. His better rounds beat 14.4 by several shots, and the recorded putting file reduces guesswork relative to most of the board.",
    deployment:
      "Give him a high-handicap partner in Fourball or Shamble, then keep him available for an important Singles matchup.",
    caution:
      "The same recent file contains wide misses; the ceiling is real, but so is the round-to-round range.",
  },
  "pat-morse": {
    role: "High-HC net weapon",
    bestCase:
      "Fresh 2026 rounds in the low-to-mid 90s give P-Mo a credible path to playing several shots inside a 24.8 index. In the 80% formats, that is exactly the kind of net leverage that can flip ordinary bogeys into winning holes.",
    deployment:
      "Pair with a low-handicap anchor in Fourball and consider protecting him for a favorable Singles matchup.",
    caution:
      "The broader history is volatile, so avoid pairing him with another player who needs a career round.",
  },
  "ryan-darcy": {
    role: "Ceiling play",
    bestCase:
      "D’Arcy’s recent file includes a 7.6 differential at a 12.4 event index. That kind of spike round can overwhelm a match, and his 2024 title supplies at least one pressure-positive trip.",
    deployment:
      "Use in Scramble or Shamble with a steady partner who can absorb the misses; his upside is worth preserving for Singles if he looks sharp on site.",
    caution:
      "The five-card range is very wide, including a 21.1 differential, so this is intentionally a variance bet.",
  },
  "tim-hummel": {
    role: "Pedigree rebound",
    bestCase:
      "Three straight championship seasons and prior mid-teen differentials show a player who has already won in this environment. If the recent 18.8 form returns after two rough 2026 posts, Hummel offers experienced net scoring at a useful number.",
    deployment:
      "Pair with current-form stability early; increase his Singles responsibility only after seeing the opening rounds.",
    caution:
      "The two newest scores are the weakest part of the file, so pedigree should not be mistaken for present form.",
  },
  "jason-olson": {
    role: "Veteran net value",
    bestCase:
      "A 17.4 differential this year sits three shots below Jason’s 20.5 index, and four titles show repeated team success. If that better gear appears once per nine, his stroke allotment becomes a real match-play weapon.",
    deployment:
      "Use beside a low-handicap player in Fourball, then target a Singles opponent who cannot comfortably give away strokes.",
    caution:
      "His surrounding rounds move well into the mid-to-high 20s, so keep a reliable gross ball in the pairing.",
  },
  "sam-blonski": {
    role: "Fresh net swing",
    bestCase:
      "Blonski’s 2026 file includes a 92 and a nine-hole 43 while playing at 24.5. That freshness creates a plausible late-round value case: ordinary bogey golf can win a lot of net holes with this allowance.",
    deployment:
      "Pair with a calm low-index anchor and use him where 80% handicap preserves more value than the Scramble formula.",
    caution:
      "The differential edge is modest and the verified Strand record is 0–3, so this is a current-activity bet rather than a pedigree pick.",
  },
  "shaun-eipper": {
    role: "Rust-discount ceiling",
    bestCase:
      "Shaun has a documented 15.7 differential against a 19.5 event number and owns a 2022 title. If he is playing more than the posting history shows, he could be the draft’s best late value.",
    deployment:
      "Ask one direct current-form question before drafting; if the answer is positive, pair with a steady player and lean into Fourball.",
    caution:
      "No posted round after June 2024 makes present readiness the largest unanswered question on his file.",
  },
  "brett-comfort": {
    role: "Deep net rebound",
    bestCase:
      "Brett has previously produced low-20s differentials, enough to beat a 24.5 event index and create several net wins. A return to the mid-90s would make him useful beside a gross-score anchor.",
    deployment:
      "Use as a protected high-handicap partner; avoid building a pairing that depends on his ball every hole.",
    caution:
      "The recent score trend is above the event number and the verified Strand record is 0–3.",
  },
  "kevin-gordon": {
    role: "Championship rebound",
    bestCase:
      "Kevin has four titles and has twice posted 17.9 differentials—better than his 19.5 event index. The best case is a veteran rebound in which familiar match-play pressure unlocks that two-stroke ceiling.",
    deployment:
      "Pair with a lower-handicap floor player and reassess after the first competitive nine before assigning a premium Singles slot.",
    caution:
      "Most 2026 differentials are above 19.5, so the current numbers favor patience over an early reach.",
  },
  "nick-kane": {
    role: "Experienced wildcard",
    bestCase:
      "The final public Garmin check changed the sample story: Kane has 120 lifetime golf rounds, a +17 personal best over 18 and three straight Strand titles. If his best gear is still accessible, 22.5 supplies meaningful net leverage.",
    deployment:
      "Pair with a low-handicap anchor in Fourball and use the Hot Putter history as a tiebreaker—not as proof of current putting form.",
    caution:
      "The latest ten are aggregates only, so course difficulty, dates and round-to-round variance remain unknown.",
  },
  "matt-onorato": {
    role: "Culture-and-pressure winner",
    bestCase:
      "Seven championships in seven documented trips is too persistent to ignore, even after shrinking team history heavily. If Matty O plays near his better historical differentials, his experience and 25 strokes can still manufacture match-play pressure.",
    deployment:
      "Use in a chemistry-first pairing with a strong tee-to-green player; let the partner supply gross floor and Matty O supply net chances.",
    caution:
      "His underlying index is 28.0, so the 25 cap removes roughly three strokes of value before the first tee.",
  },
  "brian-kerns": {
    role: "Driver specialist",
    bestCase:
      "Captain scouting gives Kerns one verified weapon: a reliable driver. In selected-drive formats that skill can matter more than an incomplete score history, and mid-90s golf at 18.5 keeps a plausible net path alive.",
    deployment:
      "Prioritize Shamble or Scramble beside a strong approach player; make Singles usage conditional on what you see in practice.",
    caution:
      "Only four 2026 rounds are known and none has a scorecard, so the uncertainty band must stay wide.",
  },
  "rhett-fahrney": {
    role: "Pedigree lottery",
    bestCase:
      "Rhett has three championships in three documented appearances and a 24.5 event number. If captain intel confirms even average current form, that combination offers unusually large late-round upside.",
    deployment:
      "Treat as a live-information pick: pair with a low-handicap anchor and favor Fourball, where the full team can cover a bad hole.",
    caution:
      "There are no current scorecards, so history cannot substitute for a direct health and form check.",
  },
};

export interface FinalScoutCase extends ScoutCopy {
  bestFormat: StrandFormat;
  bestFormatLabel: string;
  bestFormatScore: number;
  proof: string[];
}

function bestFormat(metric: PlayerSaberMetrics): StrandFormat {
  return FORMAT_ORDER.reduce((best, format) =>
    metric.format[format] > metric.format[best] ? format : best,
  FORMAT_ORDER[0]);
}

function proofPoints(metric: PlayerSaberMetrics): string[] {
  const proof: string[] = [];
  const record = metric.player.strandRecord;
  const performance = metric.performance;
  const difficultRounds = (metric.player.recentRounds ?? []).filter(
    (round) => (round.courseRating ?? 0) >= 71.5 || (round.slopeRating ?? 0) >= 130,
  ).length;

  if (record?.appearances) {
    proof.push(`${record.wins} titles / ${record.appearances} trips`);
  } else {
    proof.push("Strand rookie");
  }

  if (metric.fullRoundSampleSize) {
    proof.push(`${metric.fullRoundSampleSize} full scorecards`);
  } else if (metric.player.reportedScoring?.lifetimeRounds) {
    proof.push(`${metric.player.reportedScoring.lifetimeRounds} lifetime Garmin rounds`);
  } else if (metric.player.reportedRounds2026) {
    proof.push(`${metric.player.reportedRounds2026} reported 2026 rounds`);
  } else {
    proof.push("No current scorecards");
  }

  if (performance.ceiling !== null) {
    proof.push(`${performance.ceiling.toFixed(1)} recent-window ceiling`);
  }
  if (difficultRounds >= 2) {
    proof.push(`${difficultRounds} high-rating/slope rounds`);
  }
  if (metric.player.reportedScoring?.bestToPar18 !== undefined) {
    proof.push(`Garmin best +${metric.player.reportedScoring.bestToPar18} / 18`);
  }

  return proof.slice(0, 4);
}

export function buildFinalScoutCase(metric: PlayerSaberMetrics): FinalScoutCase {
  const format = bestFormat(metric);
  const copy = FINAL_SCOUT_COPY[metric.player.id] ?? {
    role: "Flexible depth",
    bestCase:
      "The optimistic case is that the player performs near the best evidence in the available file and converts the event handicap into net pressure.",
    deployment:
      "Pair with a complementary floor or ceiling player based on the live board.",
    caution:
      "Current evidence is incomplete; use captain intel as a bounded tiebreaker.",
  };

  return {
    ...copy,
    bestFormat: format,
    bestFormatLabel: FORMAT_LABELS[format],
    bestFormatScore: metric.format[format],
    proof: proofPoints(metric),
  };
}
