"use client";

import { useMemo, useState } from "react";
import { isCaptain } from "@/lib/players";
import {
  enrichAllPlayers,
  groupByRisk,
  suggestSafePairing,
  type PlayerAnalytics,
  type PickRisk,
} from "@/lib/player-analytics";
import type { PlayerDraftStats } from "@/lib/types";

const RISK_COLORS: Record<PickRisk, string> = {
  safe: "#2d6a4f",
  balanced: "#c9a227",
  "high-risk": "#c45c26",
};

const RISK_LABELS: Record<PickRisk, string> = {
  safe: "Safe pick",
  balanced: "Balanced",
  "high-risk": "High risk",
};

type Props = {
  players: PlayerDraftStats[];
  draftedIds?: Set<string>;
};

function formatIndex(p: PlayerDraftStats): string {
  if (p.indexNum !== null) return `${p.indexNum.toFixed(1)}${p.eventIndexCapped ? "*" : ""}`;
  if (p.estimatedIndex) return `~${p.estimatedIndex}`;
  return "—";
}

export function PlayerSkillGraph({ players, draftedIds }: Props) {
  const enriched = useMemo(() => enrichAllPlayers(players), [players]);
  const byRisk = useMemo(() => groupByRisk(enriched), [enriched]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = enriched.find((p) => p.id === selectedId) ?? null;

  const pairings = useMemo(() => {
    const map = new Map<string, PlayerAnalytics>();
    for (const p of byRisk["high-risk"]) {
      const safe = suggestSafePairing(p, enriched);
      if (safe) map.set(p.id, safe);
    }
    return map;
  }, [byRisk, enriched]);

  const chart = useMemo(() => {
    const W = 720;
    const H = 400;
    const pad = { l: 56, r: 28, t: 32, b: 52 };
    const plotW = W - pad.l - pad.r;
    const plotH = H - pad.t - pad.b;

    const withIndex = enriched.filter((p) => p.indexNum !== null);
    const xMin = 0;
    const xMax = Math.max(...withIndex.map((p) => p.indexNum!), 28);
    const yMin = 0;
    const yMax = Math.max(...enriched.map((p) => p.matchValue), 95);

    const sx = (v: number) => pad.l + ((v - xMin) / (xMax - xMin || 1)) * plotW;
    const sy = (v: number) => pad.t + plotH - ((v - yMin) / (yMax - yMin || 1)) * plotH;

    const dots = withIndex.map((p) => ({
      p,
      cx: sx(p.indexNum!),
      cy: sy(p.matchValue),
      r: 5 + p.upsideScore / 30,
      drafted: draftedIds?.has(p.id) ?? false,
    }));

    return { W, H, pad, xMin, xMax, yMin, yMax, sx, sy, dots };
  }, [enriched, draftedIds]);

  return (
    <section className="rounded-[2rem] border border-[#111]/10 bg-white p-6 shadow-sm">
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-[#111]/50">Field analytics</div>
          <h2 className="mt-1 text-xl font-medium">Skill & risk graph</h2>
          <p className="mt-2 max-w-2xl text-sm text-[#111]/70">
            X-axis = course handicap index (lower is stronger). Y-axis = Strand match-play value across
            foursomes, shamble, singles, and scramble. Dot size reflects upside; color is draft risk tier.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-medium uppercase tracking-[0.12em]">
          {(Object.keys(RISK_COLORS) as PickRisk[]).map((risk) => (
            <span key={risk} className="flex items-center gap-2 text-[#111]/75">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: RISK_COLORS[risk] }}
              />
              {RISK_LABELS[risk]}
            </span>
          ))}
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
        <div className="overflow-x-auto rounded-2xl border border-[#111]/10 bg-[#111] p-4">
          <svg
            viewBox={`0 0 ${chart.W} ${chart.H}`}
            className="w-full min-w-[520px]"
            role="img"
            aria-label="Player skill scatter plot"
          >
            <rect
              x={chart.pad.l}
              y={chart.pad.t}
              width={chart.W - chart.pad.l - chart.pad.r}
              height={chart.H - chart.pad.t - chart.pad.b}
              fill="rgba(255,255,255,0.04)"
              rx="6"
            />

            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
              const yVal = chart.yMin + t * (chart.yMax - chart.yMin);
              const y = chart.sy(yVal);
              return (
                <g key={`y-${t}`}>
                  <line
                    x1={chart.pad.l}
                    y1={y}
                    x2={chart.W - chart.pad.r}
                    y2={y}
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <text x={chart.pad.l - 10} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.5)" fontSize="11">
                    {Math.round(yVal)}
                  </text>
                </g>
              );
            })}

            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
              const xVal = chart.xMin + t * (chart.xMax - chart.xMin);
              const x = chart.sx(xVal);
              return (
                <g key={`x-${t}`}>
                  <line
                    x1={x}
                    y1={chart.pad.t}
                    x2={x}
                    y2={chart.H - chart.pad.b}
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <text
                    x={x}
                    y={chart.H - chart.pad.b + 22}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.5)"
                    fontSize="11"
                  >
                    {xVal.toFixed(0)}
                  </text>
                </g>
              );
            })}

            <text
              x={chart.W / 2}
              y={chart.H - 8}
              textAnchor="middle"
              fill="rgba(255,255,255,0.65)"
              fontSize="12"
            >
              Handicap index
            </text>
            <text
              x={16}
              y={chart.H / 2}
              textAnchor="middle"
              transform={`rotate(-90, 16, ${chart.H / 2})`}
              fill="rgba(255,255,255,0.65)"
              fontSize="12"
            >
              Match-play value
            </text>

            {chart.dots.map(({ p, cx, cy, r, drafted }) => {
              const active = selectedId === p.id;
              return (
                <g
                  key={p.id}
                  onClick={() => setSelectedId(active ? null : p.id)}
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r + (active ? 4 : 0)}
                    fill={RISK_COLORS[p.pickRisk]}
                    fillOpacity={drafted ? 0.35 : active ? 1 : 0.85}
                    stroke={active ? "#fff" : drafted ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)"}
                    strokeWidth={active ? 2 : 1}
                    strokeDasharray={drafted ? "3 2" : undefined}
                  />
                  <text
                    x={cx}
                    y={cy - r - 5}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.9)"
                    fontSize="10"
                    fontWeight={active ? 700 : 500}
                  >
                    {p.nickname}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {selected ? (
          <PlayerDetailCard
            player={selected}
            safePair={pairings.get(selected.id) ?? (selected.pickRisk === "high-risk" ? suggestSafePairing(selected, enriched) : null)}
            onClose={() => setSelectedId(null)}
          />
        ) : (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-[#111]/15 bg-[#f7f5f0] p-6 text-center text-sm text-[#111]/55">
            Click a player on the graph for full stats, GHIN links, and pairing notes.
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <RiskPanel
          title="Safe picks"
          subtitle="Verified index, veteran floor, low attest risk — anchor your roster here."
          risk="safe"
          players={byRisk.safe}
        />
        <RiskPanel
          title="Balanced"
          subtitle="Solid value with normal variance — core rotation picks."
          risk="balanced"
          players={byRisk.balanced}
        />
        <RiskPanel
          title="High risk / upside"
          subtitle="Big net upside or data gaps — pair each with a safe pick, not stacked."
          risk="high-risk"
          players={byRisk["high-risk"]}
          pairings={pairings}
        />
      </div>

      <div className="mt-8">
        <div className="text-xs uppercase tracking-[0.22em] text-[#111]/50">Full player data sheet</div>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-[#111]/10">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-[#f7f5f0] text-xs uppercase tracking-[0.1em] text-[#111]/55">
              <tr>
                <th className="px-3 py-3">Player</th>
                <th className="px-3 py-3">Risk</th>
                <th className="px-3 py-3">Index</th>
                <th className="px-3 py-3">Low</th>
                <th className="px-3 py-3">Match</th>
                <th className="px-3 py-3">Floor</th>
                <th className="px-3 py-3">Upside</th>
                <th className="px-3 py-3">Reliability</th>
                <th className="px-3 py-3">Attest</th>
                <th className="px-3 py-3">Last 5</th>
                <th className="px-3 py-3">Heat</th>
                <th className="px-3 py-3">Draft</th>
                <th className="px-3 py-3">Source</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-3 py-3">Tags</th>
                <th className="px-3 py-3">Safe pair</th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((p) => {
                const safePair = pairings.get(p.id);
                return (
                  <tr
                    key={p.id}
                    className={`border-t border-[#111]/8 transition hover:bg-[#f7f5f0]/60 ${
                      selectedId === p.id ? "bg-[#f7f5f0]" : ""
                    } ${draftedIds?.has(p.id) ? "opacity-60" : ""}`}
                    onClick={() => setSelectedId(p.id)}
                  >
                    <td className="px-3 py-2.5">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-[#111]/55">{p.nickname}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="rounded-full border px-2 py-0.5 text-xs font-medium"
                        style={{ borderColor: RISK_COLORS[p.pickRisk], color: RISK_COLORS[p.pickRisk] }}
                      >
                        {RISK_LABELS[p.pickRisk]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-lg font-medium">{formatIndex(p)}</td>
                    <td className="px-3 py-2.5">{p.lowestNum?.toFixed(1) ?? "—"}</td>
                    <td className="px-3 py-2.5">{p.matchValue.toFixed(1)}</td>
                    <td className="px-3 py-2.5">{p.floorScore.toFixed(0)}</td>
                    <td className="px-3 py-2.5">{p.upsideScore.toFixed(0)}</td>
                    <td className="px-3 py-2.5">{p.reliabilityScore.toFixed(0)}</td>
                    <td className="px-3 py-2.5">{p.attestNum || "—"}</td>
                    <td className="px-3 py-2.5 font-mono text-xs">
                      {p.recentRounds?.length
                        ? p.recentRounds
                            .map((round) => `${round.score}${round.nineHole ? "*" : ""}`)
                            .join(" · ")
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5">{p.heatLabel}</td>
                    <td className="px-3 py-2.5">
                      #{p.draftRank} ({p.draftScore.toFixed(0)})
                    </td>
                    <td className="px-3 py-2.5">{p.dataSource}</td>
                    <td className="px-3 py-2.5 text-xs">
                      {[p.location, p.origin ? `from ${p.origin}` : null].filter(Boolean).join(" · ") || "—"}
                      {p.ghinClub ? <div className="text-[#111]/50">{p.ghinClub}</div> : null}
                    </td>
                    <td className="max-w-[140px] px-3 py-2.5 text-xs text-[#111]/65">
                      {p.tags.join(", ") || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      {p.pickRisk === "high-risk" && safePair ? (
                        <span className="font-medium text-[#2d6a4f]">{safePair.nickname}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function RiskPanel({
  title,
  subtitle,
  risk,
  players,
  pairings,
}: {
  title: string;
  subtitle: string;
  risk: PickRisk;
  players: PlayerAnalytics[];
  pairings?: Map<string, PlayerAnalytics>;
}) {
  return (
    <div
      className="rounded-2xl border border-[#111]/10 bg-[#f7f5f0] p-5"
      style={{ borderTopWidth: 3, borderTopColor: RISK_COLORS[risk] }}
    >
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mt-1 text-xs text-[#111]/65">{subtitle}</p>
      <ul className="mt-4 space-y-3">
        {players.map((p) => (
          <li key={p.id} className="rounded-xl bg-white px-3 py-2 text-sm">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-medium">{p.nickname}</span>
              <span className="text-lg font-medium">{formatIndex(p)}</span>
            </div>
            <div className="mt-1 text-xs text-[#111]/60">{p.riskLabel}</div>
            {risk === "high-risk" && pairings?.get(p.id) && (
              <div className="mt-1.5 text-xs font-medium text-[#2d6a4f]">
                Safe pair: {pairings.get(p.id)!.nickname} ({formatIndex(pairings.get(p.id)!)} idx)
              </div>
            )}
          </li>
        ))}
        {!players.length && <li className="text-xs text-[#111]/50">None in this tier</li>}
      </ul>
    </div>
  );
}

function PlayerDetailCard({
  player: p,
  safePair,
  onClose,
}: {
  player: PlayerAnalytics;
  safePair: PlayerAnalytics | null;
  onClose: () => void;
}) {
  const grintUrl = p.grintProfileUrl ?? null;

  return (
    <div className="relative rounded-2xl border border-[#111]/10 bg-[#f7f5f0] p-5 text-sm">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-2 text-xl text-[#111]/40 hover:text-[#111]"
        aria-label="Close"
      >
        ×
      </button>
      <h3 className="pr-6 text-lg font-medium">{p.name}</h3>
      <p className="text-xs uppercase tracking-[0.14em] text-[#111]/55">
        {isCaptain(p.id) ? "Captain (pre-assigned)" : `Draft pool · #${p.draftRank}`}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <dt className="text-[#111]/50">Risk</dt>
        <dd style={{ color: RISK_COLORS[p.pickRisk] }}>{RISK_LABELS[p.pickRisk]}</dd>
        <dt className="text-[#111]/50">Index / low</dt>
        <dd>
          {formatIndex(p)} / {p.lowestNum?.toFixed(1) ?? "—"}
        </dd>
        <dt className="text-[#111]/50">GHIN #</dt>
        <dd>{p.ghinNumberResolved ?? p.ghinNumber ?? "Verify at draw"}</dd>
        <dt className="text-[#111]/50">Match value</dt>
        <dd>{p.matchValue.toFixed(1)}</dd>
        <dt className="text-[#111]/50">Floor / upside</dt>
        <dd>
          {p.floorScore.toFixed(0)} / {p.upsideScore.toFixed(0)}
        </dd>
        <dt className="text-[#111]/50">Reliability</dt>
        <dd>{p.reliabilityScore.toFixed(0)}</dd>
        <dt className="text-[#111]/50">Attest / heat</dt>
        <dd>
          {p.attestNum} scores · {p.heatLabel}
        </dd>
        <dt className="text-[#111]/50">Data</dt>
        <dd>{p.dataSource}</dd>
        <dt className="text-[#111]/50">Location</dt>
        <dd>{p.location ?? "—"}</dd>
        <dt className="text-[#111]/50">Origin</dt>
        <dd>{p.origin ?? "—"}</dd>
        <dt className="text-[#111]/50">Club</dt>
        <dd>{p.ghinClub ?? "—"}</dd>
        <dt className="text-[#111]/50">Tags</dt>
        <dd>{p.tags.join(", ") || "—"}</dd>
      </dl>

      <p className="mt-3 text-xs text-[#111]/70">{p.safePickNote}</p>

      {p.pickRisk === "high-risk" && safePair && (
        <div className="mt-3 rounded-xl border border-[#2d6a4f]/25 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          <strong>Recommended safe pair:</strong> {safePair.name} ({safePair.nickname}) at{" "}
          {formatIndex(safePair)} — scramble 35/15 synergy + steady foursomes floor.
        </div>
      )}

      {grintUrl && (
        <a
          href={grintUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-xs font-semibold uppercase tracking-[0.12em] text-[#c45c26]"
        >
          TheGrint profile →
        </a>
      )}
    </div>
  );
}
