import DraftHeader from "../../components/draft-header";
import ScoringSetup from "./scoring-setup";

export const metadata = {
  title: "Captain Scoring Setup | The Strand 2026",
  robots: { index: false, follow: false },
};

export default function LiveSetupPage() {
  return (
    <div className="min-h-screen bg-[#f4f0e8] text-[#111]">
      <DraftHeader title="Scoring Setup" backHref="/live" backLabel="Leaderboard" extraLink={{ href: "/draft", label: "Draft Lab" }} />
      <ScoringSetup />
    </div>
  );
}
