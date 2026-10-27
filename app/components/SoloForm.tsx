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
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
      <div className="mb-6 pb-4 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-white">Solo Weekly Routine Builder</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Build a repeatable 3-slot weekly routine (Tue, Thu, Sat) across distinct third places, benchmarked against the $58.17/wk BLS under-25 average.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">Home Neighborhood</label>
          <select
            value={origin}
            onChange={e => setOrigin(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
          >
            {NEIGHBORHOODS.map(n => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5">Weekly Social Budget</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-xs text-slate-400">$</span>
            <input
              type="number"
              value={weeklyCapDollars}
              onChange={e => setWeeklyCapDollars(parseFloat(e.target.value) || 0)}
              className="w-full pl-7 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
            />
          </div>
          <span className="text-[10px] text-slate-500 font-mono">BLS Under-25 average: $58.17/wk</span>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5">Primary Commute Mode</label>
          <select
            value={preferredMode}
            onChange={e => setPreferredMode(e.target.value)}
            className="w-full py-2 px-3 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
          >
            <option value="bike">Bike ($0)</option>
            <option value="walk">Walk ($0)</option>
            <option value="cta_rail">CTA Rail ($5.50 RT/stop)</option>
            <option value="cta_bus">CTA Bus ($5.00 RT/stop)</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs text-slate-400 mb-2">Favorite Cultural Seeds (3 domains for cross-media affinity)</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            value={seed1}
            onChange={e => setSeed1(e.target.value)}
            placeholder="Book seed (e.g. Dune)"
            className="py-1.5 px-3 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white"
          />
          <input
            type="text"
            value={seed2}
            onChange={e => setSeed2(e.target.value)}
            placeholder="Game seed (e.g. Baldur's Gate 3)"
            className="py-1.5 px-3 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white"
          />
          <input
            type="text"
            value={seed3}
            onChange={e => setSeed3(e.target.value)}
            placeholder="Music seed (e.g. Alvvays)"
            className="py-1.5 px-3 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="py-3 px-6 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
        >
          {loading ? 'Optimizing 3-Slot Routine...' : 'Generate Weekly Routine →'}
        </button>
      </div>
    </form>
  );
}
