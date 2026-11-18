import { loadFont } from "@remotion/fonts";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

/** Shared kinetic-type kit for the Strand films. */

loadFont({ family: "Geist", url: staticFile("geist.woff2"), weight: "100 900" });
export const FONT = "Geist, Helvetica, Arial, sans-serif";

export const GOLD_SOFT = "#e8c86a";
export const BONE = "#f4f2ea";
export const INK = "#07130f";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const expoOut = Easing.out(Easing.exp);

/* ------------------------------------------------------------------ */
/* Kinetic type                                                        */
/* ------------------------------------------------------------------ */

/** Text that slams in: oversized → 1, with a brief RGB-split ghost. */
export const Slam: React.FC<{
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
export const Stagger: React.FC<{
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

export const Kicker: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({
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


export const Flash: React.FC<{ at: number; strength?: number }> = ({ at, strength = 0.9 }) => {
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

