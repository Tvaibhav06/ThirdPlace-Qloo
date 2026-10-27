// app/components/PresetBar.tsx
import React from 'react';

export function PresetBar({ onSelectPreset }: { onSelectPreset: (presetId: string) => void }) {
  const presets = [
    {
      id: 'preset_a',
      tag: 'Solo Routine',
      name: 'A: New in Logan Square',
      badge: 'BLS $58.17/wk benchmark'
    },
    {
      id: 'preset_b',
      tag: 'Squad Consensus',
      name: 'B: Three friends, three budgets',
      badge: 'Blind Cap Mode ($35, $25, $18)'
    },
    {
      id: 'preset_c',
      tag: 'Squad Consensus',
      name: 'C: Far apart',
      badge: 'Commute breach replan'
    }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
          One-Click Chicago Presets (Zero Login):
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {presets.map(p => (
          <button
            key={p.id}
            onClick={() => onSelectPreset(p.id)}
            className="text-left bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-3.5 transition-all group"
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-indigo-400 mb-1">
              <span>{p.tag}</span>
              <span className="text-slate-500 group-hover:text-indigo-300">Run preset →</span>
            </div>
            <div className="text-sm font-semibold text-white group-hover:text-indigo-200">
              {p.name}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">{p.badge}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
