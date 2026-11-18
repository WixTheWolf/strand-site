"use client";

import { useEffect, useRef } from "react";

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

/** Dusk slo-mo: the strike, with a broadcast-style shot tracer. */
export function TeeShotScene() {
  return (
    <CinemaScene
      src="/cinema/tee-strike.mp4"
      poster="/cinema/tee-strike-poster.jpg"
      caption="The strike"
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
