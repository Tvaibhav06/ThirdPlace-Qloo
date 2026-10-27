// app/components/AmbiguityModal.tsx
// UI State 3: Disambiguation modal when Qloo returns multiple plausible matches for a media seed.

import React from 'react';

export function AmbiguityModal({
  data,
  onSelectCandidate,
  onSkip
}: {
  data: { ambiguousSeeds: Array<{ alias: string; query: string; candidates: Array<{ id: string; name: string; type: string; disambiguation?: string }> }> };
  onSelectCandidate: (candidateId: string) => void;
  onSkip: () => void;
}) {
  if (!data?.ambiguousSeeds?.length) return null;
  const current = data.ambiguousSeeds[0];

  return (
    <div className="fixed inset-0 bg-[#18181b]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[#efeae1] border-2 border-[#1c1917] max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#d4cdbe]">
          <div>
            <span className="text-xs font-mono text-[#57534e] uppercase tracking-wider font-bold">
              Disambiguation Dossier (UI State 3)
            </span>
            <h3 className="text-base font-serif font-bold text-[#18181b] mt-0.5">
              Multiple matches found for "{current.query}" ({current.alias})
            </h3>
          </div>
          <button
            onClick={onSkip}
            className="text-xs font-mono text-[#18181b] hover:bg-[#ded7c7] px-2 py-1 border border-[#1c1917]"
          >
            [ Skip Seed ]
          </button>
        </div>

        <p className="text-xs text-[#57534e] mb-4 font-serif">
          Qloo taste engine identified several entities matching this query. Select the intended title:
        </p>

        <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
          {current.candidates.map(c => (
            <button
              key={c.id}
              onClick={() => onSelectCandidate(c.id)}
              className="w-full text-left p-3 bg-[#f6f4ee] hover:bg-[#ded7c7] border border-[#1c1917] transition-colors group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-serif font-bold text-[#18181b] group-hover:underline">
                  {c.name}
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-[#ded7c7] text-[#18181b] border border-[#d4cdbe]">
                  {c.type.replace('urn:entity:', '')}
                </span>
              </div>
              {c.disambiguation && (
                <p className="text-xs text-[#57534e] font-serif line-clamp-2">{c.disambiguation}</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
