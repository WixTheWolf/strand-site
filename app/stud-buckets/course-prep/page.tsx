import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

import AccessGate from "../access-gate";
import CourseCaddie from "./course-caddie";
import ShareTeamGuide from "./share-team-guide";
import { COURSE_SOURCE_NOTE } from "@/lib/course-intelligence";
import {
  COURSE_INTEL_ACCESS_COOKIE,
  courseIntelAccessConfigured,
  STUD_BUCKETS_ACCESS_COOKIE,
  verifyCourseIntelSession,
  verifyStudBucketsSession,
} from "@/lib/stud-buckets-auth";

export const metadata: Metadata = {
  title: "Gamble Sands Course Book | The Strand 2026",
  description: "Private Gamble Sands course intelligence and hole-by-hole preparation.",
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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="#top" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e39a50] text-sm font-black text-[#10251e]">SB</span>
            <span><span className="block text-[9px] uppercase tracking-[0.2em] text-white/38">Private course intel</span><span className="block text-sm font-semibold">Strand Caddie</span></span>
          </Link>
          <ShareTeamGuide />
        </div>
      </header>

      <CourseCaddie />

      <footer className="bg-[#071b18] px-5 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/32">Gamble Sands · 2026</div>
          <p className="mt-2 max-w-3xl text-xs leading-5 text-white/32">{COURSE_SOURCE_NOTE}</p>
        </div>
      </footer>
    </div>
  );
}
