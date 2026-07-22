"use client";

import { useEffect, useState } from "react";

const TRIP_AT = new Date("2026-08-20T17:00:00-07:00").getTime();

function remainingDays() {
  return Math.max(0, Math.ceil((TRIP_AT - Date.now()) / 86_400_000));
}

export default function TripDayCount() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    // Browser time keeps the command center accurate without baking a build date into the page.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDays(remainingDays());
    const timer = window.setInterval(() => setDays(remainingDays()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return <span suppressHydrationWarning>{days ?? "—"}</span>;
}
