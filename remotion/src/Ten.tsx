import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, CanvasImage, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain, Vignette } from "./Cinematic";
import { Photo, SlowPlate } from "./Decade";
import { BONE, FONT, GOLD_SOFT, INK, clamp } from "./Kinetic";
import { Caps, FootageScene, Rise, SERIF, Tag, ease } from "./StrandFilm";

/** Slim bars: wide enough to feel like cinema, thin enough to keep heads in frame. */
const LETTERBOX = 62;
import timeline from "./ten-timeline.json";

/**
 * TEN YEARS OF GLORY, DISGRACE & QUESTIONABLE DECISIONS — the mockumentary.
 * Everything is laid out by scripts/build_ten.py from the narration recordings:
 * this file only knows how to draw each kind of shot.
 */

export const TEN_DURATION = timeline.total;

type Shot = {
  from: number;
  len: number;
  t: string;
  src?: string;
  srcs?: string[];
  op?: string;
  zoom?: number;
  org?: string;
  tr?: string;
  tall?: boolean;
  trim?: number;
  rate?: number;
  tag?: string;
  oy?: string;
  cover?: boolean;
  name?: string;
  sub?: string;
  kicker?: string;
  title?: string;
  foot?: string;
  drama?: boolean;
  vol?: number;
};
const SHOTS = timeline.shots as Shot[];
const AUDIO = timeline.audio as Array<{ file: string; at: number; len: number; kind: string }>;
const MUSIC = timeline.music as Array<{ file: string; from: number; to: number; offset: number; vol: number }>;
const LYRICS = timeline.lyrics as Array<{ text: string; from: number; len: number }>;
const SUBS = timeline.subs as Array<{ text: string; from: number; len: number }>;

/** A generated plate, pushed in slowly like a rostrum camera. */
const Still: React.FC<{ src: string; index: number; tag?: string }> = ({ src, index, tag }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const out = index % 2 === 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <CanvasImage
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "contrast(1.05) saturate(1.04)",
          scale: String(interpolate(frame, [0, durationInFrames], out ? [1.04, 1.13] : [1.13, 1.04])),
          translate: `${interpolate(frame, [0, durationInFrames], out ? [0, -14] : [-14, 0])}px 0px`,
        }}
      />
      {tag ? <Tag delay={6}>{tag}</Tag> : null}
    </AbsoluteFill>
  );
};

/** A wide photo held where the faces are, easing out a touch so nobody's head leaves the frame. */
const WidePhoto: React.FC<{ src: string; oy?: string; org?: string; tag?: string }> = ({ src, oy, org, tag }) => {
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
          objectPosition: `50% ${oy ?? "40%"}`,
          transformOrigin: org ?? "50% 45%",
          scale: String(interpolate(frame, [0, durationInFrames], [1.06, 1.0], { ...clamp, easing: ease })),
          filter: "contrast(1.07) saturate(1.06)",
        }}
      />
      <AbsoluteFill style={{ backgroundColor: "#fff6df", opacity: interpolate(frame, [0, 2], [0.5, 0], clamp) }} />
      {tag ? <Tag delay={1}>{tag}</Tag> : null}
    </AbsoluteFill>
  );
};

type Fit = { op?: string; zoom?: number; org?: string; tr?: string };
const FaceCard: React.FC<{ src: string; name: string; sub: string; index: number; fit: Fit }> = ({ src, name, sub, index, fit }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <CanvasImage
        src={staticFile(src)}
        style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", filter: "blur(36px) brightness(0.38) saturate(0.8)", scale: "1.2" }}
      />
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 76 }}>
        <div
          style={{
            width: 560,
            height: 860,
            overflow: "hidden",
            border: "6px solid #f4f2ea",
            boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
            rotate: `${(index % 2 === 0 ? -1 : 1) * 0.8}deg`,
            scale: String(interpolate(frame, [0, durationInFrames], [1.0, 1.04])),
          }}
        >
          <CanvasImage
            src={staticFile(src)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: fit.op ?? "50% 22%",
              transformOrigin: fit.org ?? "50% 40%",
              translate: fit.tr ?? "0px 0px",
              scale: String(fit.zoom ?? 1),
            }}
          />
        </div>
        <div style={{ width: 800 }}>
          <Rise delay={4}>
            <Caps size={26} color={GOLD_SOFT} tracking="0.36em">
              {sub}
            </Caps>
          </Rise>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: Math.min(150, Math.round(1900 / name.length)),
              fontWeight: 900,
              fontStyle: "italic",
              color: BONE,
              lineHeight: 1.08,
              opacity: interpolate(frame, [0, 6], [0, 1], clamp),
              translate: `${interpolate(frame, [0, 12], [40, 0], { ...clamp, easing: ease })}px 0px`,
            }}
          >
            {name}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Tall phone clips side by side, so three swings fill the frame instead of one sitting in a pillarbox. */
const Tri: React.FC<{ srcs: string[] }> = ({ srcs }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const w = srcs.length === 3 ? 600 : 800;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0f0d", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 18 }}>
      {srcs.map((src, i) => {
        const at = i * 4;
        return (
          <div
            key={src}
            style={{
              width: w,
              height: 900,
              overflow: "hidden",
              border: "4px solid #f4f2ea",
              boxShadow: "0 18px 60px rgba(0,0,0,0.6)",
              opacity: interpolate(frame, [at, at + 4], [0, 1], clamp),
              translate: `0px ${interpolate(frame, [at, at + 9], [(i % 2 === 0 ? 1 : -1) * 46, 0], { ...clamp, easing: ease })}px`,
            }}
          >
            <Video
              src={staticFile(src)}
              volume={0}
              style={{ width: "100%", height: "100%", objectFit: "cover", scale: String(interpolate(frame, [0, durationInFrames], [1.02, 1.08])) }}
            />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Card: React.FC<{ kicker?: string; title?: string; sub?: string; foot?: string }> = ({ kicker, title, sub, foot }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fade = interpolate(frame, [0, 8, durationInFrames - 8, durationInFrames], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", alignItems: "center", justifyContent: "center", gap: 22, opacity: fade, padding: "0 140px" }}>
      <AbsoluteFill style={{ background: "radial-gradient(55% 55% at 50% 48%, rgba(201,162,39,0.16) 0%, rgba(0,0,0,0) 72%)" }} />
      {kicker ? (
        <Caps size={28} color={GOLD_SOFT} tracking="0.46em">
          {kicker}
        </Caps>
      ) : null}
      {title ? (
        <div
          style={{
            fontFamily: SERIF,
            fontSize: Math.min(170, Math.round(3300 / title.length)),
            fontWeight: 900,
            fontStyle: "italic",
            color: BONE,
            lineHeight: 1.04,
            textAlign: "center",
            scale: String(interpolate(frame, [0, durationInFrames], [1, 1.04])),
          }}
        >
          {title}
        </div>
      ) : null}
      {sub ? (
        <Rise delay={12}>
          <div style={{ fontFamily: SERIF, fontSize: title ? 46 : 96, fontWeight: 700, fontStyle: "italic", color: title ? GOLD_SOFT : BONE, textAlign: "center", lineHeight: 1.15 }}>
            {sub}
          </div>
        </Rise>
      ) : null}
      {foot ? (
        <Rise delay={60}>
          <div style={{ fontFamily: FONT, fontSize: 24, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(244,242,234,0.6)", marginTop: 26 }}>
            {foot}
          </div>
        </Rise>
      ) : null}
    </AbsoluteFill>
  );
};

const LEDGER: Array<[string, string]> = [
  ["Tee times (negotiated)", "$4,212.00"],
  ["Lodging", "$6,930.00"],
  ["Vans × 3", "$1,118.40"],
  ["Beer", "$1,347.19"],
  ["Breakfast burritos", "$212.50"],
  ["Pizza", "$284.83"],
  ["Savings secured by the Commissioner", "– $7.43"],
];

/** The Commissioner's books. Only the pizza line is on the record. */
const Sheet: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1512", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: 1180,
          scale: String(interpolate(frame, [0, durationInFrames], [1, 1.18])),
          transformOrigin: "50% 78%",
          fontFamily: FONT,
        }}
      >
        <Caps size={24} color={GOLD_SOFT} tracking="0.4em">
          Strand Invitational · Consolidated expenses
        </Caps>
        <div style={{ height: 16 }} />
        {LEDGER.map(([label, amount], i) => {
          const hot = label === "Pizza";
          return (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "11px 18px",
                fontSize: 36,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: hot ? "#07130f" : BONE,
                background: hot ? GOLD_SOFT : i % 2 === 0 ? "rgba(244,242,234,0.05)" : "transparent",
                fontWeight: hot ? 800 : 500,
                borderBottom: "1px solid rgba(244,242,234,0.14)",
                opacity: interpolate(frame, [i * 5, i * 5 + 8], [0, 1], clamp),
              }}
            >
              <span>{label}</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{amount}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Drew's own words, as he wrote them, under his own voice. */
const Lyric: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        right: 120,
        bottom: LETTERBOX + 34,
        textAlign: "center",
        fontFamily: SERIF,
        fontSize: 58,
        fontStyle: "italic",
        fontWeight: 900,
        color: GOLD_SOFT,
        textShadow: "0 3px 22px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.95)",
        opacity: interpolate(frame, [0, 4, durationInFrames - 4, durationInFrames], [0, 1, 1, 0], clamp),
        translate: `0px ${interpolate(frame, [0, 6], [14, 0], { ...clamp, easing: ease })}px`,
      }}
    >
      {`♪ ${text} ♪`}
    </div>
  );
};

const musicVolume = (frame: number, seg: (typeof MUSIC)[number]) => {
  let duck = 1;
  for (const a of AUDIO) {
    const d = interpolate(frame, [a.at - 8, a.at, a.at + a.len, a.at + a.len + 14], [1, 0.3, 0.3, 1], clamp);
    duck = Math.min(duck, d);
  }
  const edge = interpolate(frame, [seg.from, seg.from + 18, seg.to - 26, seg.to], [0, 1, 1, 0], clamp);
  return seg.vol * duck * edge;
};

export const Ten: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {MUSIC.map((seg) => (
        <Sequence key={`${seg.file}-${seg.from}`} name={`Music ${seg.file}`} from={seg.from} durationInFrames={seg.to - seg.from} layout="none">
          <Audio src={staticFile(seg.file)} trimBefore={seg.offset} volume={musicVolume(frame, seg)} />
        </Sequence>
      ))}
      {AUDIO.map((a) => (
        <Sequence key={`${a.file}-${a.at}`} name={`Voice ${a.file}`} from={a.at} durationInFrames={a.len + 8} layout="none">
          <Audio src={staticFile(a.file)} volume={a.kind === "N" ? 1.55 : 1.35} />
        </Sequence>
      ))}

      {SHOTS.map((s, i) => (
        <Sequence key={`${s.from}-${i}`} name={`${s.t} ${s.src ?? s.title ?? ""}`} from={s.from} durationInFrames={s.len}>
          {s.t === "v" ? (
            <FootageScene src={s.src ?? ""} trimBefore={s.trim ?? 0} playbackRate={s.rate ?? 1} volume={s.vol ?? 0} dim={0.02}>
              {s.tag ? <Tag delay={4}>{s.tag}</Tag> : null}
            </FootageScene>
          ) : s.t === "p" && !s.tall ? (
            <WidePhoto src={s.src ?? ""} oy={s.oy} org={s.org} tag={s.tag} />
          ) : s.t === "p" ? (
            <Photo shot={{ src: s.src ?? "", oy: s.oy, tag: s.tag, cover: s.cover }} index={i} />
          ) : s.t === "ps" ? (
            <SlowPlate src={s.src ?? ""} bright={0.86} />
          ) : s.t === "a" ? (
            <Still src={s.src ?? ""} index={i} tag={s.tag} />
          ) : s.t === "f" ? (
            <FaceCard src={s.src ?? ""} name={s.name ?? ""} sub={s.sub ?? ""} index={i} fit={s} />
          ) : s.t === "c" ? (
            <Card kicker={s.kicker} title={s.title} sub={s.sub} foot={s.foot} />
          ) : s.t === "sheet" ? (
            <Sheet />
          ) : s.t === "tri" ? (
            <Tri srcs={s.srcs ?? []} />
          ) : (
            <AbsoluteFill style={{ backgroundColor: "#000" }} />
          )}
          {s.drama ? (
            <div style={{ position: "absolute", right: 130, top: LETTERBOX + 34, padding: "8px 14px", border: "2px solid rgba(244,242,234,0.7)" }}>
              <Caps size={20} color={BONE} tracking="0.3em">
                Dramatization
              </Caps>
            </div>
          ) : null}
        </Sequence>
      ))}

      {SUBS.map((sub) => (
        <Sequence key={sub.from} name={`Line — ${sub.text}`} from={sub.from} durationInFrames={sub.len} layout="none">
          <div
            style={{
              position: "absolute",
              left: 160,
              right: 160,
              bottom: LETTERBOX + 40,
              textAlign: "center",
              fontFamily: SERIF,
              fontSize: 54,
              fontStyle: "italic",
              fontWeight: 700,
              color: BONE,
              textShadow: "0 3px 24px rgba(0,0,0,0.95), 0 0 3px rgba(0,0,0,0.95)",
            }}
          >
            {`“${sub.text}”`}
          </div>
        </Sequence>
      ))}

      {LYRICS.map((l) => (
        <Sequence key={l.from} name={`Lyric — ${l.text}`} from={l.from} durationInFrames={l.len} layout="none">
          <Lyric text={l.text} />
        </Sequence>
      ))}

      <Grain opacity={0.05} />
      <Vignette strength={0.4} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: LETTERBOX, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: LETTERBOX, background: "#000" }} />
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: interpolate(frame, [0, 30], [1, 0], clamp) }} />
    </AbsoluteFill>
  );
};
