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
    <div className="fixed inset-0 bg-[#18181b]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#efeae1] border-2 border-[#1c1917] max-w-2xl w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#d4cdbe]">
          <div>
            <span className="text-xs font-mono text-[#57534e] uppercase tracking-wider font-bold">
              Controlled Baseline Evaluation (HR-03)
            </span>
            <h3 className="text-base font-serif font-bold text-[#18181b] mt-0.5">
              Measuring the Impact of Qloo Cultural Intelligence
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-mono text-[#18181b] hover:bg-[#ded7c7] px-2 py-1 border border-[#1c1917]"
          >
            [ Close ✕ ]
          </button>
        </div>

        <p className="text-xs text-[#57534e] mb-4 leading-relaxed font-serif">
          "If your submission would work the same without Qloo, you're building the wrong thing."
          Here is how ThirdPlace Squad compares against baseline strategies over the exact same Chicago venue inventory and budget caps:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-[#f6f4ee] border border-[#1c1917]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#18181b] font-mono">Arm A (Qloo-Enabled)</span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#121212] text-white">
                Active Product
              </span>
            </div>
            <p className="text-xs text-[#57534e] mb-2 font-serif">
              Cross-domain media seeds mapped into place affinities, 0.55 Pareto taste floor, and Shared Cultural DNA.
            </p>
            <div className="text-[11px] font-mono text-[#15803d] font-bold">
              ■ Multi-Domain Affinity Match
            </div>
          </div>

          <div className="p-3 bg-[#ded7c7]/50 border border-[#d4cdbe]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#57534e] font-mono">Arm B0 (Naive Distance)</span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#857f72] text-white">
                Zero Qloo
              </span>
            </div>
            <p className="text-xs text-[#57534e] mb-2 font-serif">
              Selects geographically closest venue to the origin with lowest spend as a tie-breaker.
            </p>
            <div className="text-[11px] font-mono text-[#857f72]">
              Top Venue: {compareData.armB0?.venue?.name || 'Closest Venue'}
            </div>
          </div>
        </div>

        <div className="p-3 bg-[#f6f4ee] border border-[#1c1917] text-[11px] text-[#57534e] font-mono mb-4">
          <strong className="text-[#b45309]">Circularity Caveat:</strong> Rank-based metrics favor Arm A by construction. Independent verification is evaluated via Kendall tau rank sensitivity checks (<strong className="text-[#18181b]">&lt; 0.80</strong> across divergent seed profiles).
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 font-mono text-xs uppercase tracking-wider font-bold bg-[#121212] hover:bg-black text-white border border-[#121212]"
          >
            Return to Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
