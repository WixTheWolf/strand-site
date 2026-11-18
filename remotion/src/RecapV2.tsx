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

/**
 * The Strand 2026 — recap v2. Cut to a 120 BPM track (one beat = 15 frames
 * at 30fps): drop 1 at 8.0s (the strike), a one-second break at 23.0s, drop 2
 * at 24.0s (the ball drops, champions revealed), final hit at 32.0s.
 */

loadFont({ family: "Geist", url: staticFile("geist.woff2"), weight: "100 900" });
const FONT = "Geist, Helvetica, Arial, sans-serif";

const GOLD_SOFT = "#e8c86a";
const BONE = "#f4f2ea";
const INK = "#07130f";

export const BEAT = 15;
const DROP_1 = 240; // 8.0s
const DROP_2 = 720; // 24.0s
const FINAL_HIT = 960; // 32.0s
export const RECAP_V2_DURATION = 1065;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const expoOut = Easing.out(Easing.exp);

/* ------------------------------------------------------------------ */
/* Kinetic type                                                        */
/* ------------------------------------------------------------------ */

/** Text that slams in: oversized → 1, with a brief RGB-split ghost. */
const Slam: React.FC<{
  children: string;
  size: number;
  color?: string;
  weight?: number;
  tracking?: string;
}> = ({ children, size, color = BONE, weight = 900, tracking = "-0.035em" }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 7], [2.3, 1], { ...clamp, easing: expoOut });
  const split = interpolate(frame, [0, 8], [22, 0], { ...clamp, easing: expoOut });
  const base: React.CSSProperties = {
    fontFamily: FONT,
    fontSize: size,
    fontWeight: weight,
    letterSpacing: tracking,
    lineHeight: 0.92,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  };
  return (
    <div
      style={{
        position: "relative",
        scale: String(scale),
        opacity: interpolate(frame, [0, 2], [0, 1], clamp),
      }}
    >
      <div style={{ ...base, position: "absolute", inset: 0, color: "#2fd3b0", translate: `${-split}px 0px`, opacity: split > 0.5 ? 0.7 : 0, mixBlendMode: "screen" }}>
        {children}
      </div>
      <div style={{ ...base, position: "absolute", inset: 0, color: "#ff5a3c", translate: `${split}px 0px`, opacity: split > 0.5 ? 0.7 : 0, mixBlendMode: "screen" }}>
        {children}
      </div>
      <div style={{ ...base, color }}>{children}</div>
    </div>
  );
};

/** Letters rise and settle one after another. */
const Stagger: React.FC<{
  children: string;
  size: number;
  color?: string;
  weight?: number;
  tracking?: string;
  step?: number;
}> = ({ children, size, color = BONE, weight = 800, tracking = "0em", step = 1.3 }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: tracking,
        textTransform: "uppercase",
        color,
        whiteSpace: "nowrap",
        display: "flex",
      }}
    >
      {Array.from(children).map((ch, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            opacity: interpolate(frame, [i * step, i * step + 5], [0, 1], clamp),
            translate: `0px ${interpolate(frame, [i * step, i * step + 9], [size * 0.55, 0], {
              ...clamp,
              easing: Easing.out(Easing.back(1.8)),
            })}px`,
          }}
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </div>
  );
};

const Kicker: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({
  children,
  color = "rgba(244,242,234,0.75)",
  size = 30,
}) => (
  <div
    style={{
      fontFamily: FONT,
      fontSize: size,
      fontWeight: 600,
      letterSpacing: "0.42em",
      textTransform: "uppercase",
      color,
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

/* ------------------------------------------------------------------ */
/* Shot building blocks                                                */
/* ------------------------------------------------------------------ */

/** A photo that punches in on its first frames, then drifts. */
const PunchPhoto: React.FC<{
  src: string;
  ox?: string;
  oy?: string;
  dir?: 1 | -1;
  dim?: number;
}> = ({ src, ox = "50%", oy = "45%", dir = 1, dim = 0.3 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const punch = interpolate(frame, [0, 9], [1.34, 1.1], { ...clamp, easing: expoOut });
  const drift = interpolate(frame, [9, durationInFrames], [0, 0.05], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: INK, overflow: "hidden" }}>
      <CanvasImage
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `${ox} ${oy}`,
          scale: String(punch + drift),
          translate: `${interpolate(frame, [0, 9], [dir * 90, 0], { ...clamp, easing: expoOut })}px 0px`,
          transformOrigin: `${ox} ${oy}`,
          filter: `saturate(1.05) contrast(1.08) blur(${interpolate(frame, [0, 6], [14, 0], clamp)}px)`,
        }}
      />
      <AbsoluteFill style={{ background: `rgba(7,19,15,${dim})` }} />
    </AbsoluteFill>
  );
};

/** Photo + giant counting stat. */
const StatShot: React.FC<{
  src: string;
  value: number;
  label: string;
  dir?: 1 | -1;
  ox?: string;
  oy?: string;
}> = ({ src, value, label, dir = 1, ox, oy }) => {
  const frame = useCurrentFrame();
  const shown = Math.round(
    interpolate(frame, [0, 11], [0, value], { ...clamp, easing: Easing.out(Easing.cubic) }),
  );
  return (
    <AbsoluteFill>
      <PunchPhoto src={src} dir={dir} ox={ox} oy={oy} dim={0.45} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 520,
            fontWeight: 900,
            letterSpacing: "-0.05em",
            lineHeight: 0.85,
            color: GOLD_SOFT,
            fontVariantNumeric: "tabular-nums",
            scale: String(interpolate(frame, [0, 7], [1.5, 1], { ...clamp, easing: expoOut })),
            textShadow: "0 10px 60px rgba(0,0,0,0.55)",
          }}
        >
          {shown}
        </div>
        <div style={{ marginTop: 8 }}>
          <Sequence from={4} layout="none">
            <Stagger size={84} tracking="0.2em" step={1}>
              {label}
            </Stagger>
          </Sequence>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Photo + lower-left caption. */
const CaptionShot: React.FC<{
  src: string;
  caption: string;
  dir?: 1 | -1;
  ox?: string;
  oy?: string;
}> = ({ src, caption, dir = 1, ox, oy }) => (
  <AbsoluteFill>
    <PunchPhoto src={src} dir={dir} ox={ox} oy={oy} dim={0.22} />
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, rgba(7,19,15,0) 50%, rgba(7,19,15,0.75) 100%)",
      }}
    />
    <div style={{ position: "absolute", left: 100, bottom: 96 }}>
      <Sequence from={5} layout="none">
        <Stagger size={96} tracking="-0.02em" weight={900} step={0.9}>
          {caption}
        </Stagger>
      </Sequence>
    </div>
  </AbsoluteFill>
);

const Flash: React.FC<{ at: number; strength?: number }> = ({ at, strength = 0.9 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#fff8e6",
        opacity: interpolate(frame, [at, at + 1, at + 7], [0, strength, 0], clamp),
        pointerEvents: "none",
      }}
    />
  );
};

/** Gold sparks bursting from the center. */
const Sparks: React.FC<{ count?: number }> = ({ count = 46 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {Array.from({ length: count }).map((_, i) => {
        const angle = random(`a${i}`) * Math.PI * 2;
        const speed = 14 + random(`s${i}`) * 30;
        const life = 26 + random(`l${i}`) * 26;
        const t = Math.min(frame, life);
        const dist = speed * t * (1 - t / (life * 2.4));
        const size = 4 + random(`z${i}`) * 9;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 960 + Math.cos(angle) * dist,
              top: 540 + Math.sin(angle) * dist * 0.72 + 0.16 * t * t,
              width: size,
              height: size * (1 + random(`e${i}`) * 3),
              borderRadius: size,
              rotate: `${(angle * 180) / Math.PI + 90}deg`,
              background: i % 3 === 0 ? BONE : GOLD_SOFT,
              boxShadow: "0 0 14px rgba(232,200,106,0.8)",
              opacity: interpolate(frame, [0, life * 0.6, life], [1, 1, 0], clamp),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

const TEASERS = [
  { at: 15, text: "August 2026" },
  { at: 45, text: "Brewster, Washington" },
  { at: 75, text: "Twenty players" },
  { at: 105, text: "Four rounds" },
  { at: 135, text: "One cup" },
];

const Teasers: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <CanvasImage
        src={staticFile("strand26-076.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "60% 55%",
          scale: String(interpolate(frame, [0, 190], [1.05, 1.22])),
          filter: "saturate(0.7) brightness(0.32) contrast(1.1)",
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {TEASERS.map((t, i) => {
          const end = i === TEASERS.length - 1 ? 190 : TEASERS[i + 1].at;
          if (frame < t.at || frame >= end) return null;
          return (
            <Sequence key={t.text} from={t.at} durationInFrames={end - t.at} layout="none">
              <Stagger
                size={i === TEASERS.length - 1 ? 190 : 110}
                weight={900}
                tracking="-0.02em"
                color={i === TEASERS.length - 1 ? GOLD_SOFT : BONE}
                step={1}
              >
                {t.text}
              </Stagger>
            </Sequence>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const StrikeBuild: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Video
      name="Strike — slow build"
      src={staticFile("strike-full.mp4")}
      playbackRate={0.75}
      volume={0}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  </AbsoluteFill>
);

const StrikeHit: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Video
        name="Strike — impact"
        src={staticFile("strike-full.mp4")}
        trimBefore={37}
        volume={0.75}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: String(interpolate(frame, [0, 8], [1.16, 1], { ...clamp, easing: expoOut })),
        }}
      />
      <AbsoluteFill style={{ background: "rgba(7,19,15,0.28)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 6 }}>
        <Slam size={250}>The Strand</Slam>
        <Sequence from={8} layout="none">
          <Stagger size={92} tracking="0.36em" weight={700} color={GOLD_SOFT} step={1}>
            Invitational
          </Stagger>
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Flyover: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Video
        name="Flyover"
        src={staticFile("flyover.mp4")}
        trimBefore={12}
        volume={0}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: String(interpolate(frame, [0, 8], [1.2, 1.02], { ...clamp, easing: expoOut })),
        }}
      />
      <AbsoluteFill
        style={{ background: "linear-gradient(180deg, rgba(7,19,15,0.2) 0%, rgba(7,19,15,0.55) 100%)" }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 26 }}>
        <Kicker color={GOLD_SOFT}>The ninth edition</Kicker>
        <Stagger size={230} weight={900} tracking="-0.035em" step={1.4}>
          Gamble Sands
        </Stagger>
        <Sequence from={26} layout="none">
          <Kicker>August 20–23 · 2026</Kicker>
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const CupTension: React.FC = () => {
  const frame = useCurrentFrame();
  const text = "And the cup goes to";
  const typed = Math.floor(
    interpolate(frame, [30, 72], [0, text.length], clamp),
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Video
        name="Cup — the drop"
        src={staticFile("cup.mp4")}
        trimBefore={45}
        volume={0}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: String(interpolate(frame, [0, 90], [1.0, 1.1], clamp)),
          transformOrigin: "50% 60%",
        }}
      />
      <AbsoluteFill
        style={{ background: "linear-gradient(180deg, rgba(7,19,15,0.55) 0%, rgba(7,19,15,0) 45%)" }}
      />
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 76,
          fontWeight: 800,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: BONE,
          opacity: frame < 90 ? 1 : 0,
        }}
      >
        {text.slice(0, typed)}
        <span style={{ opacity: frame % 10 < 5 ? 1 : 0, color: GOLD_SOFT }}>…</span>
      </div>
    </AbsoluteFill>
  );
};

const ROSTER = [
  "Justin Uribe",
  "Brett Comfort",
  "Brian Kerns",
  "Matt Schroeder",
  "Fred Geisinger",
  "Shaun Eipper",
  "Jason Olson",
  "Matt Onorato",
  "Ryan D'Arcy",
  "Kevin Gordon",
];

const Champions: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {/* backdrop arrives just after the slam so the empty cup shows first */}
      <AbsoluteFill
        style={{
          opacity: interpolate(frame, [10, 22], [0, 1], clamp),
          backgroundColor: INK,
        }}
      >
        <CanvasImage
          src={staticFile("strand26-063.jpg")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "50% 38%",
            scale: String(interpolate(frame, [10, 150], [1.18, 1.06], clamp)),
            filter: "saturate(0.6) brightness(0.3) contrast(1.1)",
          }}
        />
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(60% 55% at 50% 45%, rgba(201,162,39,0.28) 0%, rgba(7,19,15,0) 70%)",
          }}
        />
      </AbsoluteFill>

      <Sparks />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          translate: `0px ${interpolate(frame, [52, 66], [0, -150], { ...clamp, easing: Easing.inOut(Easing.cubic) })}px`,
        }}
      >
        <Sequence from={10} layout="none">
          <Kicker color={BONE} size={38}>
            2026 Champions
          </Kicker>
        </Sequence>
        <Slam size={232} color={GOLD_SOFT}>
          Team J-Bone
        </Slam>
      </AbsoluteFill>

      {/* roster: one name every eighth note */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 600,
          display: "grid",
          gridTemplateColumns: "repeat(5, 360px)",
          justifyContent: "center",
          rowGap: 34,
        }}
      >
        {ROSTER.map((name, i) => {
          const at = 60 + i * 7.5;
          return (
            <div
              key={name}
              style={{
                textAlign: "center",
                fontFamily: FONT,
                fontSize: 40,
                fontWeight: 700,
                letterSpacing: "0.02em",
                color: i === 0 ? GOLD_SOFT : BONE,
                opacity: interpolate(frame, [at, at + 2], [0, 1], clamp),
                scale: String(
                  interpolate(frame, [at, at + 7], [1.6, 1], { ...clamp, easing: expoOut }),
                ),
              }}
            >
              {name}
              {i === 0 ? " (C)" : ""}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const CrestBuild: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: INK, alignItems: "center", justifyContent: "center", gap: 44 }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(50% 50% at 50% 42%, rgba(201,162,39,0.22) 0%, rgba(7,19,15,0) 70%)",
        }}
      />
      <CanvasImage
        src={staticFile("ten-year-crest.png")}
        style={{
          width: 430,
          height: 430,
          borderRadius: "50%",
          scale: String(interpolate(frame, [0, 14], [0.2, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) })),
          rotate: `${interpolate(frame, [0, 16], [-140, 0], { ...clamp, easing: expoOut })}deg`,
          boxShadow: "0 0 140px rgba(201,162,39,0.4)",
        }}
      />
      <Sequence from={12} layout="none">
        <Stagger size={104} weight={900} tracking="-0.02em" step={1}>
          The 10-Year Strand
        </Stagger>
      </Sequence>
    </AbsoluteFill>
  );
};

const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: INK, alignItems: "center", justifyContent: "center", gap: 30 }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(55% 55% at 50% 48%, rgba(201,162,39,0.3) 0%, rgba(7,19,15,0) 72%)",
        }}
      />
      <Slam size={460} color={GOLD_SOFT}>
        2027
      </Slam>
      <Sequence from={12} layout="none">
        <Kicker color={BONE} size={40}>
          Destination TBA
        </Kicker>
      </Sequence>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 26,
          letterSpacing: "0.22em",
          color: "rgba(244,242,234,0.5)",
          opacity: interpolate(frame, [26, 40], [0, 1], clamp),
        }}
      >
        strand-site.vercel.app
      </div>
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: interpolate(frame, [durationInFrames - 30, durationInFrames - 4], [0, 1], clamp),
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* The film                                                            */
/* ------------------------------------------------------------------ */

const shakeAt = (frame: number, at: number, power: number) => {
  const t = frame - at;
  if (t < 0 || t > 16) return [0, 0];
  const decay = Math.exp(-t * 0.28) * power;
  return [Math.sin(t * 2.9) * decay, Math.cos(t * 3.7) * decay * 0.7];
};

const WHOOSH_CUTS = [300, 390, 420, 450, 480, 510, 540, 585, 630, 870];

export const RecapV2: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const shakes = [shakeAt(frame, DROP_1, 26), shakeAt(frame, DROP_2, 30), shakeAt(frame, FINAL_HIT, 22)];
  const sx = shakes.reduce((a, s) => a + s[0], 0);
  const sy = shakes.reduce((a, s) => a + s[1], 0);

  // subtle pump on every beat while the track is driving
  const driving = (frame >= DROP_1 && frame < 690) || (frame >= DROP_2 && frame < FINAL_HIT);
  const beatPhase = (frame % BEAT) / BEAT;
  const pump = driving ? 1 + 0.012 * Math.exp(-beatPhase * 5) : 1;

  // cinema bars during the build; they snap open on the first drop
  const bars = interpolate(frame, [DROP_1 - 1, DROP_1 + 6], [116, 0], { ...clamp, easing: expoOut });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* ---------- audio ---------- */}
      <Audio name="Music" src={staticFile("music.mp3")} volume={0.72} />
      <Sequence name="Impact — strike" from={DROP_1} durationInFrames={110} layout="none">
        <Audio src={staticFile("impact.mp3")} volume={0.68} />
      </Sequence>
      <Sequence name="Impact — champions" from={DROP_2} durationInFrames={110} layout="none">
        <Audio src={staticFile("impact.mp3")} volume={0.76} />
      </Sequence>
      <Sequence name="Impact — 2027" from={FINAL_HIT} durationInFrames={105} layout="none">
        <Audio src={staticFile("impact.mp3")} volume={0.64} />
      </Sequence>
      <Sequence name="Cup rattle" from={DROP_2 - 6} durationInFrames={80} layout="none">
        <Audio src={staticFile("cup-rattle.mp3")} volume={0.9} />
      </Sequence>
      {WHOOSH_CUTS.map((cut) => (
        <Sequence key={cut} name={`Whoosh ${cut}`} from={cut - 7} durationInFrames={24} layout="none">
          <Audio src={staticFile("whoosh.mp3")} volume={0.45} />
        </Sequence>
      ))}
      <Sequence name="Ambience tail" from={FINAL_HIT} layout="none">
        <Audio
          src={staticFile("dusk-ambience.mp3")}
          volume={interpolate(frame, [FINAL_HIT, FINAL_HIT + 30, durationInFrames - 25, durationInFrames - 2], [0, 0.4, 0.4, 0], clamp)}
        />
      </Sequence>

      {/* ---------- picture ---------- */}
      <AbsoluteFill style={{ translate: `${sx}px ${sy}px`, scale: String(pump) }}>
        <Sequence name="Teasers" durationInFrames={190}>
          <Teasers />
        </Sequence>
        <Sequence name="Strike — build" from={190} durationInFrames={50}>
          <StrikeBuild />
        </Sequence>
        <Sequence name="Strike — hit + title" from={DROP_1} durationInFrames={60}>
          <StrikeHit />
        </Sequence>
        <Sequence name="Flyover — Gamble Sands" from={300} durationInFrames={90}>
          <Flyover />
        </Sequence>

        <Sequence name="20 players" from={390} durationInFrames={30}>
          <StatShot src="strand26-015.jpg" value={20} label="Players" dir={1} oy="42%" />
        </Sequence>
        <Sequence name="4 rounds" from={420} durationInFrames={30}>
          <StatShot src="strand26-023.jpg" value={4} label="Rounds" dir={-1} />
        </Sequence>
        <Sequence name="3 courses" from={450} durationInFrames={30}>
          <StatShot src="strand26-032.jpg" value={3} label="Courses" dir={1} />
        </Sequence>
        <Sequence name="75 points" from={480} durationInFrames={30}>
          <StatShot src="strand26-067.jpg" value={75} label="Points" dir={-1} ox="55%" oy="35%" />
        </Sequence>
        <Sequence name="86 holes" from={510} durationInFrames={30}>
          <StatShot src="strand26-036.jpg" value={86} label="Holes" dir={1} oy="55%" />
        </Sequence>
        <Sequence name="Last light" from={540} durationInFrames={45}>
          <CaptionShot src="strand26-076.jpg" caption="Last light" dir={-1} ox="60%" oy="55%" />
        </Sequence>
        <Sequence name="The field" from={585} durationInFrames={45}>
          <CaptionShot src="strand26-063.jpg" caption="The field" dir={1} oy="38%" />
        </Sequence>

        <Sequence name="Cup tension" from={630} durationInFrames={105}>
          <CupTension />
        </Sequence>
        <Sequence name="Champions" from={DROP_2} durationInFrames={150}>
          <Champions />
        </Sequence>
        <Sequence name="Crest build" from={870} durationInFrames={90}>
          <CrestBuild />
        </Sequence>
        <Sequence name="Finale — 2027" from={FINAL_HIT} durationInFrames={105}>
          <Finale />
        </Sequence>
      </AbsoluteFill>

      {/* ---------- finishing ---------- */}
      <Flash at={DROP_1} />
      <Flash at={DROP_2} />
      <Flash at={FINAL_HIT} strength={0.7} />
      {WHOOSH_CUTS.slice(1, 8).map((cut) => (
        <Flash key={cut} at={cut} strength={0.22} />
      ))}
      <Grain opacity={0.045} />
      <Vignette strength={0.42} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: bars, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: bars, background: "#000" }} />
    </AbsoluteFill>
  );
};
