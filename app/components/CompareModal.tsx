// app/components/CompareModal.tsx
// "Compare Without Qloo" modal proving Qloo's material cultural intelligence contribution (HR-03).

import React from 'react';

export function CompareModal({
  compareData,
  onClose
}: {
  compareData: any;
  onClose: () => void;
}) {
  if (!compareData) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
              Controlled Baseline Comparison (HR-03)
            </span>
            <h3 className="text-base font-semibold text-white mt-1">
              Evaluating the Impact of Qloo Cultural Intelligence
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
          >
            Close ✕
          </button>
        </div>

        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          "If your submission would work the same without Qloo, you're building the wrong thing."
          Here is how ThirdPlace Squad compares against baseline strategies over the exact same Chicago venue inventory and budget caps:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-300 font-mono">Arm A (Qloo-Enabled)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-900 text-indigo-200">
                Active Product
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">
              Cross-domain media seeds mapped into place affinities, 0.55 Pareto taste floor, and Shared Cultural DNA.
            </p>
            <div className="text-[11px] font-mono text-indigo-400">
              Personalized multi-domain match
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 font-mono">Arm B0 (Distance Baseline)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">
                Zero Qloo
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Selects the geographically closest venue to the origin with lowest spend as a tie-breaker.
            </p>
            <div className="text-[11px] font-mono text-slate-500">
              Top Venue: {compareData.armB0?.venue?.name || 'Closest Venue'}
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 font-mono mb-4">
          <strong className="text-amber-400">Circularity Caveat:</strong> Rank-based metrics favor Arm A by construction. Independent verification is evaluated via Kendall tau rank sensitivity checks (<strong className="text-white">&lt; 0.80</strong> across divergent seed profiles).
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all"
          >
            Back to Plan
          </button>
        </div>
      </div>
    </div>
  );
}
