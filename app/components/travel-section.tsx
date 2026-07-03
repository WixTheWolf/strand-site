import { LOGISTICS_NOTES } from "@/lib/tournament";
import { STRAND_PLAYERS } from "@/lib/players";
import { formatFlightLegs, getTravelByPlayerId } from "@/lib/travel";

export default function TravelSection() {
  const rows = STRAND_PLAYERS.map((player) => {
    const travel = getTravelByPlayerId(player.id);
    return {
      player,
      arrival: travel ? formatFlightLegs(travel.arrival) : "TBD",
      departure: travel ? formatFlightLegs(travel.departure) : "TBD",
      notes: travel?.notes,
    };
  });

  return (
    <section id="travel" className="border-y border-[#14352a]/10 bg-[#14352a] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-white/60">Travel</div>
            <h2 className="mt-2 font-serif text-4xl">GEG flight board</h2>
            <p className="mt-3 max-w-2xl text-white/75">
              Thursday arrivals into Spokane (GEG). Most of the LA crew connects through PDX on Alaska morning banks.
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80 backdrop-blur">
            Fly into GEG • rent cars • drive to Brewster
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur">
          <div className="grid grid-cols-[1.1fr_1.4fr_1.4fr] bg-white/10 px-4 py-3 text-xs uppercase tracking-[0.2em] text-white/65">
            <div>Player</div>
            <div>Arrival to GEG</div>
            <div>Departure from GEG</div>
          </div>
          {rows.map(({ player, arrival, departure, notes }) => (
            <div
              key={player.id}
              className="grid grid-cols-1 gap-2 border-t border-white/10 px-4 py-4 text-sm md:grid-cols-[1.1fr_1.4fr_1.4fr] md:gap-4"
            >
              <div>
                <div className="font-medium">{player.name}</div>
                <div className="text-xs text-white/55">{player.nickname}</div>
                {notes ? <div className="mt-1 text-xs text-amber-200/90">{notes}</div> : null}
              </div>
              <div className="text-white/80">{arrival}</div>
              <div className="text-white/80">{departure}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {LOGISTICS_NOTES.map((note) => (
            <div key={note} className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur text-sm text-white/80">
              {note}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
