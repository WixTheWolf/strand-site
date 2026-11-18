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
