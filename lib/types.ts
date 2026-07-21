export type HeatStatus = "heating" | "steady" | "cooling" | "unknown";

export interface StrandPlayer {
  id: string;
  name: string;
  nickname: string;
  initials: string;
  blurb: string;
  email?: string;
  grintId: string | null;
  /** USGA GHIN number when linked — requires player verification if unknown */
  ghinNumber?: string | null;
  /** GHIN home club when verified off TheGrint */
  ghinClub?: string;
  grintUsername?: string;
  /** Where the player actually lives (may differ from stale TheGrint location) */
  location?: string;
  /** Hometown / roots when different from current residence */
  origin?: string;
  /** Extra terms for TheGrint/GHIN lookup: email, username, name */
  grintSearchTerms?: string[];
  tags: string[];
  /** Captain-verified index when GHIN/TheGrint cannot be linked reliably */
  manualIndex?: number;
  /** Verified GHIN low index when known */
  manualLowest?: number;
  /** Captain-reported activity when scorecards are unavailable */
  reportedRounds2026?: number;
  /** Aggregate scoring evidence when individual scorecards/course context are unavailable */
  reportedScoring?: {
    source: "garmin";
    sampleSize: number;
    averageToPar9?: number;
    averageToPar18?: number;
    capturedAt: string;
  };
  estimatedIndex?: number;
  photoUrl?: string;
  out?: boolean;
}

export interface GrintHandicap {
  lowest: string;
  attest: string;
  index: string;
  index_ghap: string;
  index_federation: string;
  cIndex: string | null;
  teebox_handicap: string | null;
}

export interface RoundShotStats {
  birdiesOrBetterPct?: number | null;
  parsPct?: number | null;
  bogeysPct?: number | null;
  doubleBogeysPct?: number | null;
  tripleBogeysOrWorsePct?: number | null;
  fairwayHitsPct?: number | null;
  girPct?: number | null;
  onePuttOrBetterPct?: number | null;
  twoPuttPct?: number | null;
  threePuttOrWorsePct?: number | null;
  putts?: number | null;
  upAndDowns?: number | null;
  par3Average?: number | null;
  par4Average?: number | null;
  par5Average?: number | null;
  approachMissLeftPct?: number | null;
  approachMissRightPct?: number | null;
  approachMissShortPct?: number | null;
  approachMissLongPct?: number | null;
}

export interface RecentRound {
  /** ISO or display date the round was played */
  date: string;
  score: number;
  course?: string;
  /** Tee set used for the round when included in the consented scoring record */
  teeName?: string;
  differential?: number | null;
  /** True when the posted round was 9 holes (shown with an asterisk) */
  nineHole?: boolean;
  adjustedGrossScore?: number | null;
  courseRating?: number | null;
  slopeRating?: number | null;
  pcc?: number | null;
  unadjustedDifferential?: number | null;
  netScoreDifferential?: number | null;
  holesPlayed?: number | null;
  postedDate?: string | null;
  scoreType?: string | null;
  scoreStatus?: string | null;
  usedInIndex?: boolean | null;
  exceptional?: boolean | null;
  edited?: boolean | null;
  shotStats?: RoundShotStats | null;
}

export interface PlayerDraftStats extends StrandPlayer {
  handicap: GrintHandicap | null;
  indexNum: number | null;
  lowestNum: number | null;
  attestNum: number;
  heat: HeatStatus;
  heatLabel: string;
  draftScore: number;
  draftRank: number;
  formDelta: number | null;
  dataSource: "live" | "ghin" | "snapshot" | "manual" | "estimated" | "missing";
  grintLocation?: string;
  grintUsernameResolved?: string;
  grintProfileUrl?: string | null;
  ghinNumberResolved?: string | null;
  ghinLowIndex?: number | null;
  ghinLowIndexDate?: string | null;
  ghinRevisionDate?: string | null;
  ghinSoftCap?: boolean | null;
  ghinHardCap?: boolean | null;
  ghinStatus?: string | null;
  /** Most recent posted rounds, newest first (up to 60 live; snapshot may be smaller) */
  recentRounds?: RecentRound[];
  recentRoundsSource?: "ghin" | "grint" | "snapshot" | null;
  /** Career Strand record from the archive (2018–2025) */
  strandRecord?: { wins: number; losses: number; appearances: number; winPct: number | null };
}

export interface DraftRecommendation {
  pick: number;
  playerId: string;
  rationale: string;
}
