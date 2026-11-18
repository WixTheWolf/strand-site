import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  CanvasImage,
  Easing,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Grain, Vignette } from "./Cinematic";
import { BONE, FONT, Flash, GOLD_SOFT, INK, Kicker, Slam, Stagger, clamp, expoOut } from "./Kinetic";

/**
 * The 2027 teaser — a movie-trailer act. The cue lands a braam every 160
 * frames (5.33s at 30fps); each hit starts a new beat of the trailer and the
 * narration sits in the quiet between hits.
 */

export const HIT = 160;
export const TEASER_DURATION = 790;

const Convoy: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Video
        name="Cart convoy"
        src={staticFile("convoy.mp4")}
        playbackRate={0.94}
        volume={0}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: String(interpolate(frame, [0, 9], [1.18, 1.02], { ...clamp, easing: expoOut })),
        }}
      />
      <AbsoluteFill
        style={{ background: "linear-gradient(180deg, rgba(7,19,15,0.15) 40%, rgba(7,19,15,0.7) 100%)" }}
      />
      <div style={{ position: "absolute", left: 110, bottom: 190 }}>
        <Sequence from={15} durationInFrames={45} layout="none">
          <Stagger size={130} weight={900} tracking="-0.02em" step={1}>
            Nine editions.
          </Stagger>
        </Sequence>
        <Sequence from={62} layout="none">
          <Stagger size={130} weight={900} tracking="-0.02em" step={1}>
            Nine destinations.
          </Stagger>
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};

const HandicapGag: React.FC = () => {
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
          scale: String(interpolate(frame, [0, HIT], [1.06, 1.2])),
          filter: "saturate(0.75) brightness(0.42) contrast(1.1)",
        }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 26 }}>
        <Sequence from={10} layout="none">
          <Kicker color={GOLD_SOFT} size={34}>
            And one argument about
          </Kicker>
        </Sequence>
        <Sequence from={34} layout="none">
          <Stagger size={230} weight={900} tracking="-0.03em" step={1.4}>
            Handicaps
          </Stagger>
        </Sequence>
        <Sequence from={92} layout="none">
          <Stagger size={72} weight={800} tracking="0.12em" color={GOLD_SOFT} step={1}>
            That will never, ever end
          </Stagger>
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Dawn: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Video
        name="Sunrise"
        src={staticFile("dawn.mp4")}
        playbackRate={0.9}
        volume={0}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: String(interpolate(frame, [0, HIT], [1.02, 1.1])),
        }}
      />
      <AbsoluteFill
        style={{ background: "linear-gradient(180deg, rgba(7,19,15,0.35) 0%, rgba(7,19,15,0.1) 45%, rgba(7,19,15,0.6) 100%)" }}
      />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 30 }}>
        <Sequence from={10} layout="none">
          <Kicker color={GOLD_SOFT} size={44}>
            In 2027
          </Kicker>
        </Sequence>
        <Sequence from={68} layout="none">
          <Stagger size={118} weight={900} tracking="-0.03em" step={1.1}>
            The Strand Invitational
          </Stagger>
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const TenYears: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: INK, alignItems: "center", justifyContent: "center", gap: 40 }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(55% 55% at 50% 45%, rgba(201,162,39,0.3) 0%, rgba(7,19,15,0) 72%)",
        }}
      />
      <CanvasImage
        src={staticFile("ten-year-crest.png")}
        style={{
          width: 330,
          height: 330,
          borderRadius: "50%",
          scale: String(interpolate(frame, [0, 14], [0.2, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) })),
          rotate: `${interpolate(frame, [0, 16], [-140, 0], { ...clamp, easing: expoOut })}deg`,
          boxShadow: "0 0 140px rgba(201,162,39,0.45)",
        }}
      />
      <Slam size={158} color={GOLD_SOFT}>
        Ten years running
      </Slam>
    </AbsoluteFill>
  );
};

const NUMERAL: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: 700,
  fontWeight: 900,
  letterSpacing: "-0.05em",
  lineHeight: 0.9,
};

/** "2027" with moving footage inside the numerals. */
const ComingSoon: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 8], [2.2, 1], { ...clamp, easing: expoOut });
  const drift = interpolate(frame, [8, 150], [1, 1.06], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Video
        name="Footage inside 2027"
        src={staticFile("flyover.mp4")}
        volume={0}
        style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(1.15) brightness(1.15)" }}
      />
      {/* black plate with white numerals: multiply leaves footage only inside them */}
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          mixBlendMode: "multiply",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 150,
        }}
      >
        <div style={{ ...NUMERAL, color: "#fff", scale: String(scale * drift) }}>2027</div>
      </AbsoluteFill>
      {/* gold edge on the numerals */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 150 }}>
        <div
          style={{
            ...NUMERAL,
            color: "transparent",
            WebkitTextStroke: `3px ${GOLD_SOFT}`,
            scale: String(scale * drift),
            opacity: 0.9,
          }}
        >
          2027
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 150, gap: 26 }}>
        <Sequence from={24} layout="none">
          <Stagger size={92} weight={800} tracking="0.4em" color={BONE} step={1.2}>
            Coming soon
          </Stagger>
        </Sequence>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 26,
            letterSpacing: "0.22em",
            color: "rgba(244,242,234,0.55)",
            opacity: interpolate(frame, [50, 66], [0, 1], clamp),
          }}
        >
          strand-site.vercel.app
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Narration windows, in teaser frames. The cue ducks under each one. */
const VO_WINDOWS: Array<[number, number]> = [
  [15, 55],
  [62, 114],
  [HIT + 10, HIT + 152],
  [2 * HIT + 10, 2 * HIT + 56],
  [2 * HIT + 68, 2 * HIT + 123],
  [3 * HIT + 8, 3 * HIT + 48],
  [4 * HIT + 24, 4 * HIT + 57],
];
const VO_GAIN = 1.5;

const cueVolume = (frame: number) => {
  let duck = 0;
  for (const [a, b] of VO_WINDOWS) {
    duck = Math.max(
      duck,
      interpolate(frame, [a - 5, a, b, b + 8], [0, 1, 1, 0], clamp),
    );
  }
  return 0.8 - duck * 0.44;
};

const shake = (frame: number, at: number, power: number) => {
  const t = frame - at;
  if (t < 0 || t > 16) return [0, 0];
  const d = Math.exp(-t * 0.28) * power;
  return [Math.sin(t * 2.9) * d, Math.cos(t * 3.7) * d * 0.7];
};

export const TeaserAct: React.FC<{ openingImpact?: boolean }> = ({ openingImpact = true }) => {
  const frame = useCurrentFrame();
  const s = [shake(frame, 3 * HIT, 24), shake(frame, 4 * HIT, 30)];
  const bars = interpolate(frame, [4 * HIT - 1, 4 * HIT + 6], [104, 0], { ...clamp, easing: expoOut });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* ---------- audio ---------- */}
      <Audio name="Trailer cue" src={staticFile("trailer-cue.mp3")} volume={cueVolume(frame)} />
      {openingImpact ? (
        <Sequence name="Impact — open" durationInFrames={110} layout="none">
          <Audio src={staticFile("impact.mp3")} volume={0.5} />
        </Sequence>
      ) : null}
      <Sequence name="VO — nine editions" from={15} durationInFrames={40} layout="none">
        <Audio src={staticFile("vo-a.mp3")} volume={VO_GAIN} />
      </Sequence>
      <Sequence name="VO — nine destinations" from={62} durationInFrames={52} layout="none">
        <Audio src={staticFile("vo-b.mp3")} volume={VO_GAIN} />
      </Sequence>
      <Sequence name="VO — handicaps" from={HIT + 10} durationInFrames={142} layout="none">
        <Audio src={staticFile("vo-c.mp3")} volume={VO_GAIN} />
      </Sequence>
      <Sequence name="VO — in 2027" from={2 * HIT + 10} durationInFrames={46} layout="none">
        <Audio src={staticFile("vo-d.mp3")} volume={VO_GAIN} />
      </Sequence>
      <Sequence name="VO — the Strand Invitational" from={2 * HIT + 68} durationInFrames={55} layout="none">
        <Audio src={staticFile("vo-e.mp3")} volume={VO_GAIN} />
      </Sequence>
      <Sequence name="VO — ten years running" from={3 * HIT + 8} durationInFrames={40} layout="none">
        <Audio src={staticFile("vo-f.mp3")} volume={VO_GAIN} />
      </Sequence>
      <Sequence name="VO — coming soon" from={4 * HIT + 24} durationInFrames={33} layout="none">
        <Audio src={staticFile("vo-g.mp3")} volume={VO_GAIN} />
      </Sequence>
      <Sequence name="Impact — ten years" from={3 * HIT} durationInFrames={110} layout="none">
        <Audio src={staticFile("impact.mp3")} volume={0.42} />
      </Sequence>
      <Sequence name="Impact — 2027" from={4 * HIT} durationInFrames={110} layout="none">
        <Audio src={staticFile("impact.mp3")} volume={0.5} />
      </Sequence>
      {[HIT, 2 * HIT].map((cut) => (
        <Sequence key={cut} name={`Whoosh ${cut}`} from={cut - 7} durationInFrames={24} layout="none">
          <Audio src={staticFile("whoosh.mp3")} volume={0.4} />
        </Sequence>
      ))}

      {/* ---------- picture ---------- */}
      <AbsoluteFill style={{ translate: `${s[0][0] + s[1][0]}px ${s[0][1] + s[1][1]}px` }}>
        <Sequence name="Convoy" durationInFrames={HIT}>
          <Convoy />
        </Sequence>
        <Sequence name="Handicap gag" from={HIT} durationInFrames={HIT}>
          <HandicapGag />
        </Sequence>
        <Sequence name="Sunrise" from={2 * HIT} durationInFrames={HIT}>
          <Dawn />
        </Sequence>
        <Sequence name="Ten years running" from={3 * HIT} durationInFrames={HIT}>
          <TenYears />
        </Sequence>
        <Sequence name="2027 — coming soon" from={4 * HIT} durationInFrames={TEASER_DURATION - 4 * HIT}>
          <ComingSoon />
        </Sequence>
      </AbsoluteFill>

      <Flash at={HIT} strength={0.3} />
      <Flash at={2 * HIT} strength={0.3} />
      <Flash at={3 * HIT} strength={0.85} />
      <Flash at={4 * HIT} strength={0.9} />
      <Grain opacity={0.05} />
      <Vignette strength={0.45} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: bars, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: bars, background: "#000" }} />
      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: interpolate(frame, [TEASER_DURATION - 34, TEASER_DURATION - 4], [0, 1], clamp),
        }}
      />
    </AbsoluteFill>
  );
};

/** Standalone teaser for the site's 2027 section. */
export const Teaser2027: React.FC = () => <TeaserAct />;
