import BestTeamView from "../best-team-view";
import DraftHeader from "../../components/draft-header";

export const metadata = {
  title: "Player Data | Strand War Room",
  description: "Full consented player scoring sheet and roster evidence for Gamble Sands 2026",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BestTeamPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#111]">
      <DraftHeader
        title="Player Data"
        extraLink={{ href: "/draft", label: "War Room" }}
      />
      <BestTeamView />
    </div>
  );
}
