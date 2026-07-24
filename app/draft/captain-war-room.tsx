"use client";

import { useEffect, useMemo, useState } from "react";
import { isCaptain } from "@/lib/players";
import { DRAFT_TEAM_TRANSFER_KEY, type DraftTeamTransfer } from "@/lib/live-scoring";
import {
  buildSaberBoard,
  completeDraft,
  currentDraftOwner,
  FORMAT_META,
  optimizePairs,
  rankDraftCandidates,
  rosterMetrics,
  simulateTournament,
  type CaptainIntel,
  type CaptainIntelMap,
  type DraftAssignment,
  type PlayerSaberMetrics,
  type StrandFormat,
} from "@/lib/sabermetrics";
import { CAPTAIN_INTEL_STORAGE_KEY, officialDraftSide } from "@/lib/draft-order";
import { buildFinalScoutCase } from "@/lib/final-scouting";
import type { PlayerDraftStats } from "@/lib/types";
import CaptainIntelPanel from "./captain-intel-panel";

const DRAFT_STORAGE_KEY = "strand-2026-wix-draft-v4";
const LEGACY_DRAFT_STORAGE_KEY = "strand-2026-wix-draft-v3";

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function formatIndex(player: PlayerDraftStats): string {
  const value = player.indexNum ?? player.estimatedIndex;
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(1)}${player.eventIndexCapped ? "*" : ""}`;
}

function formatEdge(value: number): string {
  if (Math.abs(value) < 0.05) return "0.0";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}`;
}

function confidenceTone(value: number) {
  if (value >= 75) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (value >= 50) return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-orange-200 bg-orange-50 text-orange-800";
}

function probabilityTone(value: number) {
  if (value >= 0.58) return "text-emerald-300";
  if (value >= 0.48) return "text-amber-200";
  return "text-orange-300";
}

function MetricBar({ value, tone = "green" }: { value: number; tone?: "green" | "orange" | "sand" }) {
  const color = tone === "orange" ? "bg-[#d36b35]" : tone === "sand" ? "bg-[#d2b47b]" : "bg-[#2d6a4f]";
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-black/10">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${clamp(value, 2, 100)}%` }} />
    </div>
  );
}

function EvidenceList({ metric }: { metric: PlayerSaberMetrics }) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {metric.evidence.map((item) => (
        <span
          key={item}
          className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[10px] text-black/60"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function metricValue(value: number | null, suffix = "", digits = 1) {
  return value === null ? "—" : `${value.toFixed(digits)}${suffix}`;
}

function DataPoint({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border border-black/[0.07] bg-white p-3">
      <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-black/35">{label}</div>
      <div className="mt-1 font-mono text-sm font-semibold text-black/80">{value}</div>
      {note && <div className="mt-1 text-[10px] leading-4 text-black/40">{note}</div>}
    </div>
  );
}

function InsightCard({
  eyebrow,
  metric,
  stat,
  note,
  tone = "green",
}: {
  eyebrow: string;
  metric: PlayerSaberMetrics;
  stat: string;
  note: string;
  tone?: "green" | "sand" | "orange";
}) {
  const accent = tone === "orange" ? "bg-[#d36b35]" : tone === "sand" ? "bg-[#d2b47b]" : "bg-[#2d6a4f]";
  return (
    <article className="relative overflow-hidden rounded-[1.5rem] border border-black/10 bg-white p-4 shadow-sm">
      <span className={`absolute inset-y-0 left-0 w-1 ${accent}`} />
      <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-black/40">{eyebrow}</div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          <div className="text-lg font-semibold tracking-tight">{metric.player.nickname}</div>
          <div className="text-[11px] text-black/45">{metric.player.name}</div>
        </div>
        <div className="font-mono text-xl font-semibold">{stat}</div>
      </div>
      <p className="mt-3 text-xs leading-5 text-black/55">{note}</p>
    </article>
  );
}

function RecentLedger({ metric }: { metric: PlayerSaberMetrics }) {
  const recent = (metric.player.recentRounds ?? []).slice(0, 10);
  if (!recent.length) {
    const aggregate = metric.player.reportedScoring;
    if (aggregate) {
      return (
        <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4">
          <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-sky-800/60">Garmin Connect aggregate</div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <DataPoint label="Recent sample" value={`${aggregate.sampleSize} rounds`} note="Individual cards unavailable" />
            <DataPoint label="Lifetime rounds" value={aggregate.lifetimeRounds?.toLocaleString() ?? "—"} note="Experience signal only" />
            <DataPoint label="9-hole average" value={aggregate.averageToPar9 === undefined ? "—" : `+${aggregate.averageToPar9}`} note="Latest aggregate" />
            <DataPoint label="18-hole average" value={aggregate.averageToPar18 === undefined ? "—" : `+${aggregate.averageToPar18}`} note="Latest aggregate" />
            <DataPoint
              label="Personal bests"
              value={`${aggregate.bestToPar9 === undefined ? "—" : `+${aggregate.bestToPar9} / 9`} · ${aggregate.bestToPar18 === undefined ? "—" : `+${aggregate.bestToPar18} / 18`}`}
              note={aggregate.badges?.join(" · ")}
            />
          </div>
          <p className="mt-3 text-[10px] leading-4 text-sky-950/55">Used as a bounded confidence signal only. Course, tee, dates and round-level variance are unavailable, so the model does not manufacture differentials.</p>
        </div>
      );
    }
    return (
      <div className="mt-4 rounded-xl border border-dashed border-black/10 bg-white/60 p-4 text-xs text-black/50">
        No scorecards available. {metric.player.reportedRounds2026
          ? `${metric.player.reportedRounds2026} rounds were reported in 2026, but the scores are unknown.`
          : "The model uses the available playing-index estimate with low confidence."}
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-black/[0.07] bg-white">
      <div className="hidden grid-cols-[78px_1fr_70px_70px_90px] gap-3 border-b border-black/[0.06] bg-black/[0.025] px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.13em] text-black/35 md:grid">
        <span>Date</span><span>Course / tee</span><span className="text-right">Score</span><span className="text-right">Diff</span><span className="text-right">Rating / slope</span>
      </div>
      {recent.map((round, index) => (
        <div key={`${round.date}-${round.course}-${index}`} className="grid grid-cols-[1fr_auto] gap-2 border-b border-black/[0.05] px-3 py-2.5 text-xs last:border-0 md:grid-cols-[78px_1fr_70px_70px_90px] md:gap-3">
          <span className="font-mono text-black/45">{round.date.slice(5)}</span>
          <span className="min-w-0 truncate text-black/65" title={`${round.course ?? "Course unavailable"}${round.teeName ? ` · ${round.teeName}` : ""}`}>
            {round.course ?? "Course unavailable"}{round.teeName ? ` · ${round.teeName}` : ""}
          </span>
          <span className="font-mono font-semibold md:text-right">{round.score}{round.nineHole ? "*" : ""}</span>
          <span className="font-mono text-black/60 md:text-right">{round.differential?.toFixed(1) ?? "—"}</span>
          <span className="col-span-2 font-mono text-[10px] text-black/40 md:col-span-1 md:text-right">
            {round.courseRating?.toFixed(1) ?? "—"} / {round.slopeRating ?? "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

function PlayerIntel({ metric }: { metric: PlayerSaberMetrics }) {
  const p = metric.performance;
  const doubleAvoidance = p.doubleBogeyPct !== null || p.tripleBogeyPct !== null
    ? 100 - (p.doubleBogeyPct ?? 0) - (p.tripleBogeyPct ?? 0)
    : null;
  const trend = p.trend === null ? "—" : `${p.trend >= 0 ? "+" : ""}${p.trend.toFixed(1)}`;

  return (
    <div className="grid gap-4 border-t border-black/[0.07] bg-[#f8f6f1] p-4 md:grid-cols-2 xl:grid-cols-4">
      <div>
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/40">Form & range</div>
        <div className="grid grid-cols-2 gap-2">
          <DataPoint label="Last 5 diff" value={metricValue(p.recent5)} />
          <DataPoint label="Last 10 diff" value={metricValue(p.recent10)} />
          <DataPoint label="Trend vs prior 5" value={trend} note="Positive is improving" />
          <DataPoint label="Ceiling / floor" value={`${metricValue(p.ceiling)} / ${metricValue(p.floor)}`} />
        </div>
      </div>
      <div>
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/40">Travel & pressure</div>
        <div className="grid grid-cols-2 gap-2">
          <DataPoint label="Away diff" value={metricValue(p.awayDifferential)} note={`${p.awayRounds} rounds`} />
          <DataPoint label="Competition diff" value={metricValue(p.competitiveDifferential)} note={`${p.competitiveRounds} rounds`} />
          <DataPoint label="Avg rating / slope" value={`${metricValue(p.averageCourseRating)} / ${metricValue(p.averageSlope, "", 0)}`} />
          <DataPoint label="Activity" value={`${p.activity30} / ${p.activity90}`} note="Rounds in 30 / 90 days" />
        </div>
      </div>
      <div>
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/40">Shot profile</div>
        <div className="grid grid-cols-2 gap-2">
          <DataPoint label="GIR / fairways" value={`${metricValue(p.girPct, "%", 0)} / ${metricValue(p.fairwayPct, "%", 0)}`} />
          <DataPoint label="Putts / 18" value={metricValue(p.puttsPer18)} />
          <DataPoint label="Birdie+" value={metricValue(p.birdieOrBetterPct, "%", 0)} />
          <DataPoint label="Avoids doubles+" value={metricValue(doubleAvoidance, "%", 0)} />
        </div>
      </div>
      <div>
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/40">Data file</div>
        <div className="grid grid-cols-2 gap-2">
          <DataPoint
            label="Scoring sample"
            value={metric.aggregateSampleSize ? `${p.roundCount} + ${metric.aggregateSampleSize} avg` : `${p.roundCount}`}
            note={metric.aggregateSampleSize ? "scorecards + aggregate" : `${p.fullRoundCount} full`}
          />
          <DataPoint label="Shot-stat rounds" value={`${p.statRoundCount}`} />
          <DataPoint label="Used in index" value={`${p.usedInIndexCount}`} />
          <DataPoint label="Last post" value={p.latestRoundDate ?? "—"} note={`${metric.player.recentRoundsSource ?? "no round feed"} · ${metric.confidenceLabel.toLowerCase()} confidence`} />
        </div>
      </div>
      <div className="md:col-span-2 xl:col-span-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/40">Recent scoring ledger</div>
            <div className="mt-1 text-xs text-black/45">
              {metric.player.reportedScoring && !(metric.player.recentRounds?.length)
                ? "Aggregate summary only · individual scorecards unavailable"
                : "Newest 10 rounds · full history remains in the model"}
            </div>
          </div>
          {metric.player.blurb && <div className="max-w-2xl text-xs leading-5 text-black/55">Scout: {metric.player.blurb}</div>}
        </div>
        <RecentLedger metric={metric} />
      </div>
    </div>
  );
}

function FinalScoutCard({
  metric,
  rank,
}: {
  metric: PlayerSaberMetrics;
  rank: number;
}) {
  const scout = buildFinalScoutCase(metric);
  return (
    <article className="flex h-full flex-col rounded-[1.55rem] border border-black/[0.08] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold ${
              rank <= 3 ? "bg-[#102f28] text-white" : "bg-black/[0.05] text-black/45"
            }`}
          >
            {rank}
          </span>
          <div>
            <div className="font-semibold tracking-tight">{metric.player.nickname}</div>
            <div className="text-[10px] text-black/40">
              {metric.player.name} · {formatIndex(metric.player)} index
            </div>
          </div>
        </div>
        <span className={`rounded-full border px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.11em] ${confidenceTone(metric.confidence)}`}>
          {metric.confidenceLabel}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-[#ece7db] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#102f28]">
          {scout.role}
        </span>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-800">
          Best: {scout.bestFormatLabel} {scout.bestFormatScore.toFixed(0)}
        </span>
      </div>

      <p className="mt-4 text-xs leading-5 text-black/65">{scout.bestCase}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {scout.proof.map((item) => (
          <span key={item} className="rounded-full border border-black/[0.07] bg-[#faf9f6] px-2 py-1 text-[9px] text-black/50">
            {item}
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-2 border-t border-black/[0.06] pt-4">
        <div className="rounded-xl bg-emerald-50/70 p-3">
          <div className="text-[8px] font-semibold uppercase tracking-[0.14em] text-emerald-800/55">Winning deployment</div>
          <p className="mt-1 text-[10px] leading-4 text-emerald-950/65">{scout.deployment}</p>
        </div>
        <div className="rounded-xl bg-orange-50/70 p-3">
          <div className="text-[8px] font-semibold uppercase tracking-[0.14em] text-orange-800/55">What must be true</div>
          <p className="mt-1 text-[10px] leading-4 text-orange-950/65">{scout.caution}</p>
        </div>
      </div>
    </article>
  );
}

function FormatCard({
  format,
  mine,
  available,
}: {
  format: StrandFormat;
  mine: number;
  available: number;
}) {
  const meta = FORMAT_META[format];
  const share = available ? (mine / available) * 100 : 50;
  return (
    <article className="rounded-[1.6rem] border border-black/10 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40">
            {meta.round} · {meta.course}
          </div>
          <h3 className="mt-1 font-semibold">{meta.label}</h3>
        </div>
        <div className="text-right">
          <div className="font-mono text-lg font-semibold">{mine.toFixed(1)}</div>
          <div className="text-[10px] text-black/40">of {available}</div>
        </div>
      </div>
      <div className="mt-4">
        <MetricBar value={share} tone={share >= 50 ? "green" : "orange"} />
      </div>
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.12em] text-black/40">
        <span>{Math.round(share)}% share</span>
        <span>{meta.weight * 100}% of event</span>
      </div>
    </article>
  );
}

export default function CaptainWarRoom({ players }: { players: PlayerDraftStats[] }) {
  const [assignments, setAssignments] = useState<DraftAssignment[]>([]);
  const [draftRestored, setDraftRestored] = useState(false);
  const [captainIntel, setCaptainIntel] = useState<CaptainIntelMap>({});
  const [intelRestored, setIntelRestored] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const board = useMemo(() => buildSaberBoard(players, captainIntel), [players, captainIntel]);
  useEffect(() => {
    try {
      const stored =
        window.localStorage.getItem(DRAFT_STORAGE_KEY) ??
        window.localStorage.getItem(LEGACY_DRAFT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as DraftAssignment[];
        const validIds = new Set(players.filter((player) => !isCaptain(player.id)).map((player) => player.id));
        const normalized = parsed
          .filter((assignment) => validIds.has(assignment.playerId))
          .slice(0, 18)
          .map((assignment, index) => ({
            playerId: assignment.playerId,
            side: officialDraftSide(index + 1),
          }));
        // Restore the external localStorage snapshot after hydration.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAssignments(normalized);
        window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(normalized));
      }
    } catch {
      // Corrupt local state should never block the war room.
    } finally {
      setDraftRestored(true);
    }
  }, [players]);

  useEffect(() => {
    if (!draftRestored) return;
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(assignments));
  }, [assignments, draftRestored]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CAPTAIN_INTEL_STORAGE_KEY);
      if (stored) {
        // Restore the external localStorage snapshot after hydration.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCaptainIntel(JSON.parse(stored) as CaptainIntelMap);
      }
    } catch {
      // Captain intel is optional; bad local state falls back to the data-only model.
    } finally {
      setIntelRestored(true);
    }
  }, []);

  useEffect(() => {
    if (!intelRestored) return;
    window.localStorage.setItem(CAPTAIN_INTEL_STORAGE_KEY, JSON.stringify(captainIntel));
  }, [captainIntel, intelRestored]);
  const metricMap = useMemo(
    () => new Map(board.map((metric) => [metric.player.id, metric])),
    [board],
  );
  const owner = currentDraftOwner(assignments);
  const scenarios = useMemo(
    () => rankDraftCandidates(players, board, assignments, owner),
    [players, board, assignments, owner],
  );
  const projectedDraft = useMemo(
    () => completeDraft(players, assignments, board),
    [players, assignments, board],
  );
  const projectedMine = useMemo(
    () => rosterMetrics(projectedDraft.mine, board),
    [projectedDraft.mine, board],
  );
  const projectedOpponent = useMemo(
    () => rosterMetrics(projectedDraft.opponent, board),
    [projectedDraft.opponent, board],
  );
  const simulation = useMemo(
    () => simulateTournament(projectedMine, projectedOpponent),
    [projectedMine, projectedOpponent],
  );
  const topScenario = scenarios[0];
  const assignedIds = useMemo(
    () => new Set(assignments.map((assignment) => assignment.playerId)),
    [assignments],
  );
  const visibleScenarios = showAll ? scenarios : scenarios.slice(0, 8);
  const avgConfidence = average(board.map((metric) => metric.confidence));
  const roundCoverage = board.filter((metric) => metric.sampleSize > 0 || metric.aggregateSampleSize > 0).length;
  const roundsModeled = board.reduce((sum, metric) => sum + metric.performance.roundCount, 0);
  const aggregateRounds = board.reduce((sum, metric) => sum + metric.aggregateSampleSize, 0);
  const eventHandicapCoverage = board.filter((metric) => metric.player.eventIndex2026 !== undefined).length;
  const detailedRounds = board.reduce((sum, metric) => sum + metric.performance.detailedRoundCount, 0);
  const puttingRounds = board.reduce(
    (sum, metric) => sum + (metric.player.recentRounds ?? []).filter((round) => round.shotStats?.putts != null).length,
    0,
  );
  const draftableBoard = board.filter(
    (metric) => !isCaptain(metric.player.id) && !assignedIds.has(metric.player.id),
  );
  const finalScoutBoard = board.filter((metric) => !isCaptain(metric.player.id));
  const valueTarget = draftableBoard[0];
  const safeAnchor = [...draftableBoard].sort(
    (a, b) => (b.consistency * 0.55 + b.confidence * 0.45) - (a.consistency * 0.55 + a.confidence * 0.45),
  )[0];
  const ceilingPlay = [...draftableBoard].sort((a, b) => b.ceiling - a.ceiling)[0];
  const riskFlag = [...draftableBoard].sort(
    (a, b) => (a.confidence - a.volatility * 2.2) - (b.confidence - b.volatility * 2.2),
  )[0];
  const lockedMine = assignments.filter((assignment) => assignment.side === "mine");
  const lockedOpponent = assignments.filter((assignment) => assignment.side === "opponent");

  const lockPick = (playerId: string) => {
    if (!owner || assignedIds.has(playerId)) return;
    setAssignments((current) => [...current, { playerId, side: owner }]);
  };

  const undoLast = () => setAssignments((current) => current.slice(0, -1));

  const sendTeamsToScoring = () => {
    if (assignments.length !== 18) return;
    const transfer: DraftTeamTransfer = {
      version: 1,
      capturedAt: new Date().toISOString(),
      wixPlayerIds: projectedDraft.mine.map((player) => player.id),
      jbonePlayerIds: projectedDraft.opponent.map((player) => player.id),
    };
    window.localStorage.setItem(DRAFT_TEAM_TRANSFER_KEY, JSON.stringify(transfer));
    window.location.assign("/live/setup");
  };

  const updateCaptainIntel = (playerId: string, value: CaptainIntel) => {
    setCaptainIntel((current) => ({
      ...current,
      [playerId]: value,
    }));
  };

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[2.2rem] bg-[#102f28] text-white shadow-[0_24px_70px_rgba(16,47,40,0.22)]">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden p-6 md:p-9">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#d2b47b]/10 blur-2xl" />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75">
                  Private · Captain WIX
                </span>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-100">
                  {simulation.simulations.toLocaleString()} event simulations
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/60">
                  {roundsModeled} rounds modeled
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/60">
                  {eventHandicapCoverage}/20 2026 HCs locked
                </span>
              </div>
              <h2 className="mt-6 max-w-2xl text-3xl font-semibold tracking-[-0.035em] md:text-5xl">
                Draft the team that creates the most points.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65 md:text-base">
                Every recommendation now blends index and low-index history, multi-window form,
                course difficulty, travel and competition splits, mistake avoidance, shot stats,
                format fit, partner lift and the board J-BONE is likely to leave behind.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">Team WIX win</div>
                  <div className={`mt-1 font-mono text-4xl font-semibold ${probabilityTone(simulation.winProbability)}`}>
                    {(simulation.winProbability * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">Expected score</div>
                  <div className="mt-2 font-mono text-2xl font-semibold">
                    {simulation.mineExpected.toFixed(1)}–{simulation.opponentExpected.toFixed(1)}
                  </div>
                  <div className="mt-1 text-[10px] text-white/45">{simulation.availablePoints} points available</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/45">80% outcome band</div>
                  <div className="mt-2 font-mono text-2xl font-semibold">
                    {simulation.mineP10.toFixed(1)}–{simulation.mineP90.toFixed(1)}
                  </div>
                  <div className="mt-1 text-[10px] text-white/45">Team WIX points</div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 bg-black/15 p-6 md:p-9 lg:border-l lg:border-t-0">
            <div className="text-[10px] uppercase tracking-[0.24em] text-white/45">
              Pick #{assignments.length + 1} · {owner === "mine" ? "WIX on the clock" : owner === "opponent" ? "J-BONE on the clock" : "Draft complete"}
            </div>
            {topScenario ? (
              <>
                <div className="mt-5 text-sm uppercase tracking-[0.14em] text-[#d2b47b]">
                  {owner === "mine" ? "Best move" : "Biggest threat"}
                </div>
                <div className="mt-1 flex items-end justify-between gap-3">
                  <div>
                    <div className="text-4xl font-semibold tracking-tight">{topScenario.metric.player.nickname}</div>
                    <div className="mt-1 text-sm text-white/55">
                      {formatIndex(topScenario.metric.player)} index · {topScenario.metric.confidenceLabel.toLowerCase()} confidence
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-2xl font-semibold">
                      {((owner === "mine" ? topScenario.robustProbability : topScenario.wixProbability) * 100).toFixed(0)}%
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/45">
                      {owner === "mine" ? "robust WIX win" : "WIX win after pick"}
                    </div>
                  </div>
                </div>
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm leading-6 text-white/70">
                  {topScenario.metric.evidence.join(" · ")}. Projected Strand value: {formatEdge(topScenario.metric.strandValueAdded)} points versus an average player.
                  {owner === "mine" && (
                    <> Downside tested against all {topScenario.responseCount} possible immediate J-BONE responses: {(topScenario.floorProbability * 100).toFixed(0)}% floor.</>
                  )}
                </div>
                <button
                  onClick={() => lockPick(topScenario.metric.player.id)}
                  className={`mt-5 w-full rounded-2xl px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.16em] transition-transform active:scale-[0.99] ${
                    owner === "mine" ? "bg-[#d2b47b] text-[#102f28]" : "bg-white text-[#102f28]"
                  }`}
                >
                  {owner === "mine" ? "Draft to Team WIX" : "Mark J-BONE pick"}
                </button>
              </>
            ) : (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.06] p-5 text-white/70">
                Both ten-man rosters are locked. Move to The Matchmaker and attack the pairings.
              </div>
            )}
          </div>
        </div>
      </div>

      {valueTarget && safeAnchor && ceilingPlay && riskFlag && (
        <section>
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/40">Decision desk</div>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">The board in four calls</h2>
            </div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-black/40">Auto-updates after every pick</div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <InsightCard
              eyebrow="Best all-format value"
              metric={valueTarget}
              stat={`${valueTarget.draftGrade.toFixed(0)}`}
              note={`${formatEdge(valueTarget.strandValueAdded)} SVA · ${valueTarget.evidence.slice(0, 2).join(" · ")}`}
            />
            <InsightCard
              eyebrow="Safest anchor"
              metric={safeAnchor}
              stat={`${safeAnchor.consistency.toFixed(0)}`}
              note={`${safeAnchor.confidenceLabel} trust · ${safeAnchor.fullRoundSampleSize} full rounds · consistency score`}
              tone="sand"
            />
            <InsightCard
              eyebrow="Highest ceiling"
              metric={ceilingPlay}
              stat={`${ceilingPlay.ceiling.toFixed(0)}`}
              note={`Best-round upside for scramble and shamble. ${ceilingPlay.volatility.toFixed(1)} differential volatility.`}
              tone="green"
            />
            <InsightCard
              eyebrow="Risk flag"
              metric={riskFlag}
              stat={`${riskFlag.confidence.toFixed(0)}`}
              note={`${riskFlag.evidence.filter((item) => item.includes("thin") || item.includes("stale") || item.includes("cap")).join(" · ") || "Wide outcome range—pair with a high-floor player."}`}
              tone="orange"
            />
          </div>
        </section>
      )}

      <CaptainIntelPanel board={board} intel={captainIntel} onChange={updateCaptainIntel} />

      <section className="rounded-[2rem] border border-black/10 bg-[#ece7db] p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/40">Final 18 · best-case dossier</div>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.025em]">The strongest honest case for every player.</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-black/55">
              Ranked by the same 75-point event model as the live board. Each card separates the optimistic path from the condition that must hold, then shows how to deploy the player if you draft him.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.13em] text-black/50">
              Exact identity matches only
            </span>
            <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.13em] text-black/50">
              Refreshed Jul 23
            </span>
          </div>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {finalScoutBoard.map((metric, index) => (
            <FinalScoutCard key={metric.player.id} metric={metric} rank={index + 1} />
          ))}
        </div>
      </section>

      <div className="rounded-[1.8rem] border border-black/10 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-black/40">Live draft state</div>
            <div className="mt-1 text-sm text-black/60">
              {lockedMine.length} Team WIX picks · {lockedOpponent.length} Team J-BONE picks · projection auto-completes the rest
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-emerald-700/70">Saved automatically on this device</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={sendTeamsToScoring}
              disabled={assignments.length !== 18}
              className="rounded-xl bg-[#183d33] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:bg-black/5 disabled:text-black/30"
            >
              Send teams to scoring
            </button>
            <button
              onClick={undoLast}
              disabled={!assignments.length}
              className="rounded-xl border border-black/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-30"
            >
              Undo last
            </button>
            <button
              onClick={() => setAssignments([])}
              disabled={!assignments.length}
              className="rounded-xl border border-black/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black/50 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Reset
            </button>
          </div>
        </div>
        {assignments.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {assignments.map((assignment, index) => {
              const metric = metricMap.get(assignment.playerId);
              if (!metric) return null;
              return (
                <span
                  key={assignment.playerId}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    assignment.side === "mine"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border-orange-200 bg-orange-50 text-orange-900"
                  }`}
                >
                  #{index + 1} {metric.player.nickname} → {assignment.side === "mine" ? "WIX" : "J-BONE"}
                </span>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {simulation.formats.map((format) => (
          <FormatCard
            key={format.format}
            format={format.format}
            mine={format.mineExpected}
            available={format.availablePoints}
          />
        ))}
      </div>

      <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-black/40">Marginal draft value</div>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.025em]">
              {owner === "mine" ? "Best players for Team WIX now" : "Who J-BONE hurts us with most"}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-black/55">
              Ranked by the projected final team—not by handicap alone. “Pick impact” compares each option with the median remaining pick at this exact draft position.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-black/10 bg-[#f7f5f0] px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-black/50">
            Positive net edge is better
          </span>
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-black/[0.08]">
          <div className="hidden grid-cols-[minmax(240px,1.6fr)_70px_90px_110px_90px_105px_150px] gap-3 border-b border-black/[0.08] bg-[#f8f6f1] px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-black/35 lg:grid">
            <span>Player / evidence</span>
            <span className="text-right">Index</span>
            <span className="text-right">Net edge</span>
            <span className="text-right">Pick impact</span>
            <span className="text-right">Floor</span>
            <span className="text-right">Data trust</span>
            <span />
          </div>
          {visibleScenarios.map((scenario, index) => {
            const metric = scenario.metric;
            const isExpanded = expandedPlayer === metric.player.id;
            return (
              <article key={metric.player.id} className="border-b border-black/[0.07] last:border-0">
                <div className="grid gap-4 p-4 lg:grid-cols-[minmax(240px,1.6fr)_70px_90px_110px_90px_105px_150px] lg:items-center">
                  <div className="flex items-start gap-3">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold ${index === 0 ? "bg-[#102f28] text-white" : "bg-black/[0.05] text-black/45"}`}>
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-semibold">{metric.player.nickname}</span>
                        <span className="text-xs text-black/40">{metric.player.name}</span>
                        {index === 0 && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-800">
                            Best move
                          </span>
                        )}
                      </div>
                      <EvidenceList metric={metric} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:contents">
                    <div className="lg:text-right">
                      <div className="text-[9px] uppercase tracking-[0.12em] text-black/35 lg:hidden">Floor</div>
                      <div className="mt-1 font-mono text-sm font-semibold text-black/60 lg:mt-0">
                        {(scenario.floorProbability * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="lg:text-right">
                      <div className="text-[9px] uppercase tracking-[0.12em] text-black/35 lg:hidden">Index</div>
                      <div className="mt-1 font-mono text-sm font-semibold lg:mt-0">{formatIndex(metric.player)}</div>
                    </div>
                    <div className="lg:text-right">
                      <div className="text-[9px] uppercase tracking-[0.12em] text-black/35 lg:hidden">Net edge</div>
                      <div className={`mt-1 font-mono text-sm font-semibold lg:mt-0 ${metric.netEdge >= 0.25 ? "text-emerald-700" : metric.netEdge <= -0.5 ? "text-orange-700" : "text-black/60"}`}>
                        {formatEdge(metric.netEdge)}
                      </div>
                    </div>
                    <div className="lg:text-right">
                      <div className="text-[9px] uppercase tracking-[0.12em] text-black/35 lg:hidden">Pick impact</div>
                      <div className={`mt-1 font-mono text-sm font-semibold lg:mt-0 ${scenario.impactVsMedian > 0.005 ? "text-emerald-700" : "text-black/60"}`}>
                        {scenario.impactVsMedian >= 0 ? "+" : ""}{(scenario.impactVsMedian * 100).toFixed(1)} pp
                      </div>
                    </div>
                    <div className="lg:text-right">
                      <div className="text-[9px] uppercase tracking-[0.12em] text-black/35 lg:hidden">Trust</div>
                      <span className={`mt-1 inline-flex rounded-full border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] lg:mt-0 ${confidenceTone(metric.confidence)}`}>
                        {metric.confidenceLabel} · {metric.confidence.toFixed(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 lg:justify-end">
                    <button
                      onClick={() => setExpandedPlayer(isExpanded ? null : metric.player.id)}
                      className="rounded-xl border border-black/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.11em] text-black/60"
                    >
                      {isExpanded ? "Hide data" : "Full data"}
                    </button>
                    <button
                      onClick={() => lockPick(metric.player.id)}
                      className="rounded-xl bg-[#102f28] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.11em] text-white"
                    >
                      {owner === "mine" ? "Draft" : "Taken"}
                    </button>
                  </div>
                </div>
                {isExpanded && <PlayerIntel metric={metric} />}
              </article>
            );
          })}
        </div>
        {scenarios.length > 8 && (
          <button
            onClick={() => setShowAll((current) => !current)}
            className="mt-5 rounded-xl border border-black/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]"
          >
            {showAll ? "Show top 8" : `Show all ${scenarios.length}`}
          </button>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-[2rem] border border-black/10 bg-[#ece7db] p-5 shadow-sm md:p-7">
          <div className="text-[10px] uppercase tracking-[0.22em] text-black/40">The Matchmaker · projected Team WIX</div>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.025em]">Best partner combinations by format</h2>
          <p className="mt-2 text-sm leading-6 text-black/55">
            These use the projected final roster. Fourball rewards a dependable floor plus birdie ceiling; shamble and scramble reward useful skill and handicap contrast.
          </p>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {(["fourball", "shamble", "scramble"] as const).map((format) => {
              const pairs = optimizePairs(projectedMine, format);
              return (
                <div key={format} className="rounded-[1.5rem] border border-black/10 bg-white/75 p-4">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-black/40">
                    {FORMAT_META[format].round} · {FORMAT_META[format].label}
                  </div>
                  <div className="mt-3 space-y-2">
                    {pairs.map((pair, index) => (
                      <div key={`${pair.a.player.id}-${pair.b.player.id}`} className="rounded-xl border border-black/[0.07] bg-white p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold">{index + 1}. {pair.a.player.nickname} + {pair.b.player.nickname}</span>
                          <span className="font-mono text-xs font-semibold">{pair.score.toFixed(0)}</span>
                        </div>
                        <div className="mt-1 text-[10px] text-black/45">{pair.note} · lift {formatEdge(pair.lift)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-sm md:p-7">
          <div className="text-[10px] uppercase tracking-[0.22em] text-black/40">Model integrity</div>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.025em]">Trust the edge—know the limits.</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#f7f5f0] p-4">
              <div className="font-mono text-2xl font-semibold">{roundCoverage}/20</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-black/40">Players with scoring evidence</div>
            </div>
            <div className="rounded-2xl bg-[#f7f5f0] p-4">
              <div className="font-mono text-2xl font-semibold">{roundsModeled}</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-black/40">Scorecards modeled</div>
            </div>
            <div className="rounded-2xl bg-[#f7f5f0] p-4">
              <div className="font-mono text-2xl font-semibold">{detailedRounds}</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-black/40">Rating + slope rounds</div>
            </div>
            <div className="rounded-2xl bg-[#f7f5f0] p-4">
              <div className="font-mono text-2xl font-semibold">{puttingRounds}</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-black/40">Rounds with putts</div>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-xs leading-5 text-black/55">
            <p><b className="text-black/75">SVA</b> is projected Strand Value Added versus the average available golfer across all four weighted formats.</p>
            <p><b className="text-black/75">Net Edge</b> combines the best recent 40% of posted differentials, last-five trend, travel/competition evidence and confidence shrinkage.</p>
            <p><b className="text-black/75">Data trust {avgConfidence.toFixed(0)}/100.</b> Missing GIR, fairway or putting data stays neutral and never counts as poor performance.</p>
            <p><b className="text-black/75">Do not overread history.</b> Team championships receive only a small, Bayesian-shrunk weight because partners and opponents are missing from the archive.</p>
          </div>
        </section>
      </div>

      <div className="rounded-[1.6rem] border border-dashed border-black/15 bg-white/55 p-5 text-xs leading-5 text-black/50">
        <b className="text-black/70">Strand Sabr v3.5:</b> all {eventHandicapCoverage} event handicaps are locked to the supplied 2026 roster sheet; GHIN, TheGrint and Garmin remain performance provenance. The model uses {roundsModeled} attributable scorecards plus {aggregateRounds} recent Garmin aggregate rounds across {roundCoverage} players, including {detailedRounds} rating/slope rounds and {puttingRounds} rounds with recorded putts. The Jul 23 public-source sweep accepted only exact identity matches: Kane&apos;s 120-round lifetime total improves experience confidence but never creates synthetic form, while ambiguous same-name results and login-gated data are excluded. Tournament weights mirror the 75-point schedule: Fourball 20%, Shamble 20%, Singles 40% and Scramble 20%. Course fit reflects Gamble Sands&apos; ground-game choices and Scarecrow&apos;s angle-dependent smaller targets. Missing fields stay neutral.
      </div>
    </section>
  );
}
