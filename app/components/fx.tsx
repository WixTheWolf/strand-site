"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/* ---------------- Scroll progress bar ---------------- */

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      if (barRef.current) barRef.current.style.width = `${pct}%`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]" aria-hidden>
      <div
        ref={barRef}
        className="h-full w-0 bg-gradient-to-r from-[#1a3c34] via-[#2e8b64] to-[#c9a227]"
      />
    </div>
  );
}

/* ---------------- Live countdown to the first tee ---------------- */

const TEE_OFF = new Date("2026-08-20T17:00:00-07:00").getTime();

function diffParts(now: number, target: number) {
  const total = Math.max(0, target - now);
  return {
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total / 3_600_000) % 24),
    minutes: Math.floor((total / 60_000) % 60),
    seconds: Math.floor((total / 1000) % 60),
    done: total === 0,
  };
}

export function Countdown({
  className = "",
  target = TEE_OFF,
  doneText = "It's go time — QuickSands at 5:00 PM",
  caption = ["Until the", "first tee"],
  ariaLabel = "Countdown to the QuickSands warm-up",
  tone = "dark",
}: {
  className?: string;
  target?: number;
  doneText?: string;
  caption?: [string, string];
  ariaLabel?: string;
  tone?: "dark" | "light";
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // Clock can only start client-side; the SSR render shows placeholders
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const cellClass = tone === "dark" ? "border-white/15 bg-black/25 backdrop-blur-sm" : "border-black/10 bg-white";
  const numClass = tone === "dark" ? "text-white" : "text-[#111]";
  const unitClass = tone === "dark" ? "text-white/50" : "text-black/45";
  const captionClass = tone === "dark" ? "text-white/60" : "text-black/55";

  const parts = now === null ? null : diffParts(now, target);
  const cells: { label: string; value: string }[] = [
    { label: "Days", value: parts ? String(parts.days) : "—" },
    { label: "Hrs", value: parts ? String(parts.hours).padStart(2, "0") : "—" },
    { label: "Min", value: parts ? String(parts.minutes).padStart(2, "0") : "—" },
    { label: "Sec", value: parts ? String(parts.seconds).padStart(2, "0") : "—" },
  ];

  if (parts?.done) {
    return (
      <div className={`text-sm font-medium uppercase tracking-[0.2em] ${className}`}>
        {doneText}
      </div>
    );
  }

  return (
    <div className={`flex items-stretch gap-2 ${className}`} role="timer" aria-label={ariaLabel}>
      {cells.map((cell) => (
        <div
          key={cell.label}
          className={`min-w-[64px] rounded-lg border px-3 py-2 text-center ${cellClass}`}
        >
          <div className={`font-mono text-2xl font-medium tabular-nums leading-none ${numClass}`} suppressHydrationWarning>
            {cell.value}
          </div>
          <div className={`mt-1.5 text-[9px] uppercase tracking-[0.24em] ${unitClass}`}>{cell.label}</div>
        </div>
      ))}
      <div className="ml-1 hidden flex-col justify-center sm:flex">
        <span className={`text-[10px] uppercase tracking-[0.2em] ${captionClass}`}>{caption[0]}</span>
        <span className={`text-[10px] uppercase tracking-[0.2em] ${captionClass}`}>{caption[1]}</span>
      </div>
    </div>
  );
}

/* ---------------- Magnetic hover (buttons) ---------------- */

export function Magnetic({
  children,
  className = "",
  strength = 0.3,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      const node = ref.current;
      if (!node || prefersReducedMotion() || e.pointerType !== "mouse") return;
      const rect = node.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      node.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    },
    [strength],
  );

  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "";
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-transform duration-300 ease-out will-change-transform ${className}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </div>
  );
}

/* ---------------- 3D tilt (cards) ---------------- */

export function TiltCard({
  children,
  className = "",
  maxTilt = 7,
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      const node = ref.current;
      if (!node || prefersReducedMotion() || e.pointerType !== "mouse") return;
      const rect = node.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      node.style.transform = `perspective(900px) rotateX(${(-py * maxTilt).toFixed(2)}deg) rotateY(${(px * maxTilt).toFixed(2)}deg) scale(1.015)`;
    },
    [maxTilt],
  );

  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "";
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-transform duration-300 ease-out will-change-transform ${className}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </div>
  );
}

/* ---------------- Holographic sheen that follows the cursor ---------------- */

export function Holo({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.PointerEvent) => {
    const node = ref.current;
    if (!node || e.pointerType !== "mouse") return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--mx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    node.style.setProperty("--my", `${((e.clientY - rect.top) / rect.height) * 100}%`);
    node.classList.add("holo-active");
  }, []);

  const onLeave = useCallback(() => {
    ref.current?.classList.remove("holo-active");
  }, []);

  return (
    <div ref={ref} className={`holo ${className}`} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </div>
  );
}

/* ---------------- Count-up number on first view ---------------- */

export function CountUp({
  value,
  suffix = "",
  duration = 1200,
  className = "",
}: {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || started.current) return;
        started.current = true;
        if (prefersReducedMotion()) {
          setDisplay(value);
          return;
        }
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / duration);
          setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {display}
      {suffix}
    </span>
  );
}

/* ---------------- Confetti burst (draft complete) ---------------- */

const CONFETTI_COLORS = ["#2e8b64", "#d2691e", "#c9a227", "#f7f5f0", "#1a3c34"];

/** Deterministic pseudo-random in [0,1) so render stays pure and SSR-safe */
function seededRandom(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function Confetti({ pieces = 90 }: { pieces?: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        left: seededRandom(i * 7 + 1) * 100,
        delay: seededRandom(i * 7 + 2) * 0.6,
        duration: 2.4 + seededRandom(i * 7 + 3) * 1.8,
        size: 6 + seededRandom(i * 7 + 4) * 7,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        spin: (seededRandom(i * 7 + 5) > 0.5 ? 1 : -1) * (420 + seededRandom(i * 7 + 6) * 540),
        drift: (seededRandom(i * 7 + 7) - 0.5) * 30,
      })),
    [pieces],
  );
  const [gone, setGone] = useState(false);

  // Under prefers-reduced-motion the pieces never animate and sit off-screen
  // (top: -3vh), so the only job here is unmounting after the show ends.
  useEffect(() => {
    const id = setTimeout(() => setGone(true), 5200);
    return () => clearTimeout(id);
  }, []);

  if (gone) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden" aria-hidden>
      {bits.map((bit, i) => (
        <span
          key={i}
          className="confetti-bit"
          style={
            {
              left: `${bit.left}%`,
              width: bit.size,
              height: bit.size * 0.45,
              background: bit.color,
              "--confetti-duration": `${bit.duration}s`,
              "--confetti-delay": `${bit.delay}s`,
              "--confetti-spin": `${bit.spin}deg`,
              "--confetti-drift": `${bit.drift}vw`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/* ---------------- Back to top ---------------- */

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 900);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" })}
      className={`fixed bottom-6 right-6 z-[60] flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#111]/85 text-white shadow-lg backdrop-blur transition-all duration-400 hover:bg-[#1a3c34] ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
        <path d="M12 19V5m-6 6 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
