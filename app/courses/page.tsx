import type { Metadata } from "next";
import DraftHeader from "../components/draft-header";
import SiteFooter from "../components/site-footer";
import CourseCommandCenter from "./course-command-center";

export const metadata: Metadata = {
  title: "Gamble Sands Course Intel | The Strand 2026",
  description:
    "Hole-by-hole Gamble Sands, Scarecrow and QuickSands strategy with official scorecards, tee data, course handicaps, player fit and Strand match-play calls.",
};

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#111]">
      <DraftHeader title="Course Intel" extraLink={{ href: "/draft", label: "Draft Lab" }} />
      <CourseCommandCenter />
      <SiteFooter />
    </div>
  );
}
