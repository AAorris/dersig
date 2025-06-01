import Link from "next/link";

export default function HeroSection() {
  return (
    <header className="text-center mb-8">
      <h1 className="text-4xl font-bold text-white mb-4">
        Cryptographic Key Generator
      </h1>
      <p className="text-gray-300 text-lg max-w-2xl mx-auto">
        Generate memorable cryptographic key pairs with dictionary word patterns.
        Keys are scored based on readability and pattern matching.
      </p>
    </header>
  );
} 