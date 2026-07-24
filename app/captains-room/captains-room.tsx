"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CAPTAIN_PLAYERS, READY_CHECK, TEAM_RULES } from "@/lib/captains-room";

const EVENT_DATE = new Date("2026-08-21T08:00:00-07:00");
const daysUntil = () => Math.max(0, Math.ceil((EVENT_DATE.getTime() - Date.now()) / 86400000));

export default function CaptainsRoom() {
  const [selectedId, setSelectedId] = useState(CAPTAIN_PLAYERS[0].id);
  const [checked, setChecked] = useState<string[]>([]);
  const [days, setDays] = useState(daysUntil());
  const player = useMemo(() => CAPTAIN_PLAYERS.find((item) => item.id === selectedId) ?? CAPTAIN_PLAYERS[0], [selectedId]);

  useEffect(() => {
    const saved = window.localStorage.getItem("strand-ready-check");
    if (saved) setChecked(JSON.parse(saved));
    const timer = window.setInterval(() => setDays(daysUntil()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  function toggle(item: string) {
    const next = checked.includes(item) ? checked.filter((value) => value !== item) : [...checked, item];
    setChecked(next);
    window.localStorage.setItem("strand-ready-check", JSON.stringify(next));
  }

  async function logout() {
    await fetch("/api/stud-buckets/logout", { method: "POST" });
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-[#eee8dc] text-[#10201b]">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#071b18]/95 text-white backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <Link href="#top" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5a15d] text-sm font-black text-[#10251e]">W</span>
            <span><span className="block text-[9px] uppercase tracking-[.24em] text-white/40">The Strand 2026</span><span className="block text-sm font-bold">Captain’s Room</span></span>
          </Link>
          <nav className="hidden gap-5 text-[10px] font-bold uppercase tracking-[.16em] text-white/55 md:flex">
            <Link href="#role">My role</Link><Link href="#prep">Prepare</Link><Link href="#tools">Tools</Link><Link href="#rules">Team code</Link>
          </nav>
          <button onClick={logout} className="rounded-full border border-white/15 px-3 py-2 text-[9px] font-bold uppercase tracking-[.16em] text-white/55">Lock</button>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden bg-[#071b18] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(229,161,93,.28),transparent_30%),radial-gradient(circle_at_85%_50%,rgba(70,128,105,.28),transparent_34%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
            <div>
              <div className="inline-flex rounded-full border border-[#e5a15d]/35 bg-[#e5a15d]/10 px-4 py-2 text-[9px] font-black uppercase tracking-[.2em] text-[#f2c28e]">Nine players · one captain · zero donated holes</div>
              <h1 className="mt-7 max-w-[11ch] text-6xl font-semibold leading-[.88] tracking-[-.075em] sm:text-7xl md:text-8xl">Show up ready. Leave with the points.</h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-white/60">Your personal role, preparation plan, match-play rules, course tools, and tournament-week checklist for August 21–22.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#role" className="rounded-full bg-[#e5a15d] px-5 py-3 text-[10px] font-black uppercase tracking-[.17em] text-[#10251e]">Find my assignment</Link>
                <Link href="/stud-buckets/course-prep" className="rounded-full border border-white/15 px-5 py-3 text-[10px] font-black uppercase tracking-[.17em] text-white/75">Open course intel</Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat value={String(days)} label="Days to first ball" /><Stat value="38" label="Point target" />
              <div className="col-span-2 rounded-[1.75rem] border border-white/10 bg-white/[.06] p-6">
                <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#f2c28e]">Captain Wix says</p>
                <p className="mt-3 text-xl font-semibold leading-8">“You do not need your best swing for two days. You need committed decisions, useful misses, and a short memory.”</p>
              </div>
            </div>
          </div>
        </section>

        <section id="role" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 md:px-8 md:py-24">
          <Eyebrow>Your assignment</Eyebrow><Title>Everybody has a job.</Title>
          <div className="mt-8 flex gap-2 overflow-x-auto pb-3">
            {CAPTAIN_PLAYERS.map((item) => <button key={item.id} onClick={() => setSelectedId(item.id)} className={`shrink-0 rounded-full px-4 py-3 text-[10px] font-black uppercase tracking-[.14em] ${selectedId === item.id ? "bg-[#0b2b23] text-white" : "border border-black/10 bg-white text-black/55"}`}>{item.nickname}</button>)}
          </div>
          <article className="mt-5 overflow-hidden rounded-[2.25rem] border border-black/8 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[.8fr_1.2fr]">
              <div className="bg-[#0b2b23] p-7 text-white md:p-10">
                <div className="text-[10px] font-black uppercase tracking-[.22em] text-[#f2c28e]">{player.name}</div>
                <h3 className="mt-4 text-4xl font-semibold tracking-[-.05em]">{player.role}</h3>
                <p className="mt-4 text-lg leading-7 text-white/65">{player.headline}</p>
                <div className="mt-8 flex flex-wrap gap-2">{player.strengths.map((strength) => <span key={strength} className="rounded-full border border-white/12 bg-white/[.06] px-3 py-2 text-[9px] font-bold uppercase tracking-[.15em] text-white/70">{strength}</span>)}</div>
                <div className="mt-10 rounded-3xl bg-black/20 p-5"><div className="text-[9px] font-black uppercase tracking-[.2em] text-[#f2c28e]">From the captain</div><p className="mt-3 text-sm leading-6 text-white/65">{player.note}</p></div>
              </div>
              <div className="p-7 md:p-10">
                <div className="text-[9px] font-black uppercase tracking-[.2em] text-black/35">Mission</div>
                <p className="mt-3 max-w-3xl text-2xl font-semibold leading-9">{player.mission}</p>
                <div className="mt-9 grid gap-3 sm:grid-cols-2">{Object.entries(player.formats).map(([format, plan]) => <div key={format} className="rounded-2xl bg-[#f2eee6] p-5"><div className="text-[9px] font-black uppercase tracking-[.18em] text-[#9a6031]">{format}</div><p className="mt-2 text-sm leading-6 text-black/60">{plan}</p></div>)}</div>
              </div>
            </div>
          </article>
        </section>

        <section id="prep" className="scroll-mt-24 bg-[#0b2b23] py-16 text-white md:py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <Eyebrow light>Preparation</Eyebrow><Title light>Practice what travels.</Title>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/50">No swing rebuilds. Build a tee ball, eliminate three-putts, sharpen simple wedges, and arrive fresh.</p>
            <div className="mt-10 grid gap-4 md:grid-cols-3">{player.prep.map((item, index) => <article key={item} className="rounded-[1.75rem] border border-white/10 bg-white/[.055] p-6"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e5a15d] text-sm font-black text-[#10251e]">{index + 1}</div><p className="mt-5 text-lg font-semibold leading-7">{item}</p></article>)}</div>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              <PrepPhase label="Now through Aug. 9" title="Build the floor">Two focused practices and one competitive round weekly. Track penalties and three-putts.</PrepPhase>
              <PrepPhase label="Aug. 10–16" title="Sharpen the weapons">Short game, putting, stock tee shot, and match play.</PrepPhase>
              <PrepPhase label="Tournament week" title="Fresh beats fried" accent>One light tune-up. Sleep, hydrate, stretch, and pack early.</PrepPhase>
            </div>
          </div>
        </section>

        <section id="tools" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 md:px-8 md:py-24">
          <Eyebrow>Tournament tools</Eyebrow><Title>Everything useful. Nothing noisy.</Title>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Tool href="/stud-buckets/course-prep" icon="⛳" title="Course Intel">Choose course, hole, and format for a fast green-light or red-light plan.</Tool>
            <Tool href="/live" icon="📊" title="Live Scoring">Know front, back, overall, and team score without guesswork.</Tool>
            <Tool href="#reset" icon="🧠" title="60-Second Reset">A simple routine after a disaster hole.</Tool>
            <Tool href="#checklist" icon="✅" title="Ready Check">Your phone remembers what is packed, charged, and handled.</Tool>
          </div>
          <div id="reset" className="mt-12 rounded-[2.25rem] bg-[#0b2b23] p-7 text-white md:p-10">
            <Eyebrow light>After a bad hole</Eyebrow>
            <div className="mt-6 grid gap-3 md:grid-cols-4">{[["1", "Name it", "That hole is over."], ["2", "Breathe", "In for four, out for six."], ["3", "Update", "Say the real match status."], ["4", "Commit", "Pick one target and make a useful swing."]].map(([n, title, copy]) => <div key={title} className="rounded-2xl bg-white/[.065] p-5"><div className="text-3xl font-semibold text-[#f2c28e]">{n}</div><h3 className="mt-3 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/50">{copy}</p></div>)}</div>
          </div>
          <div id="checklist" className="mt-12 grid gap-6 rounded-[2.25rem] border border-black/8 bg-white p-7 md:p-10 lg:grid-cols-[.7fr_1.3fr]">
            <div><Eyebrow>Ready check</Eyebrow><h3 className="mt-3 text-4xl font-semibold tracking-[-.05em]">{checked.length}/{READY_CHECK.length} handled.</h3><p className="mt-4 text-sm leading-6 text-black/50">Saved on this device. Finish it before tournament week.</p><div className="mt-6 h-3 overflow-hidden rounded-full bg-[#eee8dc]"><div className="h-full rounded-full bg-[#e5a15d]" style={{ width: `${(checked.length / READY_CHECK.length) * 100}%` }} /></div></div>
            <div className="grid gap-2 sm:grid-cols-2">{READY_CHECK.map((item) => <button key={item} onClick={() => toggle(item)} className={`flex items-center gap-3 rounded-2xl border p-4 text-left text-sm font-semibold ${checked.includes(item) ? "border-[#4c7d6b]/20 bg-[#e7f0eb] text-black/50" : "border-black/8 bg-[#f8f6f1]"}`}><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${checked.includes(item) ? "bg-[#31594d] text-white" : "border border-black/15"}`}>{checked.includes(item) ? "✓" : ""}</span><span className={checked.includes(item) ? "line-through" : ""}>{item}</span></button>)}</div>
          </div>
        </section>

        <section id="rules" className="bg-[#d9d0bf] py-16 md:py-24"><div className="mx-auto max-w-7xl px-5 md:px-8"><Eyebrow>The team code</Eyebrow><Title>Golf that travels.</Title><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{TEAM_RULES.map(([title, copy], index) => <article key={title} className="rounded-[1.75rem] bg-[#eee8dc] p-6"><div className="text-[10px] font-black uppercase tracking-[.2em] text-[#9a6031]">Rule {index + 1}</div><h3 className="mt-3 text-2xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-black/55">{copy}</p></article>)}</div></div></section>
      </main>
      <footer className="bg-[#071b18] px-5 py-10 text-center text-white"><p className="text-xl font-semibold">The Stud Buckets</p><p className="mt-2 text-[9px] font-bold uppercase tracking-[.22em] text-white/35">Prepared by Captain Wix · Gamble Sands · August 21–22, 2026</p></footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) { return <div className="rounded-[1.75rem] border border-white/10 bg-white/[.06] p-6"><div className="text-5xl font-semibold tracking-[-.06em] text-[#f2c28e]">{value}</div><div className="mt-2 text-[9px] font-bold uppercase tracking-[.2em] text-white/40">{label}</div></div>; }
function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) { return <p className={`text-[10px] font-black uppercase tracking-[.24em] ${light ? "text-[#f2c28e]" : "text-[#9a6031]"}`}>{children}</p>; }
function Title({ children, light = false }: { children: React.ReactNode; light?: boolean }) { return <h2 className={`mt-3 text-4xl font-semibold tracking-[-.055em] md:text-6xl ${light ? "text-white" : ""}`}>{children}</h2>; }
function PrepPhase({ label, title, accent = false, children }: { label: string; title: string; accent?: boolean; children: React.ReactNode }) { return <div className={`rounded-[1.75rem] p-6 ${accent ? "bg-[#e5a15d] text-[#10251e]" : "bg-white text-[#10201b]"}`}><div className="text-[9px] font-black uppercase tracking-[.2em] opacity-50">{label}</div><h3 className="mt-3 text-2xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 opacity-60">{children}</p></div>; }
function Tool({ href, icon, title, children }: { href: string; icon: string; title: string; children: React.ReactNode }) { return <Link href={href} className="rounded-[1.75rem] border border-black/8 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"><div className="text-3xl">{icon}</div><h3 className="mt-5 text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-black/50">{children}</p><div className="mt-5 text-[10px] font-black uppercase tracking-[.16em] text-[#9a6031]">Open →</div></Link>; }
