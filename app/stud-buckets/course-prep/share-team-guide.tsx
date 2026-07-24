"use client";

import { useState } from "react";

export default function ShareTeamGuide() {
  const [copied, setCopied] = useState(false);

  async function share() {
    const payload = {
      title: "The Strand · Gamble Sands Course Book",
      text: "Private Gamble Sands course intel: local rules, course identity and a hole-by-hole plan for all 50 holes. Access code required.",
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
