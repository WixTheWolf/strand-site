import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { Ball } from "./Ball";
import { COLORS } from "./palette";

const CUP_X = 1200;
const SURFACE = 510; // y of the green's top edge
const BALL = 44;
const REST_Y = SURFACE - BALL + 8;

const ORBIT_START = 125;
const ORBIT_END = 168;
const EJECT_END = 184;

export const LipOut: React.FC = () => {
  const frame = useCurrentFrame();

  // --- Ball position, phase by phase ---
  const orbitP = interpolate(frame, [ORBIT_START, ORBIT_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const angle = ((180 + 560 * orbitP) * Math.PI) / 180;
  const radX = interpolate(orbitP, [0, 1], [38, 30]);
  const radY = interpolate(orbitP, [0, 1], [13, 10]);
  const orbitX = CUP_X + Math.cos(angle) * radX - BALL / 2;
  const orbitY = SURFACE + 4 + Math.sin(angle) * radY - BALL / 2 - 10;

  let x: number;
  let y: number;
  if (frame < 45) {
    // incoming arc from off-screen left
    const s = frame / 45;
    x = interpolate(s, [0, 1], [-90, 520]);
    y = interpolate(s, [0, 1], [40, REST_Y], { easing: Easing.in(Easing.quad) });
  } else if (frame < 95) {
    // three diminishing bounces while tracking right
    x = interpolate(frame, [45, 95], [520, 1080]);
    const seg =
      frame < 66
        ? { a: 45, b: 66, h: 150 }
        : frame < 82
          ? { a: 66, b: 82, h: 72 }
          : { a: 82, b: 95, h: 30 };
    const u = (frame - seg.a) / (seg.b - seg.a);
    y = REST_Y - seg.h * 4 * u * (1 - u);
  } else if (frame < ORBIT_START) {
    // the roll — dying pace, straight at the cup
    x = interpolate(frame, [95, ORBIT_START], [1080, orbitXAt0()], {
      easing: Easing.out(Easing.quad),
    });
    y = REST_Y;
  } else if (frame < ORBIT_END) {
    x = orbitX;
    y = orbitY;
  } else if (frame < EJECT_END) {
    // spat back out — one indignant little hop
    const u = (frame - ORBIT_END) / (EJECT_END - ORBIT_END);
    x = interpolate(u, [0, 1], [orbitXAtEnd(), 1322], { easing: Easing.out(Easing.quad) });
    y = REST_Y - 46 * 4 * u * (1 - u) * (1 - u);
  } else {
    x = 1322;
    y = REST_Y;
  }

  function orbitXAt0() {
    return CUP_X + Math.cos(Math.PI) * 38 - BALL / 2;
  }
  function orbitXAtEnd() {
    const a = ((180 + 560) * Math.PI) / 180;
    return CUP_X + Math.cos(a) * 30 - BALL / 2;
  }

  const spin =
    frame < ORBIT_START
      ? frame * 16
      : frame < ORBIT_END
        ? ORBIT_START * 16 + (frame - ORBIT_START) * 26
        : ORBIT_START * 16 + (ORBIT_END - ORBIT_START) * 26 + Math.min(frame - ORBIT_END, 10) * 8;

  // Flag: idle sway, leans in during the orbit, shakes when it stays out.
  const flagLean =
    Math.sin(frame * 0.12) * 1.4 +
    interpolate(frame, [ORBIT_START, ORBIT_START + 10], [0, -4], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) +
    (frame > ORBIT_END
      ? Math.sin((frame - ORBIT_END) * 1.3) * 7 * Math.exp(-(frame - ORBIT_END) * 0.12)
      : 0);

  const inCupDip = frame >= ORBIT_START && frame < ORBIT_END;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.deepGreen, overflow: "hidden" }}>
      {/* dusk gradient */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${COLORS.deepGreenDark} 0%, ${COLORS.deepGreen} 70%)`,
        }}
      />
      {/* the green */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: SURFACE,
          bottom: 0,
          background: "rgba(46,139,100,0.72)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: SURFACE - 3,
          height: 4,
          background: "rgba(16,39,33,0.5)",
        }}
      />
      {/* mow lines */}
      {[260, 640, 1500, 1800].map((mx, i) => (
        <div
          key={mx}
          style={{
            position: "absolute",
            left: mx,
            top: SURFACE + 14,
            width: 150 + (i % 2) * 70,
            height: 7,
            borderRadius: 7,
            background: "rgba(255,255,255,0.07)",
          }}
        />
      ))}

      {/* cup */}
      <div
        style={{
          position: "absolute",
          left: CUP_X - 40,
          top: SURFACE - 4,
          width: 80,
          height: 24,
          borderRadius: "50%",
          background: "#0d2019",
          boxShadow: "inset 0 -4px 6px rgba(0,0,0,0.6)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: CUP_X - 40,
          top: SURFACE - 6,
          width: 80,
          height: 10,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.12)",
        }}
      />

      {/* flagstick */}
      <div
        style={{
          position: "absolute",
          left: CUP_X - 4,
          top: SURFACE - 196,
          width: 8,
          height: 200,
          borderRadius: 6,
          background: "rgba(255,255,255,0.92)",
          transformOrigin: "50% 100%",
          rotate: `${flagLean}deg`,
        }}
      >
        <svg
          viewBox="0 0 64 36"
          width={78}
          height={44}
          style={{
            position: "absolute",
            left: 7,
            top: 0,
            transformOrigin: "0% 50%",
            scale: `${1 + Math.sin(frame * 0.32) * 0.06} 1`,
          }}
        >
          <path
            d={`M0 0 L60 ${10 + Math.sin(frame * 0.32) * 4} L0 32 Z`}
            fill={COLORS.gold}
          />
        </svg>
      </div>

      {/* NOT TODAY */}
      <div
        style={{
          position: "absolute",
          left: CUP_X - 160,
          top: SURFACE - 268,
          width: 320,
          textAlign: "center",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: "0.24em",
          color: COLORS.goldSoft,
          scale: String(
            interpolate(frame, [ORBIT_END, ORBIT_END + 12], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.back(2.2)),
            }),
          ),
          opacity: interpolate(frame, [ORBIT_END, ORBIT_END + 6], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        NOT&nbsp;TODAY
      </div>

      {/* ball shadow */}
      <div
        style={{
          position: "absolute",
          left: x + 4,
          top: SURFACE + 10,
          width: 40,
          height: 10,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.35)",
          scale: String(interpolate(REST_Y - y, [0, 420], [1, 0.4], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })),
          opacity: interpolate(REST_Y - y, [0, 420], [0.8, 0.2], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />

      {/* the ball */}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          scale: inCupDip ? "0.93" : "1",
        }}
      >
        <Ball size={BALL} rotate={spin} />
      </div>
    </AbsoluteFill>
  );
};
