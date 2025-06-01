export default function InstructionsSection() {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 mb-8 border border-gray-700">
      <div className="flex flex-wrap items-center gap-6 text-sm">
        <span className="text-white font-medium">Score Legend:</span>
        <span className="text-gray-400">Normal ≤ 1024</span>
        <span className="text-blue-400">Magic &gt; 1024</span>
        <span className="text-yellow-400">Rare &gt; 2048</span>
        <span className="text-orange-400">Legendary &gt; 4096</span>
      </div>
    </div>
  );
} 