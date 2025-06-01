import Link from "next/link";

export default function CallToAction() {
  return (
    <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
      <h3 className="text-2xl font-bold mb-4">Ready to Start Building Community?</h3>
      <p className="mb-6 opacity-90">
        Begin your journey by generating your cryptographic identity
      </p>
      <Link
        href="/key/signing"
        className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg hover:shadow-xl"
      >
        Generate Keys Now
      </Link>
    </div>
  );
} 