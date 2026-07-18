"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Confetti } from "@/app/components/fx";
import { getPlayerPhoto } from "@/lib/player-assets";
import { TEAM_SIZE } from "@/lib/players";
import { summarizeTeam } from "@/lib/draft-engine";
import {
  createScenario,
  deleteScenario,
  formatPickLabel,
  getAvailablePlayers,
  getCurrentOwner,
  getDraftedIds,
  getFullRoster,
  getNextPickNumber,
  getPicksForSide,
  loadScenarios,
  MY_CAPTAIN,
  OPPONENT_CAPTAIN,
  SCENARIO_TEMPLATES,
  suggestJustinPick,
  TOTAL_DRAFT_PICKS,
  DRAFT_PICKS_PER_CAPTAIN,
  upsertScenario,
  type MockDraftScenario,
} from "@/lib/mock-draft";
import type { PlayerDraftStats } from "@/lib/types";
import DraftAnalytics from "./draft-analytics";
import { PlayerSkillGraph } from "./player-skill-graph";
import RecentForm from "./recent-form";

function formatIndex(player: PlayerDraftStats) {
  if (player.indexNum !== null) return player.indexNum.toFixed(1);
  if (player.estimatedIndex) return `~${player.estimatedIndex}`;
  return "—";
}

interface CaptainMockDraftProps {
  players: PlayerDraftStats[];
}

export default function CaptainMockDraft({ players }: CaptainMockDraftProps) {
  const [scenarios, setScenarios] = useState<MockDraftScenario[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [search, setSearch] = useState("");
  const [celebrate, setCelebrate] = useState(false);
  const celebrateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (celebrateTimer.current) clearTimeout(celebrateTimer.current);
  }, []);

  const playerMap = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);

  useEffect(() => {
    // localStorage is only readable after mount, so hydrate scenarios in an effect
    const loaded = loadScenarios();
    if (!loaded.length) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScenarios(loaded);
    setActiveId(loaded[0].id);
  }, []);

  const active = useMemo(
    () => scenarios.find((scenario) => scenario.id === activeId) ?? null,
    [scenarios, activeId],
  );

  const persist = useCallback((scenario: MockDraftScenario) => {
    const updated = { ...scenario, updatedAt: new Date().toISOString() };
    setScenarios((prev) => upsertScenario(prev, updated));
    return updated;
  }, []);

  const createNew = (name: string, templateIndex?: number) => {
    let scenario = createScenario(name.trim() || `Scenario ${scenarios.length + 1}`);
    if (templateIndex !== undefined) {
      scenario.name = SCENARIO_TEMPLATES[templateIndex].name;
      scenario = SCENARIO_TEMPLATES[templateIndex].preset(scenario);
    }
    const next = upsertScenario(scenarios, scenario);
    setScenarios(next);
    setActiveId(scenario.id);
    setNewName("");
  };

  const removeScenario = (id: string) => {
    const next = deleteScenario(scenarios, id);
    setScenarios(next);
    if (activeId === id) setActiveId(next[0]?.id ?? null);
  };

  const makePick = (playerId: string, forcedSide?: "mine" | "justin") => {
    if (!active) return;
    const pickNumber = getNextPickNumber(active.picks);
    if (pickNumber > TOTAL_DRAFT_PICKS) return;
    const side = forcedSide ?? getCurrentOwner(active.picks, active.iPickFirst);
    if (!side) return;
    if (getDraftedIds(active.picks).has(playerId)) return;

    persist({
      ...active,
      picks: [...active.picks, { pickNumber, playerId, side }],
    });

    if (pickNumber === TOTAL_DRAFT_PICKS) {
      setCelebrate(true);
      if (celebrateTimer.current) clearTimeout(celebrateTimer.current);
      celebrateTimer.current = setTimeout(() => setCelebrate(false), 6000);
    }
  };

  const undoPick = () => {
    if (!active || !active.picks.length) return;
    persist({ ...active, picks: active.picks.slice(0, -1) });
  };

  const resetPicks = () => {
    if (!active) return;
    persist({ ...active, picks: [] });
  };

  const autoJustin = () => {
    if (!active) return;
    const owner = getCurrentOwner(active.picks, active.iPickFirst);
    if (owner !== "justin") return;
    const available = getAvailablePlayers(players, active.picks);
    const suggestion = suggestJustinPick(
      available,
      getPicksForSide(active.picks, "mine"),
      players,
    );
    if (suggestion) makePick(suggestion.id, "justin");
  };

  const available = active ? getAvailablePlayers(players, active.picks) : [];
  const filtered = available.filter((player) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      player.name.toLowerCase().includes(q) ||
      player.nickname.toLowerCase().includes(q)
    );
  });

  const currentOwner = active ? getCurrentOwner(active.picks, active.iPickFirst) : null;
  const nextPick = active ? getNextPickNumber(active.picks) : 1;
  const draftComplete = active ? active.picks.length >= TOTAL_DRAFT_PICKS : false;

  const myRoster = active ? getFullRoster(players, active.picks, "mine") : [];
  const justinRoster = active ? getFullRoster(players, active.picks, "justin") : [];
  const myDraftedCount = active ? getPicksForSide(active.picks, "mine").length : 0;
  const justinDraftedCount = active ? getPicksForSide(active.picks, "justin").length : 0;

  const mySummary = summarizeTeam(myRoster);
  const justinSummary = summarizeTeam(justinRoster);
  const draftedIds = useMemo(
    () => (active ? getDraftedIds(active.picks) : new Set<string>()),
    [active],
  );

  return (
    <div className="space-y-6">
      {celebrate && <Confetti />}
      {/* Scenario manager */}
      <div className="rounded-[2rem] border border-[#111]/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-[#111]/50">Captain prep</div>
            <h2 className="mt-1 text-xl font-medium">Mock draft scenarios</h2>
            <p className="mt-2 max-w-2xl text-sm text-[#111]/70">
              You&apos;re <strong>{MY_CAPTAIN.nickname}</strong> — already on your team. Draft{" "}
              <strong>{DRAFT_PICKS_PER_CAPTAIN} players</strong> in a traditional draft vs{" "}
              <strong>{OPPONENT_CAPTAIN.nickname}</strong> (also pre-assigned). Live captain draft is ~one
              month before The Strand; Thursday night is <strong>The Matchmaker</strong> for pairings.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New scenario name..."
              className="rounded-xl border border-[#111]/10 bg-[#f7f5f0] px-4 py-2 text-sm outline-none"
            />
            <button
              onClick={() => createNew(newName)}
              className="rounded-xl bg-[#111] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
            >
              + New scenario
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {SCENARIO_TEMPLATES.map((template, index) => (
            <button
              key={template.name}
              onClick={() => createNew(template.name, index)}
              className="rounded-full border border-black/15 bg-[#f7f5f0] px-3 py-1.5 text-xs uppercase tracking-[0.12em] hover:bg-white"
            >
              {template.name}
            </button>
          ))}
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setActiveId(scenario.id)}
              className={`min-w-[180px] rounded-2xl border px-4 py-3 text-left ${
                activeId === scenario.id
                  ? "border-[#111] bg-[#111] text-white"
                  : "border-[#111]/10 bg-[#f7f5f0]"
              }`}
            >
              <div className="text-sm font-medium">{scenario.name}</div>
              <div className={`mt-1 text-xs ${activeId === scenario.id ? "text-white/70" : "text-[#111]/55"}`}>
                {scenario.picks.length}/{TOTAL_DRAFT_PICKS} picks
              </div>
            </button>
          ))}
          {!scenarios.length && (
            <div className="rounded-2xl border border-dashed border-[#111]/20 px-6 py-4 text-sm text-[#111]/55">
              No scenarios yet — create one above
            </div>
          )}
        </div>

        {active && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={active.iPickFirst}
                onChange={(e) => persist({ ...active, iPickFirst: e.target.checked, picks: [] })}
                disabled={active.picks.length > 0}
              />
              I pick first every round
            </label>
            <button onClick={undoPick} className="rounded-xl border px-3 py-1.5 text-xs uppercase tracking-[0.12em]">
              Undo pick
            </button>
            <button onClick={resetPicks} className="rounded-xl border px-3 py-1.5 text-xs uppercase tracking-[0.12em]">
              Reset picks
            </button>
            <button
              onClick={() => removeScenario(active.id)}
              className="rounded-xl border border-red-200 px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-red-700"
            >
              Delete scenario
            </button>
          </div>
        )}
      </div>

      {active && (
        <>
          {/* Turn indicator */}
          <div
            className={`rounded-[1.75rem] border p-5 ${
              draftComplete
                ? "border-emerald-200 bg-emerald-50"
                : currentOwner === "mine"
                  ? "border-[#111] bg-[#111] text-white"
                  : "border-orange-200 bg-orange-50 text-[#111]"
            }`}
          >
            {draftComplete ? (
              <div className="text-lg font-medium">Draft complete — compare your roster below</div>
            ) : (
              <>
                <div className="text-xs uppercase tracking-[0.22em] opacity-70">
                  Pick {nextPick} of {TOTAL_DRAFT_PICKS}
                </div>
                <div className="mt-1 text-xl font-medium">
                  {currentOwner === "mine"
                    ? `Your pick — ${MY_CAPTAIN.name}`
                    : `Justin\u2019s pick — ${OPPONENT_CAPTAIN.name}`}
                </div>
                <div className="mt-2 text-sm opacity-80">{formatPickLabel(nextPick, active.iPickFirst)}</div>
                {currentOwner === "justin" && (
                  <button
                    onClick={autoJustin}
                    className="mt-4 rounded-xl bg-[#c45c26] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
                  >
                    Auto-pick Justin&apos;s best move
                  </button>
                )}
              </>
            )}
          </div>

          <DraftAnalytics
            players={players}
            myRoster={myRoster}
            justinRoster={justinRoster}
            available={available}
            currentOwner={currentOwner}
            draftComplete={draftComplete}
            picks={active.picks}
            iPickFirst={active.iPickFirst}
          />

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            {/* Available pool */}
            <div className="rounded-[2rem] border border-[#111]/10 bg-white p-6 shadow-sm">
              <div className="text-xs uppercase tracking-[0.22em] text-[#111]/50">Available players</div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="mt-3 mb-4 w-full rounded-2xl border border-[#111]/10 bg-[#f7f5f0] px-4 py-3 text-sm outline-none"
              />
              <div className="max-h-[480px] space-y-2 overflow-y-auto">
                {filtered.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => {
                      if (currentOwner === "mine") makePick(player.id);
                      else if (currentOwner === "justin") makePick(player.id, "justin");
                    }}
                    disabled={draftComplete}
                    className="flex w-full items-center gap-3 rounded-2xl border border-[#111]/10 bg-[#f7f5f0] px-4 py-3 text-left transition hover:bg-white disabled:opacity-50"
                  >
                    {getPlayerPhoto(player.id) ? (
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-black/10">
                        <Image
                          src={getPlayerPhoto(player.id)!}
                          alt=""
                          fill
                          className="object-cover object-top"
                          sizes="40px"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/10 text-xs font-medium">
                        {player.initials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">
                        #{player.draftRank} {player.nickname} — {player.name}
                      </div>
                      <div className="text-xs text-[#111]/60">
                        {player.location ?? "—"}
                        {player.origin ? ` • from ${player.origin}` : ""}
                        {" • "}{player.heatLabel}
                      </div>
                    </div>
                    <div className="text-lg font-medium">{formatIndex(player)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Teams + pick log */}
            <div className="space-y-4">
              {[
                { side: "mine" as const, label: MY_CAPTAIN.nickname, roster: myRoster, drafted: myDraftedCount, summary: mySummary, dark: true },
                { side: "justin" as const, label: OPPONENT_CAPTAIN.nickname, roster: justinRoster, drafted: justinDraftedCount, summary: justinSummary, dark: false },
              ].map((block) => (
                <div
                  key={block.side}
                  className={`rounded-[2rem] border p-5 ${
                    block.dark ? "border-[#111] bg-[#111] text-white" : "border-[#111]/10 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{block.label}</h3>
                    <span className={`text-sm ${block.dark ? "text-white/70" : "text-[#111]/60"}`}>
                      {block.roster.length}/{TEAM_SIZE}
                    </span>
                  </div>
                  <div className={`mt-1 text-xs ${block.dark ? "text-white/60" : "text-[#111]/55"}`}>
                    Avg {block.summary.avgIndex?.toFixed(1) ?? "—"} • {block.summary.heating} heating • match value {block.summary.matchValue?.toFixed(0) ?? "—"}
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {block.roster.map((player, i) => (
                      <div
                        key={player.id}
                        className={`flex justify-between rounded-xl px-3 py-2 text-sm ${
                          block.dark ? "bg-white/10" : "bg-[#f7f5f0]"
                        }`}
                      >
                        <span>
                          {i === 0 ? "C" : i}. {player.nickname}
                          {i === 0 ? " (captain)" : ""}
                        </span>
                        <span>{formatIndex(player)}</span>
                      </div>
                    ))}
                    {Array.from({ length: DRAFT_PICKS_PER_CAPTAIN - block.drafted }).map((_, i) => (
                      <div
                        key={`open-${i}`}
                        className={`rounded-xl border border-dashed px-3 py-2 text-xs ${
                          block.dark ? "border-white/20 text-white/40" : "border-black/15 text-[#111]/40"
                        }`}
                      >
                        Open spot
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="rounded-[2rem] border border-[#111]/10 bg-white p-5 shadow-sm">
                <div className="text-xs uppercase tracking-[0.22em] text-[#111]/50">Pick log</div>
                <div className="mt-3 max-h-56 space-y-1 overflow-y-auto text-sm">
                  {active.picks.map((pick) => {
                    const player = playerMap.get(pick.playerId);
                    if (!player) return null;
                    return (
                      <div key={pick.pickNumber} className="flex justify-between rounded-lg bg-[#f7f5f0] px-3 py-2">
                        <span>
                          {pick.pickNumber}. {pick.side === "mine" ? MY_CAPTAIN.nickname : OPPONENT_CAPTAIN.nickname} → {player.nickname}
                        </span>
                        <span className="text-[#111]/60">{formatIndex(player)}</span>
                      </div>
                    );
                  })}
                  {!active.picks.length && (
                    <div className="text-[#111]/50">No picks yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Scenario compare strip */}
          {scenarios.length > 1 && (
            <div className="rounded-[2rem] border border-[#111]/10 bg-white p-6 shadow-sm">
              <div className="text-xs uppercase tracking-[0.22em] text-[#111]/50">Scenario comparison</div>
              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {scenarios.map((scenario) => {
                  const mine = getFullRoster(players, scenario.picks, "mine");
                  const sum = summarizeTeam(mine);
                  const drafted = getPicksForSide(scenario.picks, "mine").length;
                  return (
                    <button
                      key={scenario.id}
                      onClick={() => setActiveId(scenario.id)}
                      className={`rounded-2xl border p-4 text-left ${
                        activeId === scenario.id ? "border-[#111] bg-[#f7f5f0]" : "border-[#111]/10"
                      }`}
                    >
                      <div className="font-medium">{scenario.name}</div>
                      <div className="mt-2 text-xs text-[#111]/60">
                        Your team avg: {sum.avgIndex?.toFixed(1) ?? "—"} • {drafted}/{DRAFT_PICKS_PER_CAPTAIN} drafted
                      </div>
                      <div className="mt-2 text-xs text-[#111]/55">
                        {mine.map((p) => p.nickname).join(", ") || "No picks yet"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <RecentForm players={players} />

          <PlayerSkillGraph players={players} draftedIds={draftedIds} />
        </>
      )}
    </div>
  );
}