"use client";

import { useState } from "react";

export default function ShareTeamGuide() {
  const [copied, setCopied] = useState(false);

  async function share() {
    const payload = {
      title: "The Strand · On-Course Caddie",
      text: "Private Gamble Sands caddie: choose the course, hole, format and shot for an instant green/yellow/red decision. Access code required.",
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(payload).catch(() => undefined);
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={share}
      className="rounded-full border border-white/16 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/78 transition hover:border-white/30 hover:text-white"
    >
      {copied ? "Link copied ✓" : "Share course book"}
    </button>
  );
}
