// app/components/SharedCulturalDnaCard.tsx
// "Why Your Squad Clicks" card powered by Qloo GET /v2/insights/compare (compare_audiences).

import React from 'react';

export function SharedCulturalDnaCard({ culturalDna }: { culturalDna: any }) {
  if (!culturalDna || (!culturalDna.sharedTags?.length && !Object.keys(culturalDna.memberDistinctiveTags || {}).length)) {
    return null;
  }

  return (
    <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 my-6 shadow-xl shadow-indigo-950/20">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <span className="text-indigo-400">⚡</span> Why Your Squad Clicks
        </h3>
        <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-800/40">
          Qloo /v2/insights/compare
        </span>
      </div>

      <p className="text-xs text-slate-300 mb-4 leading-relaxed">
        Despite divergent surface tastes, Qloo discovered these shared cultural affinities connecting your squad:
      </p>

      {culturalDna.sharedTags?.length > 0 && (
        <div className="mb-4">
          <span className="text-[11px] font-mono uppercase text-slate-400 block mb-2">
            Shared Squad Cultural DNA:
          </span>
          <div className="flex flex-wrap gap-2">
            {culturalDna.sharedTags.map((tag: any, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-indigo-950/60 border border-indigo-700/50 rounded-xl text-xs font-medium text-indigo-200 flex items-center gap-1.5"
              >
                <span className="text-indigo-400 text-xs">●</span>
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {culturalDna.compareStatus === 'tag_intersection_fallback' && (
        <p className="text-[10px] font-mono text-slate-500 italic mt-2">
          Note: Audience comparison fallback active (derived via cross-member /v2/tags intersection).
        </p>
      )}
    </div>
  );
}
