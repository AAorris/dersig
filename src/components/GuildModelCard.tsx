import FeatureGrid from "./FeatureGrid";

export default function GuildModelCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h3 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center">
        <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
          ⚔️
        </span>
        The Adventurers Guild Model
      </h3>
      <div className="space-y-6">
        <p className="text-slate-600 leading-relaxed">
          Imagine transforming a Mastodon-like instance into something more akin to a fantasy guild—a place where people gather not just to communicate, but to organize and take action together.
        </p>

        <div className="bg-slate-50 rounded-lg p-6">
          <h4 className="font-semibold text-slate-800 mb-4">In fantasy worlds, guilds serve as community anchors where members:</h4>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
              Collaborate to address community needs and requests
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
              Organize expeditions and shared adventures
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
              Build reputation through meaningful contributions
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Digital Guild Infrastructure:</h4>
          <FeatureGrid />
        </div>
      </div>
    </div>
  );
} 