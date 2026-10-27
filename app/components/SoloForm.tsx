// app/components/SoloForm.tsx
import React, { useState } from 'react';

const NEIGHBORHOODS = [
  { id: 'wicker_park', name: 'Wicker Park' },
  { id: 'logan_square', name: 'Logan Square' },
  { id: 'pilsen', name: 'Pilsen' },
  { id: 'hyde_park', name: 'Hyde Park' },
  { id: 'lakeview', name: 'Lakeview' },
  { id: 'west_loop', name: 'West Loop' },
  { id: 'lincoln_park', name: 'Lincoln Park' },
  { id: 'chinatown', name: 'Chinatown' }
];

export function SoloForm({
  onSubmit,
  loading
}: {
  onSubmit: (data: any) => void;
  loading: boolean;
}) {
  const [origin, setOrigin] = useState('logan_square');
  const [weeklyCapDollars, setWeeklyCapDollars] = useState(35);
  const [preferredMode, setPreferredMode] = useState('bike');
  const [seed1, setSeed1] = useState('Dune');
  const [seed2, setSeed2] = useState('Baldur\'s Gate 3');
  const [seed3, setSeed3] = useState('Alvvays');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      origin,
      weeklyCapCents: Math.round(weeklyCapDollars * 100),
      preferredMode,
      maxOneWayMinutes: 25,
      slots: [
        { day: 'tue', start: '18:00', end: '20:00' },
        { day: 'thu', start: '18:30', end: '21:00' },
        { day: 'sat', start: '14:00', end: '17:00' }
      ],
      seeds: [
        { text: seed1, domain: 'book' },
        { text: seed2, domain: 'videogame' },
        { text: seed3, domain: 'artist' }
      ].filter(s => Boolean(s.text.trim()))
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border border-[#1c1917] bg-[#efeae1] p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#d4cdbe]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#18181b] uppercase tracking-wider">
              02 SOLO ROUTINE BLUEPRINT
            </span>
            <span className="text-[10px] font-mono text-[#857f72]">3 Slots: Tue / Thu / Sat</span>
          </div>
          <p className="text-xs text-[#57534e] mt-1 font-serif">
            Build a repeatable weekly cadence benchmarked against the $58.17/wk BLS under-25 food and social spend baseline.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-[#f6f4ee] border border-[#1c1917] p-3">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#57534e] mb-1">
            Home Station / District
          </label>
          <select
            value={origin}
            onChange={e => setOrigin(e.target.value)}
            className="w-full py-1 px-2 text-xs bg-[#efeae1] border border-[#1c1917] text-[#18181b] font-mono"
          >
            {NEIGHBORHOODS.map(n => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-[#f6f4ee] border border-[#1c1917] p-3">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#57534e] mb-1">
            Weekly Social Cap (LI-10)
          </label>
          <div className="relative">
            <span className="absolute left-2 top-1 text-xs text-[#57534e] font-mono">$</span>
            <input
              type="number"
              value={weeklyCapDollars}
              onChange={e => setWeeklyCapDollars(parseFloat(e.target.value) || 0)}
              className="w-full pl-5 pr-2 py-0.5 text-xs bg-[#efeae1] border border-[#1c1917] text-[#18181b] font-mono font-bold"
            />
          </div>
          <span className="text-[10px] text-[#857f72] font-mono mt-1 block">BLS Benchmark: $58.17/wk</span>
        </div>

        <div className="bg-[#f6f4ee] border border-[#1c1917] p-3">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#57534e] mb-1">
            Primary Commute Mode
          </label>
          <select
            value={preferredMode}
            onChange={e => setPreferredMode(e.target.value)}
            className="w-full py-1 px-2 text-xs bg-[#efeae1] border border-[#1c1917] text-[#18181b] font-mono"
          >
            <option value="bike">Bike ($0)</option>
            <option value="walk">Walk ($0)</option>
            <option value="cta_rail">CTA Rail ($5.50 RT)</option>
            <option value="cta_bus">CTA Bus ($5.00 RT)</option>
          </select>
        </div>
      </div>

      <div className="bg-[#f6f4ee] border border-[#1c1917] p-3 mb-6">
        <label className="block text-[10px] font-mono uppercase tracking-wider text-[#57534e] mb-2">
          Cross-Domain Qloo Seeds (3 Cultural Anchors)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            value={seed1}
            onChange={e => setSeed1(e.target.value)}
            placeholder="Book seed (e.g. Dune)"
            className="py-1 px-2 text-xs bg-[#efeae1] border border-[#1c1917] text-[#18181b] font-mono"
          />
          <input
            type="text"
            value={seed2}
            onChange={e => setSeed2(e.target.value)}
            placeholder="Game seed (e.g. Baldur's Gate 3)"
            className="py-1 px-2 text-xs bg-[#efeae1] border border-[#1c1917] text-[#18181b] font-mono"
          />
          <input
            type="text"
            value={seed3}
            onChange={e => setSeed3(e.target.value)}
            placeholder="Music seed (e.g. Alvvays)"
            className="py-1 px-2 text-xs bg-[#efeae1] border border-[#1c1917] text-[#18181b] font-mono"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-[#d4cdbe] flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="py-2.5 px-6 font-mono font-bold text-xs uppercase tracking-wider bg-[#121212] hover:bg-black disabled:opacity-50 text-white border border-[#121212] transition-colors flex items-center gap-2"
        >
          {loading ? 'Optimizing 3-Slot Routine...' : 'Generate Weekly Routine →'}
        </button>
      </div>
    </form>
  );
}
