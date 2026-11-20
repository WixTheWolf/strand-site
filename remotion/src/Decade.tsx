import { Audio } from "@remotion/media";
import { AbsoluteFill, CanvasImage, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain, Vignette } from "./Cinematic";
import { BONE, FONT, GOLD_SOFT, INK, clamp } from "./Kinetic";
import {
  Caps,
  FIELD,
  Finale,
  FootageScene,
  HitFlash,
  LETTERBOX,
  Ledger,
  Rise,
  SERIF,
  Stamp,
  Stamped,
  Tag,
  WordSlam,
  ease,
} from "./StrandFilm";
import portraits from "./decade-portraits.json";
import timeline from "./decade-timeline.json";

/**
 * NINE YEARS — a hype reel for the tenth Strand. One chapter per edition:
 * a year slam, a strobe of real photos with deadpan tags, and the result.
 * Frame positions come from decade-timeline.json, which is laid out on the bars of the score.
 */

export const DECADE_DURATION = timeline.total;
const FINAL_HIT = timeline.finalHit;
const VO_GAIN = 1.6;
/** Narration lines, when a recording exists; this cut carries its script on screen. */
const VO = timeline.vo as Array<{ file: string; at: number; len: number }>;

type Shot = { src: string; oy?: string; tag?: string; weight?: number; cover?: boolean };
type Slam = { text: string; at: number; hold?: number };
type Line = { text: string; at: number; hold: number };
type Chapter = { shots: Shot[]; lines?: Line[]; slams?: Slam[]; result: string[]; resultBg: string };

const d = (name: string) => `d/${name}.jpg`;

const CONTENT: Record<string, Chapter> = {
  "18": {
    shots: [
      { src: d("early-034") },
      { src: d("early-031"), tag: "Hydration plan", weight: 2 },
      { src: d("early-042") },
      { src: d("early-043") },
      { src: d("early-044") },
      { src: d("early-047") },
      { src: d("early-036") },
      { src: d("early-033") },
      { src: d("early-050") },
      { src: d("early-046"), oy: "30%", tag: "The original scoreboard", weight: 3 },
    ],
    lines: [
      { text: "It began as one weekend.", at: 46, hold: 80 },
      { text: "Nick made a hole-in-one. They took the ball.", at: 136, hold: 96 },
      { text: "A champion named himself Chairman.", at: 240, hold: 90 },
    ],
    result: ["Drew / Kev", "49 pts", "Justin / Rhett finished last. It is noted."],
    resultBg: d("early-034"),
  },
  "19": {
    shots: [
      { src: d("early-009") },
      { src: d("early-001"), oy: "30%", tag: "Morale: early", weight: 2 },
      { src: d("early-004"), oy: "86%", tag: "Official sponsors", weight: 2, cover: true },
      { src: d("early-010") },
      { src: d("early-011"), oy: "30%" },
      { src: d("early-072"), oy: "30%" },
      { src: d("early-012"), oy: "55%", tag: "A cart entered a bunker", weight: 4 },
    ],
    lines: [
      { text: "Rhett said he could not break 100.", at: 46, hold: 86 },
      { text: "The Commissioner marked him down as a 12.", at: 140, hold: 90 },
      { text: "He won low net. Both days.", at: 238, hold: 80 },
    ],
    result: ["Putt Pirates", "Champions", "Rhett: low net, twice. The inquiry remains open."],
    resultBg: d("early-009"),
  },
  "20": {
    shots: [],
    result: ["Team Twitter Smut", "Decisively", "“A truly lopsided victory.” — The Commissioner"], resultBg: "",
  },
  "21": {
    shots: [
      { src: d("early-067") },
      { src: d("early-015"), oy: "30%" },
      { src: d("early-014"), oy: "40%", tag: "Supplies", weight: 2 },
      { src: d("early-017") },
      { src: d("early-022"), oy: "40%" },
      { src: d("early-069"), oy: "30%", tag: "Did not make dinner", weight: 3 },
      { src: d("early-018"), oy: "40%" },
      { src: d("early-019"), oy: "40%", tag: "Also did not make dinner", weight: 3 },
      { src: d("early-020"), oy: "40%" },
      { src: d("early-023") },
    ],
    lines: [
      { text: "They returned to the desert.", at: 46, hold: 76 },
      { text: "Rhett was reassigned: individual contributor.", at: 130, hold: 96 },
      { text: "Lowell did not return a single call.", at: 234, hold: 90 },
    ],
    result: ["Brooks Is a Bully", "def.", "Rory’s a Crier"],
    resultBg: d("early-068"),
  },
  "22": {
    shots: [
      { src: d("early-029") },
      { src: d("early-051"), oy: "30%" },
      { src: d("early-054") },
      { src: d("early-062") },
      { src: d("early-066"), oy: "40%" },
      { src: d("early-056") },
      { src: d("early-055"), oy: "50%", tag: "The Commissioner’s toe. Thanks for asking.", weight: 4 },
      { src: d("early-057") },
      { src: d("early-059"), oy: "40%" },
      { src: d("early-052") },
    ],
    lines: [
      { text: "The Commissioner scheduled it on Mother’s Day.", at: 46, hold: 96 },
      { text: "It was moved. Quickly.", at: 150, hold: 70 },
      { text: "Three weddings. Several babies. One toe.", at: 262, hold: 96 },
    ],
    result: ["Team Fred", "a.k.a. The Saudis", "Mini Strand champions"],
    resultBg: d("early-029"),
  },
  "23": {
    shots: [
      { src: d("2023-001") },
      { src: d("2023-096") },
      { src: d("2023-117"), oy: "35%", tag: "Recovery position", weight: 3 },
      { src: d("2023-154") },
      { src: d("2023-202"), oy: "55%", tag: "Thinking about his round", weight: 3 },
      { src: d("2023-142") },
    ],
    lines: [{ text: "Fifteen men. One van. 81 holes in three days.", at: 44, hold: 106 }],
    slams: [{ text: "Carrot Top.", at: 216, hold: 30 }],
    result: ["PBs 30", "Striping Greens 18", "The most expensive Strand ever: $699.54 each"],
    resultBg: d("2023-186"),
  },
  "24": {
    shots: [
      { src: d("2024-001") },
      { src: d("2024-031") },
      { src: d("2024-047"), oy: "45%", tag: "The acoustic set", weight: 3 },
      { src: d("2024-064") },
      { src: d("2024-083"), oy: "30%", tag: "Tastes like victory", weight: 3 },
      { src: d("2024-073") },
    ],
    lines: [{ text: "The closest Strand ever played.", at: 44, hold: 106 }],
    slams: [{ text: "25 – 23", at: 216, hold: 30 }],
    result: ["Team D’Arce 25", "Team Nick 23", "Decided by two points"],
    resultBg: d("2024-071"),
  },
  "25": {
    shots: [
      { src: d("2025-054") },
      { src: d("2025-024") },
      { src: d("2025-010"), oy: "30%", tag: "The losing team", weight: 3 },
      { src: d("2025-071") },
      { src: d("2025-091"), oy: "55%", tag: "Post-round analysis", weight: 3 },
      { src: d("2025-105") },
    ],
    lines: [{ text: "Five courses. Four days. One peninsula.", at: 44, hold: 106 }],
    result: ["Team Taliban 33.5", "Team GilGords 26.5", "Five courses on the Monterey Peninsula"],
    resultBg: d("2025-054"),
  },
  "26": {
    shots: [
      { src: "p/017.jpg" },
      { src: "p/042.jpg" },
      { src: "p/072.jpg" },
      { src: "strand26-063.jpg" },
      { src: "p/081.jpg" },
      { src: "p/095.jpg" },
    ],
    lines: [{ text: "North. Further than they had ever gone.", at: 44, hold: 100 }],
    result: ["Team J-Bone", "def. Team WIX", "Gamble Sands · the first Strand in the Pacific Northwest"],
    resultBg: "p/096.jpg",
  },
};

const PORTRAITS = new Set<string>(portraits);

type Clip = { src: string; len: number; trim?: number; tag?: string; volume?: number };
const v = (name: string) => `dvid/${name}.mp4`;

/** Moving pictures, where any survive. 2019, 2020 and 2022 left none. */
const CLIPS: Record<string, Clip[]> = {
  "18": [{ src: v("early-037"), len: 90, tag: "The only surviving footage" }],
  "21": [{ src: v("early-021"), len: 90, tag: "The living room" }],
  "23": [
    { src: v("2023-214"), len: 60 },
    { src: v("2023-032"), len: 60 },
    { src: v("2023-079"), len: 60, tag: "He liked it" },
    { src: v("2023-063"), len: 45 },
    { src: v("2023-203"), len: 60, tag: "Halftime entertainment" },
    { src: v("2023-024"), len: 45 },
    { src: v("2023-203b"), len: 30 },
    { src: v("2023-058"), len: 30 },
  ],
  "24": [
    { src: v("2024-022"), len: 60 },
    { src: v("2024-012"), len: 45, tag: "From the rocks" },
    { src: v("2024-024"), len: 60 },
    { src: v("2024-004"), len: 45 },
    { src: v("2024-002"), len: 45 },
    { src: v("2024-051a"), len: 45 },
    { src: v("2024-051b"), len: 90, tag: "Actual audio", volume: 1 },
  ],
  "25": [
    { src: v("2025-116"), len: 60 },
    { src: v("2025-039"), len: 60 },
    { src: v("2025-041"), len: 45 },
    { src: v("2025-094"), len: 60, tag: "Bunker practice" },
    { src: v("2025-052"), len: 60 },
    { src: v("2025-043"), len: 45 },
    { src: v("2025-047"), len: 60, tag: "Clubhouse leaders" },
  ],
  "26": [
    { src: "r-bridge.mp4", len: 30 },
    { src: "r-maroon.mp4", len: 60 },
    { src: "r-swing09.mp4", len: 51 },
    { src: "r-tee75.mp4", len: 54 },
    { src: "real-swing-b.mp4", len: 60, trim: 24 },
    { src: "r-selfie2.mp4", len: 30 },
    { src: "r-walk.mp4", len: 54 },
    { src: "r-laugh.mp4", len: 39, tag: "Morale: still high" },
    { src: "r-selfie1.mp4", len: 18 },
  ],
};

/** Frames where a clip plays with its own sound, so the score steps back. */
const HUSHES: Array<[number, number]> = [];
for (const ch of timeline.chapters) {
  let at = ch.from + ch.vfrom;
  for (const clip of CLIPS[ch.key] ?? []) {
    if (clip.volume) HUSHES.push([at, at + clip.len]);
    at += clip.len;
  }
}

export const Photo: React.FC<{ shot: Shot; index: number }> = ({ shot, index }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const portrait = PORTRAITS.has(shot.src) && !shot.cover;
  const punch = interpolate(frame, [0, durationInFrames], [1.14, 1.03], { ...clamp, easing: ease });
  const tilt = (index % 2 === 0 ? -1 : 1) * interpolate(frame, [0, 8], [1.4, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: INK, overflow: "hidden" }}>
      <CanvasImage
        src={staticFile(shot.src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `50% ${shot.oy ?? "38%"}`,
          scale: String(portrait ? 1.2 : punch),
          rotate: portrait ? "0deg" : `${tilt}deg`,
          filter: portrait ? "blur(30px) brightness(0.45) saturate(0.9)" : "contrast(1.07) saturate(1.06)",
        }}
      />
      {portrait ? (
        // Tall phone shots sit whole in the middle of the frame, over their own blur.
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <CanvasImage
            src={staticFile(shot.src)}
            style={{
              height: 1080 - 2 * LETTERBOX - 24,
              width: "auto",
              borderRadius: 6,
              boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
              border: "6px solid #f4f2ea",
              scale: String(punch - 0.03),
              rotate: `${tilt * 1.6}deg`,
            }}
          />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ backgroundColor: "#fff6df", opacity: interpolate(frame, [0, 2], [0.5, 0], clamp) }} />
      {shot.tag ? <Tag delay={1}>{shot.tag}</Tag> : null}
    </AbsoluteFill>
  );
};

/** Split the available frames between shots by weight; returns [from, length] pairs. */
const layout = (shots: Shot[], from: number, to: number) => {
  const total = shots.reduce((a, s) => a + (s.weight ?? 1), 0);
  let cursor = from;
  return shots.map((s, i) => {
    const end = i === shots.length - 1 ? to : Math.round(cursor + ((to - from) * (s.weight ?? 1)) / total);
    const slot: [number, number] = [cursor, Math.max(3, end - cursor)];
    cursor = end;
    return slot;
  });
};

const YearCard: React.FC<{ year: number; place: string; num: string; bg?: string }> = ({ year, place, num, bg }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
      {bg ? (
        <CanvasImage
          src={staticFile(bg)}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.3) saturate(0.6) blur(2px)",
            scale: String(interpolate(frame, [0, 40], [1.2, 1.08])),
          }}
        />
      ) : null}
      <div style={{ position: "relative", textAlign: "center" }}>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 430,
            fontWeight: 900,
            fontStyle: "italic",
            lineHeight: 0.9,
            color: GOLD_SOFT,
            textShadow: "0 12px 80px rgba(0,0,0,0.8)",
            scale: String(interpolate(frame, [0, 7], [2.1, 1], { ...clamp, easing: ease })),
            opacity: interpolate(frame, [0, 2], [0, 1], clamp),
          }}
        >
          {year}
        </div>
        <div style={{ height: 6 }} />
        <Rise delay={8}>
          <Caps size={34} color={BONE} tracking="0.4em">
            {`Strand ${num} · ${place}`}
          </Caps>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

const ResultCard: React.FC<{ lines: string[]; bg: string }> = ({ lines, bg }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      {bg ? (
        <CanvasImage
          src={staticFile(bg)}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "50% 40%",
            filter: "brightness(0.34) saturate(0.7)",
            scale: String(interpolate(frame, [0, 60], [1.04, 1.1])),
          }}
        />
      ) : null}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 10 }}>
        <Rise delay={0} distance={18}>
          <Caps size={24} color={GOLD_SOFT}>
            Final
          </Caps>
        </Rise>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 132,
            fontWeight: 900,
            color: BONE,
            lineHeight: 1.05,
            whiteSpace: "nowrap",
            scale: String(interpolate(frame, [2, 9], [1.35, 1], { ...clamp, easing: ease })),
            opacity: interpolate(frame, [2, 5], [0, 1], clamp),
          }}
        >
          {lines[0]}
        </div>
        <Rise delay={8} distance={18}>
          <div style={{ fontFamily: SERIF, fontSize: 84, fontWeight: 700, fontStyle: "italic", color: GOLD_SOFT, whiteSpace: "nowrap" }}>
            {lines[1]}
          </div>
        </Rise>
        <div style={{ height: 8 }} />
        <Rise delay={14} distance={14}>
          <Caps size={24} tracking="0.26em">
            {lines[2]}
          </Caps>
        </Rise>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 2020: nobody took a single photo, so the chapter is paperwork. */
const NoEvidence: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#050a08" }}>
      <AbsoluteFill
        style={{ background: "radial-gradient(60% 55% at 50% 50%, rgba(201,162,39,0.14) 0%, rgba(7,19,15,0) 75%)" }}
      />
      <div style={{ position: "absolute", left: 130, top: LETTERBOX + 60, display: "flex", flexDirection: "column", gap: 20 }}>
        <Stamp delay={4}>Memo · Strand Corporate · March 2020</Stamp>
        <Stamp delay={34}>“All staff on leave until further notice.” — Drew, Head of HR</Stamp>
        <Stamp delay={84}>Rescheduled: October 1–4</Stamp>
        <Stamp delay={112}>Forecast: 116°F</Stamp>
      </div>
      <div style={{ position: "absolute", right: 200, top: LETTERBOX + 150 }}>
        <Sequence from={20} layout="none">
          <Stamped>Postponed</Stamped>
        </Sequence>
      </div>
      <div
        style={{
          position: "absolute",
          right: 150,
          bottom: LETTERBOX + 60,
          textAlign: "right",
          opacity: interpolate(frame, [110, 118], [0, 1], clamp),
        }}
      >
        <div style={{ fontFamily: SERIF, fontSize: 300, fontWeight: 900, fontStyle: "italic", color: "#e0623a", lineHeight: 0.9 }}>
          {Math.round(interpolate(frame, [110, 150], [72, 116], clamp))}°
        </div>
        <Caps size={26} color={BONE}>
          In the shade
        </Caps>
      </div>
    </AbsoluteFill>
  );
};

const EvidenceMissing: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000", alignItems: "center", justifyContent: "center", gap: 26 }}>
    <div
      style={{
        width: 620,
        height: 400,
        border: "3px dashed rgba(244,242,234,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Caps size={30} color="rgba(244,242,234,0.5)">
        Photo not found
      </Caps>
    </div>
    <Stamp delay={6}>Exhibits recovered from 2020: 0</Stamp>
  </AbsoluteFill>
);

const INTRO = [d("early-034"), d("early-009"), d("early-067"), d("early-029"), d("2023-159"), d("2024-001"), d("2025-054"), "p/096.jpg"];

const scoreVolume = (frame: number) => {
  let duck = 0;
  for (const line of VO) {
    duck = Math.max(
      duck,
      interpolate(frame, [line.at - 6, line.at, line.at + line.len, line.at + line.len + 8], [0, 1, 1, 0], clamp),
    );
  }
  for (const [a, b] of HUSHES) {
    duck = Math.max(duck, interpolate(frame, [a - 4, a, b - 2, b + 6], [0, 1.38, 1.38, 0], clamp));
  }
  const fadeOut = interpolate(frame, [DECADE_DURATION - 70, DECADE_DURATION - 8], [1, 0], clamp);
  return 0.95 * (1 - duck * 0.68) * fadeOut;
};

/** A line of the script, set like a title card over the picture. */
const ScriptLine: React.FC<{ children: string; size?: number; center?: boolean }> = ({ children, size = 62, center }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {center ? null : (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: LETTERBOX,
            height: 230,
            background: "linear-gradient(180deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0) 100%)",
            opacity: interpolate(frame, [0, 6, durationInFrames - 6, durationInFrames], [0, 1, 1, 0], clamp),
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          top: center ? 0 : LETTERBOX + 44,
          bottom: center ? 0 : undefined,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontFamily: SERIF,
          fontSize: size,
          fontWeight: 700,
          fontStyle: "italic",
          color: BONE,
          letterSpacing: "0.01em",
          textShadow: "0 4px 30px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.9)",
          opacity: interpolate(frame, [0, 8, durationInFrames - 8, durationInFrames], [0, 1, 1, 0], clamp),
          translate: `0px ${interpolate(frame, [0, 14], [14, 0], { ...clamp, easing: ease })}px`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/** A slow, dark push on one picture: the opening, before the cutting starts. */
export const SlowPlate: React.FC<{ src: string; oy?: string; bright?: number }> = ({ src, oy = "40%", bright = 0.5 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <CanvasImage
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `50% ${oy}`,
          filter: `brightness(${bright}) saturate(${bright > 0.6 ? 0.95 : 0.75}) contrast(1.08)`,
          scale: String(interpolate(frame, [0, durationInFrames], [1.04, 1.16])),
          opacity: interpolate(frame, [0, Math.min(24, durationInFrames / 3), durationInFrames - Math.min(14, durationInFrames / 3), durationInFrames], [0, 1, 1, 0], clamp),
        }}
      />
    </AbsoluteFill>
  );
};

const FACE_HOLD_DEFAULT = 12;

/** Every man in the field, one at a time, then all together. */
export const FaceRoll: React.FC<{ hold?: number }> = ({ hold: FACE_HOLD_IN }) => {
  const frame = useCurrentFrame();
  const FACE_HOLD = FACE_HOLD_IN ?? FACE_HOLD_DEFAULT;
  const i = Math.min(FIELD.length - 1, Math.floor(frame / FACE_HOLD));
  const local = frame - i * FACE_HOLD;
  const solo = frame < FIELD.length * FACE_HOLD;
  const [name, file] = FIELD[i];
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      {solo ? (
        <>
          <CanvasImage
            key={`bg-${file}`}
            src={staticFile(`players/${file}`)}
            style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", filter: "blur(36px) brightness(0.4) saturate(0.8)", scale: "1.2" }}
          />
          <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 70 }}>
            <CanvasImage
              key={file}
              src={staticFile(`players/${file}`)}
              style={{
                height: 1080 - 2 * LETTERBOX - 60,
                width: 560,
                objectFit: "cover",
                objectPosition: "50% 22%",
                border: "6px solid #f4f2ea",
                boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
                scale: String(interpolate(local, [0, 5], [1.12, 1], { ...clamp, easing: ease })),
                rotate: `${(i % 2 === 0 ? -1 : 1) * interpolate(local, [0, 5], [2.2, 0.6], clamp)}deg`,
              }}
            />
            <div style={{ width: 760 }}>
              <Caps size={24} color={GOLD_SOFT} tracking="0.4em">
                {`The field · ${String(i + 1).padStart(2, "0")} of ${FIELD.length}`}
              </Caps>
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: Math.min(170, Math.round(1500 / name.length)),
                  fontWeight: 900,
                  fontStyle: "italic",
                  color: BONE,
                  lineHeight: 1.05,
                  whiteSpace: "nowrap",
                  translate: `${interpolate(local, [0, 5], [40, 0], { ...clamp, easing: ease })}px 0px`,
                }}
              >
                {name}
              </div>
            </div>
          </AbsoluteFill>
          <AbsoluteFill style={{ backgroundColor: "#fff6df", opacity: interpolate(local, [0, 2], [0.45, 0], clamp) }} />
        </>
      ) : (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 26 }}>
          <Caps size={28} color={GOLD_SOFT} tracking="0.5em">
            Twenty men · Nine years
          </Caps>
          <div style={{ display: "flex", flexWrap: "wrap", width: 1500, justifyContent: "center", gap: 12 }}>
            {FIELD.map(([n, f]) => (
              <CanvasImage
                key={f}
                src={staticFile(`players/${f}`)}
                style={{ width: 136, height: 170, objectFit: "cover", objectPosition: "50% 22%", border: "3px solid #f4f2ea" }}
              />
            ))}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

export const Decade: React.FC = () => {
  const frame = useCurrentFrame();
  const chapters = timeline.chapters;
  const shutters: number[] = [];
  const pictures = chapters.map((ch) => {
    const content = CONTENT[ch.key];
    const slots = layout(content.shots, ch.from + 40, ch.from + ch.vfrom);
    slots.forEach((s) => shutters.push(s[0]));
    return { ch, content, slots };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* ---------- sound ---------- */}
      <Audio src={staticFile("score-epic.mp3")} volume={scoreVolume(frame)} />
      {VO.map((line) => (
        <Sequence key={line.file} name={`Narration ${line.file}`} from={line.at} durationInFrames={line.len + 6} layout="none">
          <Audio src={staticFile(`${line.file}.mp3`)} volume={VO_GAIN} />
        </Sequence>
      ))}
      {chapters.map((ch) => (
        <Sequence key={ch.key} name={`Boom ${ch.year}`} from={ch.from} durationInFrames={90} layout="none">
          <Audio src={staticFile("sfx-boom.mp3")} volume={0.42} />
        </Sequence>
      ))}
      {chapters.map((ch) => (
        <Sequence key={ch.key} name={`Whoosh ${ch.year}`} from={ch.from + 33} durationInFrames={25} layout="none">
          <Audio src={staticFile("whoosh.mp3")} volume={0.3} />
        </Sequence>
      ))}
      {chapters
        .filter((ch) => ch.vlen > 0)
        .map((ch) => (
          <Sequence key={ch.key} name={`Whoosh — tape ${ch.year}`} from={ch.from + ch.vfrom - 7} durationInFrames={25} layout="none">
            <Audio src={staticFile("whoosh.mp3")} volume={0.32} />
          </Sequence>
        ))}
      {shutters.map((at) => (
        <Sequence key={at} name={`Shutter ${at}`} from={at} durationInFrames={14} layout="none">
          <Audio src={staticFile("shutter.mp3")} volume={0.16} />
        </Sequence>
      ))}
      {FIELD.map(([name], i) => (
        <Sequence key={name} name={`Tick — ${name}`} from={timeline.roll[0] + i * FACE_HOLD_DEFAULT} durationInFrames={10} layout="none">
          <Audio src={staticFile("shutter.mp3")} volume={0.22} />
        </Sequence>
      ))}
      <Sequence name="Record scratch — no photos" from={chapters[2].from + (chapters[2].c ?? 0) - 6} durationInFrames={30} layout="none">
        <Audio src={staticFile("sfx-scratch.mp3")} volume={0.5} />
      </Sequence>
      <Sequence name="Riser — into 2027" from={FINAL_HIT - 87} durationInFrames={87} layout="none">
        <Audio src={staticFile("sfx-riser.mp3")} volume={0.4} />
      </Sequence>
      <Sequence name="Boom — 2027" from={FINAL_HIT} durationInFrames={110} layout="none">
        <Audio src={staticFile("sfx-boom.mp3")} volume={0.85} />
      </Sequence>

      {/* ---------- picture ---------- */}
      <Sequence name="Opening — place" durationInFrames={120}>
        <AbsoluteFill style={{ backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
          <Rise delay={20}>
            <Caps size={30} color={GOLD_SOFT} tracking="0.5em">
              Coachella Valley, California · February 2018
            </Caps>
          </Rise>
        </AbsoluteFill>
      </Sequence>
      <Sequence name="Opening — the desert" from={120} durationInFrames={240}>
        <SlowPlate src={d("early-034")} />
        <Sequence from={30} durationInFrames={190} layout="none">
          <ScriptLine center size={84}>
            Eight men drove into the desert.
          </ScriptLine>
        </Sequence>
      </Sequence>
      <Sequence name="Opening — clubs" from={360} durationInFrames={240}>
        <SlowPlate src={d("early-046")} oy="30%" />
        <Sequence from={30} durationInFrames={190} layout="none">
          <ScriptLine center size={84}>
            They brought clubs. Talent was optional.
          </ScriptLine>
        </Sequence>
      </Sequence>
      {INTRO.map((src, i) => (
        <Sequence key={src} name={`Intro ${i}`} from={600 + i * 22} durationInFrames={i === INTRO.length - 1 ? 26 : 22}>
          <Photo shot={{ src }} index={i} />
        </Sequence>
      ))}
      <Sequence name="Opening — still going" from={606} durationInFrames={168} layout="none">
        <AbsoluteFill style={{ background: "rgba(0,0,0,0.45)" }} />
        <ScriptLine center size={84}>
          Nine years later, they are still going back.
        </ScriptLine>
      </Sequence>
      <Sequence name="Title" from={780} durationInFrames={timeline.intro - 780}>
        <AbsoluteFill style={{ backgroundColor: "#000", alignItems: "center", justifyContent: "center", gap: 18 }}>
          <Caps size={30} color={GOLD_SOFT} tracking="0.5em">
            The Strand Invitational
          </Caps>
          <div style={{ fontFamily: SERIF, fontSize: 230, fontWeight: 900, fontStyle: "italic", color: BONE, lineHeight: 1 }}>
            Nine Years
          </div>
          <Rise delay={36}>
            <Caps size={34} tracking="0.4em">
              A true story. Mostly.
            </Caps>
          </Rise>
        </AbsoluteFill>
      </Sequence>

      {pictures.map(({ ch, content, slots }) => (
        <Sequence key={ch.key} name={`Chapter ${ch.year}`} from={ch.from} durationInFrames={ch.len}>
          <Sequence name="Year card" durationInFrames={40}>
            <YearCard year={ch.year} place={ch.place} num={ch.num} bg={content.shots[0]?.src} />
          </Sequence>
          {ch.key === "20" ? (
            <>
              <Sequence name="Paperwork" from={40} durationInFrames={(ch.c ?? 200) - 46}>
                <NoEvidence />
              </Sequence>
              <Sequence name="Photo not found" from={(ch.c ?? 200) - 6} durationInFrames={ch.vfrom - (ch.c ?? 200) + 6}>
                <EvidenceMissing />
              </Sequence>
            </>
          ) : (
            content.shots.map((shot, i) => (
              <Sequence key={shot.src} name={shot.tag ?? shot.src} from={slots[i][0] - ch.from} durationInFrames={slots[i][1]}>
                <Photo shot={shot} index={i} />
              </Sequence>
            ))
          )}
          {(content.lines ?? []).map((line) => (
            <Sequence key={line.text} name={`Script — ${line.text}`} from={line.at} durationInFrames={line.hold} layout="none">
              <ScriptLine>{line.text}</ScriptLine>
            </Sequence>
          ))}
          {(content.slams ?? []).map((slam) => (
            <Sequence key={slam.text} name={`Slam — ${slam.text}`} from={slam.at} durationInFrames={slam.hold ?? 36}>
              <AbsoluteFill style={{ background: "rgba(0,0,0,0.38)" }} />
              <WordSlam>{slam.text}</WordSlam>
            </Sequence>
          ))}
          {(() => {
            let at = ch.vfrom;
            return (CLIPS[ch.key] ?? []).map((clip) => {
              const from = at;
              at += clip.len;
              return (
                <Sequence key={clip.src} name={clip.tag ?? clip.src} from={from} durationInFrames={clip.len}>
                  <FootageScene src={clip.src} trimBefore={clip.trim ?? 0} volume={clip.volume ?? 0} dim={0.02}>
                    {clip.tag ? <Tag delay={2}>{clip.tag}</Tag> : null}
                  </FootageScene>
                </Sequence>
              );
            });
          })()}
          <Sequence name="Result" from={ch.len - 54} durationInFrames={54}>
            <ResultCard lines={content.result} bg={content.resultBg} />
          </Sequence>
        </Sequence>
      ))}

      <Sequence name="The field" from={timeline.roll[0]} durationInFrames={timeline.roll[1] - timeline.roll[0]}>
        <FaceRoll />
      </Sequence>
      <Sequence name="Ledger" from={timeline.ledger[0]} durationInFrames={timeline.ledger[1] - timeline.ledger[0]}>
        <Ledger />
      </Sequence>
      <Sequence name="Year ten is coming" from={timeline.eyes[0]} durationInFrames={timeline.eyes[1] - timeline.eyes[0]}>
        <FootageScene src="g-freddy.mp4" trimBefore={243} playbackRate={0.6} dim={0.12} />
        <Sequence from={10} layout="none">
          <WordSlam>Year ten.</WordSlam>
        </Sequence>
      </Sequence>
      <Sequence name="2027" from={FINAL_HIT} durationInFrames={timeline.tagline - FINAL_HIT}>
        <Finale />
      </Sequence>
      <Sequence name="Tagline" from={timeline.tagline} durationInFrames={DECADE_DURATION - timeline.tagline}>
        <AbsoluteFill style={{ backgroundColor: INK, alignItems: "center", justifyContent: "center", gap: 20 }}>
          <AbsoluteFill
            style={{ background: "radial-gradient(50% 55% at 50% 46%, rgba(201,162,39,0.24) 0%, rgba(7,19,15,0) 72%)" }}
          />
          <CanvasImage src={staticFile("ten-year-crest.png")} style={{ width: 220, height: 220, borderRadius: "50%" }} />
          <Rise delay={6}>
            <div style={{ fontFamily: SERIF, fontSize: 110, fontWeight: 800, fontStyle: "italic", color: BONE, lineHeight: 1.05 }}>
              It’s a golf life.
            </div>
          </Rise>
          <Rise delay={44}>
            <Caps size={34} color={GOLD_SOFT} tracking="0.34em">
              And we’ve all chose to live it
            </Caps>
          </Rise>
          <Rise delay={90}>
            <div style={{ fontFamily: FONT, fontSize: 24, letterSpacing: "0.24em", color: "rgba(244,242,234,0.55)" }}>
              The Strand Invitational · Year ten · 2027
            </div>
          </Rise>
        </AbsoluteFill>
      </Sequence>

      {/* ---------- finishing ---------- */}
      {chapters.map((ch) => (
        <HitFlash key={ch.key} at={ch.from} strength={0.6} />
      ))}
      <HitFlash at={FINAL_HIT} strength={0.85} />
      <Grain opacity={0.05} />
      <Vignette strength={0.42} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: LETTERBOX, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: LETTERBOX, background: "#000" }} />
      <AbsoluteFill
        style={{ backgroundColor: "#000", opacity: interpolate(frame, [DECADE_DURATION - 40, DECADE_DURATION - 6], [0, 1], clamp) }}
      />
    </AbsoluteFill>
  );
};
