"use client";

import { useMemo } from "react";
import type { PlayerDraftStats, RecentRound } from "@/lib/types";

function shortDate(raw: string): string {
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return `${parsed.getMonth() + 1}/${parsed.getDate()}`;
}

function fullDate(raw: string): string {
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Latest round vs the average of the earlier ones — negative = trending better */
function trendDelta(rounds: RecentRound[]): number | null {
  if (rounds.length < 3) return null;
  const [latest, ...rest] = rounds;
  const avg = rest.reduce((sum, round) => sum + round.score, 0) / rest.length;
  return latest.score - avg;
}

export default function RecentForm({ players }: { players: PlayerDraftStats[] }) {
  const withRounds = useMemo(
    () =>
      players
        .filter((player) => (player.recentRounds?.length ?? 0) > 0)
        .sort((a, b) => (a.draftRank || 99) - (b.draftRank || 99)),
    [players],
  );
  const withoutRounds = useMemo(
    () => players.filter((player) => !(player.recentRounds?.length ?? 0)),
    [players],
  );
  const hasNineHole = useMemo(
    () => withRounds.some((player) => player.recentRounds?.some((round) => round.nineHole)),
    [withRounds],
  );

  return (
    <section className="rounded-[2rem] border border-[#111]/10 bg-white p-6 shadow-sm">
      <header className="mb-5">
        <div className="text-xs uppercase tracking-[0.22em] text-[#111]/50">Recent form</div>
        <h2 className="mt-1 text-xl font-medium">Last five rounds</h2>
        <p className="mt-2 max-w-2xl text-sm text-[#111]/70">
          Most recent posted scores per player, newest first — pulled from GHIN when linked,
          TheGrint otherwise. Trend compares the latest round to the average of the ones before it.
        </p>
      </header>

      {withRounds.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {withRounds.map((player) => {
            const rounds = player.recentRounds ?? [];
            const delta = trendDelta(rounds);
            return (
              <div key={player.id} className="rounded-2xl border border-[#111]/10 bg-[#f7f5f0] p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-sm font-medium">{player.nickname}</span>
                    <span className="ml-2 font-mono text-xs text-[#111]/50">
                      {player.indexNum?.toFixed(1) ?? "—"} idx
                    </span>
                  </div>
                  {delta !== null && (
                    <span
                      className={`shrink-0 font-mono text-xs font-medium ${
                        delta <= -1 ? "text-[#2d6a4f]" : delta >= 1 ? "text-[#c45c26]" : "text-[#111]/50"
                      }`}
                      title="Latest round vs average of the previous rounds"
                    >
                      {delta <= -1 ? "▼" : delta >= 1 ? "▲" : "•"} {delta > 0 ? "+" : ""}
                      {delta.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {rounds.map((round, i) => (
                    <span
                      key={`${round.date}-${i}`}
                      className={`rounded-lg border px-2 py-1 text-center ${
                        i === 0 ? "border-[#1a3c34]/30 bg-white" : "border-[#111]/10 bg-white/60"
                      }`}
                      title={`${fullDate(round.date)}${round.course ? ` · ${round.course}` : ""}${
                        round.differential != null ? ` · diff ${round.differential}` : ""
                      }${round.nineHole ? " · 9-hole round" : ""}`}
                    >
                      <span className="block font-mono text-sm font-medium leading-none">
                        {round.score}
                        {round.nineHole && <sup className="text-[#c45c26]">*</sup>}
                      </span>
                      <span className="mt-0.5 block text-[9px] uppercase tracking-[0.08em] text-[#111]/45">
                        {shortDate(round.date)}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#111]/15 bg-[#f7f5f0] p-6 text-sm text-[#111]/55">
          No posted rounds available yet. Score history comes from GHIN once credentials are
          configured (Vercel env: GHIN_EMAIL / GHIN_PASSWORD), with TheGrint as fallback.
        </div>
      )}

      {hasNineHole && (
        <p className="mt-4 text-xs text-[#111]/45">
          <span className="font-mono text-[#c45c26]">*</span> 9-hole round
        </p>
      )}

      {withRounds.length > 0 && withoutRounds.length > 0 && (
        <p className="mt-1 text-xs text-[#111]/45">
          No score history found for: {withoutRounds.map((player) => player.nickname).join(", ")}
        </p>
      )}
    </section>
  );
}
