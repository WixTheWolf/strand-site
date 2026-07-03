interface MarqueeProps {
  items: string[];
  className?: string;
  /** CSS duration, e.g. "32s" */
  speed?: string;
}

/** Seamless CSS ticker — the track renders twice and scrolls -50%. */
export default function Marquee({ items, className = "", speed = "32s" }: MarqueeProps) {
  const segment = (key: string) => (
    <span key={key} className="inline-flex items-center" aria-hidden={key === "b"}>
      {items.map((item) => (
        <span key={`${key}-${item}`} className="inline-flex items-center">
          <span className="px-6">{item}</span>
          <span className="text-[0.6em] opacity-40">✦</span>
        </span>
      ))}
    </span>
  );

  return (
    <div className={`marquee ${className}`}>
      <div className="marquee-track" style={{ ["--marquee-speed" as string]: speed }}>
        {segment("a")}
        {segment("b")}
      </div>
    </div>
  );
}
