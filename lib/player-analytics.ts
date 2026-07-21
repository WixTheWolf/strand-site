import { computeMatchPlayValue } from "./draft-engine";
import type { PlayerDraftStats } from "./types";

export type PickRisk = "safe" | "balanced" | "high-risk";

export interface PlayerAnalytics extends PlayerDraftStats {
  matchValue: number;
  pickRisk: PickRisk;
  riskScore: number;
  reliabilityScore: number;
  upsideScore: number;
  floorScore: number;
  riskLabel: string;
  safePickNote: string;
}

const RISK_STYLES: Record<
  PickRisk,
  { fill: string; stroke: string; bg: string; text: string; label: string }
> = {
  safe: {
    fill: "#2d6a4f",
    stroke: "#1b4332",
    bg: "bg-emerald-50",
    text: "text-emerald-900",
    label: "Safe pick",
  },
  balanced: {
    fill: "#5a8f7b",
    stroke: "#14352a",
    bg: "bg-[#f7f3ea]",
    text: "text-[#14352a]",
    label: "Balanced",
  },
  "high-risk": {
    fill: "#e85d04",
    stroke: "#c45c26",
    bg: "bg-orange-50",
    text: "text-orange-900",
    label: "High risk / high reward",
  },
};

export function getRiskStyles(risk: PickRisk) {
  return RISK_STYLES[risk];
}

function computeRiskScore(player: PlayerDraftStats): number {
  let score = 0;

  if (player.tags.includes("volatile")) score += 3;
  if (player.tags.includes("chaos")) score += 2;
  if (player.tags.includes("shotmaker")) score += 1;
  if (player.tags.includes("replacement")) score += 1;
  if (player.heat === "heating") score += 2;
  if (player.heat === "cooling") score += 1;
  if (player.heat === "unknown") score += 2;
  if (player.attestNum < 15) score += 2;
  else if (player.attestNum < 35) score += 1;
  if (player.dataSource === "missing" || player.dataSource === "estimated") score += 2;
  if (player.indexNum !== null && player.indexNum >= 24) score += 1;

  if (player.heat === "steady") score -= 2;
  if (player.attestNum >= 50) score -= 2;
  else if (player.attestNum >= 30) score -= 1;
  if (player.tags.includes("steady") || player.tags.includes("rock-solid")) score -= 2;
  if (player.tags.includes("veteran") || player.tags.includes("experience")) score -= 1;
  if (player.tags.includes("champion") || player.tags.includes("captain")) score -= 1;
  if (player.dataSource === "live" || player.dataSource === "ghin" || player.dataSource === "snapshot") score -= 1;
  if (player.tags.includes("calm") || player.tags.includes("reliable")) score -= 1;

  return score;
}

function classifyRisk(score: number): PickRisk {
  if (score <= -1) return "safe";
  if (score >= 3) return "high-risk";
  return "balanced";
}

function buildRiskLabel(player: PlayerDraftStats, risk: PickRisk): string {
  if (risk === "safe") {
    if (player.heat === "steady" && player.attestNum >= 50) return "Posted scores you can trust";
    if (player.tags.includes("veteran")) return "Strand-tested, steady floor";
    return "Reliable index + temperament";
  }
  if (risk === "high-risk") {
    if (player.tags.includes("volatile")) return "Emotional volatility — huge ceiling";
    if (player.heat === "heating") return "Hot form may not hold 72 holes";
    if (player.attestNum < 15) return "Thin recent scoring record";
    return "Boom-or-bust profile";
  }
  return "Solid value with normal variance";
}

function buildSafePickNote(player: PlayerDraftStats, risk: PickRisk): string {
  const index = player.indexNum?.toFixed(1) ?? "—";
  if (risk === "safe") {
    return `Safe anchor at ${index} — low variance for four-ball and scramble pairings.`;
  }
  if (risk === "high-risk") {
    return `High-upside swing at ${index} — best in singles/net matches if the week clicks.`;
  }
  return `Balanced fit at ${index} — useful across formats with manageable downside.`;
}

export function enrichPlayerAnalytics(player: PlayerDraftStats): PlayerAnalytics {
  const matchValue = computeMatchPlayValue(player);
  const riskScore = computeRiskScore(player);
  const pickRisk = classifyRisk(riskScore);
  const reliabilityScore = Math.min(
    100,
    player.attestNum * 0.7 +
      (player.dataSource === "live" || player.dataSource === "ghin" || player.dataSource === "snapshot" ? 20 : 0) +
      (player.heat === "steady" ? 15 : 0) +
      (player.heat === "unknown" ? -10 : 0),
  );
  const upsideScore =
    matchValue * 0.55 +
    (player.heat === "heating" && player.formDelta ? player.formDelta * 4 : 0) +
    (player.tags.includes("clutch") ? 3 : 0) +
    (player.tags.includes("shotmaker") ? 2 : 0);
  const floorScore =
    matchValue * 0.45 +
    reliabilityScore * 0.25 +
    (player.indexNum !== null ? Math.max(0, 28 - player.indexNum) * 0.3 : 0);

  return {
    ...player,
    matchValue,
    pickRisk,
    riskScore,
    reliabilityScore,
    upsideScore,
    floorScore,
    riskLabel: buildRiskLabel(player, pickRisk),
    safePickNote: buildSafePickNote(player, pickRisk),
  };
}

export function enrichAllPlayers(players: PlayerDraftStats[]): PlayerAnalytics[] {
  return players.map(enrichPlayerAnalytics);
}

export function groupByRisk(players: PlayerAnalytics[]) {
  return {
    safe: players.filter((p) => p.pickRisk === "safe").sort((a, b) => a.draftRank - b.draftRank),
    balanced: players.filter((p) => p.pickRisk === "balanced").sort((a, b) => a.draftRank - b.draftRank),
    "high-risk": players
      .filter((p) => p.pickRisk === "high-risk")
      .sort((a, b) => a.draftRank - b.draftRank),
  };
}

/** Best safe anchor to pair with a volatile / high-variance pick (scramble + four-ball balance). */
export function suggestSafePairing(
  highRisk: PlayerAnalytics,
  pool: PlayerAnalytics[],
): PlayerAnalytics | null {
  const safePool = pool.filter((p) => p.id !== highRisk.id && p.pickRisk === "safe");
  if (!safePool.length) return null;

  const hi = highRisk.indexNum ?? 20;
  return safePool
    .map((safe) => {
      const spread = Math.abs((safe.indexNum ?? 10) - hi);
      const synergy = spread * 0.4 + safe.floorScore * 0.35 + safe.reliabilityScore * 0.25;
      return { safe, synergy };
    })
    .sort((a, b) => b.synergy - a.synergy)[0]?.safe ?? null;
}
