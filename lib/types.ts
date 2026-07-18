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

export interface RecentRound {
  /** ISO or display date the round was played */
  date: string;
  score: number;
  course?: string;
  differential?: number | null;
  /** True when the posted round was 9 holes (shown with an asterisk) */
  nineHole?: boolean;
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
  dataSource: "live" | "ghin" | "manual" | "estimated" | "missing";
  grintLocation?: string;
  grintUsernameResolved?: string;
  grintProfileUrl?: string | null;
  ghinNumberResolved?: string | null;
  /** Most recent posted rounds, newest first (up to 5) */
  recentRounds?: RecentRound[];
  recentRoundsSource?: "ghin" | "grint" | null;
}

export interface DraftRecommendation {
  pick: number;
  playerId: string;
  rationale: string;
}