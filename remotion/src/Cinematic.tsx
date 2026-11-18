import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";

/**
 * Shared "dusk at the Sands" cinematic system: layered dusk sky with a warm
 * horizon, drifting dune silhouettes, animated film grain, and a vignette.
 * All deterministic CSS/SVG — no WebGL.
 */

export const DUSK = {
  skyTop: "#0a1b16",
  skyMid: "#13312a",
  horizonGlow: "rgba(201,162,39,0.14)",
  duneFar: "#0e241e",
  duneNear: "#081511",
  gold: "#c9a227",
  goldSoft: "#e8c86a",
  ball: "#f4f2ea",
};

export const DuskSky: React.FC<{ horizonY: number }> = ({ horizonY }) => (
  <>
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${DUSK.skyTop} 0%, ${DUSK.skyMid} ${horizonY - 10}%, ${DUSK.skyMid} 100%)`,
      }}
    />
    {/* warm band hugging the horizon */}
    <div
      style={{
        position: "absolute",
        left: "-10%",
        right: "-10%",
        top: `${horizonY - 26}%`,
        height: "30%",
        background: `radial-gradient(55% 100% at 50% 100%, ${DUSK.horizonGlow} 0%, rgba(201,162,39,0) 70%)`,
      }}
    />
  </>
);

/** Two layers of smooth dune silhouettes with a near-imperceptible drift. */
export const Dunes: React.FC<{ horizonY: number; drift?: number }> = ({
  horizonY,
  drift = 0,
}) => (
  <>
    <svg
      viewBox="0 0 1920 220"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        left: 0,
        width: "104%",
        top: `${horizonY - 7}%`,
        height: "26%",
        translate: `${-drift * 0.4}px 0`,
      }}
    >
      <path
        d="M0 160 C 240 90, 520 130, 820 104 C 1120 78, 1420 140, 1990 96 L 1990 220 L 0 220 Z"
        fill={DUSK.duneFar}
      />
    </svg>
    <svg
      viewBox="0 0 1920 200"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        left: 0,
        width: "106%",
        top: `${horizonY + 2}%`,
        height: `${100 - horizonY - 2}%`,
        translate: `${-drift}px 0`,
      }}
    >
      <path
        d="M0 90 C 320 40, 640 110, 980 76 C 1300 46, 1560 104, 2040 66 L 2040 200 L 0 200 Z"
        fill={DUSK.duneNear}
      />
    </svg>
  </>
);

/** Animated 35mm-style grain: a noise tile nudged every frame. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.055 }) => {
  const frame = useCurrentFrame();
  const jitter = [
    [0, 0],
    [-37, 18],
    [22, -45],
    [-11, -29],
    [41, 7],
    [-25, 39],
  ][frame % 6];
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile("grain.png")})`,
        backgroundRepeat: "repeat",
        backgroundPosition: `${jitter[0]}px ${jitter[1]}px`,
        opacity,
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }}
    />
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.5 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(120% 100% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

/**
 * Broadcast-style shot tracer: a glowing gold polyline through the given
 * points, revealed up to `progress` (0..1) with a fading tail.
 */
export const Tracer: React.FC<{
  points: Array<[number, number]>;
  progress: number;
  tail?: number;
  width: number;
  height: number;
}> = ({ points, progress, tail = 0.55, width, height }) => {
  if (points.length < 2 || progress <= 0) return null;
  const d = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  // Reveal via pathLength-normalized dash: hide everything before (progress - tail)
  // and after progress.
  const start = Math.max(0, progress - tail);
  const common = {
    d,
    fill: "none" as const,
    pathLength: 1,
    strokeLinecap: "round" as const,
    strokeDasharray: `${Math.max(0.001, progress - start)} 2`,
    strokeDashoffset: -start,
  };
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <path {...common} stroke="rgba(201,162,39,0.18)" strokeWidth={16} />
      <path {...common} stroke="rgba(201,162,39,0.45)" strokeWidth={7} />
      <path {...common} stroke={DUSK.goldSoft} strokeWidth={2.4} />
    </svg>
  );
};

/** A rim-lit ball: soft white sphere with a warm key light, subtle glow. */
export const CineBall: React.FC<{ size: number }> = ({ size }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle at 36% 32%, #ffffff 0%, ${DUSK.ball} 42%, #b9b4a4 78%, #8e8a7c 100%)`,
      boxShadow: `0 0 ${size * 0.9}px rgba(232,200,106,0.35), 0 0 ${size * 0.3}px rgba(255,255,255,0.5)`,
    }}
  />
);
