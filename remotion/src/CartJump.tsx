import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { DUSK, Dunes, DuskSky, Grain, Vignette } from "./Cinematic";

const HORIZON = 68; // percent
const GROUND_Y = 640 * (HORIZON / 100) + 86; // cart baseline in px from top
const TAKEOFF = 64;
const LAND = 122;
const BUNKER_X = 1010;

/** The cart as a refined silhouette with a thin gold rim light. */
const CartSilhouette: React.FC<{ wheelSpin: number; airborne: boolean }> = ({
  wheelSpin,
  airborne,
}) => (
  <svg viewBox="0 0 160 92" width={320} height={184}>
    <defs>
      <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={DUSK.goldSoft} stopOpacity="0.9" />
        <stop offset="1" stopColor={DUSK.goldSoft} stopOpacity="0" />
      </linearGradient>
    </defs>
    {/* chassis: low body with a raked front cowl */}
    <path d="M18 66 Q16 52 32 52 L122 52 Q140 52 138 66 Z" fill="#050f0c" />
    <path d="M18 56 L34 53 L34 56 Z" fill="#050f0c" />
    {/* open cabin: slim posts + floating roof */}
    <rect x="38" y="24" width="4" height="30" fill="#050f0c" transform="skewX(-8)" />
    <rect x="106" y="24" width="4" height="30" fill="#050f0c" transform="skewX(-8)" />
    <rect x="30" y="17" width="94" height="6" rx="3" fill="#050f0c" />
    <rect x="30" y="16.4" width="94" height="2" rx="1" fill="url(#rim)" />
    {/* body rim light along the cowl */}
    <path d="M20 52.5 L136 52.5 L135 55 L21 55 Z" fill={DUSK.goldSoft} opacity="0.28" />
    {/* seated golfer silhouette, visible through the open cabin */}
    <circle cx="72" cy="31" r="6" fill="#050f0c" />
    <path d="M64 37 Q72 33 80 37 L80 52 L64 52 Z" fill="#050f0c" />
    <path d="M78 40 L92 44 L92 47 L78 44 Z" fill="#050f0c" />
    {/* seat back */}
    <path d="M86 28 L92 28 L94 52 L88 52 Z" fill="#050f0c" />
    {/* bag silhouette on the rear deck */}
    <path d="M118 32 L128 34 L126 54 L116 52 Z" fill="#050f0c" />
    <line x1="121" y1="20" x2="123" y2="33" stroke="#050f0c" strokeWidth="2.4" />
    <line x1="127" y1="23" x2="127" y2="34" stroke="#050f0c" strokeWidth="2.4" />
    {/* wheels: dark discs, slim gold hub arc that spins */}
    {[44, 116].map((cx) => (
      <g key={cx}>
        <circle cx={cx} cy="70" r="13" fill="#040c09" />
        <circle cx={cx} cy="70" r="12.2" fill="none" stroke="rgba(232,200,106,0.2)" strokeWidth="1" />
        <g style={{ transformOrigin: `${cx}px 70px`, rotate: `${wheelSpin}deg` }}>
          <path
            d={`M ${cx} 64 A 6 6 0 0 1 ${cx + 5.2} 73`}
            fill="none"
            stroke={DUSK.goldSoft}
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity={airborne ? 0.8 : 0.5}
          />
        </g>
      </g>
    ))}
  </svg>
);

const DustPuff: React.FC<{
  x: number;
  y: number;
  start: number;
  frame: number;
  scale?: number;
}> = ({ x, y, start, frame, scale = 1 }) => {
  const t = frame - start;
  if (t < 0 || t > 50) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 90,
        top: y - 44,
        width: 180,
        height: 70,
        borderRadius: "50%",
        background:
          "radial-gradient(50% 60% at 50% 70%, rgba(130,112,76,0.4) 0%, rgba(130,112,76,0) 70%)",
        scale: String(
          scale *
            interpolate(t, [0, 50], [0.45, 1.6], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.quad),
            }),
        ),
        opacity: interpolate(t, [0, 8, 50], [0, 0.85, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    />
  );
};

export const CartJump: React.FC = () => {
  const frame = useCurrentFrame();

  const cartX = interpolate(frame, [0, TAKEOFF, LAND, 168], [-440, 540, 1390, 2400], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const airborne = frame > TAKEOFF && frame < LAND;
  const flightT = (frame - TAKEOFF) / (LAND - TAKEOFF);
  const jumpY = airborne ? -270 * 4 * flightT * (1 - flightT) : 0;
  const rampLift = interpolate(frame, [TAKEOFF - 12, TAKEOFF], [0, -30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cartY = jumpY + (frame <= TAKEOFF ? rampLift : 0) + Math.sin(frame * 0.8) * (airborne ? 0 : 1.6);

  const cartTilt = interpolate(
    frame,
    [TAKEOFF - 12, TAKEOFF + 6, LAND - 12, LAND, LAND + 10],
    [0, -12, 10, 3, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) },
  );
  const squash = interpolate(frame, [LAND, LAND + 4, LAND + 12], [1, 0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: DUSK.skyTop, overflow: "hidden" }}>
      <DuskSky horizonY={HORIZON} />
      <Dunes horizonY={HORIZON - 5} drift={frame * 0.1} />

      {/* foreground ridge the cart rides */}
      <svg
        viewBox="0 0 1920 220"
        preserveAspectRatio="none"
        style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: 220 }}
      >
        {/* ridge with a carved bunker gap and a launch-side lip */}
        <path
          d="M0 96 C 220 76, 420 92, 560 78 C 640 70, 700 64, 740 70 L 790 86 C 850 150, 1170 150, 1230 86 L 1280 72 C 1420 58, 1640 84, 1920 68 L 1920 220 L 0 220 Z"
          fill="#06120e"
        />
        {/* dusk-lit sand in the gap */}
        <path d="M800 100 C 870 146, 1150 146, 1220 100 C 1150 128, 870 128, 800 100 Z" fill="#584a33" opacity="0.85" />
        <path d="M830 108 C 890 138, 1130 138, 1190 108 C 1130 126, 890 126, 830 108 Z" fill="#6b5a3e" opacity="0.6" />
      </svg>

      {/* distant pin for depth */}
      <div style={{ position: "absolute", left: 1700, top: 640 * (HORIZON / 100) - 68, width: 3, height: 64, background: "rgba(244,242,234,0.5)", borderRadius: 3 }} />
      <svg viewBox="0 0 30 18" width={30} height={18} style={{ position: "absolute", left: 1703, top: 640 * (HORIZON / 100) - 68 }}>
        <path d="M0 0 L26 6 L0 14 Z" fill={DUSK.gold} opacity="0.75" />
      </svg>

      {/* soft shadow tracking below */}
      <div
        style={{
          position: "absolute",
          left: cartX + 70,
          top:
            interpolate(
              cartX + 160,
              [BUNKER_X - 300, BUNKER_X - 210, BUNKER_X + 210, BUNKER_X + 300],
              [GROUND_Y + 64, GROUND_Y + 120, GROUND_Y + 120, GROUND_Y + 64],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            ),
          width: 220,
          height: 18,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.5)",
          filter: "blur(4px)",
          scale: String(interpolate(Math.abs(jumpY), [0, 270], [1, 0.55])),
          opacity: interpolate(Math.abs(jumpY), [0, 270], [0.65, 0.3]),
        }}
      />

      {/* takeoff + landing dust */}
      <DustPuff x={640} y={GROUND_Y + 60} start={TAKEOFF - 2} frame={frame} />
      <DustPuff x={1460} y={GROUND_Y + 60} start={LAND - 1} frame={frame} scale={1.2} />

      {/* air streaks while airborne */}
      {airborne &&
        [0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cartX - 60 - i * 70,
              top: GROUND_Y + cartY + 50 + i * 26,
              width: interpolate(flightT, [0, 0.5, 1], [30, 110 - i * 20, 30]),
              height: 2,
              borderRadius: 2,
              background: "rgba(232,200,106,0.22)",
            }}
          />
        ))}

      {/* THE CART */}
      <div
        style={{
          position: "absolute",
          left: cartX,
          top: GROUND_Y - 120,
          translate: `0px ${cartY}px`,
          rotate: `${cartTilt}deg`,
          scale: `1 ${squash}`,
          transformOrigin: "50% 100%",
        }}
      >
        <CartSilhouette wheelSpin={frame * (airborne ? 30 : 20)} airborne={airborne} />
      </div>

      <Grain />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};
