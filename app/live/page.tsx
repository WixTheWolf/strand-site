import DraftHeader from "../components/draft-header";
import SiteFooter from "../components/site-footer";
import LiveScoringDashboard from "./live-scoring-dashboard";

export const metadata = {
  title: "Live Scoring | The Strand 2026",
  description: "Live 75-point Strand match-play scoring from Gamble Sands.",
  robots: { index: false, follow: false },
};

export default function LiveScoringPage() {
  return (
    <div className="min-h-screen bg-[#f4f0e8] text-[#111]">
      <DraftHeader title="Live Scoring" extraLink={{ href: "/courses", label: "Course Intel" }} />
      <LiveScoringDashboard />
      <SiteFooter />
    </div>
  );
}
