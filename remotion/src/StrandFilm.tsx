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
const SERIF = '"Playfair Display", Georgia, serif';

export const BAR = 160;
export const FILM_DURATION = 2850;
const LETTERBOX = 138; // 2.39:1 inside 16:9
const STRIKE = 2 * BAR; // 320 — club meets ball
const CUP_DROP = 7 * BAR; // 1120 — the putt drops
const FINAL_HIT = 16 * BAR; // 2560 — "2027"

const ease = Easing.out(Easing.cubic);

/* ------------------------------------------------------------------ */
/* Narration: clip, start frame, length in frames                      */
/* ------------------------------------------------------------------ */

const NARRATION: Array<{ file: string; at: number; len: number }> = [
  { file: "n-01", at: 30, len: 100 },
  { file: "n-02", at: 172, len: 121 },
  { file: "n-03", at: 556, len: 166 },
  { file: "n-04", at: 806, len: 78 },
  { file: "n-05", at: 1000, len: 59 },
  { file: "n-06", at: 1134, len: 80 },
  { file: "n-07", at: 1452, len: 81 },
  { file: "n-08", at: 1612, len: 80 },
  { file: "n-09", at: 1772, len: 168 },
  { file: "n-10", at: 1975, len: 55 },
  { file: "n-11", at: 2092, len: 62 },
  { file: "n-12a", at: 2252, len: 53 },
  { file: "n-12b", at: 2330, len: 58 },
  { file: "n-13a", at: 2408, len: 57 },
  { file: "n-13b", at: 2486, len: 42 },
  { file: "n-14a", at: 2580, len: 43 },
  { file: "n-14b", at: 2640, len: 72 },
];
const VO_GAIN = 1.6;

/** Score level: full between lines, pulled down under the voice. */
const scoreVolume = (frame: number) => {
  let duck = 0;
  for (const line of NARRATION) {
    duck = Math.max(
      duck,
      interpolate(frame, [line.at - 6, line.at, line.at + line.len, line.at + line.len + 10], [0, 1, 1, 0], clamp),
    );
  }
  const fadeOut = interpolate(frame, [FILM_DURATION - 90, FILM_DURATION - 8], [1, 0], clamp);
  // The cue builds from a quiet first half; lift the early bars so the titles carry.
  const base = interpolate(frame, [0, 1700, 2000], [1.3, 1.3, 0.85], clamp);
  return base * (1 - duck * 0.68) * fadeOut;
};

/* ------------------------------------------------------------------ */
/* Documentary furniture                                               */
/* ------------------------------------------------------------------ */

const Caps: React.FC<{
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
const Rise: React.FC<{ children: React.ReactNode; delay?: number; distance?: number }> = ({
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
const Stamp: React.FC<{ children: string; delay?: number; color?: string }> = ({
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

const FootageScene: React.FC<{
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

const Opening: React.FC = () => (
  <FootageScene src="g-sunrise.mp4" dim={0.16}>
    <div style={{ position: "absolute", left: 130, bottom: LETTERBOX + 60 }}>
      <Stamp delay={18}>The Strand Invitational · Est. 2018</Stamp>
    </div>
    <AbsoluteFill
      style={{ backgroundColor: "#000", opacity: interpolate(useCurrentFrame(), [0, 40], [1, 0], clamp) }}
    />
  </FootageScene>
);

const ChapterGambleSands: React.FC = () => (
  <FootageScene src="flyover.mp4" trimBefore={12} dim={0.2}>
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
      <Stamp delay={26}>Brewster, Washington · August 20–23, 2026</Stamp>
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

/** The Commissioner. `sealed` is the later, darker return to him. */
const Commissioner: React.FC<{ sealed?: boolean }> = ({ sealed = false }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const push = interpolate(frame, [0, durationInFrames], [1, 1.07]);
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      {/* soft, enlarged backdrop from the same portrait */}
      <CanvasImage
        src={staticFile("players/fred.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "50% 25%",
          scale: "1.25",
          filter: `blur(46px) saturate(${sealed ? 0.3 : 0.8}) brightness(${sealed ? 0.3 : 0.5})`,
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
          scale: String(push),
        }}
      >
        <CanvasImage
          src={staticFile("players/fred.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "50% 18%",
            filter: sealed ? "grayscale(1) brightness(0.55) contrast(1.2)" : "saturate(0.92) contrast(1.05)",
          }}
        />
      </div>
      {sealed ? (
        <div style={{ position: "absolute", left: 130, bottom: LETTERBOX + 70 }}>
          <Rise delay={10}>
            <div style={{ fontFamily: SERIF, fontSize: 78, fontWeight: 700, color: BONE, lineHeight: 1 }}>
              Fred Geisinger
            </div>
          </Rise>
          <div style={{ height: 14 }} />
          <Rise delay={18}>
            <Caps size={26} color={GOLD_SOFT}>
              The Commissioner
            </Caps>
          </Rise>
          <div style={{ height: 26 }} />
          <Sequence from={86} layout="none">
            <div
              style={{
                display: "inline-block",
                border: `3px solid ${GOLD_SOFT}`,
                padding: "10px 22px",
                rotate: "-3deg",
                opacity: interpolate(frame, [86, 90], [0, 1], clamp),
                scale: String(interpolate(frame, [86, 94], [1.5, 1], { ...clamp, easing: ease })),
              }}
            >
              <Caps size={30} color={GOLD_SOFT} tracking="0.34em">
                Declined to comment
              </Caps>
            </div>
          </Sequence>
        </div>
      ) : (
        <LowerThird name="Fred Geisinger" role="The Commissioner" delay={22} />
      )}
    </AbsoluteFill>
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

const Ledger: React.FC = () => {
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
          const at = 12 + i * 13;
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
          scale: String(interpolate(frame, [0, BAR], [0.94, 1.03])),
          boxShadow: "0 0 130px rgba(201,162,39,0.4)",
        }}
      />
      <Rise delay={8}>
        <div style={{ fontFamily: SERIF, fontSize: 104, fontWeight: 800, color: BONE, lineHeight: 1 }}>
          The Strand Invitational
        </div>
      </Rise>
      <Sequence from={86} layout="none">
        <Rise>
          <Caps size={40} color={GOLD_SOFT} tracking="0.5em">
            Ten years running
          </Caps>
        </Rise>
      </Sequence>
    </AbsoluteFill>
  );
};

const Finale: React.FC = () => {
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
/* The film                                                            */
/* ------------------------------------------------------------------ */

const SHUTTERS = [560, 680, 720, 840, 1360, 2240];
/** Club-on-ball and the cart landing: one dry hit each, no clip audio. */
const THUMPS = [639, 799, 940, 992];

const shake = (frame: number, at: number, power: number) => {
  const t = frame - at;
  if (t < 0 || t > 18) return [0, 0];
  const d = Math.exp(-t * 0.26) * power;
  return [Math.sin(t * 2.9) * d, Math.cos(t * 3.7) * d * 0.7];
};

const HitFlash: React.FC<{ at: number; strength: number }> = ({ at, strength }) => {
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
  const shakes = [shake(frame, STRIKE, 22), shake(frame, CUP_DROP, 8), shake(frame, FINAL_HIT, 26)];
  const sx = shakes.reduce((a, s) => a + s[0], 0);
  const sy = shakes.reduce((a, s) => a + s[1], 0);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* ---------- sound ---------- */}
      <Audio name="Score" src={staticFile("score.mp3")} volume={scoreVolume(frame)} />
      <Sequence name="Ambience — open" durationInFrames={330} layout="none">
        <Audio
          src={staticFile("dusk-ambience.mp3")}
          volume={interpolate(frame, [0, 30, 280, 325], [0, 0.3, 0.3, 0], clamp)}
        />
      </Sequence>
      <Sequence name="Ambience — the silence" from={2440} durationInFrames={130} layout="none">
        <Audio
          src={staticFile("dusk-ambience.mp3")}
          volume={interpolate(frame, [2440, 2480, 2550, 2566], [0, 0.34, 0.34, 0], clamp)}
        />
      </Sequence>
      {NARRATION.map((line) => (
        <Sequence key={line.file} name={`Narration ${line.file}`} from={line.at} durationInFrames={line.len + 6} layout="none">
          <Audio src={staticFile(`${line.file}.mp3`)} volume={VO_GAIN} />
        </Sequence>
      ))}
      <Sequence name="Impact — strike" from={STRIKE} durationInFrames={110} layout="none">
        <Audio src={staticFile("impact.mp3")} volume={0.6} />
      </Sequence>
      {THUMPS.map((at) => (
        <Sequence key={at} name={`Thump ${at}`} from={at} durationInFrames={50} layout="none">
          <Audio src={staticFile("impact.mp3")} volume={0.28} />
        </Sequence>
      ))}
      <Sequence name="Cup rattle" from={CUP_DROP - 6} durationInFrames={80} layout="none">
        <Audio src={staticFile("cup-rattle.mp3")} volume={0.9} />
      </Sequence>
      <Sequence name="Impact — 2027" from={FINAL_HIT} durationInFrames={110} layout="none">
        <Audio src={staticFile("impact.mp3")} volume={0.6} />
      </Sequence>
      {SHUTTERS.map((at) => (
        <Sequence key={at} name={`Shutter ${at}`} from={at} durationInFrames={16} layout="none">
          <Audio src={staticFile("shutter.mp3")} volume={0.5} />
        </Sequence>
      ))}

      {/* ---------- picture ---------- */}
      <AbsoluteFill style={{ translate: `${sx}px ${sy}px` }}>
        {/* I — nine years */}
        <Sequence name="Opening — dawn" durationInFrames={BAR}>
          <Opening />
        </Sequence>
        <Sequence name="One cup" from={100} durationInFrames={60}>
          <FootageScene src="g-coast.mp4" trimBefore={123} playbackRate={0.7} dim={0.1} />
        </Sequence>
        <Sequence name="The road in" from={BAR} durationInFrames={110}>
          <FootageScene src="convoy.mp4" playbackRate={0.94} dim={0.2} />
        </Sequence>
        <Sequence name="Strike — approach" from={270} durationInFrames={50}>
          <FootageScene src="g-round.mp4" trimBefore={30} playbackRate={0.58} dim={0.05} />
        </Sequence>
        <Sequence name="Strike — impact" from={STRIKE} durationInFrames={32}>
          <FootageScene src="strike-full.mp4" trimBefore={37} volume={0.7} dim={0} />
        </Sequence>
        <Sequence name="Title — The Strand" from={352} durationInFrames={128}>
          <VideoText text="THE STRAND" src="strike-full.mp4" trimBefore={62} playbackRate={0.65} size={250} offsetY={-30} />
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 330 }}>
            <Rise delay={22}>
              <Caps size={38} color={GOLD_SOFT} tracking="0.62em">
                Invitational
              </Caps>
            </Rise>
          </AbsoluteFill>
        </Sequence>

        {/* II — 2026, as it happened */}
        <Sequence name="Chapter — Gamble Sands" from={3 * BAR} durationInFrames={80}>
          <ChapterGambleSands />
        </Sequence>
        <Sequence name="The walk in" from={560} durationInFrames={40}>
          <Archival src="strand26-015.jpg" oy="42%" from={1.05} to={1.12} />
        </Sequence>
        <Sequence name="Real swing — hazy morning" from={600} durationInFrames={80}>
          <FootageScene src="real-swing-a.mp4" dim={0.04} />
        </Sequence>
        <Sequence name="High desert" from={680} durationInFrames={40}>
          <Archival src="strand26-023.jpg" from={1.05} to={1.12} />
        </Sequence>
        <Sequence name="Three courses" from={720} durationInFrames={40}>
          <Archival src="strand26-032.jpg" from={1.05} to={1.12} />
        </Sequence>
        <Sequence name="Real swing — under the clouds" from={760} durationInFrames={80}>
          <FootageScene src="real-swing-b.mp4" dim={0.04} />
        </Sequence>
        <Sequence name="The swing" from={840} durationInFrames={40}>
          <Archival src="strand26-067.jpg" ox="55%" oy="35%" from={1.05} to={1.12} />
        </Sequence>
        <Sequence name="Cart path optional" from={880} durationInFrames={105}>
          <FootageScene src="g-cart.mp4" trimBefore={60} dim={0.04} />
        </Sequence>
        <Sequence name="Stat — 20 players" from={558} durationInFrames={36}>
          <StatTag value="20" label="Players" />
        </Sequence>
        <Sequence name="Stat — 4 rounds" from={594} durationInFrames={40}>
          <StatTag value="4" label="Rounds" />
        </Sequence>
        <Sequence name="Stat — 3 courses" from={634} durationInFrames={110}>
          <StatTag value="3" label="Courses" />
        </Sequence>
        <Sequence name="Stat — 75 points" from={806} durationInFrames={74}>
          <StatTag value="75" label="Points on the line" />
        </Sequence>
        <Sequence name="The last putt" from={985} durationInFrames={234}>
          <FootageScene src="g-round.mp4" trimBefore={66} dim={0.04} />
        </Sequence>
        <Sequence name="Champions — Team J-Bone" from={1219} durationInFrames={141}>
          <Champions />
        </Sequence>
        <Sequence name="The 2026 field" from={1360} durationInFrames={80}>
          <Archival src="strand26-063.jpg" oy="38%" dim={0.1} />
          <AbsoluteFill
            style={{ background: "linear-gradient(0deg, rgba(7,19,15,0.88) 14%, rgba(7,19,15,0) 52%)" }}
          />
          <div style={{ position: "absolute", left: 130, bottom: LETTERBOX + 56 }}>
            <Rise delay={6}>
              <div style={{ fontFamily: SERIF, fontSize: 64, fontWeight: 700, color: BONE }}>The 2026 field</div>
            </Rise>
            <div style={{ height: 10 }} />
            <Stamp delay={14}>Team J-Bone · Team WIX · Gamble Sands</Stamp>
          </div>
        </Sequence>

        {/* III — the commissioner */}
        <Sequence name="The trophy dinner" from={9 * BAR} durationInFrames={BAR}>
          <FootageScene src="g-dinner.mp4" trimBefore={140} playbackRate={0.98} dim={0.1} />
        </Sequence>
        <Sequence name="The Commissioner" from={10 * BAR} durationInFrames={BAR}>
          <FootageScene src="g-desk.mp4" trimBefore={30} dim={0.08}>
            <AbsoluteFill
              style={{ background: "linear-gradient(90deg, rgba(7,19,15,0.82) 0%, rgba(7,19,15,0) 58%)" }}
            />
            <LowerThird name="Fred Geisinger" role="The Commissioner" delay={22} />
          </FootageScene>
        </Sequence>
        <Sequence name="Ledger — nine editions" from={11 * BAR} durationInFrames={200}>
          <Ledger />
        </Sequence>

        {/* IV — year ten */}
        <Sequence name="Year ten" from={1960} durationInFrames={120}>
          <VideoText text="YEAR TEN" src="g-sunrise.mp4" trimBefore={150} size={330} />
        </Sequence>
        <Sequence name="The envelope" from={13 * BAR} durationInFrames={BAR}>
          <Envelope />
        </Sequence>
        <Sequence name="Declined to comment" from={14 * BAR} durationInFrames={BAR}>
          <Commissioner sealed />
        </Sequence>
        <Sequence name="Ten years running" from={15 * BAR} durationInFrames={BAR}>
          <TenYears />
        </Sequence>
        <Sequence name="2027 — destination unknown" from={FINAL_HIT} durationInFrames={FILM_DURATION - FINAL_HIT}>
          <Finale />
        </Sequence>
      </AbsoluteFill>

      {/* ---------- finishing ---------- */}
      <HitFlash at={STRIKE} strength={0.85} />
      <HitFlash at={CUP_DROP} strength={0.3} />
      <HitFlash at={FINAL_HIT} strength={0.85} />
      <Grain opacity={0.055} />
      <Vignette strength={0.46} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: LETTERBOX, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: LETTERBOX, background: "#000" }} />
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: interpolate(frame, [FILM_DURATION - 60, FILM_DURATION - 6], [0, 1], clamp),
        }}
      />
    </AbsoluteFill>
  );
};
