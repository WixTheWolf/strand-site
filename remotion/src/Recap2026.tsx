import { loadFont } from "@remotion/fonts";
import { Audio, Video } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import {
  AbsoluteFill,
  CanvasImage,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { DUSK, Dunes, DuskSky, Grain, Vignette } from "./Cinematic";

loadFont({
  family: "Geist",
  url: staticFile("geist.woff2"),
  weight: "100 900",
});
const fontFamily = "Geist, Helvetica, Arial, sans-serif";

const GOLD = DUSK.gold;
const GOLD_SOFT = DUSK.goldSoft;

/* ---------- shared bits ---------- */

const Label: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <div
    style={{
      fontFamily,
      fontSize: 26,
      fontWeight: 500,
      letterSpacing: "0.42em",
      textTransform: "uppercase",
      color: "rgba(244,242,234,0.6)",
      ...style,
    }}
  >
    {children}
  </div>
);

const DuskBackdrop: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <DuskSky horizonY={74} />
      <Dunes horizonY={70} drift={frame * 0.08} />
    </>
  );
};

/* ---------- Scene 1: cold open — the strike footage ---------- */

const ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Video
        name="Strike footage"
        src={staticFile("strike-full.mp4")}
        volume={0.9}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(10,27,22,0.3) 0%, rgba(10,27,22,0) 40%, rgba(10,27,22,0.45) 100%)",
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 110 }}>
        <Label
          style={{
            opacity: interpolate(frame, [2.6 * fps, 3.4 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          The Strand Invitational
        </Label>
      </AbsoluteFill>
      <Grain opacity={0.05} />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

/* ---------- Scene 2: title card ---------- */

const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = (delay: number) => ({
    opacity: interpolate(frame, [delay, delay + 0.6 * fps], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    translate: `0px ${interpolate(frame, [delay, delay + 0.6 * fps], [26, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    })}px`,
  });
  return (
    <AbsoluteFill style={{ backgroundColor: DUSK.skyTop }}>
      <DuskBackdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 34 }}>
        <Label style={rise(4)}>The Ninth Strand</Label>
        <div
          style={{
            ...rise(10),
            fontFamily,
            fontSize: 150,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "#f4f2ea",
          }}
        >
          Gamble Sands
        </div>
        <div
          style={{
            ...rise(18),
            fontFamily,
            fontSize: 30,
            fontWeight: 500,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: GOLD_SOFT,
          }}
        >
          August 20–23, 2026
        </div>
      </AbsoluteFill>
      <Grain />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

/* ---------- Scene 3: one Ken Burns shot with a caption chip ---------- */

const MontageShot: React.FC<{
  src: string;
  caption: string;
  from: number;
  to: number;
  ox?: string;
  oy?: string;
}> = ({ src, caption, from, to, ox = "50%", oy = "45%" }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a1b16" }}>
      <CanvasImage
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `${ox} ${oy}`,
          scale: String(
            interpolate(frame, [0, durationInFrames], [from, to], {
              easing: Easing.inOut(Easing.sin),
            }),
          ),
          transformOrigin: `${ox} ${oy}`,
          filter: "saturate(0.82) contrast(1.05) brightness(0.86)",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(10,27,22,0.25) 0%, rgba(10,27,22,0) 35%, rgba(10,27,22,0.5) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 90,
          bottom: 84,
          fontFamily,
          fontSize: 28,
          fontWeight: 500,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "rgba(244,242,234,0.85)",
          opacity: interpolate(frame, [0.5 * fps, 1.1 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <span style={{ color: GOLD_SOFT, marginRight: 22 }}>—</span>
        {caption}
      </div>
      <Grain opacity={0.05} />
      <Vignette strength={0.42} />
    </AbsoluteFill>
  );
};

/* ---------- Scene 4: champions reveal ---------- */

const ROSTER = [
  "Justin Uribe (C)",
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

const ChampionsReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sweep = interpolate(frame, [0.9 * fps, 1.7 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill style={{ backgroundColor: DUSK.skyTop }}>
      <DuskBackdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 30 }}>
        <Label
          style={{
            opacity: interpolate(frame, [4, 0.5 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          2026 Champions
        </Label>
        <div
          style={{
            fontFamily,
            fontSize: 170,
            fontWeight: 700,
            letterSpacing: "-0.015em",
            color: GOLD_SOFT,
            opacity: interpolate(frame, [0.4 * fps, 0.9 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            scale: String(
              interpolate(frame, [0.4 * fps, 1.1 * fps], [0.96, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.cubic),
              }),
            ),
          }}
        >
          Team J-Bone
        </div>
        {/* tracer underline */}
        <div style={{ width: 760, height: 4, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: 4,
              width: `${sweep * 100}%`,
              borderRadius: 4,
              background: `linear-gradient(90deg, rgba(201,162,39,0) 0%, ${GOLD} 30%, ${GOLD_SOFT} 100%)`,
              boxShadow: `0 0 18px rgba(232,200,106,0.6)`,
            }}
          />
        </div>
        <div
          style={{
            marginTop: 26,
            display: "grid",
            gridTemplateColumns: "repeat(5, auto)",
            columnGap: 54,
            rowGap: 14,
            fontFamily,
            fontSize: 24,
            fontWeight: 500,
            letterSpacing: "0.06em",
            color: "rgba(244,242,234,0.78)",
          }}
        >
          {ROSTER.map((name, i) => (
            <div
              key={name}
              style={{
                opacity: interpolate(frame, [2 * fps + i * 3, 2 * fps + i * 3 + 12], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              {name}
            </div>
          ))}
        </div>
      </AbsoluteFill>
      <Grain />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

/* ---------- Scene 5: outro — the 10-year tease ---------- */

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: DUSK.skyTop }}>
      <DuskBackdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 38 }}>
        <CanvasImage
          src={staticFile("ten-year-crest.png")}
          style={{
            width: 360,
            height: 360,
            borderRadius: "50%",
            scale: String(
              interpolate(frame, [0, 0.9 * fps], [0.82, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.out(Easing.back(1.4)),
              }),
            ),
            opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            boxShadow: "0 0 120px rgba(201,162,39,0.25)",
          }}
        />
        <div
          style={{
            fontFamily,
            fontSize: 64,
            fontWeight: 600,
            letterSpacing: "0.02em",
            color: "#f4f2ea",
            opacity: interpolate(frame, [0.8 * fps, 1.4 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          The 10-Year Strand · 2027
        </div>
        <Label
          style={{
            opacity: interpolate(frame, [1.3 * fps, 1.9 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Destination TBA
        </Label>
        <div
          style={{
            marginTop: 20,
            fontFamily,
            fontSize: 22,
            letterSpacing: "0.2em",
            color: "rgba(244,242,234,0.4)",
            opacity: interpolate(frame, [1.8 * fps, 2.4 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          strand-site.vercel.app
        </div>
      </AbsoluteFill>
      <Grain />
      <Vignette strength={0.5} />
      {/* fade to black */}
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: interpolate(frame, [durationInFrames - 1.2 * fps, durationInFrames - 6], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------- The film ---------- */

export const Recap2026: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* ambience bed: silent under the strike, rises after, fades at the end */}
      <Audio
        name="Dusk ambience bed"
        src={staticFile("dusk-ambience.mp3")}
        loop
        volume={interpolate(
          frame,
          [0, 4.6 * fps, 6 * fps, durationInFrames - 2.5 * fps, durationInFrames - 10],
          [0, 0.06, 0.5, 0.5, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )}
      />
      <TransitionSeries name="Recap 2026">
        <TransitionSeries.Sequence name="Cold open" durationInFrames={152}>
          <ColdOpen />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={linearTiming({ durationInFrames: 20 })} presentation={fade()} />
        <TransitionSeries.Sequence name="Title card" durationInFrames={120}>
          <TitleCard />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={linearTiming({ durationInFrames: 20 })} presentation={fade()} />
        <TransitionSeries.Sequence name="The walk in" durationInFrames={102}>
          <MontageShot src="strand26-015.jpg" caption="Twenty guys, one canyon" from={1.06} to={1.16} oy="42%" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={linearTiming({ durationInFrames: 20 })} presentation={fade()} />
        <TransitionSeries.Sequence name="High desert" durationInFrames={102}>
          <MontageShot src="strand26-023.jpg" caption="High desert golf" from={1.18} to={1.07} oy="50%" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={linearTiming({ durationInFrames: 20 })} presentation={fade()} />
        <TransitionSeries.Sequence name="The swing" durationInFrames={102}>
          <MontageShot src="strand26-067.jpg" caption="Sixty-mile carries" from={1.06} to={1.17} ox="55%" oy="35%" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={linearTiming({ durationInFrames: 20 })} presentation={fade()} />
        <TransitionSeries.Sequence name="Putts were holed" durationInFrames={102}>
          <MontageShot src="strand26-036.jpg" caption="Putts were holed" from={1.16} to={1.06} oy="55%" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={linearTiming({ durationInFrames: 20 })} presentation={fade()} />
        <TransitionSeries.Sequence name="Last light" durationInFrames={102}>
          <MontageShot src="strand26-076.jpg" caption="Last light over the Columbia" from={1.06} to={1.15} ox="60%" oy="55%" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={linearTiming({ durationInFrames: 20 })} presentation={fade()} />
        <TransitionSeries.Sequence name="Champions" durationInFrames={180}>
          <ChampionsReveal />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={linearTiming({ durationInFrames: 20 })} presentation={fade()} />
        <TransitionSeries.Sequence name="Outro" durationInFrames={210}>
          <Outro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
