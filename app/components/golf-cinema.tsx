"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Golf cinema — short films rendered with Remotion (source in /remotion),
 * shipped as tiny looping MP4s. Each scene restarts from the top whenever it
 * scrolls into view, and stays on its poster frame for users who prefer
 * reduced motion.
 */

function CinemaScene({
  src,
  poster,
  caption,
  bg,
  captionClass,
}: {
  src: string;
  poster: string;
  caption: string;
  bg: string;
  captionClass: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onReducedChange = () => {
      if (reduced.matches) video.pause();
    };
    reduced.addEventListener("change", onReducedChange);
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4 && !reduced.matches) {
            video.currentTime = 0;
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }),
      { threshold: [0, 0.4] },
    );
    io.observe(video);
    return () => {
      io.disconnect();
      reduced.removeEventListener("change", onReducedChange);
    };
  }, []);

  return (
    <div aria-hidden className={`relative select-none ${bg}`}>
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        className="mx-auto block w-full max-w-[1920px]"
        style={{ aspectRatio: "3 / 1", objectFit: "cover", minHeight: 150 }}
      >
        <source src={src} type="video/mp4" />
      </video>
      <p className={`label pointer-events-none absolute left-5 top-5 md:left-8 ${captionClass}`}>
        {caption}
      </p>
    </div>
  );
}

/** Golden-hour slo-mo of the strike itself — ElevenLabs-generated footage. */
export function TeeShotScene() {
  return (
    <CinemaScene
      src="/cinema/strike-real.mp4"
      poster="/cinema/strike-real-poster.jpg"
      caption="The strike"
      bg="bg-[#1f1a0f]"
      captionClass="text-white/40"
    />
  );
}

/** Dusk illustration: the drive, with a broadcast-style gold shot tracer. */
export function TracerScene() {
  return (
    <CinemaScene
      src="/cinema/tee-strike.mp4"
      poster="/cinema/tee-strike-poster.jpg"
      caption="The ninth Strand, in one swing"
      bg="bg-[#0a1b16]"
      captionClass="text-white/35"
    />
  );
}

/** A silhouetted cart sends it over the bunker at dusk. */
export function CartJumpScene() {
  return (
    <CinemaScene
      src="/cinema/cart-jump.mp4"
      poster="/cinema/cart-jump-poster.jpg"
      caption="Cart path optional"
      bg="bg-[#0a1b16]"
      captionClass="text-white/35"
    />
  );
}

/** The approach runs out, rides the lip, and stays up. */
export function LipOutScene() {
  return (
    <CinemaScene
      src="/cinema/lip-out.mp4"
      poster="/cinema/lip-out-poster.jpg"
      caption="The approach · so, so close"
      bg="bg-[#0a1b16]"
      captionClass="text-white/35"
    />
  );
}

/**
 * Hero background film: a slow, graded Ken Burns pass over real 2026 frames.
 * Plays continuously; holds its poster under prefers-reduced-motion.
 */
export function HeroFilmLayer() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (reduced.matches) video.pause();
      else video.play().catch(() => {});
    };
    sync();
    reduced.addEventListener("change", sync);
    return () => reduced.removeEventListener("change", sync);
  }, []);

  return (
    <video
      ref={videoRef}
      aria-hidden
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster="/cinema/hero-sands-poster.jpg"
      className="absolute inset-0 h-full w-full object-cover"
    >
      <source src="/cinema/hero-sands.mp4" type="video/mp4" />
    </video>
  );
}

/**
 * Dusk ambience: a 30s ElevenLabs field-recording loop of the course at dusk.
 * Strictly opt-in — silent until the visitor asks for it.
 */
export function AmbienceToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    return () => audioRef.current?.pause();
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (on) {
      audio.pause();
      setOn(false);
    } else {
      audio.volume = 0.55;
      audio
        .play()
        .then(() => setOn(true))
        .catch(() => {});
    }
  };

  return (
    <div className={on ? "snd-on" : ""}>
      <audio ref={audioRef} src="/audio/dusk-ambience.mp3" loop preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={on}
        className="group flex items-center gap-3 rounded-full border border-white/25 bg-black/25 px-4 py-2 backdrop-blur-sm transition-colors hover:border-white/50"
      >
        <span className="flex h-3.5 items-end gap-[3px]" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="snd-bar block h-full w-[2.5px] rounded-full bg-[#e8c86a]" />
          ))}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-white/70 group-hover:text-white">
          {on ? "Sound on" : "Sound"}
        </span>
      </button>
    </div>
  );
}

/**
 * The 2027 teaser: a click-to-play trailer with sound. Shows its poster until
 * the visitor presses play, then hands over to native controls.
 */
export function TeaserPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-[#c9a227]/35 bg-black shadow-[0_0_80px_rgba(201,162,39,0.14)]">
      <video
        ref={videoRef}
        poster="/films/teaser-2027-poster.jpg"
        preload="none"
        playsInline
        controls={started}
        onEnded={() => setStarted(false)}
        className="block aspect-video w-full"
      >
        <source src="/films/teaser-2027.mp4" type="video/mp4" />
      </video>
      {started ? null : (
        <button
          type="button"
          aria-label="Play the 2027 teaser"
          onClick={() => {
            setStarted(true);
            videoRef.current?.play().catch(() => {});
          }}
          className="group absolute inset-0 flex flex-col items-center justify-end gap-4 bg-gradient-to-t from-black/70 via-black/10 to-transparent pb-8 md:pb-10"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#e8c86a]/70 bg-black/40 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 md:h-20 md:w-20">
            <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-[#e8c86a] md:h-7 md:w-7" aria-hidden>
              <path d="M6 4l14 8-14 8z" />
            </svg>
          </span>
          <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/80">
            Watch the teaser · 26s · sound on
          </span>
        </button>
      )}
    </div>
  );
}
