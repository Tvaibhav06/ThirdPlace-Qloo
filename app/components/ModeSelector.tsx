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
    <div className="flex items-center gap-8 border-b border-[#d4cdbe] mb-8 pb-0">
      <button
        onClick={() => setMode('squad')}
        className={`pb-2.5 text-xs font-mono uppercase tracking-widest transition-all -mb-[1px] ${
          mode === 'squad'
            ? 'font-bold text-[#18181b] border-b-2 border-[#18181b]'
            : 'text-[#857f72] hover:text-[#18181b]'
        }`}
      >
        01 SQUAD CONSENSUS
      </button>
      <button
        onClick={() => setMode('solo')}
        className={`pb-2.5 text-xs font-mono uppercase tracking-widest transition-all -mb-[1px] ${
          mode === 'solo'
            ? 'font-bold text-[#18181b] border-b-2 border-[#18181b]'
            : 'text-[#857f72] hover:text-[#18181b]'
        }`}
      >
        02 SOLO WEEKLY ROUTINE
      </button>
    </div>
  );
}
