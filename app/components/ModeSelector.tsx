// app/components/ModeSelector.tsx
import React from 'react';

export function ModeSelector({
  mode,
  setMode
}: {
  mode: 'squad' | 'solo';
  setMode: (m: 'squad' | 'solo') => void;
}) {
  return (
    <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-800 max-w-md mx-auto mb-6">
      <button
        onClick={() => setMode('squad')}
        className={`flex-1 py-2.5 px-4 rounded-lg text-xs md:text-sm font-semibold transition-all ${
          mode === 'squad'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        👥 Squad Consensus Mode
      </button>
      <button
        onClick={() => setMode('solo')}
        className={`flex-1 py-2.5 px-4 rounded-lg text-xs md:text-sm font-semibold transition-all ${
          mode === 'solo'
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        👤 Solo Weekly Routine
      </button>
    </div>
  );
}
