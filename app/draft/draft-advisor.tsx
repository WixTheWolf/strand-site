"use client";

import { useMemo, useState } from "react";
import { isCaptain } from "@/lib/players";
import type { PlayerDraftStats, RecentRound } from "@/lib/types";

const WIX_ID = "matt-wixted";
const JBONE_ID = "justin-uribe";

type FirstPick = "wix" | "jbone";
type Assignment = "mine" | "theirs";

interface Rated {
  p: PlayerDraftStats;
  value: number;
  skill: number;
  ceiling: number; // 0-12, higher = better low-round upside
  consistency: number; // 0-12, higher = tighter spread
  netLeverage: boolean;
  avg18: number | null;
  best18: number | null;
  tags: { icon: string; label: string; tone: "hot" | "cold" | "steady" | "ceiling" | "net" | "warn" }[];
}

function eighteenScores(rounds: RecentRound[] | undefined): number[] {
  return (rounds ?? []).filter((r) => !r.nineHole).map((r) => r.score);
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** Composite draft value — verified index dominates, form/ceiling/consistency adjust. */
function rate(p: PlayerDraftStats): Rated {
  const index = p.indexNum ?? p.estimatedIndex ?? 22;
  const scores = eighteenScores(p.recentRounds);
  const avg18 = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  const best18 = scores.length ? Math.min(...scores) : null;
  const spread18 = scores.length >= 2 ? Math.max(...scores) - Math.min(...scores) : null;

  const skill = 30 - index; // ~24.4 (5.6) down to ~2 (28)
  const form = clamp(p.formDelta ?? 0, -4, 6); // playing below index = hot
  const ceiling = avg18 !== null && best18 !== null ? clamp(avg18 - best18, 0, 12) : 0;
  const consistency = spread18 !== null ? clamp(12 - spread18, 0, 12) : 0;
  const netLeverage = index >= 18 && ceiling >= 6;
  const noData = scores.length === 0;

  const value =
    skill +
    form * 0.8 +
    ceiling * 0.25 +
    consistency * 0.15 +
    (netLeverage ? 2 : 0) +
    (noData ? -1.2 : 0);

  const tags: Rated["tags"] = [];
  if ((p.formDelta ?? 0) >= 2) tags.push({ icon: "🔥", label: `${(p.formDelta ?? 0).toFixed(1)} below`, tone: "hot" });
  else if ((p.formDelta ?? 0) <= -2) tags.push({ icon: "❄️", label: "cold", tone: "cold" });
  if (consistency >= 9) tags.push({ icon: "🎯", label: "consistent", tone: "steady" });
  if (ceiling >= 6) tags.push({ icon: "⛰️", label: `ceiling ${best18}`, tone: "ceiling" });
  if (netLeverage) tags.push({ icon: "💰", label: "net", tone: "net" });
  if (noData) tags.push({ icon: "⚠️", label: "no rounds", tone: "warn" });

  return { p, value, skill, ceiling, consistency, netLeverage, avg18, best18, tags };
}

const toneClass: Record<string, string> = {
  hot: "bg-orange-100 text-orange-800 border-orange-200",
  cold: "bg-sky-100 text-sky-800 border-sky-200",
  steady: "bg-emerald-100 text-emerald-800 border-emerald-200",
  ceiling: "bg-amber-100 text-amber-800 border-amber-200",
  net: "bg-violet-100 text-violet-800 border-violet-200",
  warn: "bg-stone-100 text-stone-500 border-stone-200",
};

function fmtIndex(p: PlayerDraftStats) {
  return p.indexNum !== null ? p.indexNum.toFixed(1) : p.estimatedIndex ? `~${p.estimatedIndex}` : "—";
}

/** Format-fit metric for a team (0-100-ish, relative). */
function formatMetric(team: Rated[], kind: "foursomes" | "shamble" | "singles" | "scramble"): number {
  if (!team.length) return 0;
  const bySkill = [...team].sort((a, b) => b.skill - a.skill);
  const byCeiling = [...team].sort((a, b) => b.ceiling - a.ceiling);
  const top = (arr: Rated[], n: number) => arr.slice(0, n);
  switch (kind) {
    case "foursomes": // alternate shot — reward top skill + consistency, punish blow-ups
      return top(bySkill, 4).reduce((s, r) => s + r.skill + r.consistency * 0.6, 0);
    case "shamble": // best drive + own ball — steady skill with a ceiling
      return top(bySkill, 6).reduce((s, r) => s + r.skill * 0.7 + r.ceiling * 0.5, 0);
    case "singles": // net match play — total value spread across the roster
      return team.reduce((s, r) => s + r.value, 0);
    case "scramble": // best ball of group — pure ceiling
      return top(byCeiling, 4).reduce((s, r) => s + r.skill * 0.5 + r.ceiling, 0);
  }
}

export default function DraftAdvisor({ players }: { players: PlayerDraftStats[] }) {
  const [firstPick, setFirstPick] = useState<FirstPick>("jbone");
  const [assigned, setAssigned] = useState<Record<string, Assignment>>({});

  const pool = useMemo(
    () => players.filter((p) => !isCaptain(p.id)).map(rate).sort((a, b) => b.value - a.value),
    [players],
  );
  const wixCaptain = players.find((p) => p.id === WIX_ID);
  const jboneCaptain = players.find((p) => p.id === JBONE_ID);

  const available = useMemo(() => pool.filter((r) => !assigned[r.p.id]), [pool, assigned]);
  const takenCount = Object.keys(assigned).length;

  // Whose pick is it now? Pick #(takenCount+1). Alternating from firstPick.
  const pickNumber = takenCount + 1;
  const wixPicksThis =
    firstPick === "wix" ? pickNumber % 2 === 1 : pickNumber % 2 === 0;
  const draftComplete = available.length === 0;

  // Projected finish: greedily alternate the *remaining* board from here.
  const projection = useMemo(() => {
    const mine: Rated[] = [];
    const theirs: Rated[] = [];
    players.forEach((p) => {
      if (p.id === WIX_ID) return;
      if (p.id === JBONE_ID) return;
      const a = assigned[p.id];
      if (a === "mine") mine.push(rate(p));
      if (a === "theirs") theirs.push(rate(p));
    });
    let pick = pickNumber;
    for (const r of available) {
      const wixTurn = firstPick === "wix" ? pick % 2 === 1 : pick % 2 === 0;
      (wixTurn ? mine : theirs).push(r);
      pick += 1;
    }
    if (wixCaptain) mine.push(rate(wixCaptain));
    if (jboneCaptain) theirs.push(rate(jboneCaptain));
    return { mine, theirs };
  }, [players, assigned, available, pickNumber, firstPick, wixCaptain, jboneCaptain]);

  const myVal = projection.mine.reduce((s, r) => s + r.value, 0);
  const theirVal = projection.theirs.reduce((s, r) => s + r.value, 0);
  const winPct = Math.round(100 / (1 + Math.exp(-(myVal - theirVal) / 9)));

  const formats = (["foursomes", "shamble", "singles", "scramble"] as const).map((k) => {
    const mine = formatMetric(projection.mine, k);
    const theirs = formatMetric(projection.theirs, k);
    const total = mine + theirs || 1;
    return { k, minePct: Math.round((mine / total) * 100), edge: mine - theirs };
  });

  const topTarget = available[0];
  const stealRisk = available[1]; // the one J-BONE most likely grabs before your next turn

  const assign = (id: string, a: Assignment) =>
    setAssigned((prev) => ({ ...prev, [id]: a }));
  const unassign = (id: string) =>
    setAssigned((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

  const formatLabels: Record<string, string> = {
    foursomes: "R1 Foursomes",
    shamble: "R2 Shamble",
    singles: "R3 Singles",
    scramble: "R4 Scramble",
  };

  return (
    <section className="space-y-6">
      {/* Controls */}
      <div className="rounded-[2rem] border border-[#111]/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-[#111]/50">Draft advisor</div>
            <h2 className="mt-1 text-xl font-medium">Live pick recommendations</h2>
            <p className="mt-2 max-w-2xl text-sm text-[#111]/70">
              Ranks every available player by a blend of verified GHIN index, recent form, scoring
              ceiling, consistency, and net leverage. Tap <b>Mine</b> / <b>Theirs</b> as picks happen
              on draft day and it re-computes your best available in real time.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.18em] text-[#111]/50">Who picks first?</span>
            <div className="flex gap-2">
              {(["jbone", "wix"] as const).map((who) => (
                <button
                  key={who}
                  onClick={() => setFirstPick(who)}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] ${
                    firstPick === who ? "bg-[#111] text-white" : "border border-[#111]/15 bg-white"
                  }`}
                >
                  {who === "jbone" ? "J-BONE" : "WIX"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* On the clock */}
      {!draftComplete && (
        <div
          className={`rounded-[2rem] border p-6 shadow-sm ${
            wixPicksThis ? "border-emerald-300 bg-emerald-50" : "border-[#111]/10 bg-white"
          }`}
        >
          <div className="text-xs uppercase tracking-[0.22em] text-[#111]/50">
            Pick #{pickNumber} · {wixPicksThis ? "You're on the clock" : "J-BONE on the clock"}
          </div>
          {wixPicksThis ? (
            <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-emerald-700">Take now</div>
                <div className="mt-1 text-2xl font-semibold">
                  {topTarget?.p.nickname} <span className="font-mono text-lg text-[#111]/60">{topTarget && fmtIndex(topTarget.p)}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {topTarget?.tags.map((t) => (
                    <span key={t.label} className={`rounded-lg border px-2 py-0.5 text-[11px] ${toneClass[t.tone]}`}>
                      {t.icon} {t.label}
                    </span>
                  ))}
                </div>
              </div>
              {topTarget && (
                <button
                  onClick={() => assign(topTarget.p.id, "mine")}
                  className="rounded-2xl bg-[#111] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white"
                >
                  Draft {topTarget.p.nickname} → Mine
                </button>
              )}
            </div>
          ) : (
            <div className="mt-3">
              <div className="text-sm text-[#111]/70">
                J-BONE likely takes <b>{topTarget?.p.nickname}</b> ({topTarget && fmtIndex(topTarget.p)}). Your best
                player still on the board after that: <b>{stealRisk?.p.nickname ?? "—"}</b>.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Projected finish */}
      <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[2rem] border border-[#111]/10 bg-[#111] p-6 text-white shadow-sm">
          <div className="text-xs uppercase tracking-[0.22em] text-white/60">Projected win probability</div>
          <div className="mt-2 text-5xl font-semibold tabular-nums">{winPct}%</div>
          <div className="mt-1 text-sm text-white/70">
            if the rest of the board falls by value ({firstPick === "jbone" ? "J-BONE" : "WIX"} picks first)
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-emerald-400" style={{ width: `${winPct}%` }} />
          </div>
        </div>
        <div className="rounded-[2rem] border border-[#111]/10 bg-white p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.22em] text-[#111]/50">Format edge (your share)</div>
          <div className="mt-4 space-y-3">
            {formats.map((f) => (
              <div key={f.k}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{formatLabels[f.k]}</span>
                  <span className={f.edge >= 0 ? "text-emerald-700" : "text-orange-700"}>
                    {f.edge >= 0 ? "You lead" : "They lead"}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#111]/10">
                  <div
                    className={`h-full rounded-full ${f.minePct >= 50 ? "bg-emerald-500" : "bg-orange-400"}`}
                    style={{ width: `${clamp(f.minePct, 4, 96)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live big board */}
      <div className="rounded-[2rem] border border-[#111]/10 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium">Big board · {available.length} available</h3>
          {takenCount > 0 && (
            <button
              onClick={() => setAssigned({})}
              className="text-xs font-semibold uppercase tracking-[0.14em] text-[#111]/50"
            >
              Reset draft
            </button>
          )}
        </div>
        <div className="space-y-2">
          {available.map((r, i) => (
            <div
              key={r.p.id}
              className="flex items-center gap-3 rounded-2xl border border-[#111]/10 bg-[#f7f5f0] px-3 py-2.5"
            >
              <span className="w-6 text-center font-mono text-xs text-[#111]/40">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium">{r.p.nickname}</span>
                  <span className="font-mono text-xs text-[#111]/50">{fmtIndex(r.p)}</span>
                </div>
                <div className="mt-0.5 flex flex-wrap gap-1">
                  {r.tags.map((t) => (
                    <span key={t.label} className={`rounded-md border px-1.5 py-0.5 text-[10px] ${toneClass[t.tone]}`}>
                      {t.icon} {t.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="hidden w-24 sm:block">
                <div className="h-1.5 overflow-hidden rounded-full bg-[#111]/10">
                  <div
                    className="h-full rounded-full bg-[#1a3c34]"
                    style={{ width: `${clamp((r.value / (pool[0]?.value || 1)) * 100, 6, 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  onClick={() => assign(r.p.id, "mine")}
                  className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-white"
                >
                  Mine
                </button>
                <button
                  onClick={() => assign(r.p.id, "theirs")}
                  className="rounded-xl border border-[#111]/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#111]/70"
                >
                  Theirs
                </button>
              </div>
            </div>
          ))}
          {draftComplete && <p className="py-6 text-center text-sm text-[#111]/50">Board empty — draft complete.</p>}
        </div>
      </div>

      {/* Rosters so far */}
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { label: "Your team", key: "mine" as const, dark: true, capName: wixCaptain?.nickname },
          { label: "J-BONE's team", key: "theirs" as const, dark: false, capName: jboneCaptain?.nickname },
        ].map((side) => {
          const picked = players
            .filter((p) => assigned[p.id] === side.key && !isCaptain(p.id))
            .map(rate);
          return (
            <div
              key={side.key}
              className={`rounded-[2rem] border p-5 ${side.dark ? "border-[#111]/10 bg-[#111] text-white" : "border-[#111]/10 bg-white"}`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-medium">{side.label}</h3>
                <span className={`text-xs uppercase tracking-[0.16em] ${side.dark ? "text-white/50" : "text-[#111]/40"}`}>
                  C: {side.capName}
                </span>
              </div>
              <div className="mt-3 space-y-1">
                {picked.length === 0 && (
                  <p className={`text-sm ${side.dark ? "text-white/50" : "text-[#111]/40"}`}>No picks yet</p>
                )}
                {picked.map((r) => (
                  <div
                    key={r.p.id}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                      side.dark ? "bg-white/10" : "bg-[#f7f5f0]"
                    }`}
                  >
                    <span>{r.p.nickname}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs opacity-60">{fmtIndex(r.p)}</span>
                      <button onClick={() => unassign(r.p.id)} className="text-xs opacity-50 hover:opacity-100">
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
