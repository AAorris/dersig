interface Feature {
  icon: string;
  title: string;
  description: string;
  bgColor: string;
  textColor: string;
}

const features: Feature[] = [
  {
    icon: "🔐",
    title: "Identity & Trust",
    description: "Just as guilds issue official membership cards, our digital guild uses self-signed certificates to create guild cards containing your personal certificate—establishing your identity and tracking the reputation you earn through community participation.",
    bgColor: "bg-blue-50",
    textColor: "text-blue-900"
  },
  {
    icon: "🏛️",
    title: "Community Spaces",
    description: "Like traditional guild halls, we provide tools for community chat and services that create a genuine \"third place\" for meaningful interaction.",
    bgColor: "bg-green-50",
    textColor: "text-green-900"
  },
  {
    icon: "📋",
    title: "Request Board",
    description: "Similar to guild quest boards, community members can post requests for tasks, projects, and collaborative activities.",
    bgColor: "bg-orange-50",
    textColor: "text-orange-900"
  },
  {
    icon: "👑",
    title: "Governance",
    description: "Like guild masters who provide leadership, our system includes tools for community governance, moderation, and inter-guild diplomacy.",
    bgColor: "bg-purple-50",
    textColor: "text-purple-900"
  }
];

export default function FeatureGrid() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {features.map((feature) => (
        <div key={feature.title} className={`${feature.bgColor} rounded-lg p-6`}>
          <h5 className={`font-semibold ${feature.textColor} mb-3`}>
            {feature.icon} {feature.title}
          </h5>
          <p className={`${feature.textColor} text-sm leading-relaxed`}>
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
} 