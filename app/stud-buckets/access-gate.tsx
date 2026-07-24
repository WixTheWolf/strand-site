"use client";

import { FormEvent, useState } from "react";

export default function AccessGate({
  configured,
  scope = "hq",
}: {
  configured: boolean;
  scope?: "hq" | "course";
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/stud-buckets/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, scope }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Unable to open team HQ.");
      window.location.reload();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to open team HQ.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#071b18] px-5 py-16 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(230,154,73,0.24),transparent_32%),radial-gradient(circle_at_80%_70%,rgba(82,132,113,0.22),transparent_36%)]" />
      <div className="absolute -left-28 top-16 h-72 w-72 rounded-full border border-white/5" />
      <div className="absolute -right-36 bottom-0 h-96 w-96 rounded-full border border-white/5" />

      <section className="relative w-full max-w-md rounded-[2rem] border border-white/12 bg-white/[0.07] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-[#e39a50]/35 bg-[#e39a50]/12 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f2c18e]">
            Team only
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">Gamble Sands · 2026</span>
        </div>

        <div className="mt-10">
          <div className="text-sm uppercase tracking-[0.32em] text-white/45">Stud Buckets</div>
          <h1 className="mt-3 text-5xl font-semibold leading-[0.9] tracking-[-0.065em] sm:text-6xl">
            Enter the
            <br />
            bucket.
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/58">
            {scope === "course"
              ? "A private on-course caddie: choose the course, hole, format and shot for one clear decision."
              : "Captain access to team roles, pairings, matchup intelligence and the path to 38."}
          </p>
        </div>

        {configured ? (
          <form onSubmit={submit} className="mt-9">
            <label htmlFor="team-code" className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
              Team access code
            </label>
            <input
              id="team-code"
              type="password"
              autoComplete="current-password"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Enter code"
              className="mt-3 w-full rounded-2xl border border-white/12 bg-black/20 px-4 py-4 text-base text-white outline-none transition placeholder:text-white/25 focus:border-[#e39a50]/70 focus:ring-4 focus:ring-[#e39a50]/10"
            />
            {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="mt-4 w-full rounded-2xl bg-[#e39a50] px-5 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#13231e] transition hover:bg-[#efad68] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {loading ? "Opening the bucket…" : "Open the bucket"}
            </button>
          </form>
        ) : (
          <div className="mt-9 rounded-2xl border border-amber-300/20 bg-amber-200/10 p-4 text-sm leading-6 text-amber-100/80">
            Team access needs one Vercel environment variable before this page can open: <span className="font-mono text-amber-100">STUD_BUCKETS_ACCESS_CODE</span>.
          </div>
        )}

        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.18em] text-white/28">
          {scope === "course" ? "Course intel only · private field guide" : "Ten studs · one bucket · 38 points"}
        </p>
      </section>
    </main>
  );
}
