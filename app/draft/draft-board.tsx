"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TEAM_SIZE } from "@/lib/players";
import { summarizeTeam } from "@/lib/draft-engine";
import type { DraftRecommendation, PlayerDraftStats } from "@/lib/types";

interface DraftPayload {
  updatedAt: string;
  source: string;
  players: PlayerDraftStats[];
  recommendations: DraftRecommendation[];
  optimalTeams: { A: PlayerDraftStats[]; B: PlayerDraftStats[] };
  rosterNote: {
    out: string;
    in: string;
    blazeHandicap: { index: string; lowest: string } | null;
  };
}

type TeamKey = "A" | "B" | null;

const heatStyles = {
  heating: "bg-orange-100 text-orange-800 border-orange-200",
  steady: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cooling: "bg-sky-100 text-sky-800 border-sky-200",
  unknown: "bg-stone-100 text-stone-600 border-stone-200",
};

function formatIndex(player: PlayerDraftStats) {
  if (player.indexNum !== null) return player.indexNum.toFixed(1);
  if (player.estimatedIndex) return `~${player.estimatedIndex}`;
  return "—";
}

export default function DraftBoard() {
  const [data, setData] = useState<DraftPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [activeTeam, setActiveTeam] = useState<TeamKey>("A");
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/grint/players");
      if (!response.ok) throw new Error("Failed to load player data");
      const payload: DraftPayload = await response.json();
      setData(payload);
      setTeamA(payload.optimalTeams.A.map((p) => p.id));
      setTeamB(payload.optimalTeams.B.map((p) => p.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const playerMap = useMemo(() => {
    const map = new Map<string, PlayerDraftStats>();
    data?.players.forEach((player) => map.set(player.id, player));
    return map;
  }, [data]);

  const draftedIds = useMemo(() => new Set([...teamA, ...teamB]), [teamA, teamB]);

  const availablePlayers = useMemo(() => {
    if (!data) return [];
    return data.players.filter((player) => {
      if (draftedIds.has(player.id)) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        player.name.toLowerCase().includes(q) ||
        player.nickname.toLowerCase().includes(q) ||
        player.tags.some((tag) => tag.includes(q))
      );
    });
  }, [data, draftedIds, search]);

  const draftPlayer = (playerId: string) => {
    if (!activeTeam || draftedIds.has(playerId)) return;
    const setter = activeTeam === "A" ? setTeamA : setTeamB;
    const current = activeTeam === "A" ? teamA : teamB;
    if (current.length >= TEAM_SIZE) return;
    setter([...current, playerId]);
  };

  const undraftPlayer = (playerId: string) => {
    setTeamA((prev) => prev.filter((id) => id !== playerId));
    setTeamB((prev) => prev.filter((id) => id !== playerId));
  };

  const applyOptimal = () => {
    if (!data) return;
    setTeamA(data.optimalTeams.A.map((p) => p.id));
    setTeamB(data.optimalTeams.B.map((p) => p.id));
  };

  const resetDraft = () => {
    setTeamA([]);
    setTeamB([]);
  };

  const teamAStats = useMemo(
    () => teamA.map((id) => playerMap.get(id)).filter(Boolean) as PlayerDraftStats[],
    [teamA, playerMap],
  );
  const teamBStats = useMemo(
    () => teamB.map((id) => playerMap.get(id)).filter(Boolean) as PlayerDraftStats[],
    [teamB, playerMap],
  );

  const teamASummary = summarizeTeam(teamAStats);
  const teamBSummary = summarizeTeam(teamBStats);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-3xl border border-[#14352a]/10 bg-white px-8 py-10 text-center shadow-sm">
          <div className="text-xs uppercase tracking-[0.3em] text-[#14352a]/50">Connecting to TheGrint</div>
          <div className="mt-3 font-serif text-3xl">Loading handicaps & form...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <p className="text-lg text-red-700">{error ?? "No data"}</p>
        <button
          onClick={loadData}
          className="mt-6 rounded-2xl bg-[#14352a] px-6 py-3 text-sm uppercase tracking-[0.18em] text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-[#14352a]/55">Strand Draft Lab</div>
          <h1 className="mt-2 font-serif text-5xl">Build the winning team</h1>
          <p className="mt-3 max-w-3xl text-[#14352a]/75">
            Live TheGrint handicaps, heat indicators, and snake-draft recommendations for Gamble Sands 2026.
            Eric &quot;Blaze&quot; Therrien is out — Brian Kerns is in.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={applyOptimal}
            className="rounded-2xl bg-[#14352a] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white"
          >
            Load optimal draft
          </button>
          <button
            onClick={resetDraft}
            className="rounded-2xl border border-[#14352a]/15 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em]"
          >
            Clear board
          </button>
          <button
            onClick={loadData}
            className="rounded-2xl border border-[#14352a]/15 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em]"
          >
            Refresh GHIN
          </button>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.75rem] border border-[#14352a]/10 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.22em] text-[#14352a]/50">Data source</div>
          <div className="mt-2 font-medium">{data.source}</div>
          <div className="mt-1 text-sm text-[#14352a]/60">
            Updated {new Date(data.updatedAt).toLocaleString()}
          </div>
        </div>
        <div className="rounded-[1.75rem] border border-orange-200 bg-orange-50 p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.22em] text-orange-700/70">Heating up</div>
          <div className="mt-2 font-serif text-2xl">
            {data.players.filter((p) => p.heat === "heating").length} players
          </div>
          <div className="mt-1 text-sm text-orange-800/80">Index above recent low handicap</div>
        </div>
        <div className="rounded-[1.75rem] border border-[#14352a]/10 bg-[#14352a] p-5 text-white shadow-sm">
          <div className="text-xs uppercase tracking-[0.22em] text-white/60">Roster change</div>
          <div className="mt-2 text-sm">
            <span className="line-through opacity-60">{data.rosterNote.out}</span>
            <span className="mx-2">→</span>
            <span className="font-semibold">{data.rosterNote.in}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-[#14352a]/50">Draft board</div>
                <h2 className="mt-1 font-serif text-3xl">Pick to: Team {activeTeam ?? "—"}</h2>
              </div>
              <div className="flex gap-2">
                {(["A", "B"] as const).map((team) => (
                  <button
                    key={team}
                    onClick={() => setActiveTeam(team)}
                    className={`rounded-2xl px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] ${
                      activeTeam === team
                        ? "bg-[#14352a] text-white"
                        : "border border-[#14352a]/15 bg-[#f7f3ea]"
                    }`}
                  >
                    Team {team}
                  </button>
                ))}
              </div>
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players..."
              className="mb-4 w-full rounded-2xl border border-[#14352a]/10 bg-[#f7f3ea] px-4 py-3 text-sm outline-none"
            />

            <div className="space-y-3">
              {availablePlayers.map((player) => (
                <button
                  key={player.id}
                  onClick={() => draftPlayer(player.id)}
                  disabled={!activeTeam || (activeTeam === "A" ? teamA : teamB).length >= TEAM_SIZE}
                  className="flex w-full items-center justify-between rounded-2xl border border-[#14352a]/10 bg-[#f7f3ea] px-4 py-4 text-left transition hover:border-[#14352a]/25 hover:bg-white disabled:opacity-40"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#14352a] text-sm font-semibold text-white">
                      #{player.draftRank}
                    </div>
                    <div>
                      <div className="font-medium">
                        {player.name} <span className="text-[#14352a]/50">({player.nickname})</span>
                      </div>
                      <div className="mt-1 text-sm text-[#14352a]/65">{player.heatLabel}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-2xl">{formatIndex(player)}</div>
                    <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${heatStyles[player.heat]}`}>
                      {player.heat}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
            <div className="text-xs uppercase tracking-[0.22em] text-[#14352a]/50">Recommended pick order</div>
            <h2 className="mt-1 font-serif text-3xl">Best winning draft</h2>
            <div className="mt-5 space-y-2">
              {data.recommendations.map((rec) => {
                const player = playerMap.get(rec.playerId);
                if (!player) return null;
                return (
                  <div
                    key={rec.pick}
                    className="grid grid-cols-[56px_1.4fr_0.8fr_1.6fr] items-center gap-3 rounded-2xl border border-[#14352a]/8 px-4 py-3 text-sm"
                  >
                    <div className="font-serif text-2xl text-[#14352a]/70">{rec.pick}</div>
                    <div className="font-medium">{player.name}</div>
                    <div>{formatIndex(player)}</div>
                    <div className="text-[#14352a]/65">{rec.rationale}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          {[
            { key: "A" as const, ids: teamA, stats: teamAStats, summary: teamASummary, dark: true },
            { key: "B" as const, ids: teamB, stats: teamBStats, summary: teamBSummary, dark: false },
          ].map((team) => (
            <div
              key={team.key}
              className={`rounded-[2rem] border p-6 shadow-sm ${
                team.dark
                  ? "border-[#14352a] bg-[#14352a] text-white"
                  : "border-[#14352a]/10 bg-white text-[#14352a]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className={`text-xs uppercase tracking-[0.22em] ${team.dark ? "text-white/55" : "text-[#14352a]/50"}`}>
                    Team {team.key}
                  </div>
                  <h3 className="mt-1 font-serif text-3xl">
                    {team.ids.length}/{TEAM_SIZE} players
                  </h3>
                </div>
                <div className={`rounded-2xl px-3 py-2 text-sm ${team.dark ? "bg-white/10" : "bg-[#f7f3ea]"}`}>
                  Avg index {team.summary.avgIndex ? team.summary.avgIndex.toFixed(1) : "—"}
                </div>
              </div>
              <div className={`mt-2 text-sm ${team.dark ? "text-white/70" : "text-[#14352a]/65"}`}>
                {team.summary.heating} heating • Draft score{" "}
                {team.stats.reduce((sum, p) => sum + p.draftScore, 0).toFixed(1)}
              </div>
              <div className="mt-4 space-y-2">
                {team.stats.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                      team.dark ? "bg-white/10" : "bg-[#f7f3ea]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm opacity-60">{index + 1}</span>
                      <div>
                        <div className="font-medium">{player.nickname}</div>
                        <div className={`text-xs ${team.dark ? "text-white/60" : "text-[#14352a]/55"}`}>
                          {player.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-xl">{formatIndex(player)}</span>
                      <button
                        onClick={() => undraftPlayer(player.id)}
                        className={`rounded-xl px-2 py-1 text-xs uppercase tracking-[0.12em] ${
                          team.dark ? "bg-white/15 hover:bg-white/25" : "bg-white hover:bg-white/80"
                        }`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {Array.from({ length: TEAM_SIZE - team.stats.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className={`rounded-2xl border border-dashed px-4 py-3 text-sm ${
                      team.dark ? "border-white/20 text-white/40" : "border-[#14352a]/15 text-[#14352a]/40"
                    }`}
                  >
                    Open roster spot
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}