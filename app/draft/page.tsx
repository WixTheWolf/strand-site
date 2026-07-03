import DraftBoard from "./draft-board";
import DraftHeader from "../components/draft-header";

export const metadata = {
  title: "Strand Draft Lab | Captain Mock Draft",
  description:
    "Interactive captain mock draft vs Justin Uribe for Gamble Sands 2026 — skill graphs, scenarios, and live TheGrint handicaps.",
};

export default function DraftPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#111]">
      <DraftHeader
        title="Draft Lab"
        extraLink={{ href: "/draft/best-team", label: "Best team" }}
      />
      <DraftBoard />
    </div>
  );
}
