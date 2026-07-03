import Image from "next/image";
import Link from "next/link";
import { STRAND_PLAYERS } from "@/lib/players";
import { buildPlayerRecords, CHAMPIONS_BOARD, STRAND_TOURNAMENTS } from "@/lib/history";

export default function HistorySection() {
  const records = buildPlayerRecords(STRAND_PLAYERS);

  return (
    <section id="history" className="divider bg-white">
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
        <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-lg">
            <p className="label">Archive</p>
            <h2 className="section-title mt-3">The Strand since 2018</h2>
            <p className="mt-4 text-sm leading-relaxed text-black/55">
              Year-by-year results from{" "}
              <a
                href="https://www.strandinvitational.life/the-strand"
                className="underline decoration-black/20"
                target="_blank"
                rel="noopener noreferrer"
              >
                Fred&apos;s original site
              </a>
              . Win/loss totals reflect documented team-match appearances.
            </p>
          </div>
          <Image
            src="/brand/strand-invitational.png"
            alt="The Strand Invitational — est. 2018"
            width={120}
            height={120}
            className="h-20 w-auto object-contain opacity-80"
          />
        </div>

        <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-px bg-[#e2ddd3]">
            {STRAND_TOURNAMENTS.map((event) => (
              <article key={event.year} className="bg-white p-6 md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="label">{event.destination}</p>
                    <h3 className="mt-2 text-lg font-medium">{event.label}</h3>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">{event.winnerTeam}</div>
                    <div className="text-black/40">
                      {event.winnerScore !== "—" ? `${event.winnerScore}–${event.loserScore}` : "TBD"}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-black/55">{event.summary}</p>
                {event.courses.length > 0 && (
                  <p className="mt-2 text-xs text-black/35">{event.courses.join(" · ")}</p>
                )}
                <Link
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-xs uppercase tracking-[0.12em] text-black/45 hover:text-black"
                >
                  View archive →
                </Link>
              </article>
            ))}
          </div>

          <div className="space-y-8">
            <div>
              <p className="label mb-4">Champions</p>
              <div className="space-y-2">
                {CHAMPIONS_BOARD.map((row) => (
                  <div
                    key={row.year}
                    className="flex items-center justify-between border-b border-black/6 py-3 text-sm"
                  >
                    <div>
                      <span className="font-medium">{row.label}</span>
                      <span className="ml-2 text-black/40">{row.winner}</span>
                    </div>
                    <span className="text-black/55">{row.score}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="label mb-4">Player records</p>
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-white text-[10px] uppercase tracking-[0.12em] text-black/35">
                    <tr>
                      <th className="pb-2 font-medium">Player</th>
                      <th className="pb-2 font-medium">W</th>
                      <th className="pb-2 font-medium">L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records
                      .filter((r) => r.appearances > 0)
                      .map((rec) => (
                        <tr key={rec.playerId} className="border-t border-black/6">
                          <td className="py-2 font-medium">{rec.name}</td>
                          <td className="py-2 text-black/55">{rec.wins}</td>
                          <td className="py-2 text-black/55">{rec.losses}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
