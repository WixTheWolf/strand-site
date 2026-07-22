"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getCourseForSession, scoreMatch, type HoleScore, type MatchScore, type TournamentConfig } from "@/lib/live-scoring";
import { strokesOnHole } from "@/lib/course-intelligence";

interface LivePayload {
  config: TournamentConfig;
  scores: Record<string, MatchScore>;
  storageMode: "shared" | "preview";
  error?: string;
}

function ScoreStepper({ value, onChange, label }: { value: number | null; onChange: (value: number | null) => void; label: string }) {
  const change = (amount: number) => onChange(Math.max(1, Math.min(20, (value ?? 4) + amount)));
  return (
    <div className="grid grid-cols-[3.25rem_1fr_3.25rem] overflow-hidden border border-black/12 bg-white">
      <button type="button" onClick={() => change(-1)} className="min-h-14 border-r border-black/10 text-2xl" aria-label={`Subtract one from ${label}`}>−</button>
      <input
        type="number"
        inputMode="numeric"
        min="1"
        max="20"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value ? Math.max(1, Math.min(20, Number(event.target.value))) : null)}
        className="min-w-0 bg-transparent text-center font-mono text-2xl font-semibold outline-none"
        aria-label={label}
        placeholder="—"
      />
      <button type="button" onClick={() => change(1)} className="min-h-14 border-l border-black/10 text-2xl" aria-label={`Add one to ${label}`}>+</button>
    </div>
  );
}

function resultLabel(winner: "wix" | "jbone" | "tie" | "pending", wixName: string, jboneName: string) {
  if (winner === "wix") return wixName;
  if (winner === "jbone") return jboneName;
  if (winner === "tie") return "All square";
  return "Not started";
}

function holeDraftKey(matchId: string, hole: number) {
  return `strand-2026-unsynced-hole:${matchId}:${hole}`;
}

export default function MatchScorecard({ matchId }: { matchId: string }) {
  const [payload, setPayload] = useState<LivePayload | null>(null);
  const [activeHole, setActiveHole] = useState(1);
  const [draft, setDraft] = useState<HoleScore>({});
  const [scorerName, setScorerName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [online, setOnline] = useState(true);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/live-scoring", { cache: "no-store" });
      const next = await response.json() as LivePayload;
      if (!response.ok || next.error) throw new Error(next.error ?? "Unable to open this scorecard.");
      setPayload(next);
      const session = next.config.sessions.find((item) => item.matches.some((match) => match.id === matchId));
      const match = session?.matches.find((item) => item.id === matchId);
      if (!session || !match) throw new Error("Match not found.");
      const result = scoreMatch(next.config, session, match, next.scores[matchId]);
      const firstOpen = result.holeResults.find((hole) => hole.winner === "pending")?.hole ?? 18;
      setActiveHole(firstOpen);
      setDraft(next.scores[matchId]?.holes[firstOpen] ?? {});
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to open this scorecard.");
    }
  }, [matchId]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const saved = window.localStorage.getItem("strand-scorer-name");
    if (saved) setScorerName(saved);
  }, []);
  useEffect(() => {
    const update = () => setOnline(window.navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const session = payload?.config.sessions.find((item) => item.matches.some((match) => match.id === matchId));
  const match = session?.matches.find((item) => item.id === matchId);
  const matchResult = useMemo(() => payload && session && match
    ? scoreMatch(payload.config, session, match, payload.scores[matchId])
    : null, [payload, session, match, matchId]);
  const courseData = session ? getCourseForSession(session) : null;
  const hole = courseData?.course.holes[activeHole - 1];
  const yardage = courseData?.tee.holeYards[activeHole - 1];
  const players = match && payload
    ? [...match.teamWixPlayerIds, ...match.teamJbonePlayerIds].map((id) => payload.config.players.find((player) => player.id === id)).filter((player): player is NonNullable<typeof player> => Boolean(player))
    : [];

  useEffect(() => {
    if (!payload) return;
    setDirty(false);
    try {
      const local = window.localStorage.getItem(holeDraftKey(matchId, activeHole));
      if (local) {
        setDraft(JSON.parse(local) as HoleScore);
        setDirty(true);
        setMessage(`Recovered unsynced scores for hole ${activeHole} from this device.`);
        return;
      }
    } catch {
      window.localStorage.removeItem(holeDraftKey(matchId, activeHole));
    }
    setDraft(payload.scores[matchId]?.holes[activeHole] ?? {});
    setMessage(null);
  }, [activeHole, matchId, payload]);

  useEffect(() => {
    if (!dirty) return;
    window.localStorage.setItem(holeDraftKey(matchId, activeHole), JSON.stringify(draft));
  }, [activeHole, dirty, draft, matchId]);

  const setPlayerScore = (playerId: string, value: number | null) => {
    setDirty(true);
    setDraft((current) => ({
      ...current,
      playerGross: { ...(current.playerGross ?? {}), [playerId]: value },
    }));
  };
  const setTeamScore = (teamId: "wix" | "jbone", value: number | null) => {
    setDirty(true);
    setDraft((current) => ({
      ...current,
      teamGross: { ...(current.teamGross ?? {}), [teamId]: value },
    }));
  };

  const save = async () => {
    if (!payload || !session || !match) return;
    const complete = session.format === "scramble"
      ? [draft.teamGross?.wix, draft.teamGross?.jbone].every((value) => typeof value === "number")
      : players.every((player) => typeof draft.playerGross?.[player.id] === "number");
    if (!complete) {
      setMessage("Enter a gross score for both sides before saving this hole.");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      if (scorerName.trim()) window.localStorage.setItem("strand-scorer-name", scorerName.trim());
      window.localStorage.setItem(holeDraftKey(matchId, activeHole), JSON.stringify(draft));
      if (!window.navigator.onLine) {
        setMessage(`No signal. Hole ${activeHole} is safe on this device—tap save again when you reconnect.`);
        return;
      }
      const response = await fetch("/api/live-scoring", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-hole", matchId, hole: activeHole, score: draft, scorerName }),
      });
      const result = await response.json() as { ok?: boolean; score?: MatchScore; error?: string };
      if (!response.ok || !result.ok || !result.score) throw new Error(result.error ?? "Score did not save.");
      window.localStorage.removeItem(holeDraftKey(matchId, activeHole));
      setDirty(false);
      const nextPayload = { ...payload, scores: { ...payload.scores, [matchId]: result.score } };
      setPayload(nextPayload);
      const nextResult = scoreMatch(payload.config, session, match, result.score);
      const nextOpen = nextResult.holeResults.find((item) => item.hole > activeHole && item.winner === "pending")?.hole;
      if (nextOpen) {
        setActiveHole(nextOpen);
        setMessage(`Hole ${activeHole} saved.`);
      } else {
        setMessage(nextResult.complete ? "Match complete. All three points are final." : `Hole ${activeHole} saved.`);
      }
    } catch (caught) {
      window.localStorage.setItem(holeDraftKey(matchId, activeHole), JSON.stringify(draft));
      const detail = caught instanceof Error ? caught.message : "Score did not save.";
      setMessage(`${detail} Hole ${activeHole} is still safe on this device—tap save to retry.`);
    } finally {
      setSaving(false);
    }
  };

  if (!payload && !error) return <main className="flex min-h-[75vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-black/15 border-t-black" /></main>;
  if (!payload || !session || !match || !matchResult || !courseData || !hole) return <main className="mx-auto max-w-2xl px-5 py-24 text-center"><h1 className="text-3xl font-medium">Scorecard unavailable</h1><p className="mt-3 text-black/55">{error ?? "This match could not be found."}</p><Link href="/live" className="mt-6 inline-flex bg-black px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white">Back to leaderboard</Link></main>;

  const wixPlayers = players.filter((player) => player.teamId === "wix");
  const jbonePlayers = players.filter((player) => player.teamId === "jbone");
  const currentResult = matchResult.holeResults[activeHole - 1];

  return (
    <main className="pb-28">
      <section className="bg-[#12362c] text-white">
        <div className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-10">
          <div className="flex items-center justify-between gap-4">
            <div><div className="text-[10px] uppercase tracking-[0.22em] text-white/45">{session.name} · Match {match.number}</div><h1 className="mt-2 text-2xl font-medium tracking-[-0.04em] md:text-4xl">{wixPlayers.map((player) => player.nickname).join(" + ")} <span className="text-white/30">vs</span> {jbonePlayers.map((player) => player.nickname).join(" + ")}</h1></div>
            <div className="text-right"><div className="text-[9px] uppercase tracking-[0.16em] text-white/40">Thru</div><div className="font-mono text-3xl font-semibold">{matchResult.holesComplete}</div></div>
          </div>
          <div className="mt-7 grid grid-cols-3 gap-2">
            {Object.values(matchResult.segments).map((segment) => <div key={segment.id} className="border border-white/12 bg-white/7 p-3 text-center"><div className="text-[9px] uppercase tracking-[0.16em] text-white/40">{segment.label}</div><div className="mt-1 text-sm font-semibold">{resultLabel(segment.winner, "WIX", "J-BONE")}</div><div className="mt-1 font-mono text-xs text-white/45">{segment.wixHoles}–{segment.jboneHoles}</div></div>)}
          </div>
        </div>
      </section>

      {payload.storageMode === "preview" ? <div className="border-b border-amber-300 bg-amber-50 px-5 py-3 text-center text-xs"><b>Preview storage:</b> do not use for the tournament until shared sync is connected.</div> : null}

      <section className="mx-auto max-w-5xl px-5 py-7 md:px-8">
        <div className="flex gap-1 overflow-x-auto pb-2">
          {matchResult.holeResults.map((item) => {
            const selected = item.hole === activeHole;
            const tone = item.winner === "wix" ? "bg-[#d8b28c]" : item.winner === "jbone" ? "bg-[#8fb2a1]" : item.winner === "tie" ? "bg-black/15" : "bg-white";
            return <button key={item.hole} type="button" onClick={() => setActiveHole(item.hole)} className={`min-w-11 border px-2 py-3 text-center font-mono text-xs ${selected ? "border-black ring-2 ring-black/10" : "border-black/8"} ${tone}`}>{item.hole}</button>;
          })}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
          <aside>
            <div className="border border-black/10 bg-white p-5">
              <div className="flex items-start justify-between">
                <div><div className="text-[10px] uppercase tracking-[0.2em] text-black/35">Hole {activeHole}</div><div className="mt-1 font-mono text-4xl font-semibold">Par {hole.par}</div></div>
                <div className="text-right"><div className="font-mono text-2xl font-semibold">{yardage}</div><div className="text-[9px] uppercase tracking-[0.16em] text-black/35">{courseData.tee.name} yards</div></div>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-black/8 pt-4 text-sm"><span>Stroke index</span><span className="font-mono font-semibold">{hole.strokeIndex}</span></div>
              <p className="mt-4 text-sm leading-6 text-black/55">{hole.strategy}</p>
              <Link href={`/courses#${session.courseId}`} className="mt-4 inline-flex border-b border-black pb-1 text-[10px] font-semibold uppercase tracking-[0.16em]">Full hole strategy</Link>
            </div>

            <div className="mt-3 border border-black/10 bg-[#ede6d9] p-5">
              <div className="text-[10px] uppercase tracking-[0.2em] text-black/38">Playing handicaps</div>
              <div className="mt-4 space-y-3">
                {session.format === "scramble" ? (["wix", "jbone"] as const).map((teamId) => <div key={teamId} className="flex items-center justify-between text-sm"><span>{payload.config.teams[teamId].name}</span><span className="font-mono font-semibold">{matchResult.scrambleHandicaps?.[teamId] ?? 0} {strokesOnHole(matchResult.scrambleHandicaps?.[teamId] ?? 0, hole.strokeIndex) ? "●" : ""}</span></div>) : matchResult.playingHandicaps.map((handicap) => {
                  const player = payload.config.players.find((item) => item.id === handicap.playerId);
                  return <div key={handicap.playerId} className="flex items-center justify-between text-sm"><span>{player?.nickname}</span><span className="font-mono font-semibold">{handicap.matchHandicap} {strokesOnHole(handicap.matchHandicap, hole.strokeIndex) ? "●" : ""}</span></div>;
                })}
              </div>
              <p className="mt-4 border-t border-black/8 pt-3 text-xs leading-5 text-black/45">● receives a stroke on this hole. All match handicaps are played off the lowest allowance in the group.</p>
            </div>
          </aside>

          <div className="border border-black/10 bg-[#faf8f3] p-5 md:p-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div><div className="text-[10px] uppercase tracking-[0.2em] text-black/35">Enter gross scores</div><h2 className="mt-1 text-3xl font-medium tracking-[-0.04em]">Hole {activeHole}</h2></div>
              <div className="flex flex-wrap items-center gap-2">
                {!online ? <div className="rounded-full bg-amber-100 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-900">No signal · device save</div> : null}
                {dirty ? <div className="rounded-full bg-sky-100 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-sky-900">Safe on device · not synced</div> : null}
                {!dirty && currentResult.winner !== "pending" ? <div className="rounded-full bg-black px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white">Synced · {resultLabel(currentResult.winner, "WIX", "J-BONE")}</div> : null}
              </div>
            </div>

            {session.format === "scramble" ? (
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                {(["wix", "jbone"] as const).map((teamId) => <div key={teamId}><div className="mb-2 flex items-center justify-between"><span className="text-sm font-semibold">{payload.config.teams[teamId].name}</span><span className="text-xs text-black/40">team gross</span></div><ScoreStepper value={draft.teamGross?.[teamId] ?? null} onChange={(value) => setTeamScore(teamId, value)} label={`${payload.config.teams[teamId].name} gross score`} /></div>)}
              </div>
            ) : (
              <div className="mt-7 grid gap-x-5 gap-y-6 sm:grid-cols-2">
                {(["wix", "jbone"] as const).flatMap((teamId) => players.filter((player) => player.teamId === teamId).map((player) => {
                  const handicap = matchResult.playingHandicaps.find((item) => item.playerId === player.id);
                  const stroke = strokesOnHole(handicap?.matchHandicap ?? 0, hole.strokeIndex);
                  return <div key={player.id}><div className="mb-2 flex items-center justify-between"><span className="text-sm font-semibold">{player.nickname}</span><span className="text-xs text-black/40">{payload.config.teams[teamId].shortName} · PH {handicap?.matchHandicap ?? 0}{stroke ? " · gets a stroke" : ""}</span></div><ScoreStepper value={draft.playerGross?.[player.id] ?? null} onChange={(value) => setPlayerScore(player.id, value)} label={`${player.name} gross score`} /></div>;
                }))}
              </div>
            )}

            {session.format === "shamble" ? (
              <div className="mt-6 border-t border-black/8 pt-5">
                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/40" htmlFor="selected-drive">Selected drive · optional tracking</label>
                <select id="selected-drive" value={draft.selectedDrivePlayerId ?? ""} onChange={(event) => { setDirty(true); setDraft((current) => ({ ...current, selectedDrivePlayerId: event.target.value || null })); }} className="mt-2 w-full border border-black/12 bg-white px-4 py-3 text-sm outline-none"><option value="">Choose player</option>{players.map((player) => <option key={player.id} value={player.id}>{player.name}</option>)}</select>
              </div>
            ) : null}

            <div className="mt-7 border-t border-black/8 pt-5">
              <label htmlFor="scorer" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/40">Scorer name</label>
              <input id="scorer" value={scorerName} onChange={(event) => setScorerName(event.target.value)} placeholder="Who is entering scores?" className="mt-2 w-full border border-black/12 bg-white px-4 py-3 text-sm outline-none" />
            </div>

            {message ? <div className="mt-5 border border-black/10 bg-white px-4 py-3 text-sm">{message}</div> : null}
            <button type="button" disabled={saving} onClick={() => void save()} className="mt-5 w-full bg-black px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-50">{saving ? "Saving…" : currentResult.winner === "pending" ? "Save hole" : "Update hole"}</button>
            <div className="mt-3 grid grid-cols-2 gap-2"><button type="button" disabled={activeHole === 1} onClick={() => setActiveHole((value) => Math.max(1, value - 1))} className="border border-black/10 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] disabled:opacity-30">← Previous</button><button type="button" disabled={activeHole === 18} onClick={() => setActiveHole((value) => Math.min(18, value + 1))} className="border border-black/10 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] disabled:opacity-30">Next →</button></div>
          </div>
        </div>
      </section>
    </main>
  );
}
