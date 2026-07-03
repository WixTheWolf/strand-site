"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { getOptimalTeamWithPicks, summarizeTeam } from "@/lib/draft-engine";
import { MY_CAPTAIN, OPPONENT_CAPTAIN } from "@/lib/mock-draft";
import type { DraftRecommendation, PlayerDraftStats } from "@/lib/types";

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
  | "heat";

const heatStyles = {
  heating: "bg-orange-100 text-orange-800 border-orange-200",
  steady: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cooling: "bg-sky-100 text-sky-800 border-sky-200",
  unknown: "bg-stone-100 text-stone-600 border-stone-200",
};

const sourceStyles = {
  live: "bg-emerald-50 text-emerald-800",
  ghin: "bg-blue-50 text-blue-900",
  manual: "bg-amber-50 text-amber-900",
  estimated: "bg-stone-100 text-stone-700",
  missing: "bg-red-50 text-red-800",
};

function formatNum(value: number | null | undefined, digits = 1) {
  if (value === null || value === undefined) return "—";
  return value.toFixed(digits);
}

function formatRaw(value: string | null | undefined) {
  if (!value || value === "N/A") return "—";
  return value;
}

function DataCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-[0.18em] text-[#14352a]/45">{label}</div>
      <div className="mt-0.5 truncate text-sm font-medium">{value}</div>
    </div>
  );
}

function TeamRosterCard({
  pick,
  dark = false,
}: {
  pick: { snakePick: number; player: PlayerDraftStats; rationale: string };
  dark?: boolean;
}) {
  const { player, snakePick, rationale } = pick;
  const h = player.handicap;

  return (
    <article
      className={`rounded-[1.5rem] border p-5 shadow-sm ${
        dark ? "border-white/10 bg-white/10 text-white" : "border-[#14352a]/10 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={`text-xs uppercase tracking-[0.2em] ${dark ? "text-white/50" : "text-[#14352a]/50"}`}>
            Pick #{snakePick}
          </div>
          <h3 className="mt-1 font-serif text-2xl">{player.name}</h3>
          <div className={`text-sm ${dark ? "text-white/70" : "text-[#14352a]/65"}`}>
            {player.nickname} • #{player.draftRank} overall
          </div>
        </div>
        <div className="text-right">
          <div className="font-serif text-3xl">{formatNum(player.indexNum)}</div>
          <div className={`text-xs uppercase tracking-[0.16em] ${dark ? "text-white/50" : "text-[#14352a]/50"}`}>
            index
          </div>
        </div>
      </div>

      <p className={`mt-3 text-sm leading-relaxed ${dark ? "text-white/75" : "text-[#14352a]/75"}`}>
        {player.blurb}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <DataCell label="Draft score" value={formatNum(player.draftScore, 1)} />
        <DataCell label="Lowest" value={formatNum(player.lowestNum)} />
        <DataCell label="Attest %" value={formatNum(player.attestNum, 0)} />
        <DataCell label="Form" value={player.heatLabel} />
      </div>

      <div className={`mt-4 rounded-xl px-3 py-2 text-xs ${dark ? "bg-black/20 text-white/80" : "bg-[#f7f3ea] text-[#14352a]/75"}`}>
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
              dark ? "bg-white/10 text-white/70" : "bg-[#14352a]/5 text-[#14352a]/60"
            }`}
          >
            {tag}
          </span>
        ))}
      </div>

      {h && (
        <details className={`mt-4 text-xs ${dark ? "text-white/70" : "text-[#14352a]/65"}`}>
          <summary className="cursor-pointer uppercase tracking-[0.16em]">Raw GHIN fields</summary>
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
    loadData();
  }, [loadData]);

  const wixTeam = useMemo(
    () => (data ? getOptimalTeamWithPicks(data.players, data.recommendations, "A") : []),
    [data],
  );

  const justinTeam = useMemo(
    () => (data ? getOptimalTeamWithPicks(data.players, data.recommendations, "B") : []),
    [data],
  );

  const wixSummary = useMemo(() => summarizeTeam(wixTeam.map((p) => p.player)), [wixTeam]);
  const justinSummary = useMemo(() => summarizeTeam(justinTeam.map((p) => p.player)), [justinTeam]);

  const wixIds = useMemo(() => new Set(wixTeam.map((p) => p.player.id)), [wixTeam]);
  const justinIds = useMemo(() => new Set(justinTeam.map((p) => p.player.id)), [justinTeam]);

  const rationaleMap = useMemo(
    () => new Map(data?.recommendations.map((rec) => [rec.playerId, rec.rationale]) ?? []),
    [data],
  );

  const filteredPlayers = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    let list = data.players;
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nickname.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q)),
      );
    }
    return [...list].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") {
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      const an = typeof av === "number" ? av : 0;
      const bn = typeof bv === "number" ? bv : 0;
      return sortAsc ? an - bn : bn - an;
    });
  }, [data, search, sortKey, sortAsc]);

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
        <div className="rounded-3xl border border-[#14352a]/10 bg-white px-8 py-10 text-center shadow-sm">
          <div className="text-xs uppercase tracking-[0.3em] text-[#14352a]/50">Building optimal roster</div>
          <div className="mt-3 font-serif text-3xl">Loading full player sheet...</div>
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

  const totalDraftScore = wixTeam.reduce((sum, p) => sum + p.player.draftScore, 0);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-[#14352a]/55">Optimal snake draft</div>
          <h1 className="mt-2 font-serif text-5xl">{MY_CAPTAIN.nickname}&apos;s best team</h1>
          <p className="mt-3 max-w-3xl text-[#14352a]/75">
            If you pick first vs {OPPONENT_CAPTAIN.name} ({OPPONENT_CAPTAIN.nickname}) and both draft
            by value, this is your squad. Full GHIN + draft model data for all 20 players below.
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#14352a]/45">
            Updated {new Date(data.updatedAt).toLocaleString()} • {data.source}
          </p>
        </div>
        <button
          onClick={loadData}
          className="rounded-2xl border border-[#14352a]/15 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em]"
        >
          Refresh data
        </button>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-[1.75rem] border border-[#14352a]/10 bg-[#14352a] p-5 text-white shadow-sm">
          <div className="text-xs uppercase tracking-[0.22em] text-white/55">Team avg index</div>
          <div className="mt-2 font-serif text-4xl">{formatNum(wixSummary.avgIndex)}</div>
        </div>
        <div className="rounded-[1.75rem] border border-[#14352a]/10 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.22em] text-[#14352a]/50">Combined draft score</div>
          <div className="mt-2 font-serif text-4xl">{formatNum(totalDraftScore, 1)}</div>
        </div>
        <div className="rounded-[1.75rem] border border-orange-200 bg-orange-50 p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.22em] text-orange-700/70">Heating up on roster</div>
          <div className="mt-2 font-serif text-4xl">{wixSummary.heating}</div>
        </div>
        <div className="rounded-[1.75rem] border border-[#14352a]/10 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.22em] text-[#14352a]/50">Justin&apos;s avg index</div>
          <div className="mt-2 font-serif text-4xl">{formatNum(justinSummary.avgIndex)}</div>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="font-serif text-3xl">Your 10 picks</h2>
        <p className="mt-1 text-sm text-[#14352a]/65">
          Snake order if {MY_CAPTAIN.nickname} picks first: picks #1, 4, 5, 8, 9, 12, 13, 16, 17, 20
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {wixTeam.map((pick) => (
            <TeamRosterCard key={pick.player.id} pick={pick} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-serif text-3xl">{OPPONENT_CAPTAIN.nickname}&apos;s counter-roster</h2>
        <p className="mt-1 text-sm text-[#14352a]/65">What Justin gets if he drafts optimally picking second.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {justinTeam.map((pick) => (
            <div key={pick.player.id} className="rounded-2xl border border-[#14352a]/10 bg-white p-4 shadow-sm">
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#14352a]/45">Pick #{pick.snakePick}</div>
              <div className="mt-1 font-medium">{playerLabel(pick.player)}</div>
              <div className="font-serif text-2xl">{formatNum(pick.player.indexNum)}</div>
              <div className="text-xs text-[#14352a]/55">#{pick.player.draftRank} value</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-3xl">Full player data sheet</h2>
            <p className="mt-1 text-sm text-[#14352a]/65">
              Every field we have — GHIN, location, draft model, tags, and team assignment.
            </p>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, location, tag..."
            className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none sm:max-w-xs"
          />
        </div>

        <div className="overflow-x-auto rounded-[1.75rem] border border-[#14352a]/10 bg-white shadow-sm">
          <table className="min-w-[1400px] w-full text-left text-sm">
            <thead className="border-b bg-[#f7f3ea] text-[10px] uppercase tracking-[0.16em] text-[#14352a]/55">
              <tr>
                {[
                  ["draftRank", "Rank"],
                  ["name", "Player"],
                  ["indexNum", "Index"],
                  ["lowestNum", "Low"],
                  ["draftScore", "Score"],
                  ["attestNum", "Attest"],
                  ["heat", "Heat"],
                ].map(([key, label]) => (
                  <th key={key} className="px-3 py-3">
                    <button type="button" onClick={() => toggleSort(key as SortKey)} className="hover:text-[#14352a]">
                      {label}
                      {sortKey === key ? (sortAsc ? " ↑" : " ↓") : ""}
                    </button>
                  </th>
                ))}
                <th className="px-3 py-3">Team</th>
                <th className="px-3 py-3">Source</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-3 py-3">GHIN club</th>
                <th className="px-3 py-3">TheGrint</th>
                <th className="px-3 py-3">GHIN #</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player) => {
                const team = wixIds.has(player.id) ? MY_CAPTAIN.nickname : justinIds.has(player.id) ? OPPONENT_CAPTAIN.nickname : "—";
                const expanded = expandedId === player.id;
                return (
                  <Fragment key={player.id}>
                    <tr className="border-b border-[#14352a]/5 hover:bg-[#f7f3ea]/50">
                      <td className="px-3 py-3 font-medium">#{player.draftRank}</td>
                      <td className="px-3 py-3">
                        <div className="font-medium">{player.name}</div>
                        <div className="text-xs text-[#14352a]/55">{player.nickname}</div>
                      </td>
                      <td className="px-3 py-3 font-serif text-lg">{formatNum(player.indexNum)}</td>
                      <td className="px-3 py-3">{formatNum(player.lowestNum)}</td>
                      <td className="px-3 py-3">{formatNum(player.draftScore, 1)}</td>
                      <td className="px-3 py-3">{formatNum(player.attestNum, 0)}%</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${heatStyles[player.heat]}`}>
                          {player.heat}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs font-semibold uppercase tracking-[0.12em]">{team}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${sourceStyles[player.dataSource]}`}>
                          {player.dataSource}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs">
                        {player.location ?? "—"}
                        {player.origin ? <div className="text-[#14352a]/45">from {player.origin}</div> : null}
                      </td>
                      <td className="px-3 py-3 text-xs">{player.ghinClub ?? "—"}</td>
                      <td className="px-3 py-3 text-xs">
                        {player.grintProfileUrl ? (
                          <a href={player.grintProfileUrl} target="_blank" rel="noopener noreferrer" className="font-medium underline decoration-[#14352a]/20">
                            {player.grintUsernameResolved ?? player.grintUsername ?? "Profile"}
                          </a>
                        ) : (
                          <div>{player.grintUsernameResolved ?? player.grintUsername ?? "—"}</div>
                        )}
                        {player.grintId ? <div className="text-[#14352a]/45">id {player.grintId}</div> : null}
                      </td>
                      <td className="px-3 py-3 text-xs">{player.ghinNumberResolved ?? player.ghinNumber ?? "Verify"}</td>
                      <td className="px-3 py-3 text-xs">{player.email ?? "—"}</td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => setExpandedId(expanded ? null : player.id)}
                          className="text-xs uppercase tracking-[0.14em] text-[#14352a]/60 hover:text-[#14352a]"
                        >
                          {expanded ? "Hide" : "Expand"}
                        </button>
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="border-b bg-[#f7f3ea]/60">
                        <td colSpan={15} className="px-4 py-4">
                          <div className="grid gap-4 lg:grid-cols-3">
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.18em] text-[#14352a]/45">Profile</div>
                              <p className="mt-2 text-sm leading-relaxed">{player.blurb}</p>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {player.tags.map((tag) => (
                                  <span key={tag} className="rounded-full bg-[#14352a]/5 px-2 py-0.5 text-[10px] uppercase">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.18em] text-[#14352a]/45">Draft model</div>
                              <div className="mt-2 space-y-1 text-sm">
                                <div>Heat label: {player.heatLabel}</div>
                                <div>Form delta: {formatNum(player.formDelta)}</div>
                                <div>Rationale: {rationaleMap.get(player.id) ?? "—"}</div>
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-[0.18em] text-[#14352a]/45">GHIN / TheGrint</div>
                              <div className="mt-2 space-y-1 text-sm">
                                <div>Grint profile: {player.grintProfileUrl ?? "—"}</div>
                                <div>Grint location: {player.grintLocation ?? "—"}</div>
                                <div>GHIN #: {player.ghinNumberResolved ?? player.ghinNumber ?? "Pending verification"}</div>
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