"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import {
  CHAMPIONSHIP_COURSES,
  courseHandicap,
  strokesOnHole,
  type ChampionshipCourseIntel,
} from "@/lib/course-intelligence";
import {
  buildSaberBoard,
  FORMAT_META,
  type PlayerSaberMetrics,
  type StrandFormat,
} from "@/lib/sabermetrics";
import { JBONE_TEAM, STUD_BUCKETS_TEAM } from "@/lib/stud-buckets";
import { teammateJob } from "@/lib/stud-buckets-team";
import { getPlayerPhoto } from "@/lib/player-assets";
import type { PlayerDraftStats } from "@/lib/types";

type DraftPayload = {
  updatedAt: string;
  source: string;
  players: PlayerDraftStats[];
};

const FORMAT_ORDER: StrandFormat[] = ["fourball", "shamble", "singles", "scramble"];

const average = (values: number[]) =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

const number = (value: number, digits = 0) =>
  Number.isFinite(value) ? value.toFixed(digits) : "—";

function bestFormat(metric: PlayerSaberMetrics): StrandFormat {
  return [...FORMAT_ORDER].sort((a, b) => metric.format[b] - metric.format[a])[0];
}

function plannedCourseHandicap(metric: PlayerSaberMetrics, course: ChampionshipCourseIntel) {
  const tee = course.tees.find((item) => item.name === course.defaultTee) ?? course.tees[0];
  return {
    tee,
    handicap: courseHandicap(metric.index, tee, course.par),
  };
}

function strokeHoles(course: ChampionshipCourseIntel, allowance: number) {
  return course.holes
    .filter((hole) => strokesOnHole(allowance, hole.strokeIndex) > 0)
    .map((hole) => hole.number);
}

function PlayerPortrait({
  metric,
  captain = false,
  large = false,
}: {
  metric: PlayerSaberMetrics;
  captain?: boolean;
  large?: boolean;
}) {
  const photo = getPlayerPhoto(metric.player.id);

  return (
    <span
      className={`relative shrink-0 overflow-hidden border ${
        large ? "h-28 w-24 rounded-[1.4rem]" : "h-14 w-14 rounded-2xl"
      } ${
        captain ? "border-[#e39a50]/65 bg-[#e39a50]" : "border-white/14 bg-[#31594d]"
      }`}
    >
      {photo ? (
        <Image
          src={photo}
          alt={`${metric.player.name}, Stud Buckets golfer`}
          fill
          sizes={large ? "96px" : "56px"}
          className="object-cover object-top"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[10px] font-black text-white">
          {metric.player.initials}
        </span>
      )}
    </span>
  );
}

function CaptainCard({
  metric,
  ours,
}: {
  metric: PlayerSaberMetrics;
  ours: boolean;
}) {
  const gamble = plannedCourseHandicap(metric, CHAMPIONSHIP_COURSES[0]);
  const scarecrow = plannedCourseHandicap(metric, CHAMPIONSHIP_COURSES[1]);

  return (
    <article
      className={`relative overflow-hidden rounded-[1.75rem] border p-5 md:p-6 ${
        ours
          ? "border-[#e39a50]/35 bg-[#102a23] text-white shadow-[0_24px_80px_rgba(0,0,0,.22)]"
          : "border-white/10 bg-white/[0.055] text-white"
      }`}
    >
      <div className={`absolute -right-14 -top-20 h-52 w-52 rounded-full blur-3xl ${ours ? "bg-[#e39a50]/18" : "bg-white/5"}`} />
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <PlayerPortrait metric={metric} captain={ours} large />
          <div>
            <div
              className={`text-[9px] font-bold uppercase tracking-[0.18em] ${
                ours ? "text-[#efbd88]" : "text-white/40"
              }`}
            >
              {ours ? "Our fearless administrative burden" : "The man we are politely ruining"}
            </div>
            <h3 className="mt-1 text-2xl font-semibold">{metric.player.nickname}</h3>
            <p className="text-xs text-white/42">
              {metric.player.name}
            </p>
            <p className="mt-3 max-w-xs text-[10px] leading-4 text-white/45">
              {ours
                ? "Calls the pairings, tracks the points and accepts full blame for everybody else’s three-putts."
                : "Excellent golfer. Fine person. Unfortunately standing between us and the trophy."}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-3xl font-semibold">{number(metric.index, 1)}</div>
          <div className="text-[8px] uppercase tracking-[0.14em] text-white/30">
            Event index
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/10">
        {[
          [gamble.handicap, "Gamble course HC"],
          [scarecrow.handicap, "Scarecrow course HC"],
        ].map(([value, label]) => (
          <div key={label} className="bg-[#0c241e] p-4">
            <div className="font-mono text-2xl font-semibold">{value}</div>
            <div className="mt-1 text-[8px] uppercase tracking-[0.13em] text-white/32">
              {label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2">
        {FORMAT_ORDER.map((format) => (
          <div key={format} className="rounded-xl bg-white/[0.06] p-3 text-center">
            <div className="font-mono text-sm font-semibold">{number(metric.format[format])}</div>
            <div className="mt-1 text-[7px] font-bold uppercase tracking-[0.1em] text-white/30">
              {format === "scramble" ? "Scram." : FORMAT_META[format].label}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function TeamPrepMetrics() {
  const [data, setData] = useState<DraftPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(STUD_BUCKETS_TEAM.captainId);

  useEffect(() => {
    fetch("/api/grint/players", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Unable to load team metrics.");
        setData(payload);
      })
      .catch((caught) =>
        setError(caught instanceof Error ? caught.message : "Unable to load team metrics."),
      );
  }, []);

  const board = useMemo(() => (data ? buildSaberBoard(data.players) : []), [data]);
  const metricMap = useMemo(
    () => new Map(board.map((metric) => [metric.player.id, metric])),
    [board],
  );
  const team = useMemo(
    () =>
      STUD_BUCKETS_TEAM.playerIds
        .map((id) => metricMap.get(id))
        .filter(Boolean) as PlayerSaberMetrics[],
    [metricMap],
  );
  const jbone = metricMap.get(JBONE_TEAM.captainId) ?? null;
  const wix = metricMap.get(STUD_BUCKETS_TEAM.captainId) ?? null;
  const selected = metricMap.get(selectedPlayerId) ?? wix ?? team[0] ?? null;

  const gambleLeaders = useMemo(
    () => [...team].sort((a, b) => b.gambleFit - a.gambleFit).slice(0, 5),
    [team],
  );
  const scarecrowLeaders = useMemo(
    () => [...team].sort((a, b) => b.scarecrowFit - a.scarecrowFit).slice(0, 5),
    [team],
  );

  if (!data && !error) {
    return (
      <section id="team-metrics" className="scroll-mt-24 bg-[#071b18] px-5 py-20 text-center text-white">
        <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#efbd88]">
          Building the Stud Buckets metric board…
        </div>
      </section>
    );
  }

  if (!data || error || team.length !== 10 || !wix || !jbone) {
    return (
      <section id="team-metrics" className="scroll-mt-24 bg-[#071b18] px-5 py-20 text-white">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#efbd88]">Roster check</p>
          <h2 className="mt-3 text-3xl font-semibold">The team board needs a refresh.</h2>
          <p className="mt-4 text-sm leading-6 text-white/50">
            {error ?? `Loaded ${team.length} Stud Buckets. WIX and J-BONE must both be present.`}
          </p>
        </div>
      </section>
    );
  }

  const selectedCourseMaps = CHAMPIONSHIP_COURSES.map((course) => {
    const planned = plannedCourseHandicap(selected, course);
    const at80 = Math.round(planned.handicap * 0.8);
    const at75 = Math.round(planned.handicap * 0.75);
    return {
      course,
      ...planned,
      at80,
      at75,
      holes80: strokeHoles(course, at80),
      holes75: strokeHoles(course, at75),
    };
  });

  return (
    <section id="team-metrics" className="scroll-mt-24 bg-[#071b18] py-16 text-white md:py-24">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#efbd88]">
              The highly scientific bucket laboratory
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.055em] md:text-6xl">
              Ten men. One trophy. Several concerning swings.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/55">
              WIX is in the ten-man model because captains still have to hit the shots—deeply
              inconvenient, but technically fair. J‑BONE is here as the lone enemy benchmark.
              Everybody else on his team can remain a rumor.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [number(average(team.map((metric) => metric.index)), 1), "Average damage"],
              [number(average(team.map((metric) => metric.tournamentScore))), "Bucket power"],
              [number(average(team.map((metric) => metric.consistency))), "Chaos control"],
              [String(team.filter((metric) => metric.confidenceLabel === "High").length), "Adults on file"],
            ].map(([value, label]) => (
              <article key={label} className="rounded-[1.4rem] border border-white/10 bg-white/[0.055] p-4">
                <div className="text-3xl font-semibold tracking-[-0.04em] text-[#efbd88]">{value}</div>
                <div className="mt-2 text-[8px] font-bold uppercase tracking-[0.15em] text-white/32">{label}</div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <CaptainCard metric={wix} ours />
          <CaptainCard metric={jbone} ours={false} />
        </div>

        <div className="mt-14 grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#efbd88]">Our roster only</p>
                <h3 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">Everyone has a job.</h3>
                <p className="mt-2 max-w-xl text-xs leading-5 text-white/40">
                  Ten specialists. Zero passengers. P‑MO is present, accounted for and legally permitted to steal net holes.
                </p>
              </div>
              <div className="text-[9px] uppercase tracking-[0.14em] text-white/28">10 players · captain included</div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {team.map((metric) => {
                const format = bestFormat(metric);
                const job = teammateJob(metric.player.id);
                const photo = getPlayerPhoto(metric.player.id);
                return (
                  <article key={metric.player.id} className="group overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.055] transition duration-300 hover:-translate-y-1 hover:border-[#e39a50]/40">
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#102a23]">
                      {photo ? (
                        <Image
                          src={photo}
                          alt={`${metric.player.name}, ${job.title}`}
                          fill
                          sizes="(max-width: 640px) 100vw, 50vw"
                          className="object-cover object-top transition duration-700 group-hover:scale-[1.04]"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#071b18] via-[#071b18]/15 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[#efbd88]">{job.title}</p>
                          <h4 className="mt-1 text-2xl font-semibold">{metric.player.nickname}</h4>
                          <p className="text-[8px] text-white/42">{metric.player.name}</p>
                        </div>
                        <div className="rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-right backdrop-blur">
                          <div className="font-mono text-xl font-semibold">{number(metric.index, 1)}</div>
                          <div className="text-[7px] uppercase tracking-[0.12em] text-white/38">Index</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl bg-black/15 p-3">
                        <div className="font-mono font-semibold">{number(metric.format[format])}</div>
                        <div className="mt-1 text-[7px] uppercase text-white/28">{FORMAT_META[format].label}</div>
                      </div>
                      <div className="rounded-xl bg-black/15 p-3">
                        <div className="font-mono font-semibold">{number(metric.gambleFit)}</div>
                        <div className="mt-1 text-[7px] uppercase text-white/28">Gamble fit</div>
                      </div>
                      <div className="rounded-xl bg-black/15 p-3">
                        <div className="font-mono font-semibold">{number(metric.scarecrowFit)}</div>
                        <div className="mt-1 text-[7px] uppercase text-white/28">Scarecrow fit</div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3 text-xs">
                      <span className="text-white/38">Deploy when we need</span>
                      <span className="font-semibold text-white/78">{FORMAT_META[format].label}</span>
                    </div>
                    <p className="mt-4 text-xs leading-5 text-white/58">{job.mission}</p>
                    <p className="mt-4 rounded-xl bg-[#e39a50]/10 p-3 text-[10px] italic leading-4 text-[#f1c99f]">{job.lockerRoom}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-5 md:p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#efbd88]">Free strokes, legally acquired</p>
                  <h3 className="mt-2 text-2xl font-semibold">Know your pops or donate them.</h3>
                </div>
                <select
                  value={selected.player.id}
                  onChange={(event) => setSelectedPlayerId(event.target.value)}
                  className="min-w-52 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-xs text-white outline-none"
                  aria-label="Select a Stud Buckets player"
                >
                  {team.map((metric) => (
                    <option key={metric.player.id} value={metric.player.id} className="text-black">
                      {metric.player.nickname} · {number(metric.index, 1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 space-y-3">
                {selectedCourseMaps.map(({ course, tee, handicap, at80, at75, holes80, holes75 }) => {
                  const primaryAllowance = course.id === "gamble-sands" ? at80 : at75;
                  const primaryHoles = course.id === "gamble-sands" ? holes80 : holes75;
                  return (
                    <div key={course.id} className="rounded-2xl bg-black/15 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-[8px] font-bold uppercase tracking-[0.13em] text-white/30">
                            {tee.name} tees · {tee.yards.toLocaleString()} yards
                          </div>
                          <div className="mt-1 font-semibold">{course.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-2xl font-semibold text-[#efbd88]">{handicap}</div>
                          <div className="text-[7px] uppercase text-white/28">Course HC</div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-white/[0.055] p-3">
                          <div className="text-[8px] uppercase tracking-[0.12em] text-white/30">
                            {course.id === "gamble-sands" ? "Fourball · 80%" : "Shamble · 75%"}
                          </div>
                          <div className="mt-1 font-mono text-xl font-semibold">{primaryAllowance}</div>
                          <p className="mt-2 text-[9px] leading-4 text-white/38">
                            Holes {primaryHoles.length ? primaryHoles.join(" · ") : "none"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-white/[0.055] p-3">
                          {course.id === "gamble-sands" ? (
                            <>
                              <div className="text-[8px] uppercase tracking-[0.12em] text-white/30">Scramble</div>
                              <div className="mt-1 font-mono text-xl font-semibold">Pair</div>
                              <p className="mt-2 text-[9px] leading-4 text-white/38">35% low + 15% high</p>
                            </>
                          ) : (
                            <>
                              <div className="text-[8px] uppercase tracking-[0.12em] text-white/30">Singles · 80%</div>
                              <div className="mt-1 font-mono text-xl font-semibold">{at80}</div>
                              <p className="mt-2 text-[9px] leading-4 text-white/38">
                                Holes {holes80.length ? holes80.join(" · ") : "none"}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-[9px] leading-4 text-white/30">
                Planning estimate. The lowest allowance in each match plays from zero; all other
                players receive the difference. The live scorecard remains authoritative because
                group-chat math has repeatedly failed peer review.
              </p>
            </article>

            <article className="rounded-[1.75rem] bg-[#e39a50] p-5 text-[#10251e] md:p-6">
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#10251e]/48">Who should be released into the wild</div>
              <div className="mt-5 grid grid-cols-2 gap-5">
                {[
                  ["Gamble", gambleLeaders, "gambleFit" as const],
                  ["Scarecrow", scarecrowLeaders, "scarecrowFit" as const],
                ].map(([label, leaders, key]) => (
                  <div key={label as string}>
                    <h4 className="font-semibold">{label as string}</h4>
                    <div className="mt-3 space-y-2">
                      {(leaders as PlayerSaberMetrics[]).map((metric, index) => (
                        <div key={metric.player.id} className="flex items-center justify-between gap-2 border-b border-[#10251e]/10 pb-2 text-xs last:border-0">
                          <span><span className="mr-2 font-mono text-[#10251e]/35">{index + 1}</span>{metric.player.nickname}</span>
                          <span className="font-mono font-semibold">{number(metric[key as "gambleFit" | "scarecrowFit"])}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>

        <p className="mt-10 text-[9px] leading-5 text-white/28">
          Updated {new Date(data.updatedAt).toLocaleString()} · {data.source}. Metrics are
          decision support, not guarantees. Missing shot-level evidence stays neutral rather than
          being invented. Confidence is encouraged; perjury is not.
        </p>
      </div>
    </section>
  );
}
