"use client";

import { useMemo, useState } from "react";
import { isCaptain } from "@/lib/players";
import {
  buildSaberBoard,
  completeDraft,
  currentDraftOwner,
  FORMAT_META,
  optimizePairs,
  projectTournament,
  rosterMetrics,
  simulateTournament,
  type DraftAssignment,
  type DraftSide,
  type PlayerSaberMetrics,
  type StrandFormat,
} from "@/lib/sabermetrics";
import type { PlayerDraftStats } from "@/lib/types";

const WIX_PICKS_FIRST = false;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function formatIndex(player: PlayerDraftStats): string {
  const value = player.indexNum ?? player.estimatedIndex;
  if (value === null || value === undefined) return "—";
  return value > 25 ? `${value.toFixed(1)}→25` : value.toFixed(1);
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

interface CandidateScenario {
  metric: PlayerSaberMetrics;
  wixProbability: number;
  impactVsMedian: number;
}

function candidateScenarios(
  players: PlayerDraftStats[],
  board: PlayerSaberMetrics[],
  assignments: DraftAssignment[],
  owner: DraftSide | null,
): CandidateScenario[] {
  if (!owner) return [];
  const assigned = new Set(assignments.map((assignment) => assignment.playerId));
  const candidates = board.filter(
    (metric) => !isCaptain(metric.player.id) && !assigned.has(metric.player.id),
  );
  const raw = candidates.map((metric) => {
    const forced = [...assignments, { playerId: metric.player.id, side: owner }];
    const completed = completeDraft(players, forced, WIX_PICKS_FIRST);
    const mine = rosterMetrics(completed.mine, board);
    const opponent = rosterMetrics(completed.opponent, board);
    return {
      metric,
      wixProbability: projectTournament(mine, opponent).analyticWinProbability,
      impactVsMedian: 0,
    };
  });
  const probabilities = raw.map((scenario) => scenario.wixProbability).sort((a, b) => a - b);
  const median = probabilities[Math.floor(probabilities.length / 2)] ?? 0.5;
  return raw
    .map((scenario) => ({
      ...scenario,
      impactVsMedian:
        owner === "mine"
          ? scenario.wixProbability - median
          : median - scenario.wixProbability,
    }))
    .sort((a, b) =>
      owner === "mine"
        ? b.wixProbability - a.wixProbability
        : a.wixProbability - b.wixProbability,
    );
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
  const [showAll, setShowAll] = useState(false);
  const board = useMemo(() => buildSaberBoard(players), [players]);
  const metricMap = useMemo(
    () => new Map(board.map((metric) => [metric.player.id, metric])),
    [board],
  );
  const owner = currentDraftOwner(assignments, WIX_PICKS_FIRST);
  const scenarios = useMemo(
    () => candidateScenarios(players, board, assignments, owner),
    [players, board, assignments, owner],
  );
  const projectedDraft = useMemo(
    () => completeDraft(players, assignments, WIX_PICKS_FIRST),
    [players, assignments],
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
  const roundCoverage = board.filter((metric) => metric.sampleSize > 0).length;
  const fullRoundSamples = board.reduce((sum, metric) => sum + metric.fullRoundSampleSize, 0);
  const lockedMine = assignments.filter((assignment) => assignment.side === "mine");
  const lockedOpponent = assignments.filter((assignment) => assignment.side === "opponent");

  const lockPick = (playerId: string) => {
    if (!owner || assignedIds.has(playerId)) return;
    setAssignments((current) => [...current, { playerId, side: owner }]);
  };

  const undoLast = () => setAssignments((current) => current.slice(0, -1));

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
              </div>
              <h2 className="mt-6 max-w-2xl text-3xl font-semibold tracking-[-0.035em] md:text-5xl">
                Draft the team that creates the most points.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65 md:text-base">
                Every recommendation is rebuilt from current index, recent differentials, variance,
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
                      {(topScenario.wixProbability * 100).toFixed(0)}%
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/45">WIX win after pick</div>
                  </div>
                </div>
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm leading-6 text-white/70">
                  {topScenario.metric.evidence.join(" · ")}. Projected Strand value: {formatEdge(topScenario.metric.strandValueAdded)} points versus an average player.
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

      <div className="rounded-[1.8rem] border border-black/10 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-black/40">Live draft state</div>
            <div className="mt-1 text-sm text-black/60">
              {lockedMine.length} Team WIX picks · {lockedOpponent.length} Team J-BONE picks · projection auto-completes the rest
            </div>
          </div>
          <div className="flex gap-2">
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

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[940px] border-collapse text-left">
            <thead>
              <tr className="border-b border-black/10 text-[10px] uppercase tracking-[0.14em] text-black/40">
                <th className="pb-3 pr-3 font-medium">Rank / player</th>
                <th className="px-3 pb-3 text-right font-medium">Index</th>
                <th className="px-3 pb-3 text-right font-medium">Net edge</th>
                <th className="px-3 pb-3 text-right font-medium">SVA</th>
                <th className="px-3 pb-3 font-medium">Singles</th>
                <th className="px-3 pb-3 font-medium">Pair formats</th>
                <th className="px-3 pb-3 font-medium">Data trust</th>
                <th className="pl-3 pb-3 text-right font-medium">Pick impact</th>
              </tr>
            </thead>
            <tbody>
              {visibleScenarios.map((scenario, index) => {
                const metric = scenario.metric;
                const pairAverage = average([
                  metric.format.foursomes,
                  metric.format.shamble,
                  metric.format.scramble,
                ]);
                return (
                  <tr key={metric.player.id} className="border-b border-black/[0.07] align-top last:border-0">
                    <td className="py-4 pr-3">
                      <div className="flex items-start gap-3">
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold ${index === 0 ? "bg-[#102f28] text-white" : "bg-black/[0.05] text-black/45"}`}>
                          {index + 1}
                        </span>
                        <div>
                          <div className="font-semibold">{metric.player.nickname}</div>
                          <div className="mt-0.5 text-xs text-black/45">{metric.player.name}</div>
                          <EvidenceList metric={metric} />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-right font-mono font-semibold">{formatIndex(metric.player)}</td>
                    <td className={`px-3 py-4 text-right font-mono font-semibold ${metric.netEdge >= 0.25 ? "text-emerald-700" : metric.netEdge <= -0.5 ? "text-orange-700" : "text-black/60"}`}>
                      {formatEdge(metric.netEdge)}
                    </td>
                    <td className={`px-3 py-4 text-right font-mono font-semibold ${metric.strandValueAdded >= 0 ? "text-emerald-700" : "text-orange-700"}`}>
                      {formatEdge(metric.strandValueAdded)}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2">
                        <span className="w-7 font-mono text-xs">{metric.format.singles.toFixed(0)}</span>
                        <div className="w-20"><MetricBar value={metric.format.singles} /></div>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2">
                        <span className="w-7 font-mono text-xs">{pairAverage.toFixed(0)}</span>
                        <div className="w-20"><MetricBar value={pairAverage} tone="sand" /></div>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${confidenceTone(metric.confidence)}`}>
                        {metric.confidenceLabel} · {metric.confidence.toFixed(0)}
                      </span>
                      <div className="mt-1 text-[10px] text-black/40">{metric.fullRoundSampleSize} full rounds</div>
                    </td>
                    <td className="py-4 pl-3 text-right">
                      <div className={`font-mono text-sm font-semibold ${scenario.impactVsMedian > 0.005 ? "text-emerald-700" : "text-black/60"}`}>
                        {scenario.impactVsMedian >= 0 ? "+" : ""}{(scenario.impactVsMedian * 100).toFixed(1)} pp
                      </div>
                      <button
                        onClick={() => lockPick(metric.player.id)}
                        className="mt-2 rounded-xl bg-[#102f28] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white"
                      >
                        {owner === "mine" ? "Draft" : "Taken"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
            These use the projected final roster. Alternate shot rewards reliable floors; shamble and scramble reward useful skill and handicap contrast.
          </p>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {(["foursomes", "shamble", "scramble"] as const).map((format) => {
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
              <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-black/40">Players with rounds</div>
            </div>
            <div className="rounded-2xl bg-[#f7f5f0] p-4">
              <div className="font-mono text-2xl font-semibold">{fullRoundSamples}</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-black/40">Full-round samples</div>
            </div>
            <div className="rounded-2xl bg-[#f7f5f0] p-4">
              <div className="font-mono text-2xl font-semibold">{avgConfidence.toFixed(0)}</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-black/40">Average confidence</div>
            </div>
            <div className="rounded-2xl bg-[#f7f5f0] p-4">
              <div className="font-mono text-2xl font-semibold">75</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-black/40">Event points</div>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-xs leading-5 text-black/55">
            <p><b className="text-black/75">SVA</b> is projected Strand Value Added versus the average available golfer across all four weighted formats.</p>
            <p><b className="text-black/75">Net Edge</b> compares current playing index with the best recent 40% of posted differentials, then shrinks small samples toward zero.</p>
            <p><b className="text-black/75">Do not overread history.</b> Team championships receive only a small, Bayesian-shrunk weight because partners and opponents are missing from the archive.</p>
          </div>
        </section>
      </div>

      <div className="rounded-[1.6rem] border border-dashed border-black/15 bg-white/55 p-5 text-xs leading-5 text-black/50">
        <b className="text-black/70">Model v1.0:</b> the simulator creates front-nine, back-nine and overall match outcomes from each format matchup. Course-fit ratings are currently evidence-based proxies; true shot-level Gamble Sands and Scarecrow data will replace them as scorecards are captured.
      </div>
    </section>
  );
}
