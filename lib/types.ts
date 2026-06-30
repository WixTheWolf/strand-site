export type HeatStatus = "heating" | "steady" | "cooling" | "unknown";

export interface StrandPlayer {
  id: string;
  name: string;
  nickname: string;
  initials: string;
  blurb: string;
  email?: string;
  grintId: string | null;
  grintUsername?: string;
  /** Where the player actually lives (may differ from stale TheGrint location) */
  location?: string;
  /** Hometown / roots when different from current residence */
  origin?: string;
  /** Extra terms for TheGrint/GHIN lookup: email, username, name */
  grintSearchTerms?: string[];
  tags: string[];
  estimatedIndex?: number;
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
  dataSource: "live" | "estimated" | "missing";
  grintLocation?: string;
  grintUsernameResolved?: string;
}

export interface DraftRecommendation {
  pick: number;
  playerId: string;
  rationale: string;
}