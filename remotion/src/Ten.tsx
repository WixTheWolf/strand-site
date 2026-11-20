import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, CanvasImage, Freeze, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain, Vignette } from "./Cinematic";
import { Photo, SlowPlate } from "./Decade";
import { BONE, FONT, GOLD_SOFT, INK, clamp } from "./Kinetic";
import { FootageScene, SERIF, ease } from "./StrandFilm";
import timeline from "./ten-timeline.json";

/**
 * THE STRAND — the ten-year film, cut as a sports documentary.
 * scripts/build_ten.py lays everything out from the narration recordings and the
 * score's beat grid; this file only knows how to draw each kind of shot.
 */

export const TEN_DURATION = timeline.total;

const BAR = 62; // slim bars: cinema without hiding heads
const RED = "#c8102e";

type Fit = { op?: string; zoom?: number; org?: string; tr?: string };
type Shot = Fit & {
  from: number;
  len: number;
  t: string;
  src?: string;
  srcs?: string[];
  trim?: number;
  rate?: number;
  vol?: number;
  tag?: string;
  oy?: string;
  tall?: boolean;
  name?: string;
  role?: string;
  kicker?: string;
  title?: string;
  sub?: string;
  value?: string;
  label?: string;
  who?: string;
  re?: boolean;
  replay?: boolean;
  freeze?: boolean;
  lines?: string[];
};
const SHOTS = timeline.shots as Shot[];
const AUDIO = timeline.audio as Array<{ file: string; at: number; len: number; kind: string }>;
const MUSIC = timeline.music as Array<{ file: string; from: number; to: number; offset: number; vol: number; cut?: boolean }>;
const SFX = timeline.sfx as Array<{ file: string; at: number; vol: number }>;
const SUBS = timeline.subs as Array<{ text: string; from: number; len: number }>;
const LYRICS = timeline.lyrics as Array<{ text: string; from: number; len: number }>;
const HUSH = timeline.hush as number[][];

const caps = (size: number, weight = 800, tracking = "0.06em"): React.CSSProperties => ({
  fontFamily: FONT,
  fontSize: size,
  fontWeight: weight,
  letterSpacing: tracking,
  textTransform: "uppercase",
  lineHeight: 1,
});

/** Broadcast lower third: red slab, name, role. */
const LowerThird: React.FC<{ name: string; role?: string; delay?: number }> = ({ name, role, delay = 6 }) => {
  const frame = useCurrentFrame();
  const wipe = interpolate(frame, [delay, delay + 9], [0, 100], { ...clamp, easing: ease });
  return (
    <div style={{ position: "absolute", left: 110, bottom: BAR + 70, clipPath: `inset(0 ${100 - wipe}% 0 0)` }}>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <div style={{ width: 12, background: RED }} />
        <div style={{ background: "rgba(8,8,8,0.9)", padding: "16px 30px 18px 22px" }}>
          <div style={{ ...caps(58, 900, "0.02em"), color: "#fff" }}>{name}</div>
          {role ? <div style={{ ...caps(24, 600, "0.22em"), color: GOLD_SOFT, marginTop: 10 }}>{role}</div> : null}
        </div>
      </div>
    </div>
  );
};

/** Location / date stamp, bottom left, like archive footage in a doc. */
const Stamp: React.FC<{ children: string }> = ({ children }) => {
  const frame = useCurrentFrame();
  const n = Math.round(interpolate(frame, [3, 3 + children.length * 0.7], [0, children.length], clamp));
  return (
    <div style={{ position: "absolute", left: 110, bottom: BAR + 54, ...caps(30, 700, "0.2em"), color: "#fff", textShadow: "0 2px 14px rgba(0,0,0,0.9)" }}>
      <span style={{ borderLeft: `6px solid ${RED}`, paddingLeft: 16 }}>{children.slice(0, n)}</span>
    </div>
  );
};

const Corner: React.FC<{ children: string }> = ({ children }) => (
  <div style={{ position: "absolute", right: 110, top: BAR + 34, padding: "9px 16px", background: "rgba(8,8,8,0.82)", ...caps(20, 700, "0.26em"), color: "#fff" }}>{children}</div>
);

const WidePhoto: React.FC<{ s: Shot }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: INK, overflow: "hidden" }}>
      <CanvasImage
        src={staticFile(s.src ?? "")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `50% ${s.oy ?? "40%"}`,
          transformOrigin: s.org ?? "50% 45%",
          scale: String(interpolate(frame, [0, durationInFrames], [1.07, 1.0], { ...clamp, easing: ease })),
          filter: "contrast(1.1) saturate(1.05)",
        }}
      />
      <AbsoluteFill style={{ backgroundColor: "#fff", opacity: interpolate(frame, [0, 3], [0.45, 0], clamp) }} />
    </AbsoluteFill>
  );
};

/** A generated plate, pushed in slowly; always flagged as a reenactment. */
const Still: React.FC<{ src: string; index: number }> = ({ src, index }) => {
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
          filter: "contrast(1.06)",
          scale: String(interpolate(frame, [0, durationInFrames], out ? [1.04, 1.14] : [1.14, 1.04])),
        }}
      />
    </AbsoluteFill>
  );
};

const Portrait: React.FC<{ src: string; fit: Fit; w: number; h: number }> = ({ src, fit, w, h }) => (
  <div style={{ width: w, height: h, overflow: "hidden", flexShrink: 0 }}>
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
);

/** Player introduction or interview: the face fills the left of frame, block capitals name him. */
const FaceCard: React.FC<{ s: Shot; quote?: boolean }> = ({ s, quote }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const name = s.name ?? "";
  return (
    <AbsoluteFill style={{ backgroundColor: "#060606", overflow: "hidden" }}>
      <CanvasImage
        src={staticFile(s.src ?? "")}
        style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", filter: "blur(40px) brightness(0.32) saturate(0.7)", scale: "1.25" }}
      />
      <div
        style={{
          position: "absolute",
          left: quote ? 170 : 250,
          top: (1080 - 860) / 2,
          boxShadow: "0 30px 90px rgba(0,0,0,0.75)",
          scale: String(interpolate(frame, [0, durationInFrames], [1.0, 1.05])),
          transformOrigin: "50% 60%",
        }}
      >
        <Portrait src={s.src ?? ""} fit={s} w={560} h={860} />
      </div>
      <div style={{ position: "absolute", left: quote ? 800 : 880, right: 110, top: quote ? 200 : 0, bottom: quote ? undefined : 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ width: interpolate(frame, [2, 12], [0, 140], { ...clamp, easing: ease }), height: 10, background: RED, marginBottom: 26 }} />
        <div
          style={{
            ...caps(Math.min(quote ? 96 : 150, Math.round((quote ? 1100 : 1500) / Math.max(6, name.length))), 900, "0.01em"),
            color: "#fff",
            translate: `${interpolate(frame, [0, 10], [50, 0], { ...clamp, easing: ease })}px 0px`,
            opacity: interpolate(frame, [0, 5], [0, 1], clamp),
          }}
        >
          {name}
        </div>
        <div style={{ ...caps(quote ? 26 : 30, 600, "0.24em"), color: GOLD_SOFT, marginTop: 20, lineHeight: 1.4, opacity: interpolate(frame, [8, 14], [0, 1], clamp) }}>{s.role}</div>
      </div>
      {quote ? <Corner>Reenactment · voiced by an actor</Corner> : null}
    </AbsoluteFill>
  );
};

/** Tall phone clips side by side, so three swings fill the frame. */
const Tri: React.FC<{ srcs: string[] }> = ({ srcs }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#060606", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 14 }}>
      {srcs.map((src, i) => (
        <div
          key={src}
          style={{
            width: 610,
            height: 930,
            overflow: "hidden",
            opacity: interpolate(frame, [i * 3, i * 3 + 3], [0, 1], clamp),
            translate: `0px ${interpolate(frame, [i * 3, i * 3 + 8], [(i % 2 === 0 ? 1 : -1) * 40, 0], { ...clamp, easing: ease })}px`,
          }}
        >
          <Video src={staticFile(src)} volume={0} style={{ width: "100%", height: "100%", objectFit: "cover", scale: String(interpolate(frame, [0, durationInFrames], [1.02, 1.08])) }} />
        </div>
      ))}
    </AbsoluteFill>
  );
};

/** Chapter slam: black, white block capitals, one red rule. Lands on the beat with the boom. */
const Title: React.FC<{ s: Shot }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const hit = interpolate(frame, [0, 5], [1.5, 1], { ...clamp, easing: ease });
  const shake = frame < 8 ? Math.sin(frame * 2.4) * (8 - frame) * 0.9 : 0;
  const title = s.title ?? "";
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", alignItems: "center", justifyContent: "center", opacity: interpolate(frame, [durationInFrames - 5, durationInFrames], [1, 0], clamp) }}>
      <AbsoluteFill style={{ background: "radial-gradient(60% 60% at 50% 50%, rgba(200,16,46,0.2) 0%, rgba(0,0,0,0) 70%)" }} />
      {s.kicker ? <div style={{ ...caps(30, 700, "0.5em"), color: GOLD_SOFT, marginBottom: 30, opacity: interpolate(frame, [4, 10], [0, 1], clamp) }}>{s.kicker}</div> : null}
      <div
        style={{
          ...caps(Math.min(250, Math.round(2500 / Math.max(6, title.length))), 900, "-0.01em"),
          color: "#fff",
          scale: String(hit * interpolate(frame, [5, durationInFrames], [1, 1.05])),
          translate: `${shake}px 0px`,
          textAlign: "center",
          padding: "0 80px",
        }}
      >
        {title}
      </div>
      <div style={{ width: interpolate(frame, [5, 16], [0, 520], { ...clamp, easing: ease }), height: 12, background: RED, marginTop: 34 }} />
      {s.sub ? <div style={{ ...caps(36, 600, "0.3em"), color: BONE, marginTop: 34, opacity: interpolate(frame, [14, 22], [0, 1], clamp) }}>{s.sub}</div> : null}
      <AbsoluteFill style={{ backgroundColor: "#fff", opacity: interpolate(frame, [0, 4], [0.7, 0], clamp) }} />
    </AbsoluteFill>
  );
};

/** Scoreboard stat: one enormous number, what it measures, who owns it. */
const Stat: React.FC<{ s: Shot }> = ({ s }) => {
  const frame = useCurrentFrame();
  const value = s.value ?? "";
  return (
    <AbsoluteFill style={{ backgroundColor: "#070707", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "linear-gradient(115deg, rgba(200,16,46,0.28) 0%, rgba(0,0,0,0) 46%)" }} />
      {s.src ? (
        <div style={{ position: "absolute", right: 150, top: 150, opacity: interpolate(frame, [3, 9], [0, 1], clamp) }}>
          <Portrait src={s.src} fit={s} w={500} h={780} />
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 130, top: 0, bottom: 0, width: s.src ? 1060 : 1660, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div
          style={{
            ...caps(Math.min(430, Math.round(1500 / Math.max(2, value.length))), 900, "-0.03em"),
            color: "#fff",
            scale: String(interpolate(frame, [0, 5], [1.35, 1], { ...clamp, easing: ease })),
            transformOrigin: "0% 60%",
          }}
        >
          {value}
        </div>
        <div style={{ width: interpolate(frame, [3, 12], [0, 300], { ...clamp, easing: ease }), height: 12, background: RED, margin: "26px 0" }} />
        <div style={{ ...caps(62, 800, "0.03em"), color: "#fff", lineHeight: 1.08, opacity: interpolate(frame, [4, 9], [0, 1], clamp) }}>{s.label}</div>
        {s.who ? <div style={{ ...caps(34, 600, "0.26em"), color: GOLD_SOFT, marginTop: 22, opacity: interpolate(frame, [8, 14], [0, 1], clamp) }}>{s.who}</div> : null}
      </div>
      <AbsoluteFill style={{ backgroundColor: "#fff", opacity: interpolate(frame, [0, 3], [0.55, 0], clamp) }} />
    </AbsoluteFill>
  );
};

/** Year by year: the picture, the year huge beside the city. */
const City: React.FC<{ s: Shot }> = ({ s }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {s.src ? s.tall ? <Photo shot={{ src: s.src }} index={0} /> : <WidePhoto s={s} /> : null}
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0) 46%)" }} />
      <div style={{ position: "absolute", left: 110, bottom: BAR + 56, display: "flex", alignItems: "flex-end", gap: 30 }}>
        <div style={{ ...caps(190, 900, "-0.02em"), color: "#fff", scale: String(interpolate(frame, [0, 4], [1.3, 1], { ...clamp, easing: ease })), transformOrigin: "0% 100%" }}>{s.value}</div>
        <div style={{ paddingBottom: 22 }}>
          <div style={{ width: 120, height: 10, background: RED, marginBottom: 16 }} />
          <div style={{ ...caps(54, 800, "0.08em"), color: "#fff" }}>{s.label}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Footage, optionally frozen on a frame or run back as a slow-motion replay with the numbers. */
const Clip: React.FC<{ s: Shot }> = ({ s }) => {
  const frame = useCurrentFrame();
  const body = <FootageScene src={s.src ?? ""} trimBefore={s.trim ?? 0} playbackRate={s.rate ?? 1} volume={s.vol ?? 0} dim={0.02} />;
  if (s.freeze) {
    return (
      <AbsoluteFill style={{ backgroundColor: "#000" }}>
        <AbsoluteFill style={{ filter: "grayscale(0.85) contrast(1.2)", scale: String(interpolate(frame, [0, s.len], [1.0, 1.08])) }}>
          <Freeze frame={0}>{body}</Freeze>
        </AbsoluteFill>
        <AbsoluteFill style={{ border: "18px solid #fff", opacity: 0.92 }} />
        <AbsoluteFill style={{ backgroundColor: "#fff", opacity: interpolate(frame, [0, 5], [0.95, 0], clamp) }} />
        {s.name ? <LowerThird name={s.name} role={s.role} delay={4} /> : null}
      </AbsoluteFill>
    );
  }
  const lines = s.lines ?? [];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {body}
      {s.replay ? (
        <>
          <div style={{ position: "absolute", left: 110, top: BAR + 34, display: "flex", alignItems: "center", gap: 14, padding: "10px 20px", background: RED }}>
            <div style={{ width: 18, height: 18, borderRadius: 9, background: "#fff", opacity: frame % 20 < 12 ? 1 : 0.2 }} />
            <div style={{ ...caps(30, 900, "0.2em"), color: "#fff" }}>Replay</div>
          </div>
          <div style={{ position: "absolute", right: 110, bottom: BAR + 60, display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
            {lines.map((line, i) => {
              const at = Math.round(((i + 1) * s.len) / (lines.length + 1.2));
              return (
                <div
                  key={line}
                  style={{
                    padding: "12px 22px",
                    background: "rgba(8,8,8,0.9)",
                    borderRight: `10px solid ${RED}`,
                    ...caps(46, 900, "0.06em"),
                    color: "#fff",
                    opacity: interpolate(frame, [at, at + 3], [0, 1], clamp),
                    translate: `${interpolate(frame, [at, at + 7], [60, 0], { ...clamp, easing: ease })}px 0px`,
                  }}
                >
                  {line}
                </div>
              );
            })}
          </div>
        </>
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
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 1240, scale: String(interpolate(frame, [0, durationInFrames], [1, 1.14])), transformOrigin: "50% 80%", fontFamily: FONT }}>
        <div style={{ ...caps(26, 700, "0.3em"), color: GOLD_SOFT, marginBottom: 18 }}>Strand Invitational · Consolidated expenses</div>
        {LEDGER.map(([label, amount], i) => {
          const hot = label.startsWith("Savings");
          return (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 18px",
                ...caps(36, hot ? 900 : 500, "0.05em"),
                color: "#fff",
                background: hot ? RED : i % 2 === 0 ? "rgba(255,255,255,0.06)" : "transparent",
                borderBottom: "1px solid rgba(255,255,255,0.14)",
                opacity: interpolate(frame, [i * 3, i * 3 + 5], [0, 1], clamp),
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

const Card: React.FC<{ s: Shot }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fade = interpolate(frame, [0, 6, durationInFrames - 6, durationInFrames], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", alignItems: "center", justifyContent: "center", gap: 22, opacity: fade, padding: "0 140px" }}>
      {s.kicker ? <div style={{ ...caps(30, 700, "0.44em"), color: GOLD_SOFT }}>{s.kicker}</div> : null}
      {s.title ? <div style={{ ...caps(Math.min(170, Math.round(2600 / s.title.length)), 900, "0em"), color: "#fff", textAlign: "center", lineHeight: 1.05 }}>{s.title}</div> : null}
      {s.sub ? <div style={{ ...caps(38, 600, "0.24em"), color: BONE, textAlign: "center", lineHeight: 1.4 }}>{s.sub}</div> : null}
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
        bottom: BAR + 30,
        textAlign: "center",
        fontFamily: SERIF,
        fontSize: 56,
        fontStyle: "italic",
        fontWeight: 900,
        color: GOLD_SOFT,
        textShadow: "0 3px 22px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.95)",
        opacity: interpolate(frame, [0, 4, durationInFrames - 4, durationInFrames], [0, 1, 1, 0], clamp),
      }}
    >
      {`♪ ${text} ♪`}
    </div>
  );
};

/** The score sits under every voice, drops out for real sound, and only stops dead when it is cut on purpose. */
const musicVolume = (frame: number, seg: (typeof MUSIC)[number]) => {
  let duck = 1;
  for (const a of AUDIO) duck = Math.min(duck, interpolate(frame, [a.at - 10, a.at, a.at + a.len, a.at + a.len + 16], [1, 0.26, 0.26, 1], clamp));
  for (const [a, b, level] of HUSH) duck = Math.min(duck, interpolate(frame, [a - 8, a, b, b + 14], [1, level, level, 1], clamp));
  const edge = interpolate(frame, [seg.from, seg.from + 10, seg.to - (seg.cut ? 2 : 30), seg.to], [0, 1, 1, 0], clamp);
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
          <Audio src={staticFile(a.file)} volume={a.kind === "N" ? 1.5 : 1.4} />
        </Sequence>
      ))}
      {SFX.map((x, i) => (
        <Sequence key={`${x.file}-${x.at}-${i}`} name={`SFX ${x.file}`} from={Math.max(0, x.at)} durationInFrames={150} layout="none">
          <Audio src={staticFile(x.file)} volume={x.vol} />
        </Sequence>
      ))}

      {SHOTS.map((s, i) => (
        <Sequence key={`${s.from}-${i}`} name={`${s.t} ${s.src ?? s.title ?? s.value ?? ""}`} from={s.from} durationInFrames={s.len}>
          {s.t === "v" ? (
            <Clip s={s} />
          ) : s.t === "p" && !s.tall ? (
            <WidePhoto s={s} />
          ) : s.t === "p" ? (
            <Photo shot={{ src: s.src ?? "" }} index={i} />
          ) : s.t === "ps" ? (
            <SlowPlate src={s.src ?? ""} oy={s.oy} bright={0.9} />
          ) : s.t === "a" ? (
            <Still src={s.src ?? ""} index={i} />
          ) : s.t === "f" ? (
            <FaceCard s={s} />
          ) : s.t === "iv" ? (
            s.name ? <FaceCard s={s} quote /> : <Still src={s.src ?? ""} index={i} />
          ) : s.t === "tri" ? (
            <Tri srcs={s.srcs ?? []} />
          ) : s.t === "title" ? (
            <Title s={s} />
          ) : s.t === "stat" ? (
            <Stat s={s} />
          ) : s.t === "city" ? (
            <City s={s} />
          ) : s.t === "c" ? (
            <Card s={s} />
          ) : s.t === "sheet" ? (
            <Sheet />
          ) : (
            <AbsoluteFill style={{ backgroundColor: "#000" }} />
          )}
          {s.tag ? <Stamp>{s.tag}</Stamp> : null}
          {s.re ? <Corner>Reenactment</Corner> : null}
          {s.t === "iv" && !s.name && s.role ? <LowerThird name={s.role} role={s.sub} /> : null}
        </Sequence>
      ))}

      {SUBS.map((sub) => (
        <Sequence key={sub.from} name={`Line — ${sub.text}`} from={sub.from} durationInFrames={sub.len} layout="none">
          <div
            style={{
              position: "absolute",
              left: 800,
              right: 110,
              bottom: BAR + 110,
              fontFamily: SERIF,
              fontSize: 52,
              fontStyle: "italic",
              fontWeight: 700,
              lineHeight: 1.2,
              color: "#fff",
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

      <Grain opacity={0.06} />
      <Vignette strength={0.45} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: BAR, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: BAR, background: "#000" }} />
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: interpolate(frame, [0, 24], [1, 0], clamp) }} />
    </AbsoluteFill>
  );
};
