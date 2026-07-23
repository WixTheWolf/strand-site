"use client";

import Image from "next/image";
import { useMemo } from "react";
import { getPlayerPhoto } from "@/lib/player-assets";
import {
  buildSaberBoard,
  completeDraft,
  rankDraftCandidates,
  rosterMetrics,
  simulateTournament,
  type CaptainIntelMap,
  type DraftAssignment,
} from "@/lib/sabermetrics";
import { MY_CAPTAIN, OPPONENT_CAPTAIN, type DraftPick } from "@/lib/mock-draft";
import type { PlayerDraftStats } from "@/lib/types";

const TEAM_COLORS = { mine: "#2e8b64", opponent: "#d2691e" } as const;

function formatIndex(player: PlayerDraftStats): string {
  const value = player.indexNum ?? player.estimatedIndex;
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(1)}${player.eventIndexCapped ? "*" : ""}`;
}

interface DraftAnalyticsProps {
  players: PlayerDraftStats[];
  myRoster: PlayerDraftStats[];
  justinRoster: PlayerDraftStats[];
  available: PlayerDraftStats[];
  currentOwner: "mine" | "justin" | null;
  draftComplete: boolean;
  picks: DraftPick[];
  captainIntel: CaptainIntelMap;
}

export default function DraftAnalytics({
  players,
  myRoster,
  justinRoster,
  currentOwner,
  draftComplete,
  picks,
  captainIntel,
}: DraftAnalyticsProps) {
  const board = useMemo(
    () => buildSaberBoard(players, captainIntel),
    [players, captainIntel],
  );
  const assignments = useMemo<DraftAssignment[]>(
    () =>
      picks.map((pick) => ({
        playerId: pick.playerId,
        side: pick.side === "mine" ? "mine" : "opponent",
      })),
    [picks],
  );
  const projection = useMemo(
    () => completeDraft(players, assignments, board),
    [players, assignments, board],
  );
  const projectedMine = useMemo(
    () => rosterMetrics(projection.mine, board),
    [projection.mine, board],
  );
  const projectedOpponent = useMemo(
    () => rosterMetrics(projection.opponent, board),
    [projection.opponent, board],
  );
  const simulation = useMemo(
    () => simulateTournament(projectedMine, projectedOpponent),
    [projectedMine, projectedOpponent],
  );
  const scenarios = useMemo(
    () =>
      rankDraftCandidates(
        players,
        board,
        assignments,
        currentOwner === "mine" ? "mine" : currentOwner === "justin" ? "opponent" : null,
      ),
    [players, board, assignments, currentOwner],
  );
  const metricMap = useMemo(
    () => new Map(board.map((metric) => [metric.player.id, metric])),
    [board],
  );

  const winPct = Math.round(simulation.winProbability * 100);
  const currentMineValue = myRoster.reduce(
    (sum, player) => sum + (metricMap.get(player.id)?.tournamentScore ?? 0),
    0,
  );
  const currentOpponentValue = justinRoster.reduce(
    (sum, player) => sum + (metricMap.get(player.id)?.tournamentScore ?? 0),
    0,
  );

  return (
    <section className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm">
      <header className="border-b border-black/[0.07] p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/40">
              Strand Sabr · same model as War Room
            </div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Projected draft outcome</h2>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-black/50">
              Every legal player is tested at this pick. On WIX turns, each option is also tested
              against every possible immediate J-BONE response.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-black/50">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: TEAM_COLORS.mine }} />
              {MY_CAPTAIN.nickname}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: TEAM_COLORS.opponent }} />
              {OPPONENT_CAPTAIN.nickname}
            </span>
          </div>
        </div>
      </header>

      <div className="grid gap-px bg-black/[0.07] md:grid-cols-3">
        <div className="bg-[#102f28] p-5 text-white md:p-6">
          <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45">
            {draftComplete ? "Final roster win probability" : "Projected finish"}
          </div>
          <div className="mt-2 font-mono text-5xl font-semibold text-emerald-300">{winPct}%</div>
          <div className="mt-2 text-xs text-white/55">
            Expected {simulation.mineExpected.toFixed(1)}–{simulation.opponentExpected.toFixed(1)}
          </div>
          <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-white/10">
            <div className="bg-emerald-400" style={{ width: `${winPct}%` }} />
          </div>
        </div>
        <div className="bg-[#f8f6f1] p-5 md:p-6">
          <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-black/35">
            Current WIX roster signal
          </div>
          <div className="mt-2 font-mono text-4xl font-semibold text-emerald-800">
            {currentMineValue.toFixed(0)}
          </div>
          <div className="mt-2 text-xs text-black/45">{myRoster.length}/10 players locked</div>
        </div>
        <div className="bg-[#f8f6f1] p-5 md:p-6">
          <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-black/35">
            Current J-BONE roster signal
          </div>
          <div className="mt-2 font-mono text-4xl font-semibold text-orange-800">
            {currentOpponentValue.toFixed(0)}
          </div>
          <div className="mt-2 text-xs text-black/45">{justinRoster.length}/10 players locked</div>
        </div>
      </div>

      {!draftComplete && scenarios.length > 0 && (
        <div className="p-5 md:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40">
                {currentOwner === "mine" ? "Your best responses" : "Most damaging J-BONE choices"}
              </div>
              <h3 className="mt-1 text-lg font-semibold">
                {currentOwner === "mine" ? "The pick board right now" : "What to expect"}
              </h3>
            </div>
            <div className="text-right text-[9px] uppercase tracking-[0.13em] text-black/35">
              5,000 event simulations
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {scenarios.slice(0, 5).map((scenario, index) => {
              const player = scenario.metric.player;
              const photo = getPlayerPhoto(player.id);
              const primaryProbability =
                currentOwner === "mine" ? scenario.robustProbability : scenario.wixProbability;
              return (
                <article
                  key={player.id}
                  className={`rounded-2xl border p-4 ${
                    index === 0
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-black/[0.08] bg-[#f8f6f1]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-black/35">#{index + 1}</span>
                    {photo ? (
                      <div className="relative h-10 w-10 overflow-hidden rounded-full border border-black/10">
                        <Image src={photo} alt="" fill className="object-cover object-top" sizes="40px" />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.06] text-[10px] font-semibold">
                        {player.initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{player.nickname}</div>
                      <div className="font-mono text-[10px] text-black/40">{formatIndex(player)} index</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="font-mono text-2xl font-semibold">
                        {(primaryProbability * 100).toFixed(0)}%
                      </div>
                      <div className="text-[9px] uppercase tracking-[0.12em] text-black/35">
                        WIX win
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-semibold text-emerald-800">
                        {scenario.impactVsMedian >= 0 ? "+" : ""}
                        {(scenario.impactVsMedian * 100).toFixed(1)} pp
                      </div>
                      <div className="text-[9px] uppercase tracking-[0.12em] text-black/35">pick impact</div>
                    </div>
                  </div>
                  {currentOwner === "mine" && (
                    <div className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-[10px] text-black/50">
                      Worst J-BONE reply: {(scenario.floorProbability * 100).toFixed(0)}% · tested{" "}
                      {scenario.responseCount} responses
                    </div>
                  )}
                  <p className="mt-3 line-clamp-3 text-[10px] leading-4 text-black/50">
                    {scenario.metric.evidence.slice(0, 3).join(" · ")}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-px border-t border-black/[0.07] bg-black/[0.07] sm:grid-cols-2 lg:grid-cols-4">
        {simulation.formats.map((format) => {
          const share = format.availablePoints
            ? (format.mineExpected / format.availablePoints) * 100
            : 50;
          return (
            <div key={format.format} className="bg-white p-4">
              <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-black/35">
                {format.format}
              </div>
              <div className="mt-1 flex items-end justify-between">
                <span className="font-mono text-xl font-semibold">{format.mineExpected.toFixed(1)}</span>
                <span className="font-mono text-xs text-black/40">{share.toFixed(0)}% share</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
                <div
                  className={share >= 50 ? "h-full bg-emerald-700" : "h-full bg-orange-600"}
                  style={{ width: `${share}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
