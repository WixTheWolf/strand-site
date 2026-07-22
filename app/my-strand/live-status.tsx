"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  POINTS_TO_WIN,
  scoreTournament,
  type MatchScore,
  type TournamentConfig,
} from "@/lib/live-scoring";

type LivePayload = {
  config: TournamentConfig;
  scores: Record<string, MatchScore>;
  storageMode: "shared" | "preview";
  polledAt: string;
};

function point(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export default function MyStrandLiveStatus() {
  const [payload, setPayload] = useState<LivePayload | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/live-scoring", { cache: "no-store" });
      if (!response.ok) throw new Error("Scoreboard unavailable");
      setPayload(await response.json() as LivePayload);
      setUnavailable(false);
    } catch {
      setUnavailable(true);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 15_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const result = useMemo(
    () => payload ? scoreTournament(payload.config, payload.scores) : null,
    [payload],
  );

  return (
    <article className="overflow-hidden rounded-[1.5rem] bg-[#0d3028] text-white shadow-[0_20px_60px_rgba(9,41,34,0.18)]">
      <div className="border-b border-white/10 px-5 py-4 md:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">
            Live match center
          </div>
          <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/45">
            <span className={`h-2 w-2 rounded-full ${unavailable ? "bg-red-400" : "animate-pulse bg-emerald-400"}`} />
            {unavailable ? "Offline" : "15s sync"}
          </div>
        </div>
      </div>

      <div className="px-5 py-6 md:px-6">
        {result && payload ? (
          <>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div>
                <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/42">Team WIX</div>
                <div className="mt-1 font-mono text-4xl font-semibold tracking-[-0.08em]">
                  {point(result.projectedPoints.wix)}
                </div>
              </div>
              <div className="text-center">
                <div className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/55">
                  {result.holesComplete ? `${result.holesComplete} holes in` : "Not started"}
                </div>
                <div className="mt-2 font-mono text-[10px] text-white/35">{POINTS_TO_WIN} wins</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/42">Team J-BONE</div>
                <div className="mt-1 font-mono text-4xl font-semibold tracking-[-0.08em]">
                  {point(result.projectedPoints.jbone)}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 text-[10px] uppercase tracking-[0.14em]">
              <div className="rounded-xl bg-white/7 px-3 py-3 text-white/60">
                {payload.config.status === "locked" ? "Teams locked" : "Teams provisional"}
              </div>
              <div className={`rounded-xl px-3 py-3 ${payload.storageMode === "shared" ? "bg-emerald-400/15 text-emerald-100" : "bg-amber-300/15 text-amber-100"}`}>
                {payload.storageMode === "shared" ? "Shared saves ready" : "Shared storage pending"}
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 text-sm text-white/55">
            {unavailable ? "The scoreboard could not be reached." : "Opening the live scoreboard…"}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/live" className="rounded-full bg-white px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#0d3028]">
            Open live scoring
          </Link>
          <Link href="/live/setup" className="rounded-full border border-white/15 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/70">
            Captain setup
          </Link>
        </div>
      </div>
    </article>
  );
}
