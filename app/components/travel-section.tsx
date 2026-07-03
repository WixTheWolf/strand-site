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
    <section id="travel" className="divider bg-[#111] text-white">
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
        <div className="mb-12 max-w-lg">
          <p className="label text-white/40">Travel</p>
          <h2 className="section-title mt-3 text-white">GEG flight board</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/50">
            Thursday arrivals into Spokane. Most of the LA crew connects through PDX on Alaska morning
            banks.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.18em] text-white/35">
                <th className="pb-4 pr-6 font-medium">Player</th>
                <th className="pb-4 pr-6 font-medium">Arrival</th>
                <th className="pb-4 font-medium">Departure</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ player, arrival, departure, notes }) => (
                <tr key={player.id} className="border-b border-white/6">
                  <td className="py-3.5 pr-6">
                    <div className="font-medium">{player.name}</div>
                    <div className="text-xs text-white/35">{player.nickname}</div>
                    {notes ? <div className="mt-0.5 text-xs text-amber-300/70">{notes}</div> : null}
                  </td>
                  <td className="py-3.5 pr-6 text-white/60">{arrival}</td>
                  <td className="py-3.5 text-white/60">{departure}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 flex flex-wrap gap-x-8 gap-y-2">
          {LOGISTICS_NOTES.map((note) => (
            <span key={note} className="text-xs text-white/40">
              {note}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
