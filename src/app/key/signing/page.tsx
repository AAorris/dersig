import HeroSection from "@/components/HeroSection";
import InstructionsSection from "@/components/InstructionsSection";
import KeyGeneratorSection from "@/components/KeyGeneratorSection";
import SecurityNotice from "@/components/SecurityNotice";

export const dynamic = 'force-dynamic';

export default async function KeyGeneratorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-200">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl w-max mx-auto">
          <HeroSection />
          <InstructionsSection />
          <KeyGeneratorSection />
          <SecurityNotice />
        </div>
      </div>
    </div>
  );
}
