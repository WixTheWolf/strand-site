import type { Metadata } from "next";
import { cookies } from "next/headers";

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

  return <StudBucketsDashboard />;
}
