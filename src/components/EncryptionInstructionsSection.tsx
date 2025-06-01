export default function EncryptionInstructionsSection() {
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">How it works</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-blue-400 mb-3">Scoring System</h3>
          <ul className="space-y-2 text-gray-300">
            <li><span className="text-gray-400">Normal:</span> Score ≤ 1024 (Gray)</li>
            <li><span className="text-blue-400">Magic:</span> Score &gt; 1024 (Blue)</li>
            <li><span className="text-yellow-400">Rare:</span> Score &gt; 2048 (Yellow)</li>
            <li><span className="text-orange-400">Legendary:</span> Score &gt; 4096 (Orange)</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-blue-400 mb-3">Features</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Real-time key generation</li>
            <li>• Dictionary word matching</li>
            <li>• Click any key to copy</li>
            <li>• Best keys displayed first</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 