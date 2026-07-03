import Link from "next/link";
import { STRAND_PLAYERS } from "@/lib/players";
import {
  buildPlayerRecords,
  CHAMPIONS_BOARD,
  STRAND_TOURNAMENTS,
} from "@/lib/history";

export default function HistorySection() {
  const records = buildPlayerRecords(STRAND_PLAYERS);

  return (
    <section id="history" className="border-y border-[#14352a]/10 bg-white/60">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[#14352a]/60">History</div>
            <h2 className="mt-2 font-serif text-4xl">The Strand archive</h2>
            <p className="mt-4 max-w-2xl text-[#14352a]/75">
              Year-by-year results pulled from{" "}
              <a
                href="https://www.strandinvitational.life/the-strand"
                className="underline decoration-[#14352a]/25"
                target="_blank"
                rel="noopener noreferrer"
              >
                Fred&apos;s original site
              </a>
              . Win/loss totals reflect documented team-match appearances since 2018.
            </p>
          </div>
          <div className="rounded-2xl border border-[#14352a]/10 bg-white px-4 py-3 text-sm text-[#14352a]/70 shadow-sm">
            Est. 2018 • {STRAND_TOURNAMENTS.length} archive years
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            {STRAND_TOURNAMENTS.map((event) => (
              <article
                key={event.year}
                className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-[#14352a]/50">{event.destination}</div>
                    <h3 className="mt-1 font-serif text-2xl">{event.label}</h3>
                  </div>
                  <div className="rounded-2xl bg-[#f7f3ea] px-4 py-2 text-right text-sm">
                    <div className="font-medium text-[#2d6a4f]">{event.winnerTeam}</div>
                    <div className="text-[#14352a]/60">
                      {event.winnerScore !== "—" ? `${event.winnerScore}–${event.loserScore}` : "Results TBD"}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-[#14352a]/75">{event.summary}</p>
                {event.courses.length > 0 && (
                  <div className="mt-3 text-xs text-[#14352a]/55">Courses: {event.courses.join(" • ")}</div>
                )}
                {event.winnerRoster.length > 0 && (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm">
                      <div className="text-xs uppercase tracking-[0.14em] text-emerald-800/70">Winners</div>
                      <div className="mt-2 text-emerald-950">{event.winnerRoster.join(", ")}</div>
                    </div>
                    <div className="rounded-xl bg-[#f7f3ea] px-4 py-3 text-sm">
                      <div className="text-xs uppercase tracking-[0.14em] text-[#14352a]/50">Runners-up</div>
                      <div className="mt-2 text-[#14352a]/80">{event.loserRoster.join(", ") || "—"}</div>
                    </div>
                  </div>
                )}
                <Link
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-xs font-semibold uppercase tracking-[0.12em] text-[#c45c26]"
                >
                  View on strandinvitational.life →
                </Link>
              </article>
            ))}
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-[#14352a]/10 bg-[#14352a] p-6 text-white shadow-sm">
              <div className="text-xs uppercase tracking-[0.22em] text-white/60">Champions board</div>
              <div className="mt-4 space-y-3">
                {CHAMPIONS_BOARD.map((row) => (
                  <div
                    key={row.year}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3"
                  >
                    <div>
                      <div className="font-medium">{row.label}</div>
                      <div className="text-sm text-white/70">{row.winner}</div>
                    </div>
                    <div className="font-serif text-xl">{row.score}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[#14352a]/10 bg-white p-6 shadow-sm">
              <div className="text-xs uppercase tracking-[0.22em] text-[#14352a]/55">Player records</div>
              <p className="mt-2 text-sm text-[#14352a]/65">
                Wins and losses in documented team-match years (2018–2025). 2019–2020 results not posted on the legacy site.
              </p>
              <div className="mt-4 max-h-[520px] overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-white text-xs uppercase tracking-[0.1em] text-[#14352a]/50">
                    <tr>
                      <th className="pb-2">Player</th>
                      <th className="pb-2">W</th>
                      <th className="pb-2">L</th>
                      <th className="pb-2">Years</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records
                      .filter((r) => r.appearances > 0)
                      .map((rec) => (
                        <tr key={rec.playerId} className="border-t border-[#14352a]/8">
                          <td className="py-2.5 font-medium">{rec.name}</td>
                          <td className="py-2.5 text-[#2d6a4f]">{rec.wins}</td>
                          <td className="py-2.5 text-[#c45c26]">{rec.losses}</td>
                          <td className="py-2.5 text-xs text-[#14352a]/60">
                            {rec.years.map((y) => `${y.year}${y.result}`).join(" ")}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 rounded-xl bg-[#f7f3ea] px-4 py-3 text-sm">
                <strong>Matty O.</strong> is still the winningest active Strand golfer in documented years —{" "}
                {records.find((r) => r.playerId === "matt-onorato")?.wins ?? 0} team wins on record.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
