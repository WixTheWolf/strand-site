import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { CineBall, DUSK, Dunes, DuskSky, Grain, Vignette } from "./Cinematic";

const CUP_X = 1210;
const SURFACE = 408; // y of the green's top edge
const BALL = 38;
const REST_Y = SURFACE + 56; // ball-top resting line on the green

const HOP_END = 30;
const ROLL_END = 126;
const ORBIT_END = 170;
const EJECT_END = 186;

export const LipOut: React.FC = () => {
  const frame = useCurrentFrame();

  const orbitP = interpolate(frame, [ROLL_END, ORBIT_END], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const angle = ((180 + 560 * orbitP) * Math.PI) / 180;
  const radX = interpolate(orbitP, [0, 1], [36, 29]);
  const radY = interpolate(orbitP, [0, 1], [12, 9]);
  const cupCY = REST_Y + BALL / 2 + 4;
  const orbitX = (a: number, rx: number) => CUP_X + Math.cos(a) * rx - BALL / 2;
  const orbitY = (a: number, ry: number) => cupCY + Math.sin(a) * ry - BALL / 2 - 8;

  let x: number;
  let y: number;
  if (frame < HOP_END) {
    // low chip flight in from the left
    const s = frame / HOP_END;
    x = interpolate(s, [0, 1], [-70, 470]);
    y = REST_Y - 190 * (1 - s) * (1 - s) - 46 * 4 * s * (1 - s);
  } else if (frame < ROLL_END) {
    // the runout — long, dying roll at the cup
    x = interpolate(frame, [HOP_END, ROLL_END], [470, orbitX(Math.PI, 36)], {
      easing: Easing.out(Easing.cubic),
    });
    y = REST_Y;
  } else if (frame < ORBIT_END) {
    x = orbitX(angle, radX);
    y = orbitY(angle, radY);
  } else if (frame < EJECT_END) {
    const u = (frame - ORBIT_END) / (EJECT_END - ORBIT_END);
    const endA = ((180 + 560) * Math.PI) / 180;
    x = interpolate(u, [0, 1], [orbitX(endA, 29), 1318], { easing: Easing.out(Easing.quad) });
    y = REST_Y - 30 * 4 * u * (1 - u) * (1 - u);
  } else {
    x = 1318;
    y = REST_Y;
  }

  // Roll trail: a fading line on the surface behind the ball.
  const trailW = frame >= HOP_END && frame < ROLL_END + 10
    ? interpolate(frame, [HOP_END, HOP_END + 20, ROLL_END + 10], [0, 220, 40], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // Flag: idle breath, lean during orbit, shiver on the eject.
  const flagLean =
    Math.sin(frame * 0.1) * 1.2 +
    interpolate(frame, [ROLL_END, ROLL_END + 12], [0, -3], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) +
    (frame > ORBIT_END
      ? Math.sin((frame - ORBIT_END) * 1.2) * 5 * Math.exp(-(frame - ORBIT_END) * 0.12)
      : 0);

  // One slow gold ripple from the cup after the lip-out.
  const rippleT = frame - (ORBIT_END + 2);

  return (
    <AbsoluteFill style={{ backgroundColor: DUSK.skyTop, overflow: "hidden" }}>
      <DuskSky horizonY={58} />
      <Dunes horizonY={52} drift={frame * 0.06} />

      {/* the green */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: SURFACE,
          bottom: 0,
          background: "linear-gradient(180deg, #17382e 0%, #0e2721 100%)",
        }}
      />
      {/* mow stripes */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: SURFACE + 36 + i * 52,
            height: 26,
            background: "rgba(255,255,255,0.025)",
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: SURFACE - 2,
          height: 3,
          background: "rgba(5,15,12,0.7)",
        }}
      />

      {/* cup */}
      <div
        style={{
          position: "absolute",
          left: CUP_X - 38,
          top: cupCY - 11,
          width: 76,
          height: 23,
          borderRadius: "50%",
          background: "#040c09",
          boxShadow: "inset 0 -5px 7px rgba(0,0,0,0.75), 0 1px 0 rgba(232,200,106,0.18)",
        }}
      />

      {/* lip-out ripple */}
      {rippleT > 0 && rippleT < 46 && (
        <div
          style={{
            position: "absolute",
            left: CUP_X - 38,
            top: cupCY - 11,
            width: 76,
            height: 23,
            borderRadius: "50%",
            border: "1.6px solid rgba(232,200,106,0.5)",
            scale: String(1 + rippleT * 0.045),
            opacity: interpolate(rippleT, [0, 8, 46], [0, 0.6, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
      )}

      {/* flagstick */}
      <div
        style={{
          position: "absolute",
          left: CUP_X - 3,
          top: cupCY - 232,
          width: 6,
          height: 232,
          borderRadius: 4,
          background: "linear-gradient(180deg, rgba(244,242,234,0.95), rgba(244,242,234,0.55))",
          transformOrigin: "50% 100%",
          rotate: `${flagLean}deg`,
        }}
      >
        <svg
          viewBox="0 0 64 34"
          width={82}
          height={44}
          style={{
            position: "absolute",
            left: 5,
            top: 2,
            transformOrigin: "0% 50%",
            scale: `${1 + Math.sin(frame * 0.22) * 0.05} 1`,
          }}
        >
          <path d={`M0 0 L58 ${9 + Math.sin(frame * 0.22) * 3.4} L0 30 Z`} fill={DUSK.gold} />
          <path d={`M0 0 L58 ${9 + Math.sin(frame * 0.22) * 3.4} L0 6 Z`} fill={DUSK.goldSoft} opacity="0.6" />
        </svg>
      </div>

      {/* roll trail */}
      {trailW > 0 && (
        <div
          style={{
            position: "absolute",
            left: x - trailW + 8,
            top: y + BALL - 6,
            width: trailW,
            height: 2,
            borderRadius: 2,
            background: "linear-gradient(90deg, rgba(232,200,106,0) 0%, rgba(232,200,106,0.3) 100%)",
          }}
        />
      )}

      {/* ball shadow */}
      <div
        style={{
          position: "absolute",
          left: x + 3,
          top: REST_Y + BALL - 4,
          width: 34,
          height: 9,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.45)",
          filter: "blur(2px)",
          scale: String(
            interpolate(REST_Y - y, [0, 240], [1, 0.5], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          ),
          opacity: interpolate(REST_Y - y, [0, 240], [0.7, 0.25], {
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
          scale: frame >= ROLL_END && frame < ORBIT_END ? "0.94" : "1",
        }}
      >
        <CineBall size={BALL} />
      </div>

      <Grain />
      <Vignette strength={0.52} />
    </AbsoluteFill>
  );
};
