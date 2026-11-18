import {
  AbsoluteFill,
  CanvasImage,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Grain, Vignette } from "./Cinematic";

/**
 * Hero film: a slow Ken Burns pass over three real Gamble Sands frames,
 * graded into the site's deep green. The film fades from and to the flat
 * hero green, so the loop seam is invisible. No text — the page supplies it.
 */

const SHOTS = [
  { src: "strand26-015.jpg", from: 1.08, to: 1.18, ox: "48%", oy: "42%" },
  { src: "strand26-067.jpg", from: 1.2, to: 1.08, ox: "55%", oy: "35%" },
  { src: "strand26-076.jpg", from: 1.1, to: 1.2, ox: "60%", oy: "55%" },
  { src: "strand26-063.jpg", from: 1.08, to: 1.16, ox: "50%", oy: "38%" },
];

const SHOT_LEN = 170;
const XFADE = 26;
export const HERO_DURATION = SHOTS.length * SHOT_LEN; // 680

const HERO_GREEN = "#10211c";

export const HeroFilm: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: HERO_GREEN, overflow: "hidden" }}>
      {SHOTS.map((shot, i) => {
        const start = i * SHOT_LEN;
        const end = start + SHOT_LEN;
        if (frame < start - XFADE || frame > end + XFADE) return null;
        const local = frame - start;
        const zoom = interpolate(local, [-XFADE, SHOT_LEN + XFADE], [shot.from, shot.to], {
          easing: Easing.inOut(Easing.sin),
        });
        const opacity = interpolate(
          frame,
          [start - XFADE, start, end - XFADE, end],
          [i === 0 ? 1 : 0, 1, 1, i === SHOTS.length - 1 ? 1 : 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        return (
          <AbsoluteFill key={shot.src} style={{ opacity }}>
            <CanvasImage
              src={staticFile(shot.src)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: `${shot.ox} ${shot.oy}`,
                scale: String(zoom),
                transformOrigin: `${shot.ox} ${shot.oy}`,
                filter: "saturate(0.78) contrast(1.06) brightness(0.8)",
              }}
            />
          </AbsoluteFill>
        );
      })}

      {/* deep-green grade */}
      <AbsoluteFill style={{ background: "rgba(16,39,33,0.34)", mixBlendMode: "multiply" }} />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(10,27,22,0.55) 0%, rgba(10,27,22,0.1) 40%, rgba(16,39,33,0.75) 100%)",
        }}
      />
      {/* a breath of warmth low in the frame */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(60% 50% at 30% 85%, rgba(201,162,39,0.1) 0%, rgba(201,162,39,0) 70%)",
        }}
      />

      <Grain opacity={0.05} />
      <Vignette strength={0.45} />

      {/* loop seam: ease from/to the flat hero green */}
      <AbsoluteFill
        style={{
          background: HERO_GREEN,
          opacity: interpolate(
            frame,
            [0, 24, HERO_DURATION - 24, HERO_DURATION - 1],
            [1, 0, 0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          ),
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
