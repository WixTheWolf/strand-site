"use client";

import { useMemo, useState } from "react";
import { isCaptain } from "@/lib/players";
import { HANDICAP_CAP, playingIndex } from "@/lib/tournament";
import type { PlayerDraftStats, RecentRound } from "@/lib/types";

const WIX_ID = "matt-wixted";
const JBONE_ID = "justin-uribe";

type FirstPick = "wix" | "jbone";
type Assignment = "mine" | "theirs";

interface Rated {
  p: PlayerDraftStats;
  value: number;
  skill: number;
  ceiling: number;
  consistency: number;
  netLeverage: boolean;
  avg18: number | null;
  best18: number | null;
  rounds: RecentRound[];
  tags: { icon: string; label: string; tone: Tone }[];
}

type Tone = "hot" | "cold" | "steady" | "ceiling" | "net" | "warn";

function eighteenScores(rounds: RecentRound[] | undefined): number[] {
  return (rounds ?? []).filter((r) => !r.nineHole).map((r) => r.score);
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** Composite draft value — verified index dominates; recent scores adjust. */
function rate(p: PlayerDraftStats): Rated {
  // Strand ceiling: anyone over 25 plays as a 25 — they keep their real
  // scoring but forfeit the strokes above the cap, a straight net penalty
  const index = playingIndex(p.indexNum ?? p.estimatedIndex ?? 22);
  const rawIndex = p.eventIndexCapped
    ? p.manualIndex ?? p.indexNum ?? p.estimatedIndex ?? 22
    : p.indexNum ?? p.estimatedIndex ?? 22;
  const capForfeit = rawIndex - index;
  const rounds = p.recentRounds ?? [];
  const scores = eighteenScores(rounds);
  const avg18 = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  const best18 = scores.length ? Math.min(...scores) : null;
  const spread18 = scores.length >= 2 ? Math.max(...scores) - Math.min(...scores) : null;

  const skill = 30 - rawIndex;
  // Career Strand record: titles and trips are measured signal, softly weighted
  const rec = p.strandRecord;
  const pedigree = rec ? Math.min(4, rec.wins * 0.8 + rec.appearances * 0.25) : 0;
  const form = clamp(p.formDelta ?? 0, -4, 6); // playing below index = hot
  const ceiling = avg18 !== null && best18 !== null ? clamp(avg18 - best18, 0, 12) : 0;
  const consistency = spread18 !== null ? clamp(12 - spread18, 0, 12) : 0;
  const netLeverage = index >= 18 && ceiling >= 6;
  const noData = scores.length === 0;

  const value =
    skill +
    pedigree +
    form * 0.8 +
    ceiling * 0.25 +
    consistency * 0.15 +
    (netLeverage ? 2 : 0) +
    (noData ? -1.2 : 0) -
    capForfeit * 0.9;

  const tags: Rated["tags"] = [];
  if (rec && rec.wins > 0)
    tags.push({ icon: "🏆", label: `${rec.wins}–${rec.losses} strand`, tone: rec.wins >= 2 ? "hot" : "steady" });
  else if (rec && rec.appearances > 0)
    tags.push({ icon: "🎒", label: `0–${rec.losses} strand`, tone: "cold" });
  else tags.push({ icon: "🆕", label: "strand rookie", tone: "warn" });
  if (rec?.championshipYears.length)
    tags.push({
      icon: "📅",
      label: rec.championshipYears.map((year) => `'${String(year).slice(-2)}`).join(" · "),
      tone: "ceiling",
    });
  if (rawIndex > HANDICAP_CAP)
    tags.push({ icon: "🧢", label: `plays as ${HANDICAP_CAP} (−${capForfeit.toFixed(1)} net)`, tone: "warn" });
  if ((p.formDelta ?? 0) >= 2) tags.push({ icon: "🔥", label: `${(p.formDelta ?? 0).toFixed(1)} below idx`, tone: "hot" });
  else if ((p.formDelta ?? 0) <= -2) tags.push({ icon: "❄️", label: "cooling", tone: "cold" });
  if (consistency >= 9) tags.push({ icon: "🎯", label: "consistent", tone: "steady" });
  if (ceiling >= 6 && best18 !== null) tags.push({ icon: "⛰️", label: `low ${best18}`, tone: "ceiling" });
  if (netLeverage) tags.push({ icon: "💰", label: "net bomb", tone: "net" });
  if (noData) tags.push({ icon: "⚠️", label: "no rounds", tone: "warn" });

  return { p, value, skill, ceiling, consistency, netLeverage, avg18, best18, rounds, tags };
}

const toneClass: Record<Tone, string> = {
  hot: "bg-orange-100 text-orange-800 border-orange-200",
  cold: "bg-sky-100 text-sky-800 border-sky-200",
  steady: "bg-emerald-100 text-emerald-800 border-emerald-200",
  ceiling: "bg-amber-100 text-amber-800 border-amber-200",
  net: "bg-violet-100 text-violet-800 border-violet-200",
  warn: "bg-stone-100 text-stone-500 border-stone-200",
};

function fmtIndex(p: PlayerDraftStats) {
  if (p.indexNum !== null) {
    return p.eventIndexCapped ? `${p.indexNum.toFixed(1)}*` : p.indexNum.toFixed(1);
  }
  return p.estimatedIndex ? `~${Math.min(p.estimatedIndex, HANDICAP_CAP)}` : "—";
}

function shortDate(raw: string): string {
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? "" : `${d.getMonth() + 1}/${d.getDate()}`;
}

/** Last-5 score chips — newest first, 9-hole flagged with an asterisk. */
function ScoreChips({ rounds, dark }: { rounds: RecentRound[]; dark?: boolean }) {
  if (!rounds.length) {
    return <span className={`text-xs ${dark ? "text-white/40" : "text-[#111]/35"}`}>no posted rounds</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {rounds.slice(0, 5).map((r, i) => (
        <span
          key={`${r.date}-${i}`}
          title={`${r.score}${r.nineHole ? " (9-hole)" : ""} · ${shortDate(r.date)}${r.course ? ` · ${r.course}` : ""}${
            r.differential != null ? ` · diff ${r.differential}` : ""
          }`}
          className={`inline-flex items-baseline gap-0.5 rounded-md border px-1.5 py-0.5 font-mono text-xs ${
            i === 0
              ? dark
                ? "border-emerald-300/40 bg-emerald-400/15 text-white"
                : "border-emerald-300 bg-emerald-50 text-emerald-900"
              : dark
                ? "border-white/15 bg-white/10 text-white/80"
                : "border-[#111]/10 bg-white text-[#111]/80"
          }`}
        >
          {r.score}
          {r.nineHole && <sup className="text-[9px] text-orange-500">*</sup>}
        </span>
      ))}
    </div>
  );
}

/** Format-fit metric for a team. */
function formatMetric(team: Rated[], kind: "fourball" | "shamble" | "singles" | "scramble"): number {
  if (!team.length) return 0;
  const bySkill = [...team].sort((a, b) => b.skill - a.skill);
  const byCeiling = [...team].sort((a, b) => b.ceiling - a.ceiling);
  const top = (arr: Rated[], n: number) => arr.slice(0, n);
  switch (kind) {
    case "fourball":
      return top(bySkill, 4).reduce((s, r) => s + r.skill + r.consistency * 0.6, 0);
    case "shamble":
      return top(bySkill, 6).reduce((s, r) => s + r.skill * 0.7 + r.ceiling * 0.5, 0);
    case "singles":
      return team.reduce((s, r) => s + r.value, 0);
    case "scramble":
      return top(byCeiling, 4).reduce((s, r) => s + r.skill * 0.5 + r.ceiling, 0);
  }
}

const formatLabels: Record<string, string> = {
  fourball: "R1 Fourball",
  shamble: "R2 Shamble",
  singles: "R3 Singles",
  scramble: "R4 Scramble",
};

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

  const pickNumber = takenCount + 1;
  const wixPicksThis = firstPick === "wix" ? pickNumber % 2 === 1 : pickNumber % 2 === 0;
  const draftComplete = available.length === 0;

  const projection = useMemo(() => {
    const mine: Rated[] = [];
    const theirs: Rated[] = [];
    players.forEach((p) => {
      if (p.id === WIX_ID || p.id === JBONE_ID) return;
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

  const formats = (["fourball", "shamble", "singles", "scramble"] as const).map((k) => {
    const mine = formatMetric(projection.mine, k);
    const theirs = formatMetric(projection.theirs, k);
    const total = mine + theirs || 1;
    return { k, minePct: Math.round((mine / total) * 100), edge: mine - theirs };
  });

  const topTarget = available[0];
  const stealRisk = available[1];

  const assign = (id: string, a: Assignment) => setAssigned((prev) => ({ ...prev, [id]: a }));
  const unassign = (id: string) =>
    setAssigned((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

  return (
    <section className="space-y-5">
      {/* Header + who-picks-first */}
      <div className="flex flex-col gap-4 rounded-[2rem] border border-[#111]/10 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-[#111]/50">Draft advisor · live</div>
          <h2 className="mt-1 text-xl font-medium">Best available, ranked by index + recent scores</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.16em] text-[#111]/45">First pick</span>
            <div className="flex gap-1.5">
              {(["jbone", "wix"] as const).map((who) => (
                <button
                  key={who}
                  onClick={() => setFirstPick(who)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                    firstPick === who ? "bg-[#111] text-white" : "border border-[#111]/15 bg-white"
                  }`}
                >
                  {who === "jbone" ? "J-BONE" : "WIX"}
                </button>
              ))}
            </div>
          </div>
          {takenCount > 0 && (
            <button
              onClick={() => setAssigned({})}
              className="self-end rounded-xl border border-[#111]/15 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#111]/60"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* On the clock */}
      {!draftComplete && (
        <div
          className={`rounded-[2rem] border p-5 shadow-sm ${
            wixPicksThis ? "border-emerald-300 bg-emerald-50" : "border-[#111]/10 bg-white"
          }`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.2em] text-[#111]/50">
                Pick #{pickNumber} · {wixPicksThis ? "You're on the clock" : "J-BONE on the clock"}
              </div>
              {wixPicksThis ? (
                <>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-xs uppercase tracking-[0.16em] text-emerald-700">Take</span>
                    <span className="text-2xl font-semibold">{topTarget?.p.nickname}</span>
                    <span className="font-mono text-lg text-[#111]/55">{topTarget && fmtIndex(topTarget.p)}</span>
                  </div>
                  {topTarget && (
                    <div className="mt-1.5">
                      <ScoreChips rounds={topTarget.rounds} />
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-1 text-sm text-[#111]/70">
                  J-BONE likely takes <b>{topTarget?.p.nickname}</b> ({topTarget && fmtIndex(topTarget.p)}). Your best
                  left after: <b>{stealRisk?.p.nickname ?? "—"}</b>.
                </div>
              )}
            </div>
            {wixPicksThis && topTarget && (
              <button
                onClick={() => assign(topTarget.p.id, "mine")}
                className="shrink-0 rounded-2xl bg-[#111] px-6 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white"
              >
                Draft → Mine
              </button>
            )}
          </div>
        </div>
      )}

      {/* Win prob + format edge, compact single row */}
      <div className="grid gap-4 md:grid-cols-[0.55fr_1.45fr]">
        <div className="flex items-center gap-4 rounded-[2rem] border border-[#111]/10 bg-[#111] p-5 text-white shadow-sm">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/60">Win prob</div>
            <div className="text-4xl font-semibold tabular-nums">{winPct}%</div>
          </div>
          <div className="flex-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${winPct}%` }} />
            </div>
            <div className="mt-1.5 text-[11px] text-white/55">
              projected if the board falls by value
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-[#111]/10 bg-white p-5 shadow-sm">
          <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-[#111]/50">Format edge (your share)</div>
          <div className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {formats.map((f) => (
              <div key={f.k}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span>{formatLabels[f.k]}</span>
                  <span className={f.edge >= 0 ? "text-emerald-700" : "text-orange-700"}>
                    {f.edge >= 0 ? "lead" : "behind"}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#111]/10">
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

      {/* BIG BOARD — the star. Every row shows the last 5 scores. */}
      <div className="rounded-[2rem] border border-[#111]/10 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-1 flex items-baseline justify-between">
          <h3 className="text-lg font-medium">Big board</h3>
          <span className="text-xs uppercase tracking-[0.16em] text-[#111]/45">{available.length} available</span>
        </div>
        <p className="mb-4 text-xs text-[#111]/50">
          Ranked by verified index + recent form. Chips are the last 5 posted scores (newest left,
          <span className="mx-1 font-mono text-orange-500">*</span>= 9-hole). Hover a chip for date &amp; course.
        </p>

        <div className="space-y-1.5">
          {available.map((r, i) => (
            <div
              key={r.p.id}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2 rounded-2xl border border-[#111]/10 bg-[#f7f5f0] px-3 py-3 md:grid-cols-[2rem_minmax(0,11rem)_1fr_auto]"
            >
              {/* rank */}
              <span className="w-7 text-center font-mono text-sm font-semibold text-[#111]/40">{i + 1}</span>

              {/* name + index + tags */}
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="truncate font-semibold">{r.p.nickname}</span>
                  <span className="font-mono text-sm text-[#111]/55">{fmtIndex(r.p)}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {r.tags.map((t) => (
                    <span key={t.label} className={`rounded-md border px-1.5 py-0.5 text-[10px] ${toneClass[t.tone]}`}>
                      {t.icon} {t.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* last-5 scores + avg — spans full width on mobile */}
              <div className="col-span-3 flex items-center gap-3 md:col-span-1">
                <ScoreChips rounds={r.rounds} />
                {r.avg18 !== null && (
                  <span className="ml-auto shrink-0 text-right font-mono text-xs text-[#111]/50 md:ml-0">
                    avg {r.avg18.toFixed(0)}
                  </span>
                )}
              </div>

              {/* actions */}
              <div className="col-start-3 row-start-1 flex shrink-0 gap-1.5 md:col-start-4">
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

      {/* Rosters so far — with recent scores */}
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { label: "Your team", key: "mine" as const, dark: true, capName: wixCaptain?.nickname },
          { label: "J-BONE's team", key: "theirs" as const, dark: false, capName: jboneCaptain?.nickname },
        ].map((side) => {
          const picked = players.filter((p) => assigned[p.id] === side.key && !isCaptain(p.id)).map(rate);
          const avgIdx =
            picked.length > 0
              ? picked.reduce((s, r) => s + playingIndex(r.p.indexNum ?? r.p.estimatedIndex ?? 0), 0) / picked.length
              : null;
          return (
            <div
              key={side.key}
              className={`rounded-[2rem] border p-5 ${
                side.dark ? "border-[#111]/10 bg-[#111] text-white" : "border-[#111]/10 bg-white"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-medium">{side.label}</h3>
                <span className={`text-xs uppercase tracking-[0.14em] ${side.dark ? "text-white/50" : "text-[#111]/40"}`}>
                  C: {side.capName}
                  {avgIdx !== null && ` · avg ${avgIdx.toFixed(1)}`}
                </span>
              </div>
              <div className="mt-3 space-y-1.5">
                {picked.length === 0 && (
                  <p className={`text-sm ${side.dark ? "text-white/50" : "text-[#111]/40"}`}>No picks yet</p>
                )}
                {picked.map((r) => (
                  <div
                    key={r.p.id}
                    className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl px-3 py-2 text-sm ${
                      side.dark ? "bg-white/10" : "bg-[#f7f5f0]"
                    }`}
                  >
                    <span className="font-medium">{r.p.nickname}</span>
                    <span className="font-mono text-xs opacity-55">{fmtIndex(r.p)}</span>
                    <div className="ml-auto flex items-center gap-2">
                      <ScoreChips rounds={r.rounds} dark={side.dark} />
                      <button
                        onClick={() => unassign(r.p.id)}
                        className="text-xs opacity-50 hover:opacity-100"
                        aria-label={`Remove ${r.p.nickname}`}
                      >
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
