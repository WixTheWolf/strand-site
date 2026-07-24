"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  buildSaberBoard,
  FORMAT_META,
  optimizePairs,
  simulateTournament,
  type PlayerSaberMetrics,
  type StrandFormat,
} from "@/lib/sabermetrics";
import { JBONE_TEAM, PATH_TO_38, STUD_BUCKETS_TEAM, TEAM_STANDARDS } from "@/lib/stud-buckets";
import type { PlayerDraftStats } from "@/lib/types";

type DraftPayload = { updatedAt: string; source: string; players: PlayerDraftStats[] };
type PairFormat = "fourball" | "shamble" | "scramble";
const PAIR_FORMATS: PairFormat[] = ["fourball", "shamble", "scramble"];

const avg = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const n = (value: number, digits = 1) => Number.isFinite(value) ? value.toFixed(digits) : "—";
const pct = (value: number) => `${Math.round(value * 100)}%`;

function bestFormat(metric: PlayerSaberMetrics): StrandFormat {
  return (Object.keys(metric.format) as StrandFormat[]).sort((a, b) => metric.format[b] - metric.format[a])[0];
}

function role(metric: PlayerSaberMetrics) {
  if (metric.player.id === STUD_BUCKETS_TEAM.captainId) return "Captain · tone setter";
  if (metric.index <= 9) return "Gross-score weapon";
  if (metric.consistency >= 74) return "Floor setter";
  if (metric.ceiling >= 74) return "Momentum swing";
  if (metric.index >= 22 && metric.netEdge >= 0) return "Net-pressure piece";
  if (metric.scarecrowFit > metric.gambleFit + 4) return "Scarecrow specialist";
  if (metric.gambleFit > metric.scarecrowFit + 4) return "Gamble Sands fit";
  return "Flexible matchup piece";
}

function Initials({ metric }: { metric: PlayerSaberMetrics }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#31594d] text-[10px] font-bold text-white">
      {metric.player.initials}
    </span>
  );
}

export default function StudBucketsDashboard() {
  const [data, setData] = useState<DraftPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/grint/players", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Unable to load player data.");
        setData(payload);
      })
      .catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load player data."));
  }, []);

  const board = useMemo(() => data ? buildSaberBoard(data.players) : [], [data]);
  const map = useMemo(() => new Map(board.map((metric) => [metric.player.id, metric])), [board]);
  const team = useMemo(() => STUD_BUCKETS_TEAM.playerIds.map((id) => map.get(id)).filter(Boolean) as PlayerSaberMetrics[], [map]);
  const opponent = useMemo(() => JBONE_TEAM.playerIds.map((id) => map.get(id)).filter(Boolean) as PlayerSaberMetrics[], [map]);
  const simulation = useMemo(() => team.length === 10 && opponent.length === 10 ? simulateTournament(team, opponent) : null, [team, opponent]);
  const pairings = useMemo(() => Object.fromEntries(PAIR_FORMATS.map((format) => [format, optimizePairs(team, format)])) as Record<PairFormat, ReturnType<typeof optimizePairs>>, [team]);
  const expected = useMemo(() => new Map(simulation?.formats.map((format) => [format.format, format.mineExpected]) ?? []), [simulation]);
  const threats = useMemo(() => [...opponent].sort((a, b) => b.tournamentScore - a.tournamentScore).slice(0, 4), [opponent]);
  const pressure = useMemo(() => [...opponent].sort((a, b) => (a.confidence + a.consistency) - (b.confidence + b.consistency)).slice(0, 4), [opponent]);

  async function logout() {
    await fetch("/api/stud-buckets/logout", { method: "POST" });
    window.location.reload();
  }

  if (!data && !error) {
    return <main className="flex min-h-screen items-center justify-center bg-[#071b18] text-xs font-semibold uppercase tracking-[0.25em] text-white/45">Building the game plan…</main>;
  }

  if (error || team.length !== 10 || opponent.length !== 10) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071b18] px-5 text-white">
        <div className="max-w-lg rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#efbd88]">Roster check</p>
          <h1 className="mt-3 text-3xl font-semibold">The team data did not load cleanly.</h1>
          <p className="mt-4 text-sm leading-6 text-white/55">{error ?? `Loaded ${team.length} Stud Buckets and ${opponent.length} opponents.`}</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2efe7] text-[#10201b]">
      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#071b18]/95 text-white backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-3 md:px-8">
          <Link href="#top" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e39a50] text-sm font-black text-[#10251e]">SB</span>
            <span><span className="block text-[9px] uppercase tracking-[0.2em] text-white/38">The Strand 2026</span><span className="block text-sm font-semibold">Stud Buckets HQ</span></span>
          </Link>
          <nav className="hidden gap-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55 lg:flex">
            <Link href="#mission">Mission 38</Link><Link href="#pairings">Pairings</Link><Link href="#roster">Roster</Link><Link href="#opponent">Opponent</Link>
          </nav>
          <button onClick={logout} className="rounded-full border border-white/12 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.17em] text-white/45">Lock HQ</button>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden bg-[#071b18] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(227,154,80,0.24),transparent_30%),radial-gradient(circle_at_80%_35%,rgba(72,123,105,0.22),transparent_34%)]" />
          <div className="relative mx-auto grid max-w-[1440px] gap-10 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <div className="inline-flex rounded-full border border-[#e39a50]/30 bg-[#e39a50]/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.22em] text-[#efbd88]">Rosters locked · team only</div>
              <h1 className="mt-7 max-w-[10ch] text-6xl font-semibold leading-[0.88] tracking-[-0.075em] sm:text-7xl md:text-8xl">Fill the card.<br />Take the points.</h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-white/58">The operating plan for all ten Stud Buckets: player roles, format pairings, opponent pressure points and the cleanest path to 38.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#pairings" className="rounded-full bg-[#e39a50] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#10251e]">Recommended pairs</Link>
                <Link href="/courses" className="rounded-full border border-white/14 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">Course intel</Link>
                <Link href="/live" className="rounded-full border border-white/14 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">Live scoring</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                [simulation ? pct(simulation.winProbability) : "—", "Model win probability"],
                [simulation ? n(simulation.mineExpected) : "—", "Projected points"],
                [n(avg(team.map((metric) => metric.index))), "Team index average"],
                [n(avg(team.map((metric) => metric.tournamentScore)), 0), "Team power average"],
              ].map(([value, label]) => (
                <article key={label} className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5">
                  <div className="text-4xl font-semibold tracking-[-0.055em] text-[#efbd88]">{value}</div>
                  <div className="mt-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/38">{label}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="mission" className="mx-auto max-w-[1440px] scroll-mt-24 px-5 py-16 md:px-8 md:py-24">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9a6031]">Mission 38</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.055em] md:text-6xl">Four sessions. No wasted points.</h2>
          <div className="mt-10 grid gap-4 lg:grid-cols-4">
            {PATH_TO_38.map((session) => (
              <article key={session.format} className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-sm">
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-[0.16em] text-black/35"><span>{session.round}</span><span>{session.points} available</span></div>
                <h3 className="mt-5 text-2xl font-semibold">{session.label}</h3><p className="mt-1 text-xs uppercase tracking-[0.16em] text-black/35">{session.course}</p>
                <div className="mt-6 grid grid-cols-2 gap-2"><div className="rounded-2xl bg-[#071b18] p-4 text-white"><div className="text-[9px] uppercase text-white/35">Target</div><div className="text-3xl font-semibold text-[#efbd88]">{session.target}</div></div><div className="rounded-2xl bg-[#f2efe7] p-4"><div className="text-[9px] uppercase text-black/35">Model</div><div className="text-3xl font-semibold">{n(expected.get(session.format) ?? 0)}</div></div></div>
                <p className="mt-5 text-sm leading-6 text-black/55">{session.directive}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="pairings" className="scroll-mt-24 bg-[#0c2821] py-16 text-white md:py-24">
          <div className="mx-auto max-w-[1440px] px-5 md:px-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#efbd88]">Pairing laboratory</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.055em] md:text-6xl">The best five combinations.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/48">Model-optimal internal pairs. Chemistry, health and confidence can break close calls; the numbers inform the captain, not handcuff him.</p>
            <div className="mt-10 grid gap-5 xl:grid-cols-3">
              {PAIR_FORMATS.map((format) => (
                <article key={format} className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6">
                  <h3 className="text-3xl font-semibold">{FORMAT_META[format].label}</h3><p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#efbd88]">{FORMAT_META[format].course}</p>
                  <div className="mt-5 space-y-3">
                    {pairings[format].map((pair, index) => (
                      <div key={`${format}-${pair.a.player.id}-${pair.b.player.id}`} className="rounded-2xl bg-black/15 p-4">
                        <div className="flex items-center justify-between"><span className="font-mono text-[10px] text-white/30">PAIR {index + 1}</span><span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#efbd88]">{n(pair.score, 0)} fit</span></div>
                        <div className="mt-3 flex items-center gap-3"><div className="flex -space-x-2"><Initials metric={pair.a} /><Initials metric={pair.b} /></div><div className="text-sm font-semibold">{pair.a.player.nickname} + {pair.b.player.nickname}</div></div>
                        <div className="mt-3 flex justify-between gap-3 text-xs text-white/42"><span>{pair.note}</span><span className="font-mono">+{n(pair.lift)} lift</span></div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="roster" className="mx-auto max-w-[1440px] scroll-mt-24 px-5 py-16 md:px-8 md:py-24">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9a6031]">The ten</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.055em] md:text-6xl">Everyone has a job.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {team.map((metric) => { const format = bestFormat(metric); return (
              <article key={metric.player.id} className="rounded-[1.75rem] border border-black/8 bg-white p-5 shadow-sm">
                <div className="flex justify-between"><Initials metric={metric} /><div className="text-right"><div className="text-2xl font-semibold">{n(metric.index)}</div><div className="text-[9px] uppercase text-black/30">Index</div></div></div>
                <h3 className="mt-5 text-xl font-semibold">{metric.player.name}</h3><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9a6031]">{role(metric)}</p>
                <div className="mt-5 rounded-2xl bg-[#f2efe7] p-4 text-xs"><div className="flex justify-between"><span className="text-black/42">Best format</span><span className="font-semibold">{FORMAT_META[format].label}</span></div><div className="mt-2 flex justify-between"><span className="text-black/42">Format score</span><span className="font-mono font-semibold">{n(metric.format[format], 0)}</span></div><div className="mt-2 flex justify-between"><span className="text-black/42">Confidence</span><span className="font-semibold">{metric.confidenceLabel}</span></div></div>
                <p className="mt-4 text-xs leading-5 text-black/48">{metric.evidence.slice(0, 3).join(" · ")}</p>
              </article>
            ); })}
          </div>
        </section>

        <section id="opponent" className="scroll-mt-24 border-y border-black/8 bg-white py-16 md:py-24">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-5 md:px-8 lg:grid-cols-2">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9a6031]">J-BONE weapons</p><h2 className="mt-3 text-4xl font-semibold tracking-[-0.055em]">Respect their top end.</h2><div className="mt-7 space-y-3">{threats.map((metric) => <div key={metric.player.id} className="flex items-center gap-4 rounded-2xl bg-[#f2efe7] p-4"><Initials metric={metric} /><div className="min-w-0 flex-1"><div className="font-semibold">{metric.player.name}</div><div className="text-xs text-black/45">Best: {FORMAT_META[bestFormat(metric)].label} · {n(metric.tournamentScore, 0)} power</div></div><div className="font-mono text-sm">{n(metric.index)}</div></div>)}</div></div>
            <div><p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9a6031]">Pressure targets</p><h2 className="mt-3 text-4xl font-semibold tracking-[-0.055em]">Make uncertainty prove itself.</h2><div className="mt-7 space-y-3">{pressure.map((metric) => <div key={metric.player.id} className="rounded-2xl border border-black/8 p-4"><div className="flex justify-between gap-4"><div><div className="font-semibold">{metric.player.name}</div><div className="mt-1 text-xs text-black/45">{metric.confidenceLabel} confidence · {n(metric.consistency, 0)} consistency</div></div><div className="text-right text-xs text-black/45">{n(metric.index)} index</div></div><p className="mt-3 text-xs leading-5 text-black/50">No gifts. Put a ball in play, make pars visible and force the opponent to finish every hole.</p></div>)}</div></div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-16 md:px-8 md:py-24">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#9a6031]">Team standards</p><h2 className="mt-3 text-4xl font-semibold tracking-[-0.055em] md:text-6xl">Simple rules under pressure.</h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-[2rem] bg-black/8 md:grid-cols-2">{TEAM_STANDARDS.map((standard, index) => <div key={standard} className="flex gap-4 bg-white p-6"><span className="font-mono text-sm text-[#9a6031]">0{index + 1}</span><p className="text-sm leading-6 text-black/58">{standard}</p></div>)}</div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] bg-[#071b18] p-7 text-white"><div><div className="text-[10px] uppercase tracking-[0.22em] text-white/38">Stud Buckets</div><div className="mt-2 text-3xl font-semibold tracking-[-0.045em]">Ten studs. One bucket. Thirty-eight points.</div></div><div className="text-right text-[10px] uppercase tracking-[0.17em] text-white/35">Updated {new Date(data!.updatedAt).toLocaleString()}<br />Source: {data!.source}</div></div>
        </section>
      </main>
    </div>
  );
}
