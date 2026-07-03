"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TEAM_SIZE } from "@/lib/players";
import { summarizeTeam } from "@/lib/draft-engine";
import type { DraftRecommendation, PlayerDraftStats } from "@/lib/types";
import CaptainMockDraft from "./captain-mock-draft";
import PlayerMap from "./player-map";

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

type View = "captain" | "map" | "sandbox";

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
  const [view, setView] = useState<View>("captain");
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [activeTeam, setActiveTeam] = useState<"A" | "B">("A");
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/grint/players");
      if (!response.ok) throw new Error("Failed to load player data");
      const payload: DraftPayload = await response.json();
      setData(payload);
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

  const views: { key: View; label: string }[] = [
    { key: "captain", label: "Captain mock draft" },
    { key: "map", label: "Player map" },
    { key: "sandbox", label: "Free sandbox" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-[#14352a]/55">Strand Draft Lab</div>
          <h1 className="mt-2 font-serif text-5xl">Captain prep for Gamble Sands</h1>
          <p className="mt-3 max-w-3xl text-[#14352a]/75">
            Mock snake drafts vs Justin Uribe (J-BONE). Save multiple scenarios, plot the field on the map,
            and walk in Thursday night ready for any opening pick.
          </p>
        </div>
        <button
          onClick={loadData}
          className="rounded-2xl border border-[#14352a]/15 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em]"
        >
          Refresh GHIN
        </button>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {views.map((item) => (
          <button
            key={item.key}
            onClick={() => setView(item.key)}
            className={`rounded-2xl px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] ${
              view === item.key ? "bg-[#14352a] text-white" : "border border-[#14352a]/15 bg-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-[1.75rem] border border-[#14352a]/10 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.22em] text-[#14352a]/50">Live TheGrint</div>
          <div className="mt-2 font-medium">{data.players.filter((p) => p.dataSource === "live").length}/20 linked</div>
        </div>
        <div className="rounded-[1.75rem] border border-[#14352a]/10 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.22em] text-[#14352a]/50">Captain-verified</div>
          <div className="mt-2 font-medium">{data.players.filter((p) => p.dataSource === "manual").length} indexes</div>
        </div>
        <div className="rounded-[1.75rem] border border-orange-200 bg-orange-50 p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.22em] text-orange-700/70">Heating up</div>
          <div className="mt-2 font-serif text-2xl">
            {data.players.filter((p) => p.heat === "heating").map((p) => p.nickname).join(", ") || "—"}
          </div>
        </div>
        <div className="rounded-[1.75rem] border border-[#14352a]/10 bg-[#14352a] p-5 text-white shadow-sm">
          <div className="text-xs uppercase tracking-[0.22em] text-white/60">Snake draft</div>
          <div className="mt-2 font-serif text-2xl">WIX vs J-BONE</div>
          <div className="mt-1 text-sm text-white/70">9 picks each • 10 per team</div>
        </div>
      </div>

      {view === "captain" && <CaptainMockDraft players={data.players} />}

      {view === "map" && (
        <div className="space-y-6">
          <PlayerMap players={data.players} interactive />
          <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
            <div className="text-xs uppercase tracking-[0.22em] text-[#14352a]/50">Rankings</div>
            <div className="mt-4 space-y-2">
              {data.recommendations.slice(0, 10).map((rec) => {
                const player = playerMap.get(rec.playerId);
                if (!player) return null;
                return (
                  <div key={rec.pick} className="flex justify-between rounded-xl bg-[#f7f3ea] px-4 py-2 text-sm">
                    <span>#{rec.pick} {player.name} ({player.nickname})</span>
                    <span>{formatIndex(player)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {view === "sandbox" && (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-serif text-3xl">Free-form board</h2>
                <div className="flex gap-2">
                  {(["A", "B"] as const).map((team) => (
                    <button
                      key={team}
                      onClick={() => setActiveTeam(team)}
                      className={`rounded-2xl px-4 py-2 text-sm font-semibold uppercase ${
                        activeTeam === team ? "bg-[#14352a] text-white" : "border"
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
                className="mb-4 w-full rounded-2xl border bg-[#f7f3ea] px-4 py-3 text-sm outline-none"
              />
              <div className="space-y-2">
                {availablePlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => {
                      const setter = activeTeam === "A" ? setTeamA : setTeamB;
                      const current = activeTeam === "A" ? teamA : teamB;
                      if (current.length < TEAM_SIZE) setter([...current, player.id]);
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border bg-[#f7f3ea] px-4 py-3 text-left hover:bg-white"
                  >
                    <span>#{player.draftRank} {player.nickname}</span>
                    <span className="font-serif text-xl">{formatIndex(player)}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
          <section className="space-y-4">
            {[
              { key: "A" as const, ids: teamA, dark: true },
              { key: "B" as const, ids: teamB, dark: false },
            ].map((team) => {
              const stats = team.ids.map((id) => playerMap.get(id)).filter(Boolean) as PlayerDraftStats[];
              const summary = summarizeTeam(stats);
              return (
                <div
                  key={team.key}
                  className={`rounded-[2rem] border p-5 ${team.dark ? "bg-[#14352a] text-white" : "bg-white"}`}
                >
                  <h3 className="font-serif text-2xl">Team {team.key}</h3>
                  <div className="mt-1 text-sm opacity-70">Avg {summary.avgIndex?.toFixed(1) ?? "—"}</div>
                  <div className="mt-3 space-y-1">
                    {stats.map((p) => (
                      <div key={p.id} className={`flex justify-between rounded-xl px-3 py-2 text-sm ${team.dark ? "bg-white/10" : "bg-[#f7f3ea]"}`}>
                        <span>{p.nickname}</span>
                        <span>{formatIndex(p)}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => (team.key === "A" ? setTeamA([]) : setTeamB([]))}
                    className="mt-3 text-xs uppercase tracking-[0.12em] opacity-60"
                  >
                    Clear team
                  </button>
                </div>
              );
            })}
          </section>
        </div>
      )}
    </div>
  );
}