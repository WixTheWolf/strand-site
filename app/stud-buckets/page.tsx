import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";

import AccessGate from "./access-gate";
import StudBucketsDashboard from "./stud-buckets-dashboard";
import {
  STUD_BUCKETS_ACCESS_COOKIE,
  studBucketsAccessConfigured,
  verifyStudBucketsSession,
} from "@/lib/stud-buckets-auth";

export const metadata: Metadata = {
  title: "Stud Buckets HQ | The Strand 2026",
  description: "Private team strategy, pairings and opponent intelligence for the Stud Buckets.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function StudBucketsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(STUD_BUCKETS_ACCESS_COOKIE)?.value;
  const authorized = verifyStudBucketsSession(session);

  if (!authorized) {
    return <AccessGate configured={studBucketsAccessConfigured()} />;
  }

  return (
    <>
      <StudBucketsDashboard />
      <Link
        href="/stud-buckets/course-prep"
        className="fixed bottom-4 right-4 z-[60] rounded-full border border-white/15 bg-[#e39a50] px-5 py-3 text-[10px] font-black uppercase tracking-[0.17em] text-[#10251e] shadow-2xl transition hover:-translate-y-0.5 hover:bg-[#efad68]"
      >
        Course prep →
      </Link>
    </>
  );
}
