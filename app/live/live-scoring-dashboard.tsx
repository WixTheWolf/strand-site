"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FORMAT_RULES,
  POINTS_TO_WIN,
  TOTAL_TOURNAMENT_POINTS,
  scoreTournament,
  type MatchScore,
  type TeamId,
  type TournamentConfig,
} from "@/lib/live-scoring";

interface LivePayload {
  config: TournamentConfig;
  scores: Record<string, MatchScore>;
  storageMode: "shared" | "preview";
  polledAt: string;
  error?: string;
}

function point(value: number) {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
}

function relativeTime(value: string, now: number) {
  const seconds = Math.max(0, Math.round((now - new Date(value).getTime()) / 1000));
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  return `${Math.floor(seconds / 60)}m ago`;
}

function SegmentPills({ matchResult }: { matchResult: ReturnType<typeof scoreTournament>["matches"][number] }) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-1">
      {Object.values(matchResult.segments).map((segment) => {
        const label = segment.id === "front" ? "F" : segment.id === "back" ? "B" : "O";
        const status = !segment.started
          ? "—"
          : segment.winner === "tie"
            ? "½–½"
            : segment.winner === "wix"
              ? "WIX"
              : "J-B";
        return (
          <div key={segment.id} className={`border px-2 py-2 text-center ${segment.complete ? "border-black/12 bg-black text-white" : "border-black/8 bg-white"}`}>
            <div className={`text-[9px] font-semibold uppercase tracking-[0.18em] ${segment.complete ? "text-white/45" : "text-black/35"}`}>{label}</div>
            <div className="mt-0.5 font-mono text-xs font-semibold">{status}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function LiveScoringDashboard() {
  const [payload, setPayload] = useState<LivePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState("fourball");
  const [clock, setClock] = useState<number | null>(null);

  const load = useCallback(async (quiet = false) => {
    try {
      const response = await fetch("/api/live-scoring", { cache: "no-store" });
      const next = await response.json() as LivePayload;
      if (!response.ok || next.error) throw new Error(next.error ?? "Live scoring is unavailable.");
      setPayload(next);
      setError(null);
      setClock(Date.now());
    } catch (caught) {
      if (!quiet) setError(caught instanceof Error ? caught.message : "Live scoring is unavailable.");
    }
  }, []);

  useEffect(() => {
    // Initial client-side API hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    const interval = window.setInterval(() => void load(true), 10000);
    return () => window.clearInterval(interval);
  }, [load]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const tournament = useMemo(() => payload ? scoreTournament(payload.config, payload.scores) : null, [payload]);
  const session = payload?.config.sessions.find((item) => item.id === activeSession) ?? payload?.config.sessions[0];
  const sessionMatches = tournament?.matches.filter((match) => match.session.id === session?.id) ?? [];
  const sessionPoints = (team: TeamId, key: "securedPoints" | "projectedPoints") => sessionMatches.reduce((sum, match) => sum + match[key][team], 0);
  const isStarted = Boolean(tournament?.holesComplete);
  const displayPoints = (team: TeamId) => tournament
    ? isStarted ? tournament.projectedPoints[team] : tournament.securedPoints[team]
    : 0;

  if (!payload && !error) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-[1400px] items-center justify-center px-5">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-black/15 border-t-black" />
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-black/45">Opening the scoreboard</p>
        </div>
      </main>
    );
  }

  if (!payload || !tournament) {
    return <main className="mx-auto min-h-[70vh] max-w-3xl px-5 py-24 text-center"><h1 className="text-3xl font-medium">Scoreboard unavailable</h1><p className="mt-3 text-black/55">{error}</p><button type="button" onClick={() => void load()} className="mt-6 bg-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white">Try again</button></main>;
  }

  const config = payload.config;
  const wix = config.teams.wix;
  const jbone = config.teams.jbone;

  return (
    <main>
      <section className="relative overflow-hidden bg-[#12362c] text-white">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_0%,#d9b487_0,transparent_35%),radial-gradient(circle_at_85%_100%,#87a997_0,transparent_38%)]" />
        <div className="relative mx-auto max-w-[1400px] px-5 py-10 md:px-8 md:py-14">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/45">The Strand · 75-point match play</div>
              <h1 className="mt-2 text-3xl font-medium tracking-[-0.05em] md:text-5xl">Live from Gamble Sands</h1>
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/50">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Auto-refresh · {clock === null ? "syncing" : relativeTime(payload.polledAt, clock)}
            </div>
          </div>

          <div className="mt-9 grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-8">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">{wix.name}</div>
              <div className="mt-2 font-mono text-5xl font-semibold tracking-[-0.08em] md:text-8xl">{point(displayPoints("wix"))}</div>
              <div className="mt-2 text-xs text-white/45">{point(tournament.securedPoints.wix)} secured</div>
            </div>
            <div className="text-center">
              <div className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">{isStarted ? "Live projection" : "Not started"}</div>
              <div className="mt-3 font-mono text-sm text-white/40">38 wins</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">{jbone.name}</div>
              <div className="mt-2 font-mono text-5xl font-semibold tracking-[-0.08em] md:text-8xl">{point(displayPoints("jbone"))}</div>
              <div className="mt-2 text-xs text-white/45">{point(tournament.securedPoints.jbone)} secured</div>
            </div>
          </div>

          <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="flex h-full">
              <div className="bg-[#d39a66] transition-all" style={{ width: `${displayPoints("wix") / TOTAL_TOURNAMENT_POINTS * 100}%` }} />
              <div className="ml-auto bg-[#8cb39f] transition-all" style={{ width: `${displayPoints("jbone") / TOTAL_TOURNAMENT_POINTS * 100}%` }} />
            </div>
          </div>
          <div className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.14em] text-white/38">
            <span>{Math.max(0, POINTS_TO_WIN - tournament.securedPoints.wix).toFixed(1)} needed to clinch</span>
            <span>{point(tournament.pointsDecided)} of 75 decided</span>
            <span>{Math.max(0, POINTS_TO_WIN - tournament.securedPoints.jbone).toFixed(1)} needed to clinch</span>
          </div>
        </div>
      </section>

      {payload.storageMode === "preview" ? (
        <section className="border-b border-amber-300 bg-amber-50">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm md:px-8">
            <div><b>Preview mode:</b> scoring works on this server, but shared cross-device persistence needs the tournament Redis connection.</div>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">Storage setup pending</span>
          </div>
        </section>
      ) : null}
      {config.status === "provisional" ? (
        <section className="border-b border-black/8 bg-[#e8dfd0]">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm md:px-8">
            <div><b>Pre-draft preview:</b> teams and pairings are balanced placeholders until the captains lock the real draw.</div>
            <Link href="/live/setup" className="border-b border-black pb-1 text-xs font-semibold uppercase tracking-[0.16em]">Captain setup</Link>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-[1400px] px-5 py-10 md:px-8 md:py-14">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-black/40">Four sessions · 25 matches</p>
            <h2 className="mt-2 text-3xl font-medium tracking-[-0.045em]">The match board</h2>
          </div>
          <button type="button" onClick={() => void load()} className="border border-black/12 bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em]">Refresh now</button>
        </div>

        <div className="mt-7 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {config.sessions.map((item) => {
            const matches = tournament.matches.filter((match) => match.session.id === item.id);
            const complete = matches.filter((match) => match.complete).length;
            const active = activeSession === item.id;
            return (
              <button key={item.id} type="button" onClick={() => setActiveSession(item.id)} className={`border p-4 text-left transition ${active ? "border-black bg-black text-white" : "border-black/10 bg-white hover:border-black/35"}`}>
                <div className={`text-[9px] font-semibold uppercase tracking-[0.2em] ${active ? "text-white/45" : "text-black/35"}`}>Round {item.number} · {item.scheduledPoints} pts</div>
                <div className="mt-2 text-lg font-medium">{FORMAT_RULES[item.format].label}</div>
                <div className={`mt-1 text-xs ${active ? "text-white/50" : "text-black/45"}`}>{item.courseId === "gamble-sands" ? "Gamble Sands" : "Scarecrow"} · {item.teeName}</div>
                <div className="mt-4 flex items-end justify-between">
                  <span className={`text-[10px] uppercase tracking-[0.15em] ${active ? "text-white/38" : "text-black/35"}`}>{complete}/{matches.length} final</span>
                  <span className="font-mono text-sm">{point(matches.reduce((sum, match) => sum + match.projectedPoints.wix, 0))}–{point(matches.reduce((sum, match) => sum + match.projectedPoints.jbone, 0))}</span>
                </div>
              </button>
            );
          })}
        </div>

        {session ? (
          <div className="mt-8">
            <div className="grid gap-5 border border-black/10 bg-white p-5 md:grid-cols-[1fr_auto] md:items-center md:p-7">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/35">{session.name}</div>
                <h3 className="mt-2 text-2xl font-medium">{FORMAT_RULES[session.format].allowanceLabel}</h3>
                <p className="mt-2 text-sm leading-6 text-black/55">{FORMAT_RULES[session.format].entryLabel} One point each for the front, back and overall match.</p>
              </div>
              <div className="flex gap-6 md:text-right">
                <div><div className="text-[9px] uppercase tracking-[0.18em] text-black/35">Secured</div><div className="mt-1 font-mono text-2xl">{point(sessionPoints("wix", "securedPoints"))}–{point(sessionPoints("jbone", "securedPoints"))}</div></div>
                <div><div className="text-[9px] uppercase tracking-[0.18em] text-black/35">Projected</div><div className="mt-1 font-mono text-2xl">{point(sessionPoints("wix", "projectedPoints"))}–{point(sessionPoints("jbone", "projectedPoints"))}</div></div>
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {sessionMatches.map((matchResult) => {
                const wixPlayers = matchResult.match.teamWixPlayerIds.map((id) => config.players.find((player) => player.id === id)).filter(Boolean);
                const jbonePlayers = matchResult.match.teamJbonePlayerIds.map((id) => config.players.find((player) => player.id === id)).filter(Boolean);
                return (
                  <Link key={matchResult.match.id} href={`/live/match/${matchResult.match.id}`} className="group border border-black/10 bg-[#faf8f3] p-5 transition hover:-translate-y-0.5 hover:border-black/30 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">Match {matchResult.match.number}</span>
                      <span className={`rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] ${matchResult.complete ? "bg-black text-white" : matchResult.holesComplete ? "bg-emerald-100 text-emerald-900" : "bg-black/5 text-black/45"}`}>{matchResult.complete ? "Final" : matchResult.holesComplete ? `Thru ${matchResult.holesComplete}` : "Open card"}</span>
                    </div>
                    <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                      <div>{wixPlayers.map((player) => <div key={player?.id} className="text-sm font-medium">{player?.nickname}</div>)}</div>
                      <div className="font-mono text-xs text-black/25">vs</div>
                      <div className="text-right">{jbonePlayers.map((player) => <div key={player?.id} className="text-sm font-medium">{player?.nickname}</div>)}</div>
                    </div>
                    <SegmentPills matchResult={matchResult} />
                    <div className="mt-4 flex items-center justify-between border-t border-black/8 pt-4 text-xs">
                      <span className="text-black/38">{matchResult.holesComplete ? `${matchResult.holesComplete}/18 entered` : "Ready for group scoring"}</span>
                      <span className="font-semibold uppercase tracking-[0.12em] group-hover:translate-x-1">Score →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>

      <section className="border-y border-black/8 bg-white">
        <div className="mx-auto max-w-[1400px] px-5 py-12 md:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.65fr_1.35fr]">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-black/38">Tournament math</p><h2 className="mt-2 text-3xl font-medium tracking-[-0.04em]">Every point accounted for.</h2><p className="mt-3 text-sm leading-6 text-black/55">Each match is a three-point Nassau: one point for holes 1–9, one for 10–18 and one for the complete 18. Tied segments split ½–½.</p></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-sm">
                <thead><tr className="border-b border-black/10 text-left text-[10px] uppercase tracking-[0.16em] text-black/38"><th className="py-3 pr-4">Format</th><th className="px-4 py-3">Matches</th><th className="px-4 py-3">Per match</th><th className="px-4 py-3">Session</th><th className="px-4 py-3">Allowance</th></tr></thead>
                <tbody>{config.sessions.map((item) => <tr key={item.id} className="border-b border-black/7"><td className="py-4 pr-4 font-medium">{FORMAT_RULES[item.format].label}</td><td className="px-4 py-4 font-mono">{item.matchCount}</td><td className="px-4 py-4 font-mono">3</td><td className="px-4 py-4 font-mono">{item.scheduledPoints}</td><td className="px-4 py-4 text-black/55">{FORMAT_RULES[item.format].allowanceLabel}</td></tr>)}</tbody>
                <tfoot><tr className="font-semibold"><td className="py-4 pr-4">Tournament</td><td className="px-4 py-4 font-mono">25</td><td className="px-4 py-4">—</td><td className="px-4 py-4 font-mono">75</td><td className="px-4 py-4">38 to win outright</td></tr></tfoot>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
