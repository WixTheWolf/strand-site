import type { Metadata } from "next";
import { cookies } from "next/headers";

import AccessGate from "@/app/stud-buckets/access-gate";
import {
  STUD_BUCKETS_ACCESS_COOKIE,
  studBucketsAccessConfigured,
  verifyStudBucketsSession,
} from "@/lib/stud-buckets-auth";
import CaptainsRoom from "./captains-room";

export const metadata: Metadata = {
  title: "Captain's Room | The Strand 2026",
  description: "The Stud Buckets teammate preparation headquarters for The Strand at Gamble Sands.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CaptainsRoomPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(STUD_BUCKETS_ACCESS_COOKIE)?.value;

  if (!verifyStudBucketsSession(session)) {
    return <AccessGate configured={studBucketsAccessConfigured()} />;
  }

  return <CaptainsRoom />;
}
