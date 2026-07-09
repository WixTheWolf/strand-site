import Image from "next/image";
import { CountUp, Holo } from "./fx";
import Reveal from "./reveal";
import { LOGISTICS_NOTES } from "@/lib/tournament";
import { getPlayerPhoto } from "@/lib/player-assets";
import { isCaptain, STRAND_PLAYERS } from "@/lib/players";
import { getTravelByPlayerId, type FlightLeg } from "@/lib/travel";

/** Deterministic bar widths so the barcode is stable across SSR renders */
function barcodeBars(seed: string): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const bars: number[] = [];
  for (let i = 0; i < 28; i += 1) {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    bars.push((Math.abs(h) % 3) + 1);
  }
  return bars;
}

function Barcode({ seed, className }: { seed: string; className?: string }) {
  const bars = barcodeBars(seed);
  const total = bars.reduce((sum, w) => sum + w + 1, 0);
  const positions = bars.reduce<{ x: number; w: number }[]>((acc, w) => {
    const x = acc.length ? acc[acc.length - 1].x + acc[acc.length - 1].w + 1 : 0;
    return [...acc, { x, w }];
  }, []);
  return (
    <svg
      viewBox={`0 0 ${total} 24`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      {positions.map(({ x, w }, i) => (
        <rect key={i} x={x} y="0" width={w} height="24" fill="currentColor" />
      ))}
    </svg>
  );
}

function routeParts(route: string): string[] {
  return route.split("→").map((part) => part.trim());
}

/** "SAN → PDX", "PDX → GEG" → { origin: "SAN", via: ["PDX"], final: "GEG" } */
function summarizeLegs(legs: FlightLeg[]) {
  if (!legs.length) return null;
  const chain: string[] = [];
  for (const leg of legs) {
    for (const code of routeParts(leg.route)) {
      if (chain[chain.length - 1] !== code) chain.push(code);
    }
  }
  return {
    origin: chain[0],
    final: chain[chain.length - 1],
    via: chain.slice(1, -1),
  };
}

function FieldStack({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-[0.18em] text-[#111]/40">{label}</div>
      <div className="mt-0.5 font-mono text-sm font-medium text-[#111]">{value}</div>
    </div>
  );
}

function LegLines({ legs }: { legs: FlightLeg[] }) {
  return (
    <div className="space-y-0.5">
      {legs.map((leg) => (
        <div key={`${leg.route}-${leg.times}`} className="font-mono text-[10px] text-[#111]/55">
          {leg.airline.toUpperCase()} · {leg.route} · {leg.times}
        </div>
      ))}
    </div>
  );
}

export default function TravelSection() {
  const passes = STRAND_PLAYERS.map((player, idx) => {
    const travel = getTravelByPlayerId(player.id);
    const arrival = travel?.arrival ?? [];
    const departure = travel?.departure ?? [];
    const inbound = summarizeLegs(arrival);
    const outbound = summarizeLegs(departure);
    const seat = `${String(idx + 1).padStart(2, "0")}${idx % 2 === 0 ? "A" : "B"}`;
    return { player, arrival, departure, inbound, outbound, seat, standby: !inbound };
  });

  const booked = passes.filter((pass) => !pass.standby).length;

  return (
    <section id="travel" className="divider bg-[#111] text-white">
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
        <Reveal className="mb-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-lg">
            <p className="label text-white/40">Travel</p>
            <h2 className="section-title mt-3 text-white">The Pass</h2>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              Twenty boarding passes to Brewster. Thursday arrivals into Spokane — most of the LA
              crew rides the Alaska morning bank through PDX.
            </p>
          </div>
          <div className="flex gap-8 text-sm">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">Booked</div>
              <div className="mt-1 font-mono text-2xl font-medium">
                <CountUp value={booked} />/{passes.length}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">Arrive</div>
              <div className="mt-1 font-mono text-2xl font-medium">AUG 20</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/35">Depart</div>
              <div className="mt-1 font-mono text-2xl font-medium">AUG 23</div>
            </div>
          </div>
        </div>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-2">
          {passes.map(({ player, arrival, departure, inbound, outbound, seat }, i) => {
            const photo = getPlayerPhoto(player.id);
            const captain = isCaptain(player.id);
            return (
              <Reveal key={player.id} delay={(i % 2) * 100}>
              <Holo className="rounded-xl">
              <article
                className="group relative flex flex-col overflow-hidden rounded-xl bg-[#f7f5f0] text-[#111] shadow-[0_1px_0_rgba(255,255,255,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.45)] sm:flex-row"
              >
                {/* Main ticket body */}
                <div className="min-w-0 flex-1 p-5 md:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#1a3c34]">
                      Strand Air
                    </div>
                    <div className="text-[9px] uppercase tracking-[0.2em] text-[#111]/40">
                      {captain ? "Captain Class" : "Boarding pass"}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    {photo ? (
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[#111]/10">
                        <Image src={photo} alt={player.name} fill className="object-cover object-top" sizes="44px" />
                      </div>
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#111]/8 font-mono text-xs">
                        {player.initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-[9px] uppercase tracking-[0.18em] text-[#111]/40">Passenger</div>
                      <div className="truncate font-mono text-sm font-medium uppercase">{player.name}</div>
                      <div className="text-xs text-[#111]/50">&ldquo;{player.nickname}&rdquo;</div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-end gap-4">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.18em] text-[#111]/40">From</div>
                      <div className="font-mono text-3xl font-medium leading-none tracking-tight">
                        {inbound?.origin ?? "TBD"}
                      </div>
                    </div>
                    <div className="mb-1 flex flex-1 items-center gap-1 text-[#1a3c34]">
                      <span className="h-px flex-1 bg-current opacity-30" />
                      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden>
                        <path d="M21.5 15.5c.6-.2.9-.8.7-1.4-.1-.4-.5-.7-.9-.8l-5.9-1.1-4.2-7.5c-.2-.3-.5-.5-.8-.6l-1-.2 2 8-4.7 1.2-1.6-2.1-.9-.2 1 3.9-.3 4 .9-.2 1-2.4 4.6-1.5 2.3 7.9.9-.4c.3-.2.5-.5.5-.9l.3-8.6 5.6-1.6.5.5Z" />
                      </svg>
                      <span className="h-px flex-1 bg-current opacity-30" />
                      {inbound?.via.length ? (
                        <span className="rounded-full border border-[#1a3c34]/25 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em]">
                          via {inbound.via.join(" · ")}
                        </span>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] uppercase tracking-[0.18em] text-[#111]/40">To</div>
                      <div className="font-mono text-3xl font-medium leading-none tracking-tight">GEG</div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-t border-dashed border-[#111]/15 pt-4">
                    <FieldStack label="Date" value="AUG 20" />
                    <FieldStack label="Seat" value={captain ? "1A" : seat} />
                    <FieldStack label="Group" value="STRAND" />
                    <FieldStack label="Dest" value="Brewster WA" />
                  </div>

                  {arrival.length > 0 ? (
                    <div className="mt-4">
                      <LegLines legs={arrival} />
                    </div>
                  ) : (
                    <div className="mt-4 inline-block -rotate-2 border-2 border-[#c45c26] px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c45c26]">
                      Standby — flights TBD
                    </div>
                  )}
                </div>

                {/* Perforation */}
                <div className="relative shrink-0 border-t-2 border-dashed border-[#111]/20 sm:border-l-2 sm:border-t-0">
                  <span className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full bg-[#111] sm:-top-2.5 sm:left-1/2 sm:-translate-x-1/2" aria-hidden />
                  <span className="absolute -bottom-2.5 -right-2.5 h-5 w-5 rounded-full bg-[#111] sm:-bottom-2.5 sm:left-1/2 sm:right-auto sm:-translate-x-1/2" aria-hidden />
                </div>

                {/* Stub */}
                <div className="flex w-full shrink-0 flex-col justify-between gap-3 p-5 sm:w-[168px] md:p-6">
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.2em] text-[#111]/40">Return</div>
                    <div className="mt-0.5 font-mono text-sm font-medium">
                      GEG → {outbound?.final ?? "TBD"}
                    </div>
                    <div className="font-mono text-[10px] text-[#111]/45">AUG 23</div>
                    {departure.length > 0 && (
                      <div className="mt-2 hidden sm:block">
                        <LegLines legs={departure} />
                      </div>
                    )}
                  </div>
                  <div>
                    <Barcode seed={player.id} className="h-6 w-full text-[#111]" />
                    <div className="mt-1 text-center font-mono text-[9px] uppercase tracking-[0.3em] text-[#111]/40">
                      STR-2026-{player.initials}
                    </div>
                  </div>
                </div>
              </article>
              </Holo>
              </Reveal>
            );
          })}
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
