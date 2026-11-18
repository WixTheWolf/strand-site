import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { COLORS } from "./palette";

const GROUND = 80; // turf band height
const RAMP_X = 560;
const BUNKER_X = 1000;
const TAKEOFF = 64;
const LAND = 122;

type Grain = { vx: number; vy: number; delay: number; r: number };

const SAND_BURST: Grain[] = [
  { vx: -3.4, vy: -7.4, delay: 0, r: 10 },
  { vx: -1.2, vy: -9.4, delay: 2, r: 8 },
  { vx: 0.8, vy: -8.4, delay: 1, r: 11 },
  { vx: 2.6, vy: -6.4, delay: 3, r: 8 },
  { vx: -4.6, vy: -5.0, delay: 2, r: 7 },
  { vx: 4.1, vy: -5.6, delay: 4, r: 10 },
  { vx: 1.7, vy: -10.4, delay: 1, r: 7 },
  { vx: -2.4, vy: -11.0, delay: 3, r: 6 },
  { vx: 3.3, vy: -8.8, delay: 5, r: 9 },
  { vx: -0.3, vy: -12.2, delay: 2, r: 7 },
];

export const CartJump: React.FC = () => {
  const frame = useCurrentFrame();

  // Piecewise X: drive in → ramp → flight → land → floor it off-frame.
  const cartX = interpolate(
    frame,
    [0, TAKEOFF, LAND, 168],
    [-420, RAMP_X - 40, 1340, 2350],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Flight arc + approach bounce.
  const airborne = frame > TAKEOFF && frame < LAND;
  const flightT = (frame - TAKEOFF) / (LAND - TAKEOFF);
  const jumpY = airborne ? -300 * 4 * flightT * (1 - flightT) : 0;
  const driveBounce =
    frame <= TAKEOFF ? Math.sin(frame * 0.9) * 3 : frame >= LAND ? Math.sin(frame * 0.9) * 2 : 0;
  const rampLift = interpolate(frame, [TAKEOFF - 10, TAKEOFF], [0, -34], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cartY = jumpY + driveBounce + (airborne ? 0 : frame < TAKEOFF ? rampLift : 0);

  // Nose up on takeoff, nose down into the landing, squash on touchdown.
  const cartTilt = interpolate(
    frame,
    [TAKEOFF - 10, TAKEOFF + 6, LAND - 10, LAND, LAND + 8],
    [0, -14, 12, 4, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) },
  );
  const squash = interpolate(frame, [LAND, LAND + 4, LAND + 10], [1, 0.88, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const wheelSpin = frame * (airborne ? 34 : 22);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.cream, overflow: "hidden" }}>
      {/* ground */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: GROUND,
          background: COLORS.turf,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: GROUND - 4,
          height: 5,
          background: "rgba(26,60,52,0.3)",
        }}
      />

      {/* launch ramp mound */}
      <div
        style={{
          position: "absolute",
          left: RAMP_X - 160,
          bottom: GROUND - 6,
          width: 330,
          height: 62,
          borderRadius: "60% 60% 0 0",
          background: COLORS.turf,
        }}
      />

      {/* bunker cut into the turf */}
      <div
        style={{
          position: "absolute",
          left: BUNKER_X - 250,
          bottom: 0,
          width: 500,
          height: 70,
          borderRadius: "50% 50% 0 0",
          background: COLORS.sand,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: BUNKER_X - 210,
          bottom: 0,
          width: 420,
          height: 44,
          borderRadius: "50% 50% 0 0",
          background: COLORS.sandDeep,
        }}
      />
      {/* rake lines */}
      {[-150, -90, -30, 30, 90].map((dx) => (
        <div
          key={dx}
          style={{
            position: "absolute",
            left: BUNKER_X + dx,
            bottom: 8,
            width: 3,
            height: 26,
            background: "rgba(138,107,63,0.3)",
            borderRadius: 3,
          }}
        />
      ))}

      {/* flying shadow racing beneath the cart */}
      <div
        style={{
          position: "absolute",
          left: cartX + 60,
          bottom: interpolate(
            cartX + 170,
            [BUNKER_X - 290, BUNKER_X - 200, BUNKER_X + 200, BUNKER_X + 290],
            [GROUND - 18, 24, 24, GROUND - 18],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
          width: 230,
          height: 20,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.28)",
          scale: String(interpolate(Math.abs(jumpY), [0, 300], [1, 0.55])),
          opacity: interpolate(Math.abs(jumpY), [0, 300], [0.9, 0.45]),
        }}
      />

      {/* dust puff over the bunker while the cart buzzes it */}
      <div
        style={{
          position: "absolute",
          left: BUNKER_X - 130,
          bottom: 30,
          width: 260,
          height: 90,
          borderRadius: "50%",
          background: COLORS.sand,
          opacity: interpolate(frame, [TAKEOFF + 14, TAKEOFF + 26, TAKEOFF + 60], [0, 0.55, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: String(
            interpolate(frame, [TAKEOFF + 14, TAKEOFF + 60], [0.5, 1.5], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.quad),
            }),
          ),
        }}
      />
      {/* sand erupting as the cart clears the bunker */}
      {SAND_BURST.map((g, i) => {
        const t = Math.max(0, frame - (TAKEOFF + 16 + g.delay));
        const alive = t > 0 && t < 44;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: BUNKER_X - 20 + g.vx * t * 3,
              bottom: 40 - g.vy * t * 2.6 - 0.35 * t * t,
              width: g.r * 2,
              height: g.r * 2,
              borderRadius: "50%",
              background: COLORS.sandDeep,
              opacity: alive
                ? interpolate(t, [0, 30, 44], [1, 1, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  })
                : 0,
            }}
          />
        );
      })}

      {/* THE CART */}
      <div
        style={{
          position: "absolute",
          left: cartX,
          bottom: GROUND - 14,
          translate: `0px ${cartY}px`,
          rotate: `${cartTilt}deg`,
          scale: `1 ${squash}`,
          transformOrigin: "50% 100%",
        }}
      >
        <svg viewBox="0 0 150 90" width={310} height={186}>
          {/* boost flames — flicker */}
          <g
            style={{
              transformOrigin: "16px 58px",
              scale: `${1 + Math.sin(frame * 2.6) * 0.25} 1`,
              opacity: airborne ? 1 : 0.65,
            }}
          >
            <path d="M18 54 L-16 58 L18 64 Z" fill={COLORS.gold} />
            <path d="M18 56 L-4 58 L18 62 Z" fill={COLORS.goldSoft} />
          </g>
          {/* body */}
          <rect x="18" y="44" width="104" height="22" rx="8" fill={COLORS.deepGreen} />
          <rect x="26" y="20" width="6" height="26" fill={COLORS.deepGreen} />
          <rect x="98" y="20" width="6" height="26" fill={COLORS.deepGreen} />
          <rect x="20" y="14" width="92" height="8" rx="4" fill={COLORS.gold} />
          <rect x="40" y="30" width="44" height="16" rx="4" fill={COLORS.cream} opacity="0.85" />
          {/* golfer silhouette — arm up during the jump */}
          <circle cx="62" cy="30" r="7" fill={COLORS.ink} />
          <rect x="54" y="36" width="16" height="12" rx="5" fill={COLORS.ink} />
          {airborne && (
            <rect x="68" y="18" width="5" height="16" rx="3" fill={COLORS.ink} transform="rotate(28 70 26)" />
          )}
          {/* bag on the back */}
          <rect x="112" y="26" width="12" height="24" rx="5" fill={COLORS.dirt} transform="rotate(14 118 38)" />
          <line x1="117" y1="12" x2="119" y2="28" stroke={COLORS.ink} strokeWidth="2.4" />
          <line x1="123" y1="14" x2="123" y2="28" stroke={COLORS.ink} strokeWidth="2.4" />
          {/* wheels */}
          {[38, 104].map((cx) => (
            <g key={cx} style={{ transformOrigin: `${cx}px 70px`, rotate: `${wheelSpin}deg` }}>
              <circle cx={cx} cy="70" r="12" fill={COLORS.ink} />
              <circle cx={cx} cy="70" r="5" fill={COLORS.cream} />
              <rect x={cx - 1.2} y="59" width="2.4" height="22" fill={COLORS.cream} opacity="0.7" />
            </g>
          ))}
        </svg>
      </div>
    </AbsoluteFill>
  );
};
