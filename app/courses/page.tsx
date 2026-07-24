import type { Metadata } from "next";
import DraftHeader from "../components/draft-header";
import SiteFooter from "../components/site-footer";
import CourseCommandCenter from "./course-command-center";

export const metadata: Metadata = {
  title: "Team Course Game Plan | The Strand 2026",
  description:
    "One team field guide for Gamble Sands and Scarecrow: course management, personal strokes, format tactics, preparation drills and all 36 hole-by-hole decisions.",
};

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#111]">
      <DraftHeader title="Course Intel" extraLink={{ href: "/live", label: "Live Scoring" }} />
      <CourseCommandCenter />
      <SiteFooter />
    </div>
  );
}
