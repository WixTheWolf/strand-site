import { loadFont } from "@remotion/fonts";
import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  CanvasImage,
  Easing,
  Sequence,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Grain, Vignette } from "./Cinematic";
import { BONE, FONT, GOLD_SOFT, INK, clamp } from "./Kinetic";

/**
 * THE STRAND — a short documentary. One orchestral score with a hit every
 * 160 frames (5.33s at 30fps); scenes change on those bars and the narration
 * sits between them. 2026 is told in the past tense; the tenth edition is
 * left as a mystery.
 */

loadFont({ family: "Playfair Display", url: staticFile("playfair.woff2"), weight: "400 900" });
loadFont({
  family: "Playfair Display",
  url: staticFile("playfair-italic.woff2"),
  weight: "400 900",
  style: "italic",
});
export const SERIF = '"Playfair Display", Georgia, serif';

export const FILM_DURATION = 2760;
export const LETTERBOX = 138; // 2.39:1 inside 16:9
// The score: lone hits at 0s, 8s and 12s, then a 120 BPM groove from 14s
// (a beat is 15 frames, a bar 60). Cuts sit on those beats.
const TITLE_HIT = 360; // 12s
const CUP_DROP = 1380; // 46s
const MUSIC_IN = 360; // the cold open plays on sound design alone; the band enters with the title
const CART_HUSH = [1215, 1290]; // record scratch: "We don't talk about the cart."
const SILENCE = [2310, 2400]; // the score drops out for "He declined to comment."
const FINAL_HIT = 2520; // 84s — "2027"

export const ease = Easing.out(Easing.cubic);

/* ------------------------------------------------------------------ */
/* Narration: clip, start frame, length in frames                      */
/* ------------------------------------------------------------------ */

const NARRATION: Array<{ file: string; at: number; len: number }> = [
  { file: "v-01", at: 18, len: 170 },
  { file: "v-02", at: 261, len: 34 },
  { file: "v-03a", at: 426, len: 63 },
  { file: "v-03b", at: 489, len: 123 },
  { file: "v-04", at: 636, len: 134 },
  { file: "v-05a", at: 786, len: 51 },
  { file: "v-05b", at: 843, len: 38 },
  { file: "v-06", at: 903, len: 45 },
  { file: "v-07", at: 1026, len: 71 },
  { file: "v-08", at: 1146, len: 62 },
  { file: "v-09", at: 1230, len: 51 },
  { file: "v-10", at: 1296, len: 62 },
  { file: "v-11", at: 1389, len: 82 },
  { file: "v-12", at: 1626, len: 78 },
  { file: "v-13", at: 1716, len: 79 },
  { file: "v-14", at: 1836, len: 166 },
  { file: "v-15", at: 2046, len: 54 },
  { file: "v-16", at: 2109, len: 60 },
  { file: "v-17", at: 2226, len: 42 },
  { file: "v-18", at: 2328, len: 41 },
  { file: "v-19", at: 2406, len: 101 },
  { file: "v-20", at: 2538, len: 42 },
  { file: "v-21", at: 2592, len: 72 },
];
const VO_GAIN = 1.6;

/** Score level: full between lines, pulled down under the voice, out for the silence. */
const scoreVolume = (frame: number) => {
  let duck = 0;
  for (const line of NARRATION) {
    duck = Math.max(
      duck,
      interpolate(frame, [line.at - 6, line.at, line.at + line.len, line.at + line.len + 8], [0, 1, 1, 0], clamp),
    );
  }
  const gap = (g: number[]) => interpolate(frame, [g[0] - 2, g[0], g[1] - 1, g[1]], [1, 0, 0, 1], clamp);
  const silence = gap(CART_HUSH) * gap(SILENCE);
  const fadeOut = interpolate(frame, [FILM_DURATION - 60, FILM_DURATION - 8], [1, 0], clamp);
  return 0.95 * (1 - duck * 0.7) * silence * fadeOut;
};

/* ------------------------------------------------------------------ */
/* Documentary furniture                                               */
/* ------------------------------------------------------------------ */

export const Caps: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  tracking?: string;
  style?: React.CSSProperties;
}> = ({ children, size = 24, color = "rgba(244,242,234,0.78)", tracking = "0.36em", style }) => (
  <div
    style={{
      fontFamily: FONT,
      fontSize: size,
      fontWeight: 600,
      letterSpacing: tracking,
      textTransform: "uppercase",
      color,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Fade and rise in — the film's default text entrance. */
export const Rise: React.FC<{ children: React.ReactNode; delay?: number; distance?: number }> = ({
  children,
  delay = 0,
  distance = 26,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        opacity: interpolate(frame, [delay, delay + 16], [0, 1], clamp),
        translate: `0px ${interpolate(frame, [delay, delay + 22], [distance, 0], { ...clamp, easing: ease })}px`,
      }}
    >
      {children}
    </div>
  );
};

/** Typewriter stamp for places and dates. */
export const Stamp: React.FC<{ children: string; delay?: number; color?: string }> = ({
  children,
  delay = 0,
  color = "rgba(244,242,234,0.8)",
}) => {
  const frame = useCurrentFrame();
  const shown = Math.floor(interpolate(frame, [delay, delay + children.length * 0.9], [0, children.length], clamp));
  return (
    <Caps size={22} tracking="0.3em" color={color}>
      {children.slice(0, shown)}
      <span style={{ opacity: shown < children.length && frame % 8 < 4 ? 1 : 0 }}>▍</span>
    </Caps>
  );
};

/** Name and title, the way a documentary introduces someone. */
const LowerThird: React.FC<{ name: string; role: string; delay?: number }> = ({ name, role, delay = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 130, bottom: LETTERBOX + 70 }}>
      <div
        style={{
          width: interpolate(frame, [delay, delay + 18], [0, 420], { ...clamp, easing: ease }),
          height: 3,
          background: GOLD_SOFT,
          marginBottom: 20,
        }}
      />
      <Rise delay={delay + 6}>
        <div style={{ fontFamily: SERIF, fontSize: 78, fontWeight: 700, color: BONE, lineHeight: 1 }}>{name}</div>
      </Rise>
      <div style={{ height: 14 }} />
      <Rise delay={delay + 14}>
        <Caps size={26} color={GOLD_SOFT}>
          {role}
        </Caps>
      </Rise>
    </div>
  );
};

/** A statistic set in the corner of the frame. */
const StatTag: React.FC<{ value: string; label: string }> = ({ value, label }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        right: 130,
        bottom: LETTERBOX + 56,
        textAlign: "right",
        opacity: interpolate(frame, [0, 8], [0, 1], clamp),
        translate: `${interpolate(frame, [0, 14], [40, 0], { ...clamp, easing: ease })}px 0px`,
      }}
    >
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 210,
          fontWeight: 800,
          lineHeight: 0.9,
          color: GOLD_SOFT,
          textShadow: "0 8px 50px rgba(0,0,0,0.6)",
        }}
      >
        {value}
      </div>
      <Caps size={30} color={BONE} tracking="0.4em" style={{ marginTop: 22, textShadow: "0 2px 18px rgba(0,0,0,0.8)" }}>
        {label}
      </Caps>
    </div>
  );
};

/** A still from the trip: slow push, a touch desaturated, a shutter flash on arrival. */
const Archival: React.FC<{
  src: string;
  ox?: string;
  oy?: string;
  dim?: number;
  from?: number;
  to?: number;
}> = ({ src, ox = "50%", oy = "45%", dim = 0.18, from = 1.05, to = 1.13 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: INK, overflow: "hidden" }}>
      <CanvasImage
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `${ox} ${oy}`,
          scale: String(interpolate(frame, [0, durationInFrames], [from, to])),
          transformOrigin: `${ox} ${oy}`,
          filter: "saturate(0.86) contrast(1.06)",
        }}
      />
      <AbsoluteFill style={{ background: `rgba(7,19,15,${dim})` }} />
      <AbsoluteFill
        style={{
          backgroundColor: "#fff6df",
          opacity: interpolate(frame, [0, 1, 7], [0, 0.4, 0], clamp),
        }}
      />
    </AbsoluteFill>
  );
};

/** Type with moving footage inside the letters. */
const VideoText: React.FC<{
  text: string;
  src: string;
  size: number;
  trimBefore?: number;
  playbackRate?: number;
  italic?: boolean;
  offsetY?: number;
}> = ({ text, src, size, trimBefore = 0, playbackRate = 1, italic = false, offsetY = 0 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [1.07, 1], { ...clamp, easing: ease });
  const type: React.CSSProperties = {
    fontFamily: SERIF,
    fontSize: size,
    fontWeight: 900,
    fontStyle: italic ? "italic" : "normal",
    letterSpacing: "-0.02em",
    lineHeight: 1,
    whiteSpace: "nowrap",
    scale: String(scale),
    translate: `0px ${offsetY}px`,
  };
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Video
        src={staticFile(src)}
        trimBefore={trimBefore}
        playbackRate={playbackRate}
        volume={0}
        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(1.15) brightness(1.3)" }}
      />
      <AbsoluteFill
        style={{ backgroundColor: "#000", mixBlendMode: "multiply", alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ ...type, color: "#fff" }}>{text}</div>
      </AbsoluteFill>
      {/* Gold rim: stroke painted under a black fill, screened on, so only the outer edge shows. */}
      <AbsoluteFill
        style={{ backgroundColor: "#000", mixBlendMode: "screen", alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ ...type, color: "#000", WebkitTextStroke: "5px rgba(232,200,106,0.9)", paintOrder: "stroke fill" }}>
          {text}
        </div>
      </AbsoluteFill>
      <AbsoluteFill
        style={{ backgroundColor: "#000", opacity: interpolate(frame, [0, 16], [1, 0], clamp) }}
      />
    </AbsoluteFill>
  );
};

const SCRAMBLE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&";

/** Characters churn; from `resolveAt` they lock in one by one to `to`. */
const Scramble: React.FC<{ length: number; seed?: string; to?: string; resolveAt?: number; size?: number; color?: string }> = ({
  length,
  seed = "a",
  to,
  resolveAt = 0,
  size = 40,
  color = GOLD_SOFT,
}) => {
  const frame = useCurrentFrame();
  const locked = to ? Math.floor(interpolate(frame, [resolveAt, resolveAt + to.length * 4], [0, to.length], clamp)) : 0;
  const count = to ? to.length : length;
  let out = "";
  for (let i = 0; i < count; i++) {
    if (to && i < locked) out += to[i];
    else out += SCRAMBLE_CHARS[Math.floor(random(`s-${seed}-${i}-${Math.floor(frame / 2)}`) * SCRAMBLE_CHARS.length)];
  }
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: size,
        fontWeight: 700,
        letterSpacing: "0.3em",
        color,
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
      }}
    >
      {out}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

export const FootageScene: React.FC<{
  src: string;
  trimBefore?: number;
  playbackRate?: number;
  volume?: number;
  dim?: number;
  children?: React.ReactNode;
}> = ({ src, trimBefore = 0, playbackRate = 1, volume = 0, dim = 0.12, children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Video
        src={staticFile(src)}
        trimBefore={trimBefore}
        playbackRate={playbackRate}
        volume={volume}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: String(interpolate(frame, [0, durationInFrames], [1.03, 1.09])),
        }}
      />
      <AbsoluteFill style={{ background: `rgba(7,19,15,${dim})` }} />
      {children}
    </AbsoluteFill>
  );
};

const ChapterGambleSands: React.FC = () => (
  <FootageScene src="flyover.mp4" trimBefore={12} dim={0.06}>
    <AbsoluteFill
      style={{ background: "linear-gradient(90deg, rgba(7,19,15,0.7) 0%, rgba(7,19,15,0) 60%)" }}
    />
    <div style={{ position: "absolute", left: 130, bottom: LETTERBOX + 60 }}>
      <Rise delay={4}>
        <Caps color={GOLD_SOFT} size={26}>
          Chapter nine
        </Caps>
      </Rise>
      <div style={{ height: 10 }} />
      <Rise delay={10}>
        <div style={{ fontFamily: SERIF, fontSize: 170, fontWeight: 800, color: BONE, lineHeight: 1 }}>
          Gamble Sands
        </div>
      </Rise>
      <div style={{ height: 22 }} />
      <Stamp delay={12}>Brewster, Washington · August 20–23, 2026</Stamp>
    </div>
  </FootageScene>
);

const ROSTER = [
  { name: "Justin Uribe (C)", photo: "players/j-bone.jpg" },
  { name: "Brett Comfort", photo: "players/brett.jpg" },
  { name: "Brian Kerns", photo: "players/kerns-cartoon.png" },
  { name: "Matt Schroeder", photo: "players/tony-schroe.jpg" },
  { name: "Fred Geisinger", photo: "players/fred.jpg" },
  { name: "Shaun Eipper", photo: "players/shaun.jpg" },
  { name: "Jason Olson", photo: "players/jason.jpg" },
  { name: "Matt Onorato", photo: "players/matty-o.jpg" },
  { name: "Ryan D'Arcy", photo: "players/darcy.jpg" },
  { name: "Kevin Gordon", photo: "players/kev.jpg" },
];

const Champions: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <CanvasImage
        src={staticFile("strand26-063.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "50% 38%",
          scale: String(interpolate(frame, [0, 224], [1.16, 1.06])),
          filter: "saturate(0.55) brightness(0.28) contrast(1.1)",
        }}
      />
      <AbsoluteFill
        style={{
          background: "radial-gradient(60% 50% at 50% 34%, rgba(201,162,39,0.24) 0%, rgba(7,19,15,0) 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: LETTERBOX + 34,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Rise delay={4}>
          <Caps color={BONE} size={26}>
            2026 Champions
          </Caps>
        </Rise>
        <Rise delay={8} distance={40}>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 170,
              fontWeight: 900,
              fontStyle: "italic",
              color: GOLD_SOFT,
              lineHeight: 1.05,
            }}
          >
            Team J-Bone
          </div>
        </Rise>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 470,
          display: "grid",
          gridTemplateColumns: "repeat(5, 320px)",
          justifyContent: "center",
          rowGap: 26,
        }}
      >
        {ROSTER.map((player, i) => {
          const at = 40 + i * 8;
          return (
            <div
              key={player.name}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                opacity: interpolate(frame, [at, at + 10], [0, 1], clamp),
                translate: `0px ${interpolate(frame, [at, at + 16], [24, 0], { ...clamp, easing: ease })}px`,
              }}
            >
              <CanvasImage
                src={staticFile(player.photo)}
                style={{
                  width: 136,
                  height: 136,
                  borderRadius: "50%",
                  objectFit: "cover",
                  objectPosition: "50% 20%",
                  border: `3px solid ${i === 0 ? GOLD_SOFT : "rgba(244,242,234,0.8)"}`,
                  filter: "saturate(0.9)",
                }}
              />
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 26,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  color: i === 0 ? GOLD_SOFT : BONE,
                  whiteSpace: "nowrap",
                }}
              >
                {player.name}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** The Commissioner's handwritten pairings, laid over the ledger like evidence. */
const PairingsCard: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: `rgba(7,19,15,${interpolate(frame, [0, 8], [0, 0.82], clamp)})`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 450,
          height: 600,
          overflow: "hidden",
          borderRadius: 4,
          border: "10px solid #f4f2ea",
          boxShadow: "0 30px 90px rgba(0,0,0,0.7)",
          rotate: `${interpolate(frame, [0, 10], [-9, -3], { ...clamp, easing: ease })}deg`,
          scale: String(interpolate(frame, [0, 10, 75], [1.25, 1, 1.05], { ...clamp, easing: ease })),
          opacity: interpolate(frame, [0, 4], [0, 1], clamp),
        }}
      >
        <Video src={staticFile("r-pairings.mp4")} volume={0} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", left: 130, bottom: LETTERBOX + 64 }}>
        <Stamp delay={12}>Exhibit A · The pairings, by hand</Stamp>
      </div>
    </AbsoluteFill>
  );
};

/** A rubber-stamp slam for the one thing the Commissioner will say. */
export const Stamped: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        display: "inline-block",
        border: `4px solid ${GOLD_SOFT}`,
        padding: "12px 26px",
        rotate: "-3deg",
        background: "rgba(7,19,15,0.55)",
        opacity: interpolate(frame, [0, 3], [0, 1], clamp),
        scale: String(interpolate(frame, [0, 8], [1.6, 1], { ...clamp, easing: ease })),
      }}
    >
      <Caps size={40} color={GOLD_SOFT} tracking="0.34em">
        {children}
      </Caps>
    </div>
  );
};

const EDITIONS = [
  { year: 2018, place: "Palm Springs, California" },
  { year: 2019, place: "Indio, California" },
  { year: 2020, place: "Palm Desert, California" },
  { year: 2021, place: "La Quinta, California" },
  { year: 2022, place: "Rams Hill, California" },
  { year: 2023, place: "St. George, Utah" },
  { year: 2024, place: "Ojai, California" },
  { year: 2025, place: "Monterey, California" },
  { year: 2026, place: "Brewster, Washington" },
];

export const Ledger: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Video
        src={staticFile("g-coast.mp4")}
        playbackRate={0.55}
        volume={0}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: String(interpolate(frame, [0, 200], [1.05, 1.12])),
          filter: "saturate(0.6) brightness(0.3) blur(2px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: LETTERBOX + 30,
          bottom: LETTERBOX + 30,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 9,
        }}
      >
        <Rise>
          <Caps color={GOLD_SOFT} size={24}>
            Nine editions · Nine destinations
          </Caps>
        </Rise>
        <div style={{ height: 14 }} />
        {EDITIONS.map((e, i) => {
          const at = 8 + i * 9;
          return (
            <div
              key={e.year}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 34,
                width: 900,
                opacity: interpolate(frame, [at, at + 10], [0, 1], clamp),
                translate: `${interpolate(frame, [at, at + 16], [-30, 0], { ...clamp, easing: ease })}px 0px`,
              }}
            >
              <div
                style={{
                  fontFamily: SERIF,
                  fontSize: 50,
                  fontWeight: 800,
                  color: GOLD_SOFT,
                  width: 150,
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1.12,
                }}
              >
                {e.year}
              </div>
              <div
                style={{
                  flex: 1,
                  borderBottom: "1px solid rgba(244,242,234,0.18)",
                  fontFamily: FONT,
                  fontSize: 30,
                  fontWeight: 500,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: BONE,
                  paddingBottom: 6,
                }}
              >
                {e.place}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Envelope: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <FootageScene src="envelope.mp4" playbackRate={0.9} dim={0.1}>
      <div
        style={{
          position: "absolute",
          left: 130,
          top: LETTERBOX + 56,
          display: "grid",
          gridTemplateColumns: "auto auto",
          columnGap: 34,
          rowGap: 18,
          alignItems: "center",
          opacity: interpolate(frame, [14, 28], [0, 1], clamp),
        }}
      >
        <Caps size={28}>Destination</Caps>
        <Scramble length={11} size={40} />
        <Caps size={28}>Dates</Caps>
        <Scramble length={8} seed="dates" size={40} />
        <Caps size={28}>Edition</Caps>
        <div style={{ fontFamily: FONT, fontSize: 40, fontWeight: 700, letterSpacing: "0.3em", color: GOLD_SOFT }}>
          No. 10
        </div>
      </div>
    </FootageScene>
  );
};

const TenYears: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: INK, alignItems: "center", justifyContent: "center", gap: 30 }}>
      <AbsoluteFill
        style={{
          background: "radial-gradient(50% 55% at 50% 46%, rgba(201,162,39,0.26) 0%, rgba(7,19,15,0) 72%)",
        }}
      />
      <CanvasImage
        src={staticFile("ten-year-crest.png")}
        style={{
          width: 300,
          height: 300,
          borderRadius: "50%",
          opacity: interpolate(frame, [0, 20], [0, 1], clamp),
          scale: String(interpolate(frame, [0, 120], [0.94, 1.03])),
          boxShadow: "0 0 130px rgba(201,162,39,0.4)",
        }}
      />
      <Rise delay={8}>
        <div style={{ fontFamily: SERIF, fontSize: 104, fontWeight: 800, color: BONE, lineHeight: 1 }}>
          The Strand Invitational
        </div>
      </Rise>
      <Sequence from={50} layout="none">
        <Rise>
          <Caps size={40} color={GOLD_SOFT} tracking="0.5em">
            Ten years running
          </Caps>
        </Rise>
      </Sequence>
    </AbsoluteFill>
  );
};

export const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <VideoText text="2027" src="flyover.mp4" playbackRate={0.5} size={600} offsetY={-70} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: LETTERBOX + 44,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 30,
            opacity: interpolate(frame, [70, 84], [0, 1], clamp),
          }}
        >
          <Caps size={30} color={BONE}>
            Destination
          </Caps>
          <Scramble length={7} to="UNKNOWN" resolveAt={118} size={44} />
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 28,
            letterSpacing: "0.24em",
            color: "rgba(244,242,234,0.62)",
            opacity: interpolate(frame, [160, 176], [0, 1], clamp),
          }}
        >
          strand-site.vercel.app
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Fast-cut furniture                                                  */
/* ------------------------------------------------------------------ */

/** A strobe of stills: each photo punches in for a few frames with a flash. */
const Burst: React.FC<{ photos: Array<string | [string, string]>; per: number }> = ({ photos, per }) => {
  const frame = useCurrentFrame();
  const index = Math.min(photos.length - 1, Math.floor(frame / per));
  const local = frame - index * per;
  const entry = photos[index];
  const [src, oy] = typeof entry === "string" ? [entry, "38%"] : entry;
  return (
    <AbsoluteFill style={{ backgroundColor: INK, overflow: "hidden" }}>
      <CanvasImage
        key={src}
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `50% ${oy}`,
          scale: String(interpolate(local, [0, per], [1.16, 1.04], { ...clamp, easing: ease })),
          rotate: `${(index % 2 === 0 ? -1 : 1) * interpolate(local, [0, per], [1.2, 0], clamp)}deg`,
          filter: "contrast(1.08) saturate(1.05)",
        }}
      />
      <AbsoluteFill style={{ backgroundColor: "#fff6df", opacity: interpolate(local, [0, 2], [0.55, 0], clamp) }} />
    </AbsoluteFill>
  );
};

export const FIELD: Array<[string, string]> = [
  ["J-BONE", "j-bone.jpg"],
  ["WIX", "wix.jpg"],
  ["FRED", "fred.jpg"],
  ["DREW", "drew.jpg"],
  ["D'ARCY", "darcy.jpg"],
  ["TONY SCHROE", "tony-schroe.jpg"],
  ["JACK", "jack.jpg"],
  ["GORD", "gord.jpg"],
  ["NICK", "nick.jpg"],
  ["KERNS", "kerns-cartoon.png"],
  ["HUMMEL", "hummel.jpg"],
  ["KEV", "kev.jpg"],
  ["JASON", "jason.jpg"],
  ["SHAUN", "shaun.jpg"],
  ["KANE", "kane.jpg"],
  ["BRETT", "brett.jpg"],
  ["BLONSKI", "blonski.jpg"],
  ["P-MO", "p-mo.jpg"],
  ["RHETT", "rhett.jpg"],
  ["MATTY O.", "matty-o.jpg"],
];

/** Twenty faces in two beats: the whole field, one tile every three frames. */
const RollCall: React.FC = () => {
  const frame = useCurrentFrame();
  const shown = Math.min(FIELD.length, Math.floor(frame / 3) + 1);
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <AbsoluteFill
        style={{ background: "radial-gradient(70% 60% at 50% 50%, rgba(201,162,39,0.2) 0%, rgba(7,19,15,0) 75%)" }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: LETTERBOX + 26,
          display: "flex",
          justifyContent: "center",
          alignItems: "baseline",
          gap: 26,
        }}
      >
        <Caps size={26} color={BONE}>
          The field
        </Caps>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 92,
            fontWeight: 900,
            fontStyle: "italic",
            color: GOLD_SOFT,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            width: 120,
            textAlign: "center",
          }}
        >
          {shown}
        </div>
        <Caps size={26} color={BONE}>
          Gamble Sands · 2026
        </Caps>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: LETTERBOX + 150,
          display: "grid",
          gridTemplateColumns: "repeat(10, 172px)",
          justifyContent: "center",
          rowGap: 22,
        }}
      >
        {FIELD.map(([nick, file], i) => {
          const at = i * 3;
          return (
            <div
              key={nick}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                opacity: frame >= at ? 1 : 0,
                scale: String(interpolate(frame, [at, at + 6], [1.5, 1], { ...clamp, easing: ease })),
              }}
            >
              <CanvasImage
                src={staticFile(`players/${file}`)}
                style={{
                  width: 148,
                  height: 190,
                  objectFit: "cover",
                  objectPosition: "50% 20%",
                  borderRadius: 6,
                  border: `2px solid ${i === 0 ? GOLD_SOFT : "rgba(244,242,234,0.7)"}`,
                }}
              />
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 17,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  color: BONE,
                  whiteSpace: "nowrap",
                }}
              >
                {nick}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Three swings at once, each panel sliding in on its own beat. */
const Triptych: React.FC<{ panels: Array<{ src: string; trimBefore?: number; ox?: number }> }> = ({ panels }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {panels.map((panel, i) => {
        const at = i * 8;
        return (
          <div
            key={panel.src}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `calc(${(i * 100) / panels.length}% + ${i === 0 ? 0 : 4}px)`,
              width: `calc(${100 / panels.length}% - ${i === 0 || i === panels.length - 1 ? 4 : 8}px)`,
              overflow: "hidden",
              opacity: frame >= at ? 1 : 0,
              translate: `0px ${interpolate(frame, [at, at + 10], [i % 2 === 0 ? 120 : -120, 0], { ...clamp, easing: ease })}px`,
            }}
          >
            <Video
              src={staticFile(panel.src)}
              trimBefore={panel.trimBefore ?? 0}
              volume={0}
              // The player keeps its 16:9 shape, so size it to the frame and slide it under the panel.
              style={{
                position: "absolute",
                top: 0,
                left: -(1920 - 1920 / panels.length) * (panel.ox ?? 0.5),
                width: 1920,
                height: 1080,
                maxWidth: "none",
              }}
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** A deadpan label for whoever is on screen. */
export const Tag: React.FC<{ children: string; delay?: number }> = ({ children, delay = 4 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 130,
        bottom: LETTERBOX + 56,
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 20px 12px 16px",
        background: "rgba(7,19,15,0.72)",
        borderLeft: `5px solid ${GOLD_SOFT}`,
        opacity: interpolate(frame, [delay, delay + 3], [0, 1], clamp),
        translate: `${interpolate(frame, [delay, delay + 8], [-30, 0], { ...clamp, easing: ease })}px 0px`,
      }}
    >
      <Caps size={34} color={BONE} tracking="0.24em">
        {children}
      </Caps>
    </div>
  );
};

/** One big word, slammed on and gone. */
export const WordSlam: React.FC<{ children: string }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          fontFamily: SERIF,
          fontSize: Math.min(190, Math.round(3100 / children.length)),
          fontWeight: 900,
          fontStyle: "italic",
          color: BONE,
          textShadow: "0 10px 60px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)",
          whiteSpace: "nowrap",
          scale: String(interpolate(frame, [0, 6], [1.7, 1], { ...clamp, easing: ease })),
          opacity: interpolate(frame, [0, 2, durationInFrames - 5, durationInFrames], [0, 1, 1, 0], clamp),
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/** The real Commissioner, before the film gets dramatic about him. */
const OneMan: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <CanvasImage
        src={staticFile("players/fred.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "50% 25%",
          scale: "1.25",
          filter: "blur(46px) saturate(0.8) brightness(0.45)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 250,
          top: LETTERBOX + 48,
          width: 480,
          height: 696,
          overflow: "hidden",
          borderRadius: 6,
          border: "1px solid rgba(232,200,106,0.5)",
          boxShadow: "0 30px 90px rgba(0,0,0,0.6)",
          scale: String(interpolate(frame, [0, durationInFrames], [1.0, 1.08])),
        }}
      >
        <CanvasImage
          src={staticFile("players/fred.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 18%" }}
        />
      </div>
      <div style={{ position: "absolute", left: 130, top: LETTERBOX + 250 }}>
        <Rise delay={6}>
          <Caps size={28} color={GOLD_SOFT}>
            None of it happens without
          </Caps>
        </Rise>
        <div style={{ height: 8 }} />
        <Rise delay={30} distance={40}>
          <div style={{ fontFamily: SERIF, fontSize: 210, fontWeight: 900, fontStyle: "italic", color: BONE, lineHeight: 1 }}>
            One man.
          </div>
        </Rise>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* The film                                                            */
/* ------------------------------------------------------------------ */

const BURSTS: Array<{ at: number; per: number; photos: Array<string | [string, string]> }> = [
  { at: 510, per: 15, photos: ["p/003.jpg", ["p/004.jpg", "30%"]] },
  { at: 690, per: 5, photos: ["p/017.jpg", "p/042.jpg", ["p/050.jpg", "30%"], "p/072.jpg", "p/074.jpg", "p/097.jpg"] },
  { at: 990, per: 8, photos: [["p/044.jpg", "28%"], ["p/047.jpg", "30%"], ["p/079.jpg", "30%"], "p/081.jpg"] },
  {
    at: 1396,
    per: 6,
    photos: ["p/082.jpg", ["p/084.jpg", "30%"], ["p/088.jpg", "40%"], ["p/092.jpg", "62%"], ["p/093.jpg", "30%"], "p/095.jpg", "p/096.jpg"],
  },
];
const SHUTTERS = [1560, 1935, ...BURSTS.flatMap((b) => b.photos.map((_, i) => b.at + i * b.per))];
const WHOOSHES = [510, 555, 690, 900, 990, 1020, 1140, 1396, 1935, 2040];
/** Club-on-ball, sand and the cart landing: one dry hit each, on the beat. */
const THUMPS = [906, 915, 922, 975, 1035, 1060, 1200];

const shake = (frame: number, at: number, power: number) => {
  const t = frame - at;
  if (t < 0 || t > 18) return [0, 0];
  const d = Math.exp(-t * 0.26) * power;
  return [Math.sin(t * 2.9) * d, Math.cos(t * 3.7) * d * 0.7];
};

export const HitFlash: React.FC<{ at: number; strength: number }> = ({ at, strength }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#fff6df",
        opacity: interpolate(frame, [at, at + 1, at + 8], [0, strength, 0], clamp),
        pointerEvents: "none",
      }}
    />
  );
};

export const StrandFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const shakes = [shake(frame, TITLE_HIT, 22), shake(frame, 1200, 10), shake(frame, CUP_DROP, 8), shake(frame, FINAL_HIT, 26)];
  const sx = shakes.reduce((a, v) => a + v[0], 0);
  const sy = shakes.reduce((a, v) => a + v[1], 0);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* ---------- sound ---------- */}
      <Sequence name="Score" from={MUSIC_IN} layout="none">
        <Audio src={staticFile("score3.mp3")} volume={scoreVolume(frame)} />
      </Sequence>
      <Sequence name="Cold open — clock and drone" durationInFrames={MUSIC_IN} layout="none">
        <Audio
          src={staticFile("sfx-tick.mp3")}
          volume={interpolate(frame, [0, 20, MUSIC_IN - 10, MUSIC_IN], [0, 5, 5, 0], clamp)}
        />
      </Sequence>
      <Sequence name="Boom — the eyes" from={240} durationInFrames={110} layout="none">
        <Audio src={staticFile("sfx-boom.mp3")} volume={0.7} />
      </Sequence>
      <Sequence name="Riser — into the title" from={TITLE_HIT - 87} durationInFrames={87} layout="none">
        <Audio src={staticFile("sfx-riser.mp3")} volume={0.45} />
      </Sequence>
      <Sequence name="Boom — title" from={TITLE_HIT} durationInFrames={110} layout="none">
        <Audio src={staticFile("sfx-boom.mp3")} volume={0.8} />
      </Sequence>
      <Sequence name="Record scratch — the cart" from={CART_HUSH[0] - 4} durationInFrames={30} layout="none">
        <Audio src={staticFile("sfx-scratch.mp3")} volume={0.6} />
      </Sequence>
      <Sequence name="Cheer — the putt drops" from={CUP_DROP - 4} durationInFrames={90} layout="none">
        <Audio src={staticFile("sfx-cheer.mp3")} volume={interpolate(frame, [CUP_DROP + 40, CUP_DROP + 86], [0.5, 0], clamp)} />
      </Sequence>
      <Sequence name="Boom — the silence" from={SILENCE[0]} durationInFrames={110} layout="none">
        <Audio src={staticFile("sfx-boom.mp3")} volume={0.6} />
      </Sequence>
      <Sequence name="Riser — into 2027" from={FINAL_HIT - 87} durationInFrames={87} layout="none">
        <Audio src={staticFile("sfx-riser.mp3")} volume={0.4} />
      </Sequence>
      <Sequence name="Boom — 2027" from={FINAL_HIT} durationInFrames={110} layout="none">
        <Audio src={staticFile("sfx-boom.mp3")} volume={0.85} />
      </Sequence>
      {WHOOSHES.map((at) => (
        <Sequence key={at} name={`Whoosh ${at}`} from={at - 7} durationInFrames={25} layout="none">
          <Audio src={staticFile("whoosh.mp3")} volume={0.32} />
        </Sequence>
      ))}
      {NARRATION.map((line) => (
        <Sequence key={line.file} name={`Narration ${line.file}`} from={line.at} durationInFrames={line.len + 6} layout="none">
          <Audio src={staticFile(`${line.file}.mp3`)} volume={VO_GAIN} />
        </Sequence>
      ))}
      <Sequence name="Impact — title" from={TITLE_HIT} durationInFrames={110} layout="none">
        <Audio src={staticFile("impact.mp3")} volume={0.5} />
      </Sequence>
      <Sequence name="Cup rattle" from={CUP_DROP - 6} durationInFrames={80} layout="none">
        <Audio src={staticFile("cup-rattle.mp3")} volume={0.9} />
      </Sequence>
      <Sequence name="Impact — 2027" from={FINAL_HIT} durationInFrames={110} layout="none">
        <Audio src={staticFile("impact.mp3")} volume={0.6} />
      </Sequence>
      {THUMPS.map((at) => (
        <Sequence key={at} name={`Thump ${at}`} from={at} durationInFrames={50} layout="none">
          <Audio src={staticFile("impact.mp3")} volume={0.26} />
        </Sequence>
      ))}
      {SHUTTERS.map((at) => (
        <Sequence key={at} name={`Shutter ${at}`} from={at} durationInFrames={16} layout="none">
          <Audio src={staticFile("shutter.mp3")} volume={0.22} />
        </Sequence>
      ))}

      {/* ---------- picture ---------- */}
      <AbsoluteFill style={{ translate: `${sx}px ${sy}px` }}>
        {/* Cold open — the secret */}
        <Sequence name="The secret" durationInFrames={240}>
          <FootageScene src="g-freddy.mp4" trimBefore={138} playbackRate={0.42} dim={0.14}>
            <div style={{ position: "absolute", left: 130, bottom: LETTERBOX + 60 }}>
              <Stamp delay={24}>An undisclosed office · Present day</Stamp>
            </div>
          </FootageScene>
        </Sequence>
        <Sequence name="We'll get to him" from={240} durationInFrames={120}>
          <FootageScene src="g-freddy.mp4" trimBefore={243} playbackRate={0.5} dim={0.1} />
        </Sequence>
        <Sequence name="Title — The Strand" from={TITLE_HIT} durationInFrames={60}>
          <VideoText text="THE STRAND" src="strike-full.mp4" trimBefore={62} playbackRate={0.65} size={250} offsetY={-30} />
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 330 }}>
            <Rise delay={10}>
              <Caps size={38} color={GOLD_SOFT} tracking="0.62em">
                Invitational
              </Caps>
            </Rise>
          </AbsoluteFill>
        </Sequence>

        {/* 2026, as it happened */}
        <Sequence name="Chapter — Gamble Sands" from={420} durationInFrames={60}>
          <ChapterGambleSands />
        </Sequence>
        <Sequence name="Real — over the Columbia" from={480} durationInFrames={30}>
          <FootageScene src="r-bridge.mp4" dim={0.04} />
        </Sequence>
        <Sequence name="Real — out of the lodge" from={540} durationInFrames={15}>
          <FootageScene src="r-lodge.mp4" trimBefore={20} dim={0.04} />
        </Sequence>
        <Sequence name="Roll call — the field" from={555} durationInFrames={75}>
          <RollCall />
        </Sequence>
        <Sequence name="Real — the walk down" from={630} durationInFrames={30}>
          <FootageScene src="r-walk.mp4" dim={0.04} />
        </Sequence>
        <Sequence name="Real — the tee box" from={660} durationInFrames={30}>
          <FootageScene src="r-teebox.mp4" trimBefore={10} dim={0.04} />
        </Sequence>
        <Sequence name="Real — foursome one" from={720} durationInFrames={15}>
          <FootageScene src="r-selfie1.mp4" dim={0.04} />
        </Sequence>
        <Sequence name="Real — foursome two" from={735} durationInFrames={15}>
          <FootageScene src="r-selfie2.mp4" dim={0.04} />
        </Sequence>
        <Sequence name="Real — shaka" from={750} durationInFrames={30}>
          <FootageScene src="r-laugh.mp4" dim={0.04}>
            <Tag>Morale: high</Tag>
          </FootageScene>
        </Sequence>
        <Sequence name="Real — red sun" from={780} durationInFrames={60}>
          <FootageScene src="r-redsun.mp4" playbackRate={0.55} dim={0.04}>
            <Tag delay={26}>Air quality: questionable</Tag>
          </FootageScene>
        </Sequence>
        <Sequence name="Real — nobody blinked" from={840} durationInFrames={60}>
          <FootageScene src="r-maroon.mp4" dim={0.04} />
        </Sequence>
        <Sequence name="Good swings — three at once" from={900} durationInFrames={60}>
          <Triptych
            panels={[
              { src: "real-swing-b.mp4", trimBefore: 24, ox: 0.62 },
              { src: "real-tee.mp4", ox: 0.58 },
              { src: "r-tee75.mp4", trimBefore: 12, ox: 0.38 },
            ]}
          />
        </Sequence>
        <Sequence name="Word — good swings" from={903} durationInFrames={34}>
          <WordSlam>Good swings.</WordSlam>
        </Sequence>
        <Sequence name="Good swing — the fairway" from={960} durationInFrames={30}>
          <FootageScene src="r-swing09.mp4" trimBefore={12} dim={0.04} />
        </Sequence>
        <Sequence name="Other swing" from={1020} durationInFrames={30}>
          <FootageScene src="g-shot.mp4" trimBefore={143} dim={0.04} />
        </Sequence>
        <Sequence name="Other swing — the bunker" from={1050} durationInFrames={33}>
          <FootageScene src="g-shot.mp4" trimBefore={207} dim={0.04} />
        </Sequence>
        <Sequence name="Word — other swings" from={1052} durationInFrames={30}>
          <WordSlam>Other swings.</WordSlam>
        </Sequence>
        <Sequence name="Real — he saw it" from={1083} durationInFrames={57}>
          <FootageScene src="r-pink.mp4" playbackRate={0.75} dim={0.04}>
            <Tag>Eyewitness</Tag>
          </FootageScene>
        </Sequence>
        <Sequence name="Real — cart selfie" from={1140} durationInFrames={30}>
          <FootageScene src="r-cartselfie.mp4" dim={0.04}>
            <Tag delay={2}>Last known photo of the cart</Tag>
          </FootageScene>
        </Sequence>
        <Sequence name="The cart" from={1170} durationInFrames={45}>
          <FootageScene src="g-cart.mp4" trimBefore={90} dim={0.04} />
        </Sequence>
        <Sequence name="We don't talk about the cart" from={CART_HUSH[0]} durationInFrames={CART_HUSH[1] - CART_HUSH[0]}>
          <AbsoluteFill style={{ filter: "saturate(0.2) contrast(1.12)" }}>
            <FootageScene src="g-stuck.mp4" trimBefore={30} playbackRate={0.6} dim={0.1} />
          </AbsoluteFill>
          <div style={{ position: "absolute", left: 130, bottom: LETTERBOX + 64 }}>
            <Sequence from={18} layout="none">
              <Stamped>Classified</Stamped>
            </Sequence>
          </div>
        </Sequence>
        <Sequence name="The last putt" from={1290} durationInFrames={106}>
          <FootageScene src="cup.mp4" trimBefore={45} dim={0.04} />
        </Sequence>
        {BURSTS.map((b) => (
          <Sequence key={b.at} name={`Photo burst ${b.at}`} from={b.at} durationInFrames={b.at === 1396 ? 44 : b.photos.length * b.per}>
            <Burst photos={b.photos} per={b.per} />
          </Sequence>
        ))}
        <Sequence name="Stat — 4 rounds" from={640} durationInFrames={40}>
          <StatTag value="4" label="Rounds" />
        </Sequence>
        <Sequence name="Stat — 3 courses" from={680} durationInFrames={40}>
          <StatTag value="3" label="Courses" />
        </Sequence>
        <Sequence name="Stat — 75 points" from={722} durationInFrames={56}>
          <StatTag value="75" label="Points on the line" />
        </Sequence>
        <Sequence name="Champions — Team J-Bone" from={1440} durationInFrames={120}>
          <Champions />
        </Sequence>
        <Sequence name="The 2026 field" from={1560} durationInFrames={60}>
          <Archival src="strand26-063.jpg" oy="38%" dim={0.1} />
          <AbsoluteFill
            style={{ background: "linear-gradient(0deg, rgba(7,19,15,0.88) 14%, rgba(7,19,15,0) 52%)" }}
          />
          <div style={{ position: "absolute", left: 130, bottom: LETTERBOX + 56 }}>
            <Rise delay={4}>
              <div style={{ fontFamily: SERIF, fontSize: 64, fontWeight: 700, color: BONE }}>The 2026 field</div>
            </Rise>
            <div style={{ height: 10 }} />
            <Stamp delay={8}>Team J-Bone · Team WIX · Gamble Sands</Stamp>
          </div>
        </Sequence>

        {/* The Commissioner */}
        <Sequence name="One man — the real Fred" from={1620} durationInFrames={90}>
          <OneMan />
        </Sequence>
        <Sequence name="The Commissioner" from={1710} durationInFrames={120}>
          <FootageScene src="g-freddy.mp4" trimBefore={8} dim={0.06}>
            <AbsoluteFill
              style={{ background: "linear-gradient(90deg, rgba(7,19,15,0.82) 0%, rgba(7,19,15,0) 58%)" }}
            />
            <LowerThird name="Fred Geisinger" role="The Commissioner" delay={10} />
          </FootageScene>
        </Sequence>
        <Sequence name="Ledger — nine editions" from={1830} durationInFrames={105}>
          <Ledger />
        </Sequence>
        <Sequence name="Real — the pairings sheet" from={1935} durationInFrames={105}>
          <Ledger />
          <PairingsCard />
        </Sequence>

        {/* Year ten */}
        <Sequence name="Year ten" from={2040} durationInFrames={60}>
          <VideoText text="YEAR TEN" src="g-sunrise.mp4" trimBefore={150} size={330} />
        </Sequence>
        <Sequence name="The envelope" from={2100} durationInFrames={120}>
          <Envelope />
        </Sequence>
        <Sequence name="We asked the Commissioner" from={2220} durationInFrames={90}>
          <FootageScene src="g-freddy.mp4" trimBefore={70} dim={0.08} />
        </Sequence>
        <Sequence name="He declined to comment" from={SILENCE[0]} durationInFrames={SILENCE[1] - SILENCE[0]}>
          <FootageScene src="g-freddy.mp4" trimBefore={243} playbackRate={0.6} dim={0.12}>
            <div style={{ position: "absolute", left: 130, bottom: LETTERBOX + 64 }}>
              <Sequence from={54} layout="none">
                <Stamped>Declined to comment</Stamped>
              </Sequence>
            </div>
          </FootageScene>
        </Sequence>
        <Sequence name="Ten years running" from={SILENCE[1]} durationInFrames={FINAL_HIT - SILENCE[1]}>
          <TenYears />
        </Sequence>
        <Sequence name="2027 — destination unknown" from={FINAL_HIT} durationInFrames={FILM_DURATION - FINAL_HIT}>
          <Finale />
        </Sequence>
      </AbsoluteFill>

      {/* ---------- finishing ---------- */}
      <div
        style={{
          position: "absolute",
          right: 130,
          top: LETTERBOX + 30,
          opacity: interpolate(frame, [430, 450, SILENCE[0] - 20, SILENCE[0]], [0, 0.55, 0.55, 0], clamp),
        }}
      >
        <Caps size={17} tracking="0.4em" color={BONE}>
          The Strand · A film
        </Caps>
      </div>
      <HitFlash at={240} strength={0.25} />
      <HitFlash at={TITLE_HIT} strength={0.85} />
      <HitFlash at={CUP_DROP} strength={0.3} />
      <HitFlash at={FINAL_HIT} strength={0.85} />
      <Grain opacity={0.055} />
      <Vignette strength={0.46} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: LETTERBOX, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: LETTERBOX, background: "#000" }} />
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: interpolate(frame, [FILM_DURATION - 50, FILM_DURATION - 6], [0, 1], clamp),
        }}
      />
    </AbsoluteFill>
  );
};
