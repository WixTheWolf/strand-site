import DraftHeader from "../../../components/draft-header";
import MatchScorecard from "./match-scorecard";

export const metadata = {
  title: "Match Scorecard | The Strand 2026",
  robots: { index: false, follow: false },
};

export default async function MatchPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  return (
    <div className="min-h-screen bg-[#f4f0e8] text-[#111]">
      <DraftHeader title="Group Scorecard" backHref="/live" backLabel="Leaderboard" extraLink={{ href: "/courses", label: "Course Intel" }} />
      <MatchScorecard matchId={matchId} />
    </div>
  );
}
