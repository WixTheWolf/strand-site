import BestTeamView from "../best-team-view";
import DraftHeader from "../../components/draft-header";

export const metadata = {
  title: "Best Team | Strand Draft Lab",
  description: "Optimal WIX snake-draft roster and full player data sheet for Gamble Sands 2026",
};

export default function BestTeamPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#111]">
      <DraftHeader
        title="Best Team"
        extraLink={{ href: "/draft", label: "Mock draft" }}
      />
      <BestTeamView />
    </div>
  );
}
