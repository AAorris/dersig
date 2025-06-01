export default function CommunityCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
      <h3 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center">
        <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
          🌐
        </span>
        Building Distributed Communities
      </h3>
      <div className="space-y-4 text-slate-600 leading-relaxed">
        <p>
          Many people yearn for genuine community—moving beyond isolation to build meaningful relationships, share stories, embark on adventures, support those in need, and practice collaborative leadership in peer-to-peer networks.
        </p>
        <p>
          Digital communities like Mastodon demonstrate this potential: local instances serve as community hubs where members connect, while federation creates a broader distributed network of interconnected communities.
        </p>
        <p className="font-medium text-slate-700">
          Dersig explores a unique approach to intentional community formation, shifting focus from content consumption to active collaboration—organizing together, making and fulfilling requests, building relationships, and creating shared narratives.
        </p>
      </div>
    </div>
  );
} 