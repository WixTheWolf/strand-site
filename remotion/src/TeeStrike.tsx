import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { CineBall, DUSK, Dunes, DuskSky, Grain, Tracer, Vignette } from "./Cinematic";

const IMPACT = 48;
const W = 1920;
const H = 640;
const TEE_X = 430;
const TEE_Y = 452;

// Quadratic bezier for the ball flight / tracer.
const P0 = [TEE_X + 2, TEE_Y - 2] as const;
const P1 = [1150, 120] as const;
const P2 = [1890, 96] as const;
const bez = (t: number): [number, number] => [
  (1 - t) * (1 - t) * P0[0] + 2 * (1 - t) * t * P1[0] + t * t * P2[0],
  (1 - t) * (1 - t) * P0[1] + 2 * (1 - t) * t * P1[1] + t * t * P2[1],
];
const PATH_POINTS = Array.from({ length: 48 }, (_, i) => bez(i / 47));

const MOTES = [
  { dx: -26, vy: -0.8, vx: -0.22, r: 4, o: 0.3 },
  { dx: -8, vy: -1.1, vx: 0.1, r: 3, o: 0.4 },
  { dx: 10, vy: -0.9, vx: 0.3, r: 5, o: 0.25 },
  { dx: 26, vy: -0.6, vx: 0.5, r: 3, o: 0.35 },
  { dx: -40, vy: -0.5, vx: -0.4, r: 3, o: 0.2 },
  { dx: 42, vy: -1.0, vx: 0.7, r: 4, o: 0.28 },
];

export const TeeStrike: React.FC = () => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - IMPACT);

  // Slo-mo flight progress along the bezier.
  const flight = interpolate(frame, [IMPACT, 150], [0, 0.96], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const [bx, by] = bez(flight);
  const launched = frame >= IMPACT;

  // Club silhouette sweep: slow address, fast strike, slow follow-through.
  const clubAngle = interpolate(
    frame,
    [0, 10, 34, IMPACT, IMPACT + 56],
    [4, 4, 56, 0, -42],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.65, 0, 0.35, 1) },
  );
  const sweeping = frame > IMPACT - 8 && frame < IMPACT + 14;

  // Impact bloom + decaying shake.
  const bloom = interpolate(frame, [IMPACT, IMPACT + 3, IMPACT + 26], [0, 0.5, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shake = frame >= IMPACT ? Math.sin(t * 2.1) * 3 * Math.exp(-t * 0.22) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: DUSK.skyTop, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          translate: `${shake}px ${-shake * 0.6}px`,
          scale: String(
            interpolate(frame, [0, 150], [1.0, 1.045], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          ),
          transformOrigin: "26% 70%",
        }}
      >
        <DuskSky horizonY={72} />
        <Dunes horizonY={68} drift={frame * 0.08} />

        {/* near turf ridge, in silhouette */}
        <svg
          viewBox="0 0 1920 160"
          preserveAspectRatio="none"
          style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: 160 }}
        >
          <path d="M0 70 C 300 40, 560 86, 900 64 C 1280 40, 1560 84, 1920 58 L 1920 160 L 0 160 Z" fill="#06120e" />
        </svg>
        {/* a few blades near the tee */}
        {[-70, -38, 48, 86].map((dx, i) => (
          <div
            key={dx}
            style={{
              position: "absolute",
              left: TEE_X + dx,
              top: TEE_Y + 26 - (14 + (i % 2) * 8),
              width: 3,
              height: 14 + (i % 2) * 8,
              borderRadius: 3,
              background: "#0c201a",
              rotate: `${(i % 2 === 0 ? -1 : 1) * (8 + i * 3)}deg`,
            }}
          />
        ))}

        {/* tee silhouette */}
        <div
          style={{
            position: "absolute",
            left: TEE_X - 5,
            top: TEE_Y + 16,
            width: 10,
            height: 30,
            borderRadius: "0 0 5px 5px",
            background: "#0a1a15",
            boxShadow: "1px 0 0 rgba(232,200,106,0.25)",
          }}
        />

        {/* tracer + ball */}
        {launched && (
          <Tracer points={[...PATH_POINTS]} progress={flight} width={W} height={H} />
        )}
        <div
          style={{
            position: "absolute",
            left: (launched ? bx : P0[0]) - 20,
            top: (launched ? by : P0[1]) - 20,
          }}
        >
          <CineBall size={40} />
        </div>

        {/* club: shaft + blade in silhouette, ghosted during the sweep */}
        {[0, 13, 26].map((lag, i) => (
          <div
            key={lag}
            style={{
              position: "absolute",
              left: TEE_X - 5,
              top: TEE_Y - 342,
              width: 10,
              height: 352,
              transformOrigin: "50% 0%",
              rotate: `${clubAngle + (sweeping ? lag : 0)}deg`,
              opacity: i === 0 ? 1 : sweeping ? 0.3 - i * 0.1 : 0,
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: 5,
                background: "#050f0c",
                boxShadow: i === 0 ? "1.5px 0 0 rgba(232,200,106,0.3)" : "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: -30,
                bottom: -16,
                width: 56,
                height: 32,
                borderRadius: "18px 24px 20px 6px",
                background: "#050f0c",
                boxShadow: i === 0 ? "0 1.5px 0 rgba(232,200,106,0.3)" : "none",
              }}
            />
          </div>
        ))}

        {/* dust motes lifting off the strike */}
        {launched &&
          MOTES.map((m, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: TEE_X + m.dx + m.vx * t * 2,
                top: TEE_Y + 8 + m.vy * t * 1.6,
                width: m.r,
                height: m.r,
                borderRadius: "50%",
                background: DUSK.goldSoft,
                opacity:
                  m.o *
                  interpolate(t, [0, 14, 80], [0, 1, 0], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
              }}
            />
          ))}

        {/* impact bloom */}
        <div
          style={{
            position: "absolute",
            left: TEE_X - 160,
            top: TEE_Y - 160,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(255,250,235,${bloom}) 0%, rgba(232,200,106,${bloom * 0.5}) 30%, rgba(232,200,106,0) 70%)`,
            pointerEvents: "none",
          }}
        />
      </AbsoluteFill>

      <Grain />
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};
