import { Suspense } from "react";
import { streamKeys } from "@/app/key/lib";
import { StreamedKeyList } from "@/app/key/streamed-key-list";

export default function KeyGeneratorSection() {
  return (
    <div className="bg-black rounded-lg border border-gray-700 overflow-hidden">
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-white font-medium">Generated Keys</h3>
        <p className="text-gray-400 text-sm">
          Showing ranked keys. Click to copy
        </p>
      </div>

      <Suspense fallback={<LoadingState />}>
        <KeyGeneratorContent />
      </Suspense>
    </div>
  );
}

function KeyGeneratorContent() {
  const timeout = process.env.VERCEL_ENV ? 1_000 : 60_000;
  const { streamableValue } = streamKeys(timeout);

  return (
    <div className="relative">
      <StreamedKeyList streamableValue={streamableValue.value} size={50} />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="p-8 text-center">
      <div className="inline-flex items-center space-x-2 text-gray-400">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400" />
        <span>Initializing key generation...</span>
      </div>
    </div>
  );
} 