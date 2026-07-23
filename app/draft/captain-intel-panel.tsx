"use client";

import { isCaptain } from "@/lib/players";
import type {
  CaptainIntel,
  CaptainIntelMap,
  PlayerSaberMetrics,
} from "@/lib/sabermetrics";

const READS: { value: CaptainIntel["rating"]; label: string; title: string }[] = [
  { value: -2, label: "−2", title: "Strong fade" },
  { value: -1, label: "−1", title: "Caution" },
  { value: 0, label: "0", title: "Data only" },
  { value: 1, label: "+1", title: "Captain lean" },
  { value: 2, label: "+2", title: "Strong buy" },
];

interface CaptainIntelPanelProps {
  board: PlayerSaberMetrics[];
  intel: CaptainIntelMap;
  onChange: (playerId: string, value: CaptainIntel) => void;
}

export default function CaptainIntelPanel({
  board,
  intel,
  onChange,
}: CaptainIntelPanelProps) {
  const draftable = board.filter((metric) => !isCaptain(metric.player.id));
  const activeCount = Object.values(intel).filter(
    (item) => item.rating !== 0 || item.note?.trim(),
  ).length;

  return (
    <details className="group overflow-hidden rounded-[1.8rem] border border-black/10 bg-white shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 md:p-6">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/40">
            Captain intel
          </div>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Add the information the scorecards cannot see.
          </h2>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-black/50">
            Health, confidence, recent unposted play and teammate fit. The effect is capped so your
            read breaks close calls without overpowering the measured data.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-mono text-2xl font-semibold">{activeCount}</div>
          <div className="text-[9px] uppercase tracking-[0.14em] text-black/35">active reads</div>
        </div>
      </summary>

      <div className="border-t border-black/[0.07] bg-[#f8f6f1] p-4 md:p-6">
        <div className="grid gap-3 lg:grid-cols-2">
          {draftable.map((metric) => {
            const current = intel[metric.player.id] ?? { rating: 0 };
            return (
              <div
                key={metric.player.id}
                className="rounded-2xl border border-black/[0.07] bg-white p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">{metric.player.nickname}</div>
                    <div className="text-[10px] text-black/40">
                      {metric.confidenceLabel} data trust · grade {metric.draftGrade.toFixed(0)}
                    </div>
                  </div>
                  <div className="flex rounded-xl border border-black/10 bg-[#f7f5f0] p-1">
                    {READS.map((read) => (
                      <button
                        key={read.value}
                        type="button"
                        title={read.title}
                        aria-label={`${metric.player.nickname}: ${read.title}`}
                        aria-pressed={current.rating === read.value}
                        onClick={() =>
                          onChange(metric.player.id, {
                            ...current,
                            rating: read.value,
                          })
                        }
                        className={`min-w-9 rounded-lg px-2 py-1.5 font-mono text-[10px] font-semibold transition ${
                          current.rating === read.value
                            ? read.value > 0
                              ? "bg-emerald-700 text-white"
                              : read.value < 0
                                ? "bg-orange-700 text-white"
                                : "bg-[#111] text-white"
                            : "text-black/45 hover:bg-white"
                        }`}
                      >
                        {read.label}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  key={`${metric.player.id}-${current.note ?? ""}`}
                  defaultValue={current.note ?? ""}
                  onBlur={(event) =>
                    onChange(metric.player.id, {
                      ...current,
                      note: event.target.value,
                    })
                  }
                  placeholder="Optional note: health, confidence, chemistry, recent play…"
                  className="mt-3 w-full rounded-xl border border-black/10 bg-[#f8f6f1] px-3 py-2 text-xs outline-none transition focus:border-[#183d33]"
                />
              </div>
            );
          })}
        </div>
      </div>
    </details>
  );
}
