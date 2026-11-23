import React from "react";
import { AbsoluteFill, Audio, CanvasImage, Sequence, Video, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain, Vignette } from "./Cinematic";
import { SERIF } from "./StrandFilm";
import timeline from "./tall-timeline.json";

/**
 * THE STRAND, upright: the film cut for a phone. Tall footage fills the frame, wide
 * photographs are stacked, and one grade sits over all of it.
 */
type Shot = { from: number; len: number; t: string; src?: string; srcs?: string[]; trim?: number; vol?: number; title?: string; sub?: string };
const SHOTS = timeline.shots as Shot[];
const VOICE = timeline.voice as Array<{ file: string; at: number; len: number }>;
const MUSIC = timeline.music as Array<{ file: string; from: number; to: number; offset: number; vol: number }>;
const HUSH = timeline.hush as number[][];
export const TALL_DURATION = timeline.total as number;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const WARM = "#efe9dc";

const Clip: React.FC<{ s: Shot }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Video src={staticFile(s.src ?? "")} trimBefore={s.trim ?? 0} volume={s.vol ?? 0} style={{ width: "100%", height: "100%", objectFit: "cover", scale: String(interpolate(frame, [0, durationInFrames], [1.0, 1.03])) }} />
    </AbsoluteFill>
  );
};

const Photo: React.FC<{ s: Shot }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
      <CanvasImage src={staticFile(s.src ?? "")} style={{ width: 1080, height: 1920, objectFit: "contain", scale: String(interpolate(frame, [0, durationInFrames], [1.0, 1.05])) }} />
    </AbsoluteFill>
  );
};

/** Wide photographs, one above the other, each the full width of the frame. */
const Stack: React.FC<{ s: Shot }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const srcs = s.srcs ?? [];
  const h = srcs.length === 3 ? 620 : 800;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", alignItems: "center", justifyContent: "center", gap: 14, flexDirection: "column" }}>
      {srcs.map((p, i) => (
        <div key={p} style={{ width: 1080, height: h, overflow: "hidden", opacity: interpolate(frame, [i * 5, i * 5 + 8], [0, 1], clamp) }}>
          <CanvasImage src={staticFile(p)} style={{ width: 1080, height: h, objectFit: "cover", scale: String(interpolate(frame, [0, durationInFrames], [1.0, 1.05])) }} />
        </div>
      ))}
    </AbsoluteFill>
  );
};

const Card: React.FC<{ s: Shot }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const edge = Math.max(1, Math.min(14, Math.floor(durationInFrames / 3)));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", alignItems: "center", justifyContent: "center", gap: 30, opacity: interpolate(frame, [0, edge, durationInFrames - edge, durationInFrames], [0, 1, 1, 0], clamp) }}>
      {s.title ? <div style={{ fontFamily: SERIF, fontSize: 84, letterSpacing: "0.18em", textTransform: "uppercase", color: WARM }}>{s.title}</div> : null}
      {s.sub ? <div style={{ fontFamily: SERIF, fontSize: 38, fontStyle: "italic", color: "#b9ad94" }}>{s.sub}</div> : null}
    </AbsoluteFill>
  );
};

const Logo: React.FC<{ s: Shot }> = ({ s }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#f6f1e4", alignItems: "center", justifyContent: "center", opacity: interpolate(frame, [0, 12], [0, 1], clamp) }}>
      <CanvasImage src={staticFile(s.src ?? "")} style={{ width: 760, height: 760, objectFit: "contain" }} />
    </AbsoluteFill>
  );
};

/** The score sits low under voices and real sound, and comes up between them. */
const musicVolume = (frame: number, seg: (typeof MUSIC)[number]) => {
  let duck = 1;
  for (const a of VOICE) duck = Math.min(duck, interpolate(frame, [a.at - 12, a.at, a.at + a.len, a.at + a.len + 18], [1, 0.5, 0.5, 1], clamp));
  for (const [a, b, level] of HUSH) duck = Math.min(duck, interpolate(frame, [a - 10, a, b, b + 16], [1, level, level, 1], clamp));
  const edge = interpolate(frame, [seg.from, seg.from + 20, seg.to - 36, seg.to], [0, 1, 1, 0], clamp);
  return seg.vol * duck * edge;
};

export const Tall: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {MUSIC.map((seg) => (
        <Sequence key={`${seg.file}-${seg.from}`} from={seg.from} durationInFrames={seg.to - seg.from} layout="none">
          <Audio src={staticFile(seg.file)} trimBefore={seg.offset} volume={musicVolume(frame, seg)} />
        </Sequence>
      ))}
      {VOICE.map((a) => (
        <Sequence key={`${a.file}-${a.at}`} from={a.at} durationInFrames={a.len + 8} layout="none">
          <Audio src={staticFile(a.file)} volume={1.5} />
        </Sequence>
      ))}
      <AbsoluteFill style={{ filter: "contrast(1.07) saturate(0.9) sepia(0.14) brightness(0.98)" }}>
        {SHOTS.map((s, i) => (
          <Sequence key={`${s.from}-${i}`} from={s.from} durationInFrames={s.len}>
            {s.t === "v" ? <Clip s={s} /> : s.t === "p" ? <Photo s={s} /> : s.t === "stack" ? <Stack s={s} /> : s.t === "logo" ? <Logo s={s} /> : <Card s={s} />}
          </Sequence>
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "rgba(255,226,190,0.05)", mixBlendMode: "multiply", pointerEvents: "none" }} />
      <Grain opacity={0.075} />
      <Vignette strength={0.38} />
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: interpolate(frame, [0, 18], [1, 0], clamp) }} />
    </AbsoluteFill>
  );
};
