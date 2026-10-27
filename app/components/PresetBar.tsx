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
    <div className="mb-8 border border-[#1c1917] bg-[#efeae1] p-4">
      <div className="flex items-center justify-between mb-3 border-b border-[#d4cdbe] pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#18181b] uppercase tracking-wider">
            01 PRESET SCENARIO TRIAGE
          </span>
          <span className="text-[10px] font-mono text-[#857f72]">
            One-Click Chicago Dossiers (Zero Auth)
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#857f72]">3 scenarios ready</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {presets.map(p => (
          <button
            key={p.id}
            onClick={() => onSelectPreset(p.id)}
            className="text-left bg-[#f6f4ee] hover:bg-[#ded7c7] border border-[#1c1917] p-3 transition-colors group"
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-[#57534e] mb-1">
              <span className="uppercase tracking-wider">{p.tag}</span>
              <span className="text-[#18181b] font-bold group-hover:underline">Run →</span>
            </div>
            <div className="text-sm font-serif font-bold text-[#18181b]">
              {p.name}
            </div>
            <div className="text-[11px] text-[#57534e] mt-1 font-mono">{p.badge}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
