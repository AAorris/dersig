import EncryptionHeroSection from "@/components/EncryptionHeroSection";
import EncryptionInstructionsSection from "@/components/EncryptionInstructionsSection";
import EncryptionKeyGeneratorSection from "@/components/EncryptionKeyGeneratorSection";
import SecurityNotice from "@/components/SecurityNotice";

export const dynamic = 'force-dynamic';

export default async function EncryptionKeyGeneratorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <EncryptionHeroSection />
          <EncryptionInstructionsSection />
          <EncryptionKeyGeneratorSection />
          <SecurityNotice />
        </div>
      </div>
    </div>
  );
} 