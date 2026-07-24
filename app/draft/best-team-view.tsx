"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { summarizeTeam } from "@/lib/draft-engine";
import {
  buildSaberBoard,
  completeDraft,
  rosterMetrics,
  simulateTournament,
} from "@/lib/sabermetrics";
import {
  CAPTAIN_INTEL_STORAGE_KEY,
  JBONE_PICK_NUMBERS,
  WIX_PICK_NUMBERS,
} from "@/lib/draft-order";
import { MY_CAPTAIN, OPPONENT_CAPTAIN, DRAFT_PICKS_PER_CAPTAIN } from "@/lib/mock-draft";
import { STRAND_RULES } from "@/lib/tournament";
import type { DraftRecommendation, PlayerDraftStats } from "@/lib/types";
import type { CaptainIntelMap } from "@/lib/sabermetrics";

interface DraftPayload {
  updatedAt: string;
  source: string;
  players: PlayerDraftStats[];
  recommendations: DraftRecommendation[];
  optimalTeams: { A: PlayerDraftStats[]; B: PlayerDraftStats[] };
}

type SortKey =
  | "draftRank"
  | "name"
  | "indexNum"
  | "lowestNum"
  | "draftScore"
  | "attestNum"
  | "heat"
  | "strand";

const heatStyles = {
  heating: "bg-orange-100 text-orange-800 border-orange-200",
  steady: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cooling: "bg-sky-100 text-sky-800 border-sky-200",
  unknown: "bg-stone-100 text-stone-600 border-stone-200",
};

const sourceStyles = {
  live: "bg-emerald-50 text-emerald-800",
  ghin: "bg-blue-50 text-blue-900",
  snapshot: "bg-violet-50 text-violet-900",
  manual: "bg-amber-50 text-amber-900",
  estimated: "bg-stone-100 text-stone-700",
  missing: "bg-red-50 text-red-800",
};

function formatNum(value: number | null | undefined, digits = 1) {
  if (value === null || value === undefined) return "—";
  return value.toFixed(digits);
}

function formatPlayerIndex(player: PlayerDraftStats) {
  if (player.indexNum === null) return "—";
  return `${player.indexNum.toFixed(1)}${player.eventIndexCapped ? "*" : ""}`;
}

function formatRaw(value: string | null | undefined) {
  if (!value || value === "N/A") return "—";
  return value;
}

function DataCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-[0.18em] text-[#111]/45">{label}</div>
      <div className="mt-0.5 truncate text-sm font-medium">{value}</div>
    </div>
  );
}

function TeamRosterCard({
  pick,
  dark = false,
}: {
  pick: { overallPick: number; player: PlayerDraftStats; rationale: string };
  dark?: boolean;
}) {
  const { player, overallPick, rationale } = pick;
  const h = player.handicap;

  return (
    <article
      className={`rounded-[1.5rem] border p-5 shadow-sm ${
        dark ? "border-white/10 bg-white/10 text-white" : "border-[#111]/10 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={`text-xs uppercase tracking-[0.2em] ${dark ? "text-white/50" : "text-[#111]/50"}`}>
            {overallPick === 0 ? "Captain (locked)" : `Pick #${overallPick}`}
          </div>
          <h3 className="mt-1 text-lg font-medium">{player.name}</h3>
          <div className={`text-sm ${dark ? "text-white/70" : "text-[#111]/65"}`}>
            {player.nickname} • #{player.draftRank} overall
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-medium">{formatPlayerIndex(player)}</div>
          <div className={`text-xs uppercase tracking-[0.16em] ${dark ? "text-white/50" : "text-[#111]/50"}`}>
            index
          </div>
        </div>
      </div>

      <p className={`mt-3 text-sm leading-relaxed ${dark ? "text-white/75" : "text-[#111]/75"}`}>
        {player.blurb}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <DataCell label="Draft score" value={formatNum(player.draftScore, 1)} />
        <DataCell label="Lowest" value={formatNum(player.lowestNum)} />
        <DataCell label="Attest %" value={formatNum(player.attestNum, 0)} />
        <DataCell label="Form" value={player.heatLabel} />
        <DataCell label="Strand W–L" value={recordLabel(player)} />
      </div>

      <div className={`mt-4 rounded-xl px-3 py-2 text-xs ${dark ? "bg-black/20 text-white/80" : "bg-[#f7f5f0] text-[#111]/75"}`}>
        {rationale}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${heatStyles[player.heat]}`}>
          {player.heat}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${sourceStyles[player.dataSource]}`}>
          {player.dataSource}
        </span>
        {player.tags.map((tag) => (
          <span
            key={tag}
            className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${
              dark ? "bg-white/10 text-white/70" : "bg-[#111]/5 text-[#111]/60"
            }`}
          >
            {tag}
          </span>
        ))}
      </div>

      {player.reportedScoring && (
        <div className={`mt-4 grid grid-cols-2 gap-2 rounded-xl p-3 text-xs sm:grid-cols-5 ${dark ? "bg-black/20 text-white/80" : "bg-sky-50 text-sky-950/75"}`}>
          <DataCell label="Recent sample" value={`${player.reportedScoring.sampleSize} rounds`} />
          <DataCell label="Lifetime" value={player.reportedScoring.lifetimeRounds ? `${player.reportedScoring.lifetimeRounds} rounds` : "—"} />
          <DataCell label="9-hole avg" value={player.reportedScoring.averageToPar9 === undefined ? "—" : `+${player.reportedScoring.averageToPar9}`} />
          <DataCell label="18-hole avg" value={player.reportedScoring.averageToPar18 === undefined ? "—" : `+${player.reportedScoring.averageToPar18}`} />
          <DataCell label="Best 18" value={player.reportedScoring.bestToPar18 === undefined ? "—" : `+${player.reportedScoring.bestToPar18}`} />
        </div>
      )}

      {h && (
        <details className={`mt-4 text-xs ${dark ? "text-white/70" : "text-[#111]/65"}`}>
          <summary className="cursor-pointer uppercase tracking-[0.16em]">Model source fields</summary>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            <div>Index: {formatRaw(h.index)}</div>
            <div>Lowest: {formatRaw(h.lowest)}</div>
            <div>GHAP: {formatRaw(h.index_ghap)}</div>
            <div>Federation: {formatRaw(h.index_federation)}</div>
            <div>Attest: {formatRaw(h.attest)}</div>
            <div>Teebox: {formatRaw(h.teebox_handicap)}</div>
          </div>
        </details>
      )}
    </article>
  );
}

export default function BestTeamView() {
  const [data, setData] = useState<DraftPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("draftRank");
  const [sortAsc, setSortAsc] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [captainIntel, setCaptainIntel] = useState<CaptainIntelMap>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/grint/players");
      if (!response.ok) throw new Error("Failed to load player data");
      setData(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial client-side API hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CAPTAIN_INTEL_STORAGE_KEY);
      if (stored) {
        // Apply the same bounded qualitative layer used by the live War Room.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCaptainIntel(JSON.parse(stored) as CaptainIntelMap);
      }
    } catch {
      // Optional local context; fall back to the measured data-only model.
    }
  }, []);

  const board = useMemo(
    () => (data ? buildSaberBoard(data.players, captainIntel) : []),
    [data, captainIntel],
  );
  const projection = useMemo(
    () => (data ? completeDraft(data.players, [], board) : null),
    [data, board],
  );
  const metricMap = useMemo(
    () => new Map(board.map((metric, index) => [metric.player.id, { metric, rank: index + 1 }])),
    [board],
  );
  const wixTeam = useMemo(
    () =>
      (projection?.mine ?? []).map((player, index) => ({
        overallPick: index === 0 ? 0 : WIX_PICK_NUMBERS[index - 1] ?? index * 2,
        player,
        rationale:
          metricMap.get(player.id)?.metric.evidence.join(" • ") ??
          "Captain — pre-assigned to your team",
      })),
    [projection, metricMap],
  );
  const justinTeam = useMemo(
    () =>
      (projection?.opponent ?? []).map((player, index) => ({
        overallPick: index === 0 ? 0 : JBONE_PICK_NUMBERS[index - 1] ?? index * 2 - 1,
        player,
        rationale:
          metricMap.get(player.id)?.metric.evidence.join(" • ") ??
          "Captain — pre-assigned to opponent",
      })),
    [projection, metricMap],
  );

  const wixSummary = useMemo(() => summarizeTeam(wixTeam.map((p) => p.player)), [wixTeam]);
  const justinSummary = useMemo(() => summarizeTeam(justinTeam.map((p) => p.player)), [justinTeam]);

  const wixIds = useMemo(() => new Set(wixTeam.map((p) => p.player.id)), [wixTeam]);
  const justinIds = useMemo(() => new Set(justinTeam.map((p) => p.player.id)), [justinTeam]);

  const tournamentSimulation = useMemo(
    () =>
      simulateTournament(
        rosterMetrics(projection?.mine ?? [], board),
        rosterMetrics(projection?.opponent ?? [], board),
      ),
    [projection, board],
  );

  const rationaleMap = useMemo(
    () => new Map(board.map((metric) => [metric.player.id, metric.evidence.join(" • ")])),
    [board],
  );

  const filteredPlayers = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    let list = data.players.map((player) => ({
      ...player,
      draftRank: metricMap.get(player.id)?.rank ?? player.draftRank,
      draftScore: metricMap.get(player.id)?.metric.draftGrade ?? player.draftScore,
    }));
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nickname.toLowerCase().includes(q) ||
          p.ghinClub?.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q)),
      );
    }
    return [...list].sort((a, b) => {
      if (sortKey === "strand") {
        // Wins dominate, appearances break ties; rookies sort last
        const score = (p: PlayerDraftStats) =>
          p.strandRecord ? p.strandRecord.wins * 100 + p.strandRecord.appearances : -1;
        return sortAsc ? score(a) - score(b) : score(b) - score(a);
      }
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") {
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      const an = typeof av === "number" ? av : 0;
      const bn = typeof bv === "number" ? bv : 0;
      return sortAsc ? an - bn : bn - an;
    });
  }, [data, search, sortKey, sortAsc, metricMap]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(key === "name");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-3xl border border-[#111]/10 bg-white px-8 py-10 text-center shadow-sm">
          <div className="text-xs uppercase tracking-[0.3em] text-[#111]/50">Building optimal roster</div>
          <div className="mt-3 text-xl font-medium">Loading full player sheet...</div>
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
          className="mt-6 rounded-2xl bg-[#111] px-6 py-3 text-sm uppercase tracking-[0.18em] text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10 md:px-8">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="label">Optimal draft</p>
          <h1 className="section-title mt-3">{MY_CAPTAIN.nickname}&apos;s best team</h1>
          <p className="mt-3 max-w-3xl text-sm text-black/55">
            {MY_CAPTAIN.nickname} is pre-assigned as captain. The same Strand Sabr engine used in the
            live War Room projects your other{" "}
            {DRAFT_PICKS_PER_CAPTAIN} players vs {OPPONENT_CAPTAIN.nickname} using match-play analytics
            across fourball, shamble, singles, and scramble. The official order is locked: J-BONE odd
            picks, WIX even picks.
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#111]/45">
            Updated {new Date(data.updatedAt).toLocaleString()} • {data.source} •{" "}
            {Object.values(captainIntel).filter((item) => item.rating !== 0 || item.note?.trim()).length} captain reads applied
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-900">
            Official order locked · J-BONE picks first
          </div>
          <button
            onClick={loadData}
            className="rounded-2xl border border-[#111]/15 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em]"
          >
            Refresh data
          </button>
        </div>
      </div>

      <div className="mb-8 rounded-[2rem] border border-[#111]/10 bg-[#f7f5f0] p-6">
        <div className="text-xs uppercase tracking-[0.22em] text-[#111]/50">Rules baked into this model</div>
        <ul className="mt-3 grid gap-1.5 text-sm text-[#111]/75 md:grid-cols-2">
          {STRAND_RULES.slice(0, 6).map((rule) => (
            <li key={rule}>• {rule}</li>
          ))}
        </ul>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-[1.75rem] border border-[#111]/10 bg-[#111] p-5 text-white shadow-sm">
          <div className="text-xs uppercase tracking-[0.22em] text-white/55">Team avg index</div>
          <div className="mt-2 text-2xl font-medium">{formatNum(wixSummary.avgIndex)}</div>
        </div>
        <div className="rounded-[1.75rem] border border-[#111]/10 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.22em] text-[#111]/50">Match-play roster value</div>
          <div className="mt-2 text-2xl font-medium">{formatNum(wixSummary.matchValue, 0)}</div>
        </div>
        <div className="rounded-[1.75rem] border border-orange-200 bg-orange-50 p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.22em] text-orange-700/70">Projected WIX win</div>
          <div className="mt-2 text-2xl font-medium">{(tournamentSimulation.winProbability * 100).toFixed(0)}%</div>
        </div>
        <div className="rounded-[1.75rem] border border-[#111]/10 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.22em] text-[#111]/50">Justin&apos;s avg index</div>
          <div className="mt-2 text-2xl font-medium">{formatNum(justinSummary.avgIndex)}</div>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-medium">Your roster — {MY_CAPTAIN.nickname} + 9 picks</h2>
        <p className="mt-1 text-sm text-[#111]/65">
          Straight alternating order: WIX owns picks #2, 4, 6, 8, 10, 12, 14, 16 and 18.
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {wixTeam.map((pick) => (
            <TeamRosterCard key={pick.player.id} pick={pick} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-medium">{OPPONENT_CAPTAIN.nickname}&apos;s counter-roster</h2>
        <p className="mt-1 text-sm text-[#111]/65">
          What Justin gets if he drafts optimally from picks #1, 3, 5, 7, 9, 11, 13, 15 and 17.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {justinTeam.map((pick) => (
            <div key={pick.player.id} className="rounded-2xl border border-[#111]/10 bg-white p-4 shadow-sm">
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#111]/45">Pick #{pick.overallPick}</div>
              <div className="mt-1 font-medium">{playerLabel(pick.player)}</div>
              <div className="text-lg font-medium">{formatPlayerIndex(pick.player)}</div>
              <div className="text-xs text-[#111]/55">#{pick.player.draftRank} value</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-medium">Full player data sheet</h2>
            <p className="mt-1 text-sm text-[#111]/65">
              Performance-only roster data: index provenance, scoring depth, latest post, model value and Strand record.
            </p>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, club or scouting tag..."
            className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none sm:max-w-xs"
          />
        </div>

        <div className="overflow-x-auto rounded-[1.75rem] border border-[#111]/10 bg-white shadow-sm">
          <table className="min-w-[1080px] w-full text-left text-sm">
            <thead className="border-b bg-[#f7f5f0] text-[10px] uppercase tracking-[0.16em] text-[#111]/55">
              <tr>
                {[
                  ["draftRank", "Rank"],
                  ["name", "Player"],
                  ["indexNum", "2026 HC"],
                  ["lowestNum", "Low"],
                  ["draftScore", "Score"],
                  ["attestNum", "Attest"],
                  ["strand", "Record"],
                ].map(([key, label]) => (
                  <th key={key} className="px-3 py-3">
                    <button type="button" onClick={() => toggleSort(key as SortKey)} className="hover:text-[#111]">
                      {label}
                      {sortKey === key ? (sortAsc ? " ↑" : " ↓") : ""}
                    </button>
                  </th>
                ))}
                <th className="px-3 py-3">Team</th>
                <th className="px-3 py-3">Source</th>
                <th className="px-3 py-3">Rounds</th>
                <th className="px-3 py-3">Last post</th>
                <th className="px-3 py-3">GHIN club</th>
                <th className="px-3 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player) => {
                const team = wixIds.has(player.id) ? MY_CAPTAIN.nickname : justinIds.has(player.id) ? OPPONENT_CAPTAIN.nickname : "—";
                const expanded = expandedId === player.id;
                return (
                  <Fragment key={player.id}>
                    <tr className="border-b border-[#111]/5 hover:bg-[#f7f5f0]/50">
                      <td className="px-3 py-3 font-medium">#{player.draftRank}</td>
                      <td className="px-3 py-3">
                        <div className="font-medium">{player.name}</div>
                        <div className="text-xs text-[#111]/55">{player.nickname}</div>
                      </td>
                      <td className="px-3 py-3 text-lg font-medium">{formatPlayerIndex(player)}</td>
                      <td className="px-3 py-3">{formatNum(player.lowestNum)}</td>
                      <td className="px-3 py-3">{formatNum(player.draftScore, 1)}</td>
                      <td className="px-3 py-3">{formatNum(player.attestNum, 0)}%</td>
                      <td className="px-3 py-3">
                        <div className="font-medium">{recordLabel(player)}</div>
                        {player.strandRecord && player.strandRecord.appearances > 0 && (
                          <>
                            <div className="text-xs text-[#111]/45">
                              {player.strandRecord.appearances} trips · {player.strandRecord.winPct}%
                            </div>
                            {player.strandRecord.championshipYears.length > 0 && (
                              <div className="mt-0.5 font-mono text-[10px] text-amber-700/75">
                                🏆 {player.strandRecord.championshipYears.join(" · ")}
                              </div>
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs font-semibold uppercase tracking-[0.12em]">{team}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${sourceStyles[player.dataSource]}`}>
                          {player.dataSource}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs">
                        {(player.recentRounds?.length ?? 0) || (player.reportedScoring ? `${player.reportedScoring.sampleSize} avg` : 0)}
                      </td>
                      <td className="px-3 py-3 font-mono text-xs">{player.recentRounds?.[0]?.date ?? "—"}</td>
                      <td className="px-3 py-3 text-xs">{player.ghinClub ?? "—"}</td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => setExpandedId(expanded ? null : player.id)}
                          className="text-xs uppercase tracking-[0.14em] text-[#111]/60 hover:text-[#111]"
                        >
                          {expanded ? "Hide" : "Expand"}
                        </button>
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="border-b bg-[#f7f5f0]/60">
                        <td colSpan={13} className="px-4 py-4">
                          <div className="grid gap-4 lg:grid-cols-3">
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.18em] text-[#111]/45">Profile</div>
                              <p className="mt-2 text-sm leading-relaxed">{player.blurb}</p>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {player.tags.map((tag) => (
                                  <span key={tag} className="rounded-full bg-[#111]/5 px-2 py-0.5 text-[10px] uppercase">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.18em] text-[#111]/45">Draft model</div>
                              <div className="mt-2 space-y-1 text-sm">
                                <div>Heat label: {player.heatLabel}</div>
                                <div>Form delta: {formatNum(player.formDelta)}</div>
                                <div>
                                  Strand history: {recordLabel(player)}
                                  {player.strandRecord ? ` · ${player.strandRecord.appearances} documented trips` : ""}
                                </div>
                                <div>
                                  Championship years: {player.strandRecord?.championshipYears.length
                                    ? player.strandRecord.championshipYears.join(", ")
                                    : "none"}
                                </div>
                                <div>Rationale: {rationaleMap.get(player.id) ?? "—"}</div>
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.18em] text-[#111]/45">Data provenance</div>
                              <div className="mt-2 space-y-1 text-sm">
                                <div>Source: {player.dataSource}</div>
                                <div>2026 event handicap: {formatPlayerIndex(player)}</div>
                                <div>Score feed: {player.recentRoundsSource ?? "none"}</div>
                                <div>Scorecards modeled: {player.recentRounds?.length ?? 0}</div>
                                {player.reportedScoring && (
                                  <>
                                    <div>Garmin aggregate: {player.reportedScoring.sampleSize} rounds</div>
                                    <div>Garmin lifetime: {player.reportedScoring.lifetimeRounds ?? "—"} rounds</div>
                                    <div>Average to par: +{player.reportedScoring.averageToPar9 ?? "—"} / 9 · +{player.reportedScoring.averageToPar18 ?? "—"} / 18</div>
                                    <div>Personal best: +{player.reportedScoring.bestToPar9 ?? "—"} / 9 · +{player.reportedScoring.bestToPar18 ?? "—"} / 18</div>
                                    <div>Badges: {player.reportedScoring.badges?.join(", ") ?? "—"}</div>
                                    <div>Aggregate captured: {player.reportedScoring.capturedAt}</div>
                                  </>
                                )}
                                <div>Club: {player.ghinClub ?? "—"}</div>
                                {player.handicap ? (
                                  <>
                                    <div>Index raw: {formatRaw(player.handicap.index)}</div>
                                    <div>Lowest raw: {formatRaw(player.handicap.lowest)}</div>
                                    <div>GHAP: {formatRaw(player.handicap.index_ghap)}</div>
                                    <div>Federation: {formatRaw(player.handicap.index_federation)}</div>
                                    <div>Attest raw: {formatRaw(player.handicap.attest)}</div>
                                    <div>cIndex: {formatRaw(player.handicap.cIndex)}</div>
                                    <div>Teebox HC: {formatRaw(player.handicap.teebox_handicap)}</div>
                                  </>
                                ) : (
                                  <div>No live handicap payload</div>
                                )}
                              </div>
                            </div>
                          </div>
                          {(player.recentRounds?.length ?? 0) > 0 && (
                            <div className="mt-5 overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
                              <div className="grid grid-cols-[86px_1fr_62px_62px_92px] gap-3 border-b border-black/[0.06] bg-black/[0.025] px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.13em] text-black/35">
                                <span>Date</span><span>Course / tee</span><span className="text-right">Score</span><span className="text-right">Diff</span><span className="text-right">Rating / slope</span>
                              </div>
                              {player.recentRounds?.slice(0, 20).map((round, index) => (
                                <div key={`${round.date}-${round.course}-${index}`} className="grid grid-cols-[86px_1fr_62px_62px_92px] gap-3 border-b border-black/[0.05] px-3 py-2 text-xs last:border-0">
                                  <span className="font-mono text-black/45">{round.date}</span>
                                  <span className="truncate text-black/65">{round.course ?? "—"}{round.teeName ? ` · ${round.teeName}` : ""}</span>
                                  <span className="font-mono text-right font-semibold">{round.score}{round.nineHole ? "*" : ""}</span>
                                  <span className="font-mono text-right text-black/60">{round.differential?.toFixed(1) ?? "—"}</span>
                                  <span className="font-mono text-right text-black/40">{round.courseRating?.toFixed(1) ?? "—"} / {round.slopeRating ?? "—"}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function playerLabel(player: PlayerDraftStats) {
  return `${player.nickname} (${player.name.split(" ").pop()})`;
}

function recordLabel(player: PlayerDraftStats) {
  const rec = player.strandRecord;
  if (!rec || rec.appearances === 0) return "Rookie";
  return `${rec.wins}–${rec.losses}`;
}
