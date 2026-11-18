import Image from "next/image";
import { TiltCard } from "./fx";
import { getPlayerPhoto } from "@/lib/player-assets";
import type { StrandPlayer } from "@/lib/types";

export default function RosterCard({
  title,
  subtitle,
  players,
  champion = false,
}: {
  title: string;
  subtitle: string;
  players: StrandPlayer[];
  champion?: boolean;
}) {
  return (
    <TiltCard
      className={`h-full rounded-[2rem] border p-6 md:p-8 ${
        champion
          ? "border-[#c9a227]/60 bg-[#1a3c34] text-white shadow-[0_24px_70px_rgba(26,60,52,0.35)]"
          : "border-black/10 bg-white text-[#111] shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`label ${champion ? "text-[#e8c86a]" : "text-black/45"}`}>{subtitle}</p>
          <h3 className="mt-2 text-2xl font-medium tracking-[-0.03em]">{title}</h3>
        </div>
        {champion && <span className="champ-ring rounded-2xl bg-[#c9a227]/15 px-3 py-2 text-2xl" aria-hidden>🏆</span>}
      </div>
      <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {players.map((player, i) => {
          const photo = getPlayerPhoto(player.id);
          return (
            <li
              key={player.id}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2 text-sm ${
                champion ? "bg-white/8" : "bg-[#f7f5f0]"
              }`}
            >
              {photo ? (
                <Image
                  src={photo}
                  alt=""
                  width={34}
                  height={34}
                  className={`h-[34px] w-[34px] rounded-full object-cover ${champion ? "ring-1 ring-[#c9a227]/60" : "ring-1 ring-black/10"}`}
                />
              ) : (
                <span className={`flex h-[34px] w-[34px] items-center justify-center rounded-full text-[10px] font-semibold ${champion ? "bg-white/15" : "bg-black/10"}`}>
                  {player.initials}
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate font-medium">{player.name}</span>
                <span className={`block text-[10px] uppercase tracking-[0.14em] ${champion ? "text-white/50" : "text-black/40"}`}>
                  {i === 0 ? "Captain" : player.nickname}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </TiltCard>
  );
}
