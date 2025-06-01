import CommunityCard from "./CommunityCard";
import GuildModelCard from "./GuildModelCard";

export default function OverviewSection() {
  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
        Overview
      </h2>
      <CommunityCard />
      <GuildModelCard />
    </section>
  );
} 