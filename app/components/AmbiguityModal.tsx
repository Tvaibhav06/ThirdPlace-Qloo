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
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
              Disambiguation Required (UI State 3)
            </span>
            <h3 className="text-base font-semibold text-white mt-1">
              Multiple matches found for "{current.query}" ({current.alias})
            </h3>
          </div>
          <button
            onClick={onSkip}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
          >
            Skip Seed
          </button>
        </div>

        <p className="text-xs text-slate-300 mb-4">
          Qloo identified several entities matching this title. Please select the intended title:
        </p>

        <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
          {current.candidates.map(c => (
            <button
              key={c.id}
              onClick={() => onSelectCandidate(c.id)}
              className="w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-600/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-white group-hover:text-indigo-200">
                  {c.name}
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {c.type.replace('urn:entity:', '')}
                </span>
              </div>
              {c.disambiguation && (
                <p className="text-xs text-slate-400 line-clamp-2">{c.disambiguation}</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
