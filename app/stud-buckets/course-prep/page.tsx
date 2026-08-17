import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";

import AccessGate from "../access-gate";
import CourseCaddie from "./course-caddie";
import GambleTrafficLights from "./gamble-traffic-lights";
import ShareTeamGuide from "./share-team-guide";
import TeamHero from "./team-hero";
import TeamPrepMetrics from "./team-prep-metrics";
import WinningBlueprint from "./winning-blueprint";
import { COURSE_SOURCE_NOTE } from "@/lib/course-intelligence";
import { HOLE_PHOTO_SOURCES } from "@/lib/course-humor";
import {
  COURSE_INTEL_ACCESS_COOKIE,
  courseIntelAccessConfigured,
  STUD_BUCKETS_ACCESS_COOKIE,
  verifyCourseIntelSession,
  verifyStudBucketsSession,
} from "@/lib/stud-buckets-auth";

export const metadata: Metadata = {
  title: "Brewster Boys Field Manual | Gamble Sands 2026",
  description: "Private Brewster Boys course intel, player jobs and format-aware decisions.",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function CoursePrepPage() {
  const cookieStore = await cookies();
  const captainSession = cookieStore.get(STUD_BUCKETS_ACCESS_COOKIE)?.value;
  const courseSession = cookieStore.get(COURSE_INTEL_ACCESS_COOKIE)?.value;
  const authorized =
    verifyStudBucketsSession(captainSession) || verifyCourseIntelSession(courseSession);

  if (!authorized) {
    return <AccessGate configured={courseIntelAccessConfigured()} scope="course" />;
  }

  return (
    <div id="top" className="min-h-screen bg-[#f4f0e7] text-[#10201b]">
      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#071b18]/95 text-white backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="#top" className="flex items-center gap-3">
            <Image
              src="/brand/brewster-boys-cutout.png"
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 object-contain drop-shadow-[0_7px_10px_rgba(0,0,0,.35)]"
            />
            <span><span className="block text-[9px] uppercase tracking-[0.2em] text-white/38">Play smart · stay loose</span><span className="block text-sm font-semibold">Brewster Boys Field Manual</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <nav className="hidden items-center gap-1 md:flex" aria-label="Field manual sections">
              <Link href="#win-plan" className="rounded-full bg-[#efbd88]/12 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#efbd88] hover:bg-[#efbd88]/20">Win plan</Link>
              <Link href="#gamble-18" className="rounded-full px-4 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-white/52 hover:bg-white/8 hover:text-white">Gamble 18</Link>
              <Link href="#caddie" className="rounded-full px-4 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-white/52 hover:bg-white/8 hover:text-white">Caddie</Link>
              <Link href="#team-metrics" className="rounded-full px-4 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-white/52 hover:bg-white/8 hover:text-white">The Boys</Link>
            </nav>
            <ShareTeamGuide />
          </div>
        </div>
      </header>

      <TeamHero />
      <WinningBlueprint />
      <GambleTrafficLights />
      <CourseCaddie />
      <TeamPrepMetrics />

      <footer className="bg-[#071b18] px-5 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#efbd88]">Brewster Boys · Gamble Sands · 2026</div>
          <p className="mt-3 max-w-xl text-sm font-semibold text-white/70">
            Ten boys. One brew. Bring the damn thing home.
          </p>
          <p className="mt-2 max-w-3xl text-xs leading-5 text-white/32">{COURSE_SOURCE_NOTE}</p>
          <p className="mt-2 max-w-3xl text-xs leading-5 text-white/32">
            Every hole photo is mapped to a labeled course-and-hole record. Photo sources:{" "}
            {HOLE_PHOTO_SOURCES.map((source, index) => (
              <span key={source.courses}>
                {index > 0 ? " · " : ""}
                <a
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-white/25 underline-offset-2 hover:text-white/60"
                >
                  {source.courses}: {source.label}
                </a>
              </span>
            ))}
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
