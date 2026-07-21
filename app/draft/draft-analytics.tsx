"use client";

import Image from "next/image";
import { useMemo } from "react";
import {
  buildRationale,
  computeMatchPlayValue,
  marginalTeamValue,
  projectRemainingDraft,
  summarizeTeamFormats,
  winProbability,
  type FormatValues,
} from "@/lib/draft-engine";
import { getPickOwner, MY_CAPTAIN, OPPONENT_CAPTAIN, TOTAL_DRAFT_PICKS, type DraftPick } from "@/lib/mock-draft";
import { getPlayerPhoto } from "@/lib/player-assets";
import type { PlayerDraftStats } from "@/lib/types";

/** Two-team categorical palette — validated (dataviz six checks) on white surface */
const TEAM_COLORS = { mine: "#2e8b64", justin: "#d2691e" } as const;

const FORMAT_ROWS: { key: keyof FormatValues; label: string; course: string }[] = [
  { key: "fourball", label: "R1 · Fourball", course: "Gamble Sands" },
  { key: "shamble", label: "R2 · Shamble", course: "Scarecrow" },
  { key: "singles", label: "R3 · Singles", course: "Scarecrow" },
  { key: "scramble", label: "R4 · Scramble", course: "Gamble Sands" },
];

function formatIndex(player: PlayerDraftStats) {
  if (player.indexNum !== null) return `${player.indexNum.toFixed(1)}${player.eventIndexCapped ? "*" : ""}`;
  if (player.estimatedIndex) return `~${player.estimatedIndex}`;
  return "—";
}

function playerIndex(player: PlayerDraftStats): number | null {
  return player.indexNum ?? player.estimatedIndex ?? null;
}

interface Props {
  players: PlayerDraftStats[];
  myRoster: PlayerDraftStats[];
  justinRoster: PlayerDraftStats[];
  available: PlayerDraftStats[];
  currentOwner: "mine" | "justin" | null;
  draftComplete: boolean;
  picks: DraftPick[];
  iPickFirst: boolean;
}

export default function DraftAnalytics({
  players,
  myRoster,
  justinRoster,
  available,
  currentOwner,
  draftComplete,
  picks,
  iPickFirst,
}: Props) {
  const playerMap = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);

  const model = useMemo(() => {
    const nextPick = picks.length + 1;
    const projection = draftComplete
      ? { wix: myRoster, justin: justinRoster }
      : projectRemainingDraft(nextPick, iPickFirst, available, myRoster, justinRoster);

    const projMine = marginalTeamValue(projection.wix);
    const projJustin = marginalTeamValue(projection.justin);
    const winProb = winProbability(projMine, projJustin);

    const currentMine = marginalTeamValue(myRoster);
    const currentJustin = marginalTeamValue(justinRoster);
    const mySynergy = currentMine - myRoster.reduce((s, p) => s + computeMatchPlayValue(p), 0);
    const justinSynergy =
      currentJustin - justinRoster.reduce((s, p) => s + computeMatchPlayValue(p), 0);

    const myFormats = summarizeTeamFormats(myRoster);
    const justinFormats = summarizeTeamFormats(justinRoster);

    return {
      projection,
      projMine,
      projJustin,
      winProb,
      currentMine,
      currentJustin,
      mySynergy,
      justinSynergy,
      myFormats,
      justinFormats,
    };
  }, [picks.length, draftComplete, iPickFirst, available, myRoster, justinRoster]);

  // Justin's predicted preference order (greedy against his current roster)
  const justinBoard = useMemo(() => {
    const base = marginalTeamValue(justinRoster);
    return [...available]
      .map((candidate) => ({
        candidate,
        gain: marginalTeamValue([...justinRoster, candidate]) - base,
      }))
      .sort((a, b) => b.gain - a.gain);
  }, [available, justinRoster]);

  // My recommendations, with steal risk vs Justin's intervening picks
  const recommendations = useMemo(() => {
    if (draftComplete || currentOwner !== "mine") return [];
    const base = marginalTeamValue(myRoster);
    const nextPick = picks.length + 1;

    // How many times does Justin pick before my next turn?
    let justinPicksBetween = 0;
    for (let p = nextPick + 1; p <= TOTAL_DRAFT_PICKS; p += 1) {
      if (getPickOwner(p, iPickFirst) === "mine") break;
      justinPicksBetween += 1;
    }

    const justinRank = new Map(justinBoard.map((entry, i) => [entry.candidate.id, i]));

    return [...available]
      .map((candidate) => ({
        candidate,
        gain: marginalTeamValue([...myRoster, candidate]) - base,
        oppRank: justinRank.get(candidate.id) ?? 99,
      }))
      .sort((a, b) => b.gain - a.gain)
      .slice(0, 5)
      .map((entry) => ({
        ...entry,
        rationale: buildRationale(entry.candidate),
        likelyGone: entry.oppRank < justinPicksBetween,
        atRisk: entry.oppRank < justinPicksBetween + 2,
      }));
  }, [available, myRoster, picks.length, iPickFirst, currentOwner, draftComplete, justinBoard]);

  // Cumulative roster value after each pick, for the draft-flow chart
  const flow = useMemo(() => {
    const mine: { pick: number; value: number; label: string }[] = [];
    const justin: { pick: number; value: number; label: string }[] = [];
    const myCaptain = players.find((p) => p.id === MY_CAPTAIN.id);
    const oppCaptain = players.find((p) => p.id === OPPONENT_CAPTAIN.id);
    let mineRoster = myCaptain ? [myCaptain] : [];
    let justinRosterSim = oppCaptain ? [oppCaptain] : [];
    mine.push({ pick: 0, value: marginalTeamValue(mineRoster), label: "Captains" });
    justin.push({ pick: 0, value: marginalTeamValue(justinRosterSim), label: "Captains" });

    for (const pick of picks) {
      const player = playerMap.get(pick.playerId);
      if (!player) continue;
      if (pick.side === "mine") {
        mineRoster = [...mineRoster, player];
        mine.push({ pick: pick.pickNumber, value: marginalTeamValue(mineRoster), label: player.nickname });
      } else {
        justinRosterSim = [...justinRosterSim, player];
        justin.push({ pick: pick.pickNumber, value: marginalTeamValue(justinRosterSim), label: player.nickname });
      }
    }
    return { mine, justin };
  }, [picks, playerMap, players]);

  const winPct = Math.round(model.winProb * 100);
  const formatMax = Math.max(
    1,
    ...FORMAT_ROWS.flatMap((row) => [model.myFormats[row.key], model.justinFormats[row.key]]),
  );

  return (
    <section className="rounded-[2rem] border border-[#111]/10 bg-white p-6 shadow-sm">
      <header className="mb-6 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-[#111]/50">War room</div>
          <h2 className="mt-1 text-xl font-medium">Live draft model</h2>
          <p className="mt-2 max-w-2xl text-sm text-[#111]/70">
            Every number recomputes on each pick — projected finish assumes best-available drafting
            from here for both captains.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-[0.12em] text-[#111]/75">
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: TEAM_COLORS.mine }} />
            {MY_CAPTAIN.nickname}
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: TEAM_COLORS.justin }} />
            {OPPONENT_CAPTAIN.nickname}
          </span>
        </div>
      </header>

      {/* Win probability + totals */}
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div className="rounded-2xl border border-[#111]/10 bg-[#f7f5f0] p-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#111]/50">
            {draftComplete ? "Win probability — final rosters" : "Win probability — projected finish"}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-5xl font-medium tracking-tight" style={{ color: TEAM_COLORS.mine }}>
              {winPct}%
            </span>
            <span className="text-sm text-[#111]/55">{MY_CAPTAIN.nickname}</span>
            <span className="ml-auto font-mono text-xl text-[#111]/45">{100 - winPct}%</span>
          </div>
          <div
            className="mt-3 flex h-3 overflow-hidden rounded-full"
            role="img"
            aria-label={`${MY_CAPTAIN.nickname} ${winPct}% vs ${OPPONENT_CAPTAIN.nickname} ${100 - winPct}%`}
          >
            <div className="h-full transition-all duration-700" style={{ width: `${winPct}%`, background: TEAM_COLORS.mine }} />
            <div className="h-full w-[2px] bg-white" />
            <div className="h-full flex-1 transition-all duration-700" style={{ background: TEAM_COLORS.justin }} />
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-[#111]/50">
            Logistic model on total roster value ({model.projMine.toFixed(0)} vs{" "}
            {model.projJustin.toFixed(0)}) incl. synergy — not a promise, a lean.
          </p>
        </div>

        {[
          {
            label: `${MY_CAPTAIN.nickname} roster value`,
            value: model.currentMine,
            synergy: model.mySynergy,
            roster: myRoster,
            color: TEAM_COLORS.mine,
          },
          {
            label: `${OPPONENT_CAPTAIN.nickname} roster value`,
            value: model.currentJustin,
            synergy: model.justinSynergy,
            roster: justinRoster,
            color: TEAM_COLORS.justin,
          },
        ].map((team) => (
          <div key={team.label} className="rounded-2xl border border-[#111]/10 bg-[#f7f5f0] p-5">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#111]/50">{team.label}</div>
            <div className="mt-2 font-mono text-4xl font-medium tracking-tight" style={{ color: team.color }}>
              {team.value.toFixed(0)}
            </div>
            <dl className="mt-3 space-y-1 text-[11px] text-[#111]/60">
              <div className="flex justify-between">
                <dt>Roster synergy</dt>
                <dd className="font-mono">+{team.synergy.toFixed(1)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Avg match value / player</dt>
                <dd className="font-mono">
                  {team.roster.length ? (team.value / team.roster.length).toFixed(1) : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Heating up</dt>
                <dd className="font-mono">{team.roster.filter((p) => p.heat === "heating").length}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      {/* Pick recommendations */}
      {currentOwner === "mine" && recommendations.length > 0 && (
        <div className="mt-6">
          <div className="text-xs uppercase tracking-[0.22em] text-[#111]/50">
            Best available — value added to your roster
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {recommendations.map((rec, i) => {
              const photo = getPlayerPhoto(rec.candidate.id);
              return (
                <div
                  key={rec.candidate.id}
                  className={`relative rounded-2xl border p-4 ${
                    i === 0 ? "border-[#2e8b64] bg-emerald-50/60" : "border-[#111]/10 bg-[#f7f5f0]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#111]/40">#{i + 1}</span>
                    {photo ? (
                      <div className="relative h-9 w-9 overflow-hidden rounded-full border border-[#111]/10">
                        <Image src={photo} alt="" fill className="object-cover object-top" sizes="36px" />
                      </div>
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#111]/8 text-[10px] font-medium">
                        {rec.candidate.initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{rec.candidate.nickname}</div>
                      <div className="font-mono text-xs text-[#111]/55">{formatIndex(rec.candidate)} idx</div>
                    </div>
                  </div>
                  <div className="mt-3 font-mono text-lg font-medium" style={{ color: TEAM_COLORS.mine }}>
                    +{rec.gain.toFixed(1)}
                  </div>
                  <p className="mt-1 line-clamp-3 text-[11px] leading-snug text-[#111]/60">{rec.rationale}</p>
                  {(rec.likelyGone || rec.atRisk) && (
                    <div
                      className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${
                        rec.likelyGone ? "bg-[#d2691e]/15 text-[#a04e12]" : "bg-[#c9a227]/15 text-[#7a6011]"
                      }`}
                    >
                      {rec.likelyGone ? `${OPPONENT_CAPTAIN.nickname} target — likely gone` : "At risk before your next pick"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Justin's predicted board */}
      {currentOwner === "justin" && justinBoard.length > 0 && (
        <div className="mt-6 rounded-2xl border border-[#d2691e]/30 bg-orange-50/50 p-5">
          <div className="text-xs uppercase tracking-[0.22em] text-[#a04e12]">
            Predicted {OPPONENT_CAPTAIN.nickname} board
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {justinBoard.slice(0, 3).map((entry, i) => (
              <div key={entry.candidate.id} className="flex items-center gap-3 rounded-xl bg-white px-4 py-2.5">
                <span className="font-mono text-xs text-[#111]/40">{i + 1}</span>
                <span className="text-sm font-medium">{entry.candidate.nickname}</span>
                <span className="font-mono text-xs text-[#111]/55">{formatIndex(entry.candidate)}</span>
                <span className="font-mono text-xs" style={{ color: TEAM_COLORS.justin }}>
                  +{entry.gain.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Format edge */}
      <div className="mt-8">
        <div className="text-xs uppercase tracking-[0.22em] text-[#111]/50">
          Format edge — current rosters, round by round
        </div>
        <div className="mt-4 space-y-4">
          {FORMAT_ROWS.map((row) => {
            const mineVal = model.myFormats[row.key];
            const justinVal = model.justinFormats[row.key];
            const edge = mineVal - justinVal;
            const leader = edge >= 0 ? MY_CAPTAIN.nickname : OPPONENT_CAPTAIN.nickname;
            return (
              <div key={row.key}>
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-sm font-medium">
                    {row.label} <span className="text-xs font-normal text-[#111]/45">· {row.course}</span>
                  </div>
                  <div
                    className="font-mono text-xs font-medium"
                    style={{ color: edge >= 0 ? TEAM_COLORS.mine : TEAM_COLORS.justin }}
                  >
                    {leader} +{Math.abs(edge).toFixed(1)}
                  </div>
                </div>
                <div className="mt-1.5 space-y-[2px]">
                  {[
                    { val: mineVal, color: TEAM_COLORS.mine, name: MY_CAPTAIN.nickname },
                    { val: justinVal, color: TEAM_COLORS.justin, name: OPPONENT_CAPTAIN.nickname },
                  ].map((bar) => (
                    <div key={bar.name} className="flex items-center gap-2" title={`${bar.name}: ${bar.val.toFixed(1)}`}>
                      <div className="h-[12px] flex-1 rounded-r-[4px] bg-[#111]/[0.04]">
                        <div
                          className="h-full rounded-r-[4px] transition-all duration-500"
                          style={{ width: `${(bar.val / formatMax) * 100}%`, background: bar.color }}
                        />
                      </div>
                      <span className="w-12 text-right font-mono text-[11px] text-[#111]/60">
                        {bar.val.toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Roster shape */}
      <div className="mt-8">
        <div className="text-xs uppercase tracking-[0.22em] text-[#111]/50">
          Roster shape — handicap spread (0–30)
        </div>
        <div className="mt-4 space-y-3">
          {[
            { name: MY_CAPTAIN.nickname, roster: myRoster, color: TEAM_COLORS.mine, ghost: false },
            { name: OPPONENT_CAPTAIN.nickname, roster: justinRoster, color: TEAM_COLORS.justin, ghost: false },
            { name: "Board", roster: available, color: "#8a8577", ghost: true },
          ].map((lane) => {
            const indexed = lane.roster
              .map((p) => ({ p, idx: playerIndex(p) }))
              .filter((entry): entry is { p: PlayerDraftStats; idx: number } => entry.idx !== null);
            const low = indexed.filter((e) => e.idx <= 12).length;
            const mid = indexed.filter((e) => e.idx > 12 && e.idx <= 20).length;
            const high = indexed.filter((e) => e.idx > 20).length;
            return (
              <div key={lane.name} className="flex items-center gap-3">
                <span className="w-14 shrink-0 text-xs font-medium text-[#111]/70">{lane.name}</span>
                <div className="relative h-7 flex-1 rounded-full bg-[#111]/[0.04]">
                  {[0, 10, 20, 30].map((tick) => (
                    <span
                      key={tick}
                      className="absolute top-0 h-full w-px bg-[#111]/8"
                      style={{ left: `${(tick / 30) * 100}%` }}
                      aria-hidden
                    />
                  ))}
                  {indexed.map(({ p, idx }) => (
                    <span
                      key={p.id}
                      title={`${p.nickname} · ${idx.toFixed(1)}`}
                      className="absolute top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white"
                      style={{
                        left: `${(Math.min(idx, 30) / 30) * 100}%`,
                        background: lane.ghost ? "transparent" : lane.color,
                        border: lane.ghost ? `2px solid ${lane.color}` : "none",
                      }}
                    />
                  ))}
                </div>
                <span className="w-24 shrink-0 text-right font-mono text-[10px] text-[#111]/50">
                  {low}L · {mid}M · {high}H
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-[#111]/45">
          L ≤ 12 · M 13–20 · H 21+ — scramble/shamble synergy wants low-high pairs (35% / 15%).
        </p>
      </div>

      {/* Draft flow */}
      {picks.length > 0 && (
        <div className="mt-8">
          <div className="text-xs uppercase tracking-[0.22em] text-[#111]/50">
            Draft flow — cumulative roster value by pick
          </div>
          <DraftFlowChart mine={flow.mine} justin={flow.justin} />
        </div>
      )}
    </section>
  );
}

function DraftFlowChart({
  mine,
  justin,
}: {
  mine: { pick: number; value: number; label: string }[];
  justin: { pick: number; value: number; label: string }[];
}) {
  const W = 720;
  const H = 220;
  const pad = { l: 44, r: 64, t: 16, b: 28 };
  const all = [...mine, ...justin];
  const yMax = Math.max(...all.map((d) => d.value)) * 1.08;
  const yMin = 0;
  const xMax = Math.max(TOTAL_DRAFT_PICKS, ...all.map((d) => d.pick));

  const sx = (v: number) => pad.l + (v / xMax) * (W - pad.l - pad.r);
  const sy = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - (v - yMin) / (yMax - yMin || 1));

  const path = (data: { pick: number; value: number }[]) =>
    data.map((d, i) => `${i === 0 ? "M" : "L"}${sx(d.pick).toFixed(1)},${sy(d.value).toFixed(1)}`).join(" ");

  const series = [
    { name: MY_CAPTAIN.nickname, data: mine, color: TEAM_COLORS.mine },
    { name: OPPONENT_CAPTAIN.nickname, data: justin, color: TEAM_COLORS.justin },
  ];

  return (
    <div className="mt-3 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[480px]" role="img" aria-label="Cumulative roster value by pick">
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={sy(yMax * t)} y2={sy(yMax * t)} stroke="#111" strokeOpacity="0.06" />
            <text x={pad.l - 8} y={sy(yMax * t) + 3} textAnchor="end" fontSize="10" fill="#111" fillOpacity="0.45">
              {Math.round(yMax * t)}
            </text>
          </g>
        ))}
        {Array.from({ length: xMax + 1 }, (_, i) => i)
          .filter((i) => i % 2 === 0)
          .map((i) => (
            <text key={i} x={sx(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#111" fillOpacity="0.45">
              {i}
            </text>
          ))}
        {series.map((s) => (
          <g key={s.name}>
            <path d={path(s.data)} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" />
            {s.data.map((d) => (
              <circle key={`${s.name}-${d.pick}`} cx={sx(d.pick)} cy={sy(d.value)} r="4" fill={s.color} stroke="#fff" strokeWidth="2">
                <title>{`Pick ${d.pick} · ${d.label} → ${s.name} at ${d.value.toFixed(1)}`}</title>
              </circle>
            ))}
            <text
              x={sx(s.data[s.data.length - 1].pick) + 8}
              y={sy(s.data[s.data.length - 1].value) + 4}
              fontSize="11"
              fontWeight="600"
              fill={s.color}
            >
              {s.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
