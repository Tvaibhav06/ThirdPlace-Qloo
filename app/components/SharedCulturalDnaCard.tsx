// app/components/SharedCulturalDnaCard.tsx
// "Why Your Squad Clicks" card powered by Qloo GET /v2/insights/compare (compare_audiences).

import React from 'react';

export function SharedCulturalDnaCard({ culturalDna }: { culturalDna: any }) {
  if (!culturalDna || (!culturalDna.sharedTags?.length && !Object.keys(culturalDna.memberDistinctiveTags || {}).length)) {
    return null;
  }

  return (
    <div className="border border-[#1c1917] bg-[#efeae1] p-4 my-6">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#d4cdbe]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#18181b] uppercase tracking-wider">
            05 SHARED CULTURAL DNA & CROSS-DOMAIN AFFINITIES
          </span>
          <span className="text-[10px] font-mono text-[#857f72]">/v2/insights/compare</span>
        </div>
        <span className="text-[10px] font-mono text-[#15803d] font-bold">
          ■ Grounded in Qloo Graph
        </span>
      </div>

      <p className="text-xs text-[#57534e] mb-3 leading-relaxed font-serif">
        Despite divergent surface media seeds, Qloo taste graph traversal identified these shared cultural anchors connecting your squad:
      </p>

      {culturalDna.sharedTags?.length > 0 && (
        <div className="mb-2">
          <div className="flex flex-wrap gap-2">
            {culturalDna.sharedTags.map((tag: any, idx: number) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-[#f6f4ee] border border-[#1c1917] text-xs font-mono text-[#18181b] flex items-center gap-1.5"
              >
                <span className="text-[#15803d] text-[10px]">■</span>
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {culturalDna.compareStatus === 'tag_intersection_fallback' && (
        <p className="text-[10px] font-mono text-[#857f72] italic mt-2">
          Note: Audience comparison fallback active (derived via cross-member /v2/tags intersection).
        </p>
      )}
    </div>
  );
}
