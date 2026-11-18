import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { Ball } from "./Ball";
import { COLORS } from "./palette";

const IMPACT = 38;

type Chunk = {
  vx: number;
  vy: number;
  spin: number;
  color: string;
  w: number;
  h: number;
};

const TURF_CHUNKS: Chunk[] = [
  { vx: -3.2, vy: -5.4, spin: -9, color: COLORS.turf, w: 26, h: 8 },
  { vx: -1.5, vy: -7.2, spin: 7, color: COLORS.deepGreen, w: 18, h: 7 },
  { vx: 0.7, vy: -8.0, spin: -12, color: COLORS.turfBright, w: 24, h: 8 },
  { vx: 2.3, vy: -6.4, spin: 11, color: COLORS.turf, w: 15, h: 6 },
  { vx: 3.9, vy: -4.3, spin: -6, color: COLORS.dirt, w: 21, h: 8 },
  { vx: -4.3, vy: -3.1, spin: 5, color: COLORS.dirt, w: 15, h: 6 },
  { vx: 1.4, vy: -5.2, spin: 14, color: COLORS.turfBright, w: 12, h: 5 },
];

/** Parabolic position for a launched fragment, in slo-mo time. */
const fling = (t: number, v: number, gravity = 0) => v * t + 0.5 * gravity * t * t;

const TEE_X = 500;
const GROUND_Y = 530;

export const TeeStrike: React.FC = () => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - IMPACT); // slo-mo clock, starts at impact

  // Ball flight: shallow rising line with slight arc, slow (it's slo-mo).
  const ballX = TEE_X - 14 + fling(t, 11.5);
  const ballY = GROUND_Y - 92 - fling(t, 3.4, -0.012);
  const launched = frame >= IMPACT;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.cream, overflow: "hidden" }}>
      {/* subtle camera push-in */}
      <AbsoluteFill
        style={{
          scale: String(
            interpolate(frame, [0, 150], [1, 1.07], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.3, 0, 0.7, 1),
            }),
          ),
          transformOrigin: "30% 72%",
        }}
      >
        {/* ground */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 110,
            background: COLORS.turf,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 106,
            height: 6,
            background: "rgba(26,60,52,0.35)",
          }}
        />
        {/* blades of rough near the tee */}
        {[-120, -74, 66, 128, 196].map((dx, i) => (
          <div
            key={dx}
            style={{
              position: "absolute",
              left: TEE_X + dx,
              bottom: 104,
              width: 5,
              height: 26 + (i % 3) * 8,
              borderRadius: 4,
              background: COLORS.deepGreen,
              opacity: 0.5,
              rotate: `${(i % 2 === 0 ? -1 : 1) * (6 + i * 2)}deg`,
            }}
          />
        ))}

        {/* tee */}
        <div
          style={{
            position: "absolute",
            left: TEE_X - 8,
            bottom: 104,
            width: 16,
            height: 54,
            borderRadius: "0 0 8px 8px",
            background: COLORS.gold,
          }}
        />

        {/* motion trail ghosts behind the launched ball */}
        {launched &&
          [10, 20, 30].map((lag, i) => {
            const lt = Math.max(0, t - lag);
            return (
              <div
                key={lag}
                style={{
                  position: "absolute",
                  left: TEE_X - 14 + fling(lt, 11.5),
                  top: GROUND_Y - 92 - fling(lt, 3.4, -0.012),
                  opacity: t > lag ? 0.22 - i * 0.06 : 0,
                }}
              >
                <Ball size={56} />
              </div>
            );
          })}

        {/* the ball */}
        <div style={{ position: "absolute", left: ballX, top: ballY }}>
          <Ball size={56} rotate={launched ? t * 26 : 0} />
        </div>

        {/* speed lines chasing the ball */}
        {launched &&
          [0, 26, 52].map((dy, i) => (
            <div
              key={dy}
              style={{
                position: "absolute",
                left: ballX - 150 - i * 40,
                top: ballY + 6 + dy * 0.5,
                width: interpolate(t, [4 + i * 3, 26 + i * 3], [0, 170], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.out(Easing.quad),
                }),
                height: 4,
                borderRadius: 4,
                background: "rgba(26,60,52,0.28)",
                opacity: interpolate(t, [4, 30, 90], [0, 1, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            />
          ))}

        {/* turf chunks exploding off the tee in slo-mo */}
        {launched &&
          TURF_CHUNKS.map((c, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: TEE_X + fling(t, c.vx, 0.028) * 2.4,
                top: GROUND_Y - 44 + fling(t, c.vy, 0.062) * 2.4,
                width: c.w,
                height: c.h,
                borderRadius: 3,
                background: c.color,
                rotate: `${t * c.spin * 0.45}deg`,
                opacity: interpolate(t, [0, 80, 112], [1, 1, 0], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            />
          ))}

        {/* impact ring + flash */}
        <div
          style={{
            position: "absolute",
            left: TEE_X - 60,
            top: GROUND_Y - 120,
            width: 120,
            height: 120,
            borderRadius: "50%",
            border: `5px solid ${COLORS.gold}`,
            scale: String(
              interpolate(frame, [IMPACT, IMPACT + 42], [0.2, 3.4], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.cubic),
              }),
            ),
            opacity: interpolate(frame, [IMPACT, IMPACT + 3, IMPACT + 42], [0, 0.95, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />

        {/* club: shaft from top, swings through, then slow follow-through */}
        <div
          style={{
            position: "absolute",
            left: TEE_X - 6,
            top: GROUND_Y - 92 - 330,
            width: 12,
            height: 360,
            transformOrigin: "50% 0%",
            rotate: `${interpolate(
              frame,
              [6, IMPACT, IMPACT + 70],
              [112, 0, -38],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.7, 0, 0.55, 1),
              },
            )}deg`,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 6,
              background: "rgba(17,17,17,0.85)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -34,
              bottom: -20,
              width: 62,
              height: 38,
              borderRadius: "20px 28px 24px 8px",
              background: COLORS.deepGreen,
            }}
          />
        </div>
      </AbsoluteFill>

      {/* impact flash over everything */}
      <AbsoluteFill
        style={{
          background: "#ffffff",
          opacity: interpolate(frame, [IMPACT, IMPACT + 2, IMPACT + 8], [0, 0.55, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
