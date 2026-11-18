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
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (reduced.matches) return;
          if (entry.isIntersecting) {
            video.currentTime = 0;
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }),
      { threshold: 0.4 },
    );
    io.observe(video);
    return () => io.disconnect();
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

/** Close-up slo-mo: driver meets ball, turf flies, ball screams off frame. */
export function TeeShotScene() {
  return (
    <CinemaScene
      src="/cinema/tee-strike.mp4"
      poster="/cinema/tee-strike-poster.jpg"
      caption="The strike · super slo-mo"
      bg="bg-[#f7f5f0]"
      captionClass="text-black/40"
    />
  );
}

/** The supercharged cart sends it over the bunker. Club rules are silent on this. */
export function CartJumpScene() {
  return (
    <CinemaScene
      src="/cinema/cart-jump.mp4"
      poster="/cinema/cart-jump-poster.jpg"
      caption="Cart path optional"
      bg="bg-[#f7f5f0]"
      captionClass="text-black/40"
    />
  );
}

/** Approach shot bounces on, tracks at the cup, orbits the lip... stays out. */
export function LipOutScene() {
  return (
    <CinemaScene
      src="/cinema/lip-out.mp4"
      poster="/cinema/lip-out-poster.jpg"
      caption="The approach · so, so close"
      bg="bg-[#1a3c34]"
      captionClass="text-white/40"
    />
  );
}
