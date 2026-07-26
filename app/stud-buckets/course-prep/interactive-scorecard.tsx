"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { holeImage, holeMemory, planTranslation } from "@/lib/course-humor";
import { planLabel, type HolePlan } from "@/lib/course-intelligence";

export type ScorecardCourseId = "gamble-sands" | "scarecrow" | "quicksands";
export type ScorecardFormatId = "singles" | "fourball" | "shamble" | "scramble";

export interface ScorecardHole {
  number: number;
  par: number;
  yards: number;
  strokeIndex?: number;
  plan: HolePlan;
  headline: string;
  strategy: string;
  preferredMiss: string;
  matchPlay: string;
}

interface TeeOption {
  name: string;
  color: string;
}

interface InteractiveScorecardProps {
  courseId: ScorecardCourseId;
  courseName: string;
  format: ScorecardFormatId;
  holes: ScorecardHole[];
  teeName?: string;
  teeOptions?: readonly TeeOption[];
  onCourseChange: (courseId: ScorecardCourseId) => void;
  onFormatChange: (format: ScorecardFormatId) => void;
  onTeeChange: (teeName: string) => void;
  onOpenFullCaddie: (holeNumber: number) => void;
}

const COURSES: { id: ScorecardCourseId; label: string }[] = [
  { id: "gamble-sands", label: "Gamble Sands" },
  { id: "scarecrow", label: "Scarecrow" },
  { id: "quicksands", label: "QuickSands" },
];

const FORMATS: { id: ScorecardFormatId; label: string }[] = [
  { id: "fourball", label: "Fourball" },
  { id: "shamble", label: "Shamble" },
  { id: "scramble", label: "Scramble" },
  { id: "singles", label: "Singles" },
];

const PLAN_STYLE: Record<HolePlan, { button: string; dot: string }> = {
  attack: {
    button: "bg-emerald-100 text-emerald-950 hover:bg-emerald-200",
    dot: "bg-emerald-600",
  },
  swing: {
    button: "bg-amber-100 text-amber-950 hover:bg-amber-200",
    dot: "bg-amber-500",
  },
  protect: {
    button: "bg-rose-100 text-rose-950 hover:bg-rose-200",
    dot: "bg-rose-600",
  },
};

function formatTip(format: ScorecardFormatId, hole: ScorecardHole): string {
  if (format === "fourball") {
    return `One ball posts a score. Then go hunt. ${hole.matchPlay}`;
  }
  if (format === "shamble") {
    return `First drive finds grass. Second drive gets brave. ${hole.matchPlay}`;
  }
  if (format === "scramble") {
    return `First ball earns permission. Second ball spends it. ${hole.matchPlay}`;
  }
  return `No rescue ball. Hit the shot you own. ${hole.matchPlay}`;
}

function ScorecardSide({
  courseName,
  holes,
  label,
  onSelect,
}: {
  courseName: string;
  holes: ScorecardHole[];
  label: string;
  onSelect: (holeNumber: number) => void;
}) {
  const par = holes.reduce((total, hole) => total + hole.par, 0);
  const yards = holes.reduce((total, hole) => total + hole.yards, 0);
  const showStrokeIndex = holes.some((hole) => hole.strokeIndex);

  return (
    <section className="overflow-hidden rounded-[1.35rem] border border-black/8 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-black/8 bg-[#102a23] px-4 py-3 text-white">
        <div>
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#efbd88]">
            {courseName}
          </p>
          <h3 className="mt-1 text-sm font-semibold">{label}</h3>
        </div>
        <div className="text-right font-mono text-[9px] leading-4 text-white/58">
          <div>Par {par}</div>
          <div>{yards.toLocaleString()} yds</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[330px] table-fixed border-collapse text-center">
          <caption className="sr-only">
            {courseName} {label} interactive scorecard
          </caption>
          <thead>
            <tr className="border-b border-black/8">
              <th
                scope="col"
                className="w-12 bg-[#f4f0e7] px-1 py-3 text-[8px] font-black uppercase tracking-[0.12em] text-black/38"
              >
                Hole
              </th>
              {holes.map((hole) => (
                <th key={hole.number} scope="col" className="p-1">
                  <button
                    type="button"
                    onClick={() => onSelect(hole.number)}
                    aria-label={`Open ${courseName} hole ${hole.number} photo and caddie tips`}
                    className={`group relative flex min-h-11 w-full flex-col items-center justify-center rounded-lg font-mono text-sm font-black transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#102a23] ${PLAN_STYLE[hole.plan].button}`}
                  >
                    <span>{hole.number}</span>
                    <span
                      aria-hidden="true"
                      className="mt-1 text-[7px] leading-none opacity-45 transition group-hover:translate-x-0.5"
                    >
                      ↗
                    </span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono">
            <tr className="border-b border-black/8">
              <th
                scope="row"
                className="bg-[#f4f0e7] px-1 py-2 text-[8px] font-black uppercase tracking-[0.12em] text-black/38"
              >
                Par
              </th>
              {holes.map((hole) => (
                <td key={hole.number} className="px-0.5 py-2 text-[10px] font-bold text-[#102a23]">
                  {hole.par}
                </td>
              ))}
            </tr>
            <tr className={showStrokeIndex ? "border-b border-black/8" : undefined}>
              <th
                scope="row"
                className="bg-[#f4f0e7] px-1 py-2 text-[8px] font-black uppercase tracking-[0.12em] text-black/38"
              >
                Yds
              </th>
              {holes.map((hole) => (
                <td key={hole.number} className="px-0.5 py-2 text-[9px] text-black/58">
                  {hole.yards}
                </td>
              ))}
            </tr>
            {showStrokeIndex ? (
              <tr>
                <th
                  scope="row"
                  className="bg-[#f4f0e7] px-1 py-2 text-[8px] font-black uppercase tracking-[0.12em] text-black/38"
                >
                  Hcp
                </th>
                {holes.map((hole) => (
                  <td key={hole.number} className="px-0.5 py-2 text-[9px] text-black/42">
                    {hole.strokeIndex}
                  </td>
                ))}
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function InteractiveScorecard({
  courseId,
  courseName,
  format,
  holes,
  teeName,
  teeOptions,
  onCourseChange,
  onFormatChange,
  onTeeChange,
  onOpenFullCaddie,
}: InteractiveScorecardProps) {
  const [activeHoleNumber, setActiveHoleNumber] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const activeHole = holes.find((hole) => hole.number === activeHoleNumber);
  const splitAt = courseId === "quicksands" ? 7 : 9;
  const firstSide = holes.slice(0, splitAt);
  const secondSide = holes.slice(splitAt);
  const totalPar = holes.reduce((total, hole) => total + hole.par, 0);
  const totalYards = holes.reduce((total, hole) => total + hole.yards, 0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (activeHole && !dialog.open) {
      dialog.showModal();
    } else if (!activeHole && dialog.open) {
      dialog.close();
    }
  }, [activeHole]);

  function closeDialog() {
    setActiveHoleNumber(null);
  }

  function selectCourse(nextCourseId: ScorecardCourseId) {
    closeDialog();
    onCourseChange(nextCourseId);
  }

  function moveHole(direction: -1 | 1) {
    if (!activeHole) return;
    const currentIndex = holes.findIndex((hole) => hole.number === activeHole.number);
    const nextIndex = (currentIndex + direction + holes.length) % holes.length;
    setActiveHoleNumber(holes[nextIndex].number);
    dialogRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openFullCaddie() {
    if (!activeHole) return;
    const holeNumber = activeHole.number;
    closeDialog();
    onOpenFullCaddie(holeNumber);
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-9">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9a6031]">
              Interactive scorecards
            </p>
            <h1 className="mt-1 text-4xl font-semibold tracking-[-0.055em]">
              Tap the hole. Get the call.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/48">
              Photo, target, good miss and format tip. No yardage-book archaeology.
            </p>
          </div>
          <div className="rounded-2xl border border-black/8 bg-white px-4 py-3 text-right shadow-sm">
            <p className="text-[8px] font-black uppercase tracking-[0.16em] text-black/35">
              Full card
            </p>
            <p className="mt-1 font-mono text-sm font-bold text-[#102a23]">
              Par {totalPar} · {totalYards.toLocaleString()} yds
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-[1.35rem] border border-black/8 bg-white p-3 shadow-sm sm:p-4">
          <p className="px-1 text-[8px] font-black uppercase tracking-[0.16em] text-black/35">
            Course
          </p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {COURSES.map((course) => (
              <button
                key={course.id}
                type="button"
                onClick={() => selectCourse(course.id)}
                className={`rounded-xl px-2 py-3 text-[9px] font-black uppercase tracking-[0.08em] transition sm:text-[10px] ${
                  courseId === course.id
                    ? "bg-[#102a23] text-white shadow-sm"
                    : "bg-[#f4f0e7] text-black/48 hover:text-black/75"
                }`}
              >
                {course.label}
              </button>
            ))}
          </div>

          <div className="mt-3 grid gap-3 border-t border-black/8 pt-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div>
              <p className="px-1 text-[8px] font-black uppercase tracking-[0.16em] text-black/35">
                Match format
              </p>
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {FORMATS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onFormatChange(item.id)}
                    className={`rounded-lg px-1.5 py-2.5 text-[8px] font-black uppercase tracking-[0.07em] transition sm:px-3 sm:text-[9px] ${
                      format === item.id
                        ? "bg-[#9a6031] text-white"
                        : "bg-[#f4f0e7] text-black/42 hover:text-black/70"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {teeName && teeOptions?.length ? (
              <label className="block sm:w-40">
                <span className="px-1 text-[8px] font-black uppercase tracking-[0.16em] text-black/35">
                  Tee
                </span>
                <select
                  value={teeName}
                  onChange={(event) => onTeeChange(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-black/8 bg-[#f4f0e7] px-3 py-2.5 text-xs font-semibold outline-none focus:border-[#31594d]"
                >
                  {teeOptions.map((tee) => (
                    <option key={tee.name} value={tee.name}>
                      {tee.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          <ScorecardSide
            courseName={courseName}
            holes={firstSide}
            label={courseId === "quicksands" ? "Opening seven" : "Front nine"}
            onSelect={setActiveHoleNumber}
          />
          <ScorecardSide
            courseName={courseName}
            holes={secondSide}
            label={courseId === "quicksands" ? "Closing seven" : "Back nine"}
            onSelect={setActiveHoleNumber}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-black/8 bg-white px-4 py-3 text-[9px] font-bold text-black/44">
          {(["attack", "swing", "protect"] as HolePlan[]).map((plan) => (
            <span key={plan} className="inline-flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${PLAN_STYLE[plan].dot}`} />
              {planLabel(plan)}
            </span>
          ))}
          <span className="ml-auto hidden font-normal text-black/32 sm:inline">
            Every hole number is a button.
          </span>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        onClose={closeDialog}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
        aria-labelledby={activeHole ? `scorecard-hole-${activeHole.number}-title` : undefined}
        className="m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-3xl overflow-y-auto rounded-[1.75rem] bg-white p-0 text-[#10201b] shadow-[0_30px_100px_rgba(0,0,0,.45)] backdrop:bg-[#03100e]/80 backdrop:backdrop-blur-sm"
      >
        {activeHole ? (
          <article>
            <div className="relative h-[min(42vh,22rem)] overflow-hidden bg-[#102a23]">
              <Image
                src={holeImage(courseId, activeHole.number)}
                alt={`${courseName} hole ${activeHole.number}`}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/14 to-black/35" />
              <button
                type="button"
                onClick={closeDialog}
                aria-label="Close hole tips"
                className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/38 text-2xl leading-none text-white backdrop-blur-md transition hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                ×
              </button>
              <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#e39a50] px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.14em] text-[#10251e]">
                    {planLabel(activeHole.plan)}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.16em] text-white/55">
                    {courseName}
                  </span>
                </div>
                <div className="mt-3 flex items-end gap-4">
                  <span className="font-mono text-7xl font-semibold leading-none tracking-[-0.08em] sm:text-8xl">
                    {activeHole.number}
                  </span>
                  <div className="pb-1.5">
                    <p className="font-mono text-xs text-white/65">
                      Par {activeHole.par} · {activeHole.yards} yds
                      {activeHole.strokeIndex ? ` · Hcp ${activeHole.strokeIndex}` : ""}
                    </p>
                    <h2
                      id={`scorecard-hole-${activeHole.number}-title`}
                      className="mt-1 text-xl font-semibold tracking-[-0.03em] sm:text-2xl"
                    >
                      {activeHole.headline}
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <p className="text-lg font-semibold leading-7 text-[#9a6031]">
                {holeMemory(courseId, activeHole.number)}
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <article className="rounded-2xl bg-[#edf3ef] p-4">
                  <p className="text-[8px] font-black uppercase tracking-[0.17em] text-[#31594d]">
                    Play it
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-5 text-[#102a23]">
                    {activeHole.strategy}
                  </p>
                </article>
                <article className="rounded-2xl bg-[#f4f0e7] p-4">
                  <p className="text-[8px] font-black uppercase tracking-[0.17em] text-[#9a6031]">
                    Good miss
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-5 text-[#102a23]">
                    {activeHole.preferredMiss}
                  </p>
                </article>
                <article className="rounded-2xl bg-[#102a23] p-4 text-white">
                  <p className="text-[8px] font-black uppercase tracking-[0.17em] text-[#efbd88]">
                    {FORMATS.find((item) => item.id === format)?.label} call
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-5 text-white/76">
                    {formatTip(format, activeHole)}
                  </p>
                </article>
              </div>

              <p className="mt-4 rounded-xl border border-black/8 px-4 py-3 text-xs font-semibold leading-5 text-black/48">
                {planTranslation(activeHole.plan)}
              </p>

              <div className="mt-5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveHole(-1)}
                  className="h-11 flex-1 rounded-xl border border-black/10 px-3 text-[9px] font-black uppercase tracking-[0.12em] text-black/52 transition hover:bg-[#f4f0e7]"
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  onClick={openFullCaddie}
                  className="h-11 flex-[1.35] rounded-xl bg-[#102a23] px-3 text-[9px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#173d32]"
                >
                  Full caddie
                </button>
                <button
                  type="button"
                  onClick={() => moveHole(1)}
                  className="h-11 flex-1 rounded-xl border border-black/10 px-3 text-[9px] font-black uppercase tracking-[0.12em] text-black/52 transition hover:bg-[#f4f0e7]"
                >
                  Next →
                </button>
              </div>
            </div>
          </article>
        ) : null}
      </dialog>
    </>
  );
}
