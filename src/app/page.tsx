import HeroSection from "@/components/HeroSection";
import OverviewSection from "@/components/OverviewSection";
import CallToAction from "@/components/CallToAction";

export default function Home() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
			{/* Hero Section */}
			<div className="container mx-auto px-6 py-16">
				<div className="max-w-4xl mx-auto">
					<HeroSection />
					<OverviewSection />
					<CallToAction />
				</div>
			</div>
		</div>
	);
}
