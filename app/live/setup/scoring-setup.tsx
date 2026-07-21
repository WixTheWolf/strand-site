"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CHAMPIONSHIP_COURSES } from "@/lib/course-intelligence";
import { FORMAT_RULES, validateTournamentConfig, type MatchScore, type TeamId, type TournamentConfig } from "@/lib/live-scoring";

interface LivePayload {
  config: TournamentConfig;
  scores: Record<string, MatchScore>;
  storageMode: "shared" | "preview";
  error?: string;
}

function cloneConfig(config: TournamentConfig): TournamentConfig {
  return JSON.parse(JSON.stringify(config)) as TournamentConfig;
}

function autoPair(config: TournamentConfig): TournamentConfig {
  const next = cloneConfig(config);
  const wix = next.players.filter((player) => player.teamId === "wix").sort((a, b) => a.index - b.index);
  const jbone = next.players.filter((player) => player.teamId === "jbone").sort((a, b) => a.index - b.index);
  for (const session of next.sessions) {
    session.matches.forEach((match, index) => {
      if (session.format === "singles") {
        match.teamWixPlayerIds = wix[index] ? [wix[index].id] : [];
        match.teamJbonePlayerIds = jbone[index] ? [jbone[index].id] : [];
      } else {
        match.teamWixPlayerIds = wix.slice(index * 2, index * 2 + 2).map((player) => player.id);
        match.teamJbonePlayerIds = jbone.slice(index * 2, index * 2 + 2).map((player) => player.id);
      }
    });
  }
  return next;
}

export default function ScoringSetup() {
  const [payload, setPayload] = useState<LivePayload | null>(null);
  const [draft, setDraft] = useState<TournamentConfig | null>(null);
  const [pin, setPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState("fourball");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/live-scoring", { cache: "no-store" });
      const next = await response.json() as LivePayload;
      if (!response.ok || next.error) throw new Error(next.error ?? "Unable to load setup.");
      setPayload(next);
      setDraft(cloneConfig(next.config));
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Unable to load setup.");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  const errors = useMemo(() => draft ? validateTournamentConfig(draft) : [], [draft]);
  const session = draft?.sessions.find((item) => item.id === activeSession) ?? draft?.sessions[0];

  const assignTeam = (playerId: string, teamId: TeamId) => setDraft((current) => {
    if (!current) return current;
    const next = cloneConfig(current);
    const player = next.players.find((item) => item.id === playerId);
    if (player) player.teamId = teamId;
    return next;
  });

  const updateSlot = (matchId: string, teamId: TeamId, slot: number, playerId: string) => setDraft((current) => {
    if (!current) return current;
    const next = cloneConfig(current);
    const targetSession = next.sessions.find((item) => item.id === activeSession);
    const match = targetSession?.matches.find((item) => item.id === matchId);
    if (!match) return current;
    const key = teamId === "wix" ? "teamWixPlayerIds" : "teamJbonePlayerIds";
    match[key][slot] = playerId;
    return next;
  });

  const changeCourse = (courseId: "gamble-sands" | "scarecrow") => setDraft((current) => {
    if (!current) return current;
    const next = cloneConfig(current);
    const target = next.sessions.find((item) => item.id === activeSession);
    if (target) {
      target.courseId = courseId;
      target.teeName = CHAMPIONSHIP_COURSES.find((course) => course.id === courseId)?.defaultTee ?? "Sands";
    }
    return next;
  });

  const changeTee = (teeName: string) => setDraft((current) => {
    if (!current) return current;
    const next = cloneConfig(current);
    const target = next.sessions.find((item) => item.id === activeSession);
    if (target) target.teeName = teeName;
    return next;
  });

  const save = async () => {
    if (!draft || errors.length) return;
    setSaving(true);
    setMessage(null);
    try {
      const next = cloneConfig(draft);
      next.status = "locked";
      const response = await fetch("/api/live-scoring", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "replace-config", pin, config: next }),
      });
      const result = await response.json() as { ok?: boolean; config?: TournamentConfig; error?: string; details?: string[] };
      if (!response.ok || !result.ok || !result.config) throw new Error(result.details?.join(" ") ?? result.error ?? "Setup did not save.");
      setDraft(cloneConfig(result.config));
      setPayload((current) => current ? { ...current, config: result.config as TournamentConfig } : current);
      setMessage("Teams and all 25 matches are locked.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Setup did not save.");
    } finally {
      setSaving(false);
    }
  };

  const resetScores = async () => {
    if (!window.confirm("Clear every live score from all 25 matches? This cannot be undone.")) return;
    setSaving(true);
    try {
      const response = await fetch("/api/live-scoring", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reset-scores", pin }) });
      const result = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error ?? "Scores were not reset.");
      setMessage("All match scores were cleared.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Scores were not reset.");
    } finally {
      setSaving(false);
    }
  };

  if (!draft || !payload) return <main className="flex min-h-[75vh] items-center justify-center"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-black/15 border-t-black" /><p className="mt-4 text-sm text-black/45">{message ?? "Loading captain setup…"}</p></div></main>;

  const teamPlayers = (teamId: TeamId) => draft.players.filter((player) => player.teamId === teamId).sort((a, b) => a.index - b.index);
  const activeCourse = session ? CHAMPIONSHIP_COURSES.find((course) => course.id === session.courseId) : null;
  const slotCount = session?.format === "singles" ? 1 : 2;

  return (
    <main className="mx-auto max-w-[1400px] px-5 py-10 md:px-8 md:py-14">
      <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-black/38">Captain control room</p><h1 className="mt-2 text-4xl font-medium tracking-[-0.05em] md:text-6xl">Lock the field.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-black/55">Assign exactly 10 players to each team, then set the five partner matches and ten Singles matches. Every player must appear exactly once per session.</p></div>
        <div className={`border p-5 ${payload.storageMode === "shared" ? "border-emerald-200 bg-emerald-50" : "border-amber-300 bg-amber-50"}`}><div className="text-[10px] font-semibold uppercase tracking-[0.18em]">{payload.storageMode === "shared" ? "Shared live storage connected" : "Preview storage only"}</div><p className="mt-2 text-sm leading-6">{payload.storageMode === "shared" ? "Captain changes and group scores will synchronize across devices." : "Use PIN “preview” to test setup. Do not lock tournament pairings here until shared storage is connected."}</p></div>
      </div>

      <section className="mt-10 border border-black/10 bg-white p-5 md:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/38">Step 1</p><h2 className="mt-1 text-2xl font-medium">Assign the two teams</h2></div><div className="font-mono text-sm">WIX {teamPlayers("wix").length}/10 · J-BONE {teamPlayers("jbone").length}/10</div></div>
        <div className="mt-6 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {[...draft.players].sort((a, b) => a.index - b.index).map((player) => <div key={player.id} className="grid grid-cols-[1fr_auto] items-center gap-3 border border-black/8 bg-[#faf8f3] p-3"><div><div className="text-sm font-medium">{player.name}</div><div className="mt-0.5 font-mono text-xs text-black/40">{player.index.toFixed(1)}</div></div><div className="flex"><button type="button" onClick={() => assignTeam(player.id, "wix")} className={`px-2.5 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] ${player.teamId === "wix" ? "bg-[#bd7a48] text-white" : "bg-black/5"}`}>WIX</button><button type="button" onClick={() => assignTeam(player.id, "jbone")} className={`px-2.5 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] ${player.teamId === "jbone" ? "bg-[#315d4e] text-white" : "bg-black/5"}`}>J-B</button></div></div>)}
        </div>
        <button type="button" onClick={() => setDraft((current) => current ? autoPair(current) : current)} className="mt-5 border border-black/12 bg-black px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white">Build balanced pairings from teams</button>
      </section>

      <section className="mt-5 border border-black/10 bg-white p-5 md:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/38">Step 2</p><h2 className="mt-1 text-2xl font-medium">Set every session and match</h2></div>{errors.length ? <div className="rounded-full bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-800">{errors.length} setup issue{errors.length === 1 ? "" : "s"}</div> : <div className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800">All 75 points valid</div>}</div>
        <div className="mt-6 flex gap-1 overflow-x-auto">{draft.sessions.map((item) => <button key={item.id} type="button" onClick={() => setActiveSession(item.id)} className={`min-w-max border px-4 py-3 text-left ${activeSession === item.id ? "border-black bg-black text-white" : "border-black/10 bg-[#faf8f3]"}`}><span className="block text-[9px] uppercase tracking-[0.16em] opacity-50">Round {item.number}</span><span className="mt-1 block text-sm font-semibold">{FORMAT_RULES[item.format].label}</span></button>)}</div>

        {session ? <>
          <div className="mt-6 grid gap-4 border border-black/8 bg-[#ede6d9] p-4 md:grid-cols-2"><label className="text-xs font-semibold uppercase tracking-[0.14em]">Course<select value={session.courseId} onChange={(event) => changeCourse(event.target.value as "gamble-sands" | "scarecrow")} className="mt-2 w-full border border-black/10 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal"><option value="gamble-sands">Gamble Sands</option><option value="scarecrow">Scarecrow</option></select></label><label className="text-xs font-semibold uppercase tracking-[0.14em]">Tee<select value={session.teeName} onChange={(event) => changeTee(event.target.value)} className="mt-2 w-full border border-black/10 bg-white px-3 py-3 text-sm font-normal normal-case tracking-normal">{activeCourse?.tees.map((tee) => <option key={tee.name} value={tee.name}>{tee.name} · {tee.yards.toLocaleString()} · {tee.rating.toFixed(1)}/{tee.slope}</option>)}</select></label></div>
          <div className="mt-4 grid gap-3 xl:grid-cols-2">{session.matches.map((match) => <div key={match.id} className="border border-black/8 bg-[#faf8f3] p-4"><div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/38">Match {match.number} · 3 points</div><div className="grid grid-cols-2 gap-3">{(["wix", "jbone"] as const).map((teamId) => <div key={teamId}><div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-black/40">{draft.teams[teamId].name}</div><div className="space-y-2">{Array.from({ length: slotCount }).map((_, slot) => { const ids = teamId === "wix" ? match.teamWixPlayerIds : match.teamJbonePlayerIds; return <select key={slot} value={ids[slot] ?? ""} onChange={(event) => updateSlot(match.id, teamId, slot, event.target.value)} className="w-full border border-black/10 bg-white px-3 py-2.5 text-sm"><option value="">Choose player</option>{teamPlayers(teamId).map((player) => <option key={player.id} value={player.id}>{player.nickname} · {player.index.toFixed(1)}</option>)}</select>; })}</div></div>)}</div></div>)}</div>
        </> : null}
      </section>

      {errors.length ? <div className="mt-5 border border-rose-200 bg-rose-50 p-5"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-800">Fix before locking</div><ul className="mt-3 space-y-2 text-sm text-rose-900">{errors.map((error) => <li key={error}>• {error}</li>)}</ul></div> : null}

      <section className="mt-5 border border-black/10 bg-[#12362c] p-5 text-white md:p-7"><div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-end"><div><label htmlFor="captain-pin" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Captain PIN</label><input id="captain-pin" type="password" value={pin} onChange={(event) => setPin(event.target.value)} placeholder={payload.storageMode === "preview" ? "preview" : "Enter scoring PIN"} className="mt-2 w-full max-w-md border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30" />{message ? <p className="mt-3 text-sm text-white/70">{message}</p> : null}</div><div className="flex flex-wrap gap-2"><button type="button" disabled={saving || errors.length > 0} onClick={() => void save()} className="bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-black disabled:opacity-35">{saving ? "Saving…" : "Lock teams + pairings"}</button><button type="button" disabled={saving} onClick={() => void resetScores()} className="border border-rose-300/35 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-rose-100">Reset all scores</button></div></div></section>
    </main>
  );
}
