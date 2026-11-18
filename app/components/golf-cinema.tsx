"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

/**
 * Golf cinema — looping animated vignettes that replay each time they
 * scroll into view. Pure CSS/SVG: no video files, no network, reduced-motion
 * safe (static frame when the user prefers no animation).
 */

function useReplayOnView(threshold = 0.45) {
  const ref = useRef<HTMLDivElement>(null);
  const [take, setTake] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setTake((t) => t + 1)),
      { threshold },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, take };
}

function Ball({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden>
      <circle cx="12" cy="12" r="11" fill="#fdfdf8" stroke="rgba(0,0,0,0.12)" />
      {[[8, 8], [14, 7], [10, 13], [16, 12], [12, 17], [7, 16]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.1" fill="rgba(0,0,0,0.12)" />
      ))}
    </svg>
  );
}

const TURF = [
  { tx: "-54px", ty: "-74px", tr: "-220deg", d: "0s", c: "#2e8b64", w: 10 },
  { tx: "-26px", ty: "-96px", tr: "160deg", d: "0.02s", c: "#1a3c34", w: 7 },
  { tx: "10px", ty: "-108px", tr: "-300deg", d: "0.01s", c: "#3da375", w: 9 },
  { tx: "38px", ty: "-88px", tr: "260deg", d: "0.03s", c: "#2e8b64", w: 6 },
  { tx: "64px", ty: "-60px", tr: "-150deg", d: "0.02s", c: "#8a6b3f", w: 8 },
  { tx: "-70px", ty: "-44px", tr: "120deg", d: "0.04s", c: "#8a6b3f", w: 6 },
];

/** Close-up slo-mo: driver meets ball, turf flies, ball screams off frame. */
export function TeeShotScene() {
  const { ref, take } = useReplayOnView();
  return (
    <div ref={ref} aria-hidden className="gc-stage select-none bg-[#f7f5f0]">
      <div key={take} className="relative mx-auto h-[220px] max-w-[1400px] overflow-hidden px-5 md:px-8">
        <p className="gc-caption label absolute left-5 top-5 text-black/40 md:left-8">The strike · super slo-mo</p>
        {/* ground */}
        <div className="absolute inset-x-0 bottom-0 h-[38px] bg-[#2e8b64]/90" />
        <div className="absolute inset-x-0 bottom-[36px] h-[3px] bg-[#1a3c34]/30" />
        {/* speed lines */}
        {[70, 92, 114].map((y, i) => (
          <span
            key={y}
            className="absolute left-[14%] h-[2px] w-16 origin-left rounded bg-[#1a3c34]/30"
            style={{ bottom: y, animation: `gc-speedline 4.6s ease-out ${i * 0.03}s infinite` }}
          />
        ))}
        {/* tee + ball + impact */}
        <div className="absolute bottom-[30px] left-[14%]">
          <div className="absolute -left-[4px] bottom-0 h-[26px] w-[8px] rounded-b bg-[#c9a227]" />
          <div className="absolute -left-[13px] bottom-[22px]" style={{ animation: "gc-ball-launch 4.6s linear infinite" }}>
            <Ball size={26} />
          </div>
          <span
            className="absolute -left-[22px] bottom-[10px] block h-11 w-11 rounded-full border-2 border-[#c9a227]"
            style={{ animation: "gc-impact-ring 4.6s ease-out infinite" }}
          />
          {TURF.map((t, i) => (
            <span
              key={i}
              className="absolute bottom-[2px] left-0 block rounded-sm"
              style={{
                width: t.w,
                height: 3,
                background: t.c,
                "--tx": t.tx,
                "--ty": t.ty,
                "--tr": t.tr,
                animation: `gc-turf 4.6s cubic-bezier(0.2, 0.6, 0.4, 1) ${t.d} infinite`,
              } as CSSProperties}
            />
          ))}
        </div>
        {/* club — shaft + head swinging through */}
        <div
          className="absolute bottom-[34px] left-[14%] h-[150px] w-[6px] origin-top"
          style={{ animation: "gc-club-swing 4.6s cubic-bezier(0.6, 0, 0.4, 1) infinite" }}
        >
          <div className="h-full w-full rounded bg-[#111]/80" />
          <div className="absolute -left-[16px] bottom-[-10px] h-[18px] w-[30px] rounded-[10px_14px_12px_4px] bg-[#1a3c34]" />
        </div>
      </div>
    </div>
  );
}

/** Approach shot bounces on, tracks at the cup, orbits the lip... stays out. */
export function LipOutScene({ dark = false }: { dark?: boolean }) {
  const { ref, take } = useReplayOnView();
  return (
    <div ref={ref} aria-hidden className={`gc-stage select-none ${dark ? "bg-[#1a3c34]" : "bg-white"}`}>
      <div key={take} className="relative mx-auto h-[190px] max-w-[1400px] overflow-hidden px-5 md:px-8">
        <p className={`gc-caption label absolute left-5 top-5 md:left-8 ${dark ? "text-white/40" : "text-black/40"}`}>
          The approach · so, so close
        </p>
        {/* green */}
        <div className={`absolute inset-x-0 bottom-0 h-[44px] ${dark ? "bg-[#2e8b64]/70" : "bg-[#2e8b64]/90"}`} />
        {/* cup + flag at ~62vw */}
        <div className="absolute bottom-[40px]" style={{ left: "calc(62.5vw)" }}>
          <div className="h-[8px] w-[26px] -translate-x-1/2 rounded-[50%] bg-[#0d2019]" />
          <div
            className="absolute -top-[86px] left-[2px] h-[88px] w-[3px] origin-bottom rounded bg-white/90"
            style={{ animation: "gc-flag-react 7s ease-in-out infinite" }}
          >
            <div className="flag-wave absolute left-[3px] top-0 h-0 w-0 border-y-[9px] border-l-[26px] border-y-transparent border-l-[#c9a227]" />
          </div>
          <span
            className={`gc-caption absolute -top-[116px] left-1/2 w-28 -translate-x-1/2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] ${
              dark ? "text-[#e8c86a]" : "text-[#1a3c34]"
            }`}
            style={{ animation: "gc-almost 7s ease-out infinite" }}
          >
            Not today
          </span>
        </div>
        {/* ball: x carrier → y bouncer → lip orbit */}
        <div className="absolute bottom-[44px] left-0" style={{ animation: "gc-approach-x 7s linear infinite" }}>
          <div style={{ animation: "gc-approach-y 7s linear infinite" }}>
            <div className="h-5 w-5" style={{ animation: "gc-lip-orbit 7s linear infinite", transformOrigin: "160% 50%" }}>
              <div style={{ animation: "gc-ball-spin 7s linear infinite" }}>
                <Ball size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SAND = [
  { sx: "-44px", sy: "-52px", d: "0s" },
  { sx: "-18px", sy: "-70px", d: "0.05s" },
  { sx: "12px", sy: "-58px", d: "0.02s" },
  { sx: "34px", sy: "-40px", d: "0.08s" },
  { sx: "-60px", sy: "-30px", d: "0.04s" },
];

/** The supercharged cart sends it over the bunker. Club rules are silent on this. */
export function CartJumpScene({ dark = false }: { dark?: boolean }) {
  const { ref, take } = useReplayOnView();
  return (
    <div ref={ref} aria-hidden className={`gc-stage select-none ${dark ? "bg-[#1a3c34]" : "bg-[#f7f5f0]"}`}>
      <div key={take} className="relative mx-auto h-[210px] max-w-[1400px] overflow-hidden px-5 md:px-8">
        <p className={`gc-caption label absolute left-5 top-5 md:left-8 ${dark ? "text-white/40" : "text-black/40"}`}>
          Cart path optional
        </p>
        {/* turf with a bunker cut into it */}
        <div className={`absolute inset-x-0 bottom-0 h-[34px] ${dark ? "bg-[#2e8b64]/70" : "bg-[#2e8b64]/90"}`} />
        <div className="absolute bottom-0 left-[46%] h-[30px] w-[220px] -translate-x-1/2">
          <div className="absolute inset-x-0 bottom-0 h-full rounded-t-[50%] bg-[#e4d4ae]" />
          <div className="absolute inset-x-3 bottom-0 h-[60%] rounded-t-[50%] bg-[#d8c493]" />
          {/* sand kicked by the jump */}
          {SAND.map((s, i) => (
            <span
              key={i}
              className="absolute bottom-[18px] left-1/2 block h-[5px] w-[5px] rounded-full bg-[#d8c493]"
              style={{ "--sx": s.sx, "--sy": s.sy, animation: `gc-sand-kick 5.4s ease-out ${s.d} infinite` } as CSSProperties}
            />
          ))}
          <div
            className="absolute -bottom-[2px] left-1/2 h-[6px] w-[120px] -translate-x-1/2 rounded-[50%] bg-black/30"
            style={{ animation: "gc-shadow-fly 5.4s linear infinite" }}
          />
        </div>
        {/* launch ramp mound */}
        <div className={`absolute bottom-[30px] left-[24%] h-[26px] w-[150px] rounded-t-[60%] ${dark ? "bg-[#2e8b64]/70" : "bg-[#2e8b64]/90"}`} />
        {/* the cart */}
        <div className="absolute bottom-[34px] left-0" style={{ animation: "gc-cart-x 5.4s linear infinite" }}>
          <div style={{ animation: "gc-cart-y 5.4s linear infinite" }}>
            <svg viewBox="0 0 150 90" width={140} height={84}>
              {/* boost flames */}
              <g style={{ animation: "gc-boost 0.3s linear infinite", transformOrigin: "16px 58px" }}>
                <path d="M18 54 L-12 58 L18 64 Z" fill="#c9a227" />
                <path d="M18 56 L-2 58 L18 62 Z" fill="#e8c86a" />
              </g>
              {/* body */}
              <rect x="18" y="44" width="104" height="22" rx="8" fill="#1a3c34" />
              <rect x="26" y="20" width="6" height="26" fill="#1a3c34" />
              <rect x="98" y="20" width="6" height="26" fill="#1a3c34" />
              <rect x="20" y="14" width="92" height="8" rx="4" fill="#c9a227" />
              <rect x="40" y="30" width="44" height="16" rx="4" fill="#f7f5f0" opacity="0.85" />
              {/* golfer silhouette */}
              <circle cx="62" cy="30" r="7" fill="#111" />
              <rect x="54" y="36" width="16" height="12" rx="5" fill="#111" />
              {/* bag on the back */}
              <rect x="112" y="26" width="12" height="24" rx="5" fill="#8a6b3f" transform="rotate(14 118 38)" />
              <line x1="117" y1="12" x2="119" y2="28" stroke="#111" strokeWidth="2.4" />
              <line x1="123" y1="14" x2="123" y2="28" stroke="#111" strokeWidth="2.4" />
              {/* wheels */}
              <g style={{ animation: "gc-wheel-spin 5.4s linear infinite", transformOrigin: "38px 70px" }}>
                <circle cx="38" cy="70" r="12" fill="#111" />
                <circle cx="38" cy="70" r="5" fill="#f7f5f0" />
                <rect x="36.8" y="59" width="2.4" height="22" fill="#f7f5f0" opacity="0.7" />
              </g>
              <g style={{ animation: "gc-wheel-spin 5.4s linear infinite", transformOrigin: "104px 70px" }}>
                <circle cx="104" cy="70" r="12" fill="#111" />
                <circle cx="104" cy="70" r="5" fill="#f7f5f0" />
                <rect x="102.8" y="59" width="2.4" height="22" fill="#f7f5f0" opacity="0.7" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
