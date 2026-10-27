// app/components/SquadForm.tsx
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

const TRANSIT_MODES = [
  { id: 'cta_rail', name: 'CTA Rail ($5.50 RT)' },
  { id: 'cta_bus', name: 'CTA Bus ($5.00 RT)' },
  { id: 'walk', name: 'Walk ($0)' },
  { id: 'bike', name: 'Bike ($0)' },
  { id: 'drive', name: 'Drive / Rideshare' }
];

export function SquadForm({
  onSubmit,
  loading
}: {
  onSubmit: (data: any) => void;
  loading: boolean;
}) {
  const [members, setMembers] = useState([
    {
      alias: 'M1',
      label: 'Friend 1',
      origin: 'wicker_park',
      mode: 'cta_rail',
      capDollars: 35,
      hardFilters: [] as string[],
      seed1Text: 'Dune',
      seed1Domain: 'book',
      seed2Text: 'Baldur\'s Gate 3',
      seed2Domain: 'videogame'
    },
    {
      alias: 'M2',
      label: 'Friend 2',
      origin: 'logan_square',
      mode: 'bike',
      capDollars: 25,
      hardFilters: [] as string[],
      seed1Text: 'Alvvays',
      seed1Domain: 'artist',
      seed2Text: 'Past Lives',
      seed2Domain: 'movie'
    },
    {
      alias: 'M3',
      label: 'Friend 3',
      origin: 'west_loop',
      mode: 'walk',
      capDollars: 18,
      hardFilters: ['wheelchair_accessible'] as string[],
      seed1Text: 'The Bear',
      seed1Domain: 'tv_show',
      seed2Text: 'Kendrick Lamar',
      seed2Domain: 'artist'
    }
  ]);

  const [maxOneWayMinutes, setMaxOneWayMinutes] = useState(30);
  const [blindCapMode, setBlindCapMode] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      window: { day: 'tue', start: '18:30', end: '21:30' },
      maxOneWayMinutes,
      options: { blindCapMode, scenario: 'base', contingencyBp: 1000 },
      members: members.map(m => ({
        alias: m.alias,
        origin: m.origin,
        mode: m.mode,
        capCents: Math.round(m.capDollars * 100),
        filters: m.hardFilters,
        seeds: [
          { text: m.seed1Text, domain: m.seed1Domain },
          m.seed2Text ? { text: m.seed2Text, domain: m.seed2Domain } : null
        ].filter(Boolean)
      }))
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-semibold text-white">Squad Hangout Configuration</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Privacy Guarantee: Friend display labels stay strictly in your browser (M1..M4 aliases on server).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={blindCapMode}
              onChange={e => setBlindCapMode(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0"
            />
            <span>Blind Cap Mode (Active)</span>
          </label>
        </div>
      </div>

      <div className="space-y-6">
        {members.map((m, idx) => (
          <div key={m.alias} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wide">
                {m.alias} • {m.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Budget Cap:</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">$</span>
                  <input
                    type="number"
                    value={m.capDollars}
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0;
                      setMembers(prev => prev.map((item, i) => (i === idx ? { ...item, capDollars: val } : item)));
                    }}
                    className="w-20 pl-6 pr-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Origin Neighborhood</label>
                <select
                  value={m.origin}
                  onChange={e => {
                    const val = e.target.value;
                    setMembers(prev => prev.map((item, i) => (i === idx ? { ...item, origin: val } : item)));
                  }}
                  className="w-full py-1.5 px-3 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                >
                  {NEIGHBORHOODS.map(n => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Commute Mode</label>
                <select
                  value={m.mode}
                  onChange={e => {
                    const val = e.target.value;
                    setMembers(prev => prev.map((item, i) => (i === idx ? { ...item, mode: val } : item)));
                  }}
                  className="w-full py-1.5 px-3 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200"
                >
                  {TRANSIT_MODES.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Media Seed 1 (Book, Film, Game, Music)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={m.seed1Text}
                    onChange={e => {
                      const val = e.target.value;
                      setMembers(prev => prev.map((item, i) => (i === idx ? { ...item, seed1Text: val } : item)));
                    }}
                    placeholder="e.g. Dune"
                    className="flex-1 py-1 px-2.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                  <select
                    value={m.seed1Domain}
                    onChange={e => {
                      const val = e.target.value;
                      setMembers(prev => prev.map((item, i) => (i === idx ? { ...item, seed1Domain: val } : item)));
                    }}
                    className="w-24 text-[11px] bg-slate-900 border border-slate-700 rounded-lg text-slate-300"
                  >
                    <option value="book">Book</option>
                    <option value="artist">Artist</option>
                    <option value="movie">Movie</option>
                    <option value="tv_show">TV Show</option>
                    <option value="videogame">Game</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Media Seed 2 (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={m.seed2Text}
                    onChange={e => {
                      const val = e.target.value;
                      setMembers(prev => prev.map((item, i) => (i === idx ? { ...item, seed2Text: val } : item)));
                    }}
                    placeholder="e.g. Alvvays"
                    className="flex-1 py-1 px-2.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                  <select
                    value={m.seed2Domain}
                    onChange={e => {
                      const val = e.target.value;
                      setMembers(prev => prev.map((item, i) => (i === idx ? { ...item, seed2Domain: val } : item)));
                    }}
                    className="w-24 text-[11px] bg-slate-900 border border-slate-700 rounded-lg text-slate-300"
                  >
                    <option value="book">Book</option>
                    <option value="artist">Artist</option>
                    <option value="movie">Movie</option>
                    <option value="tv_show">TV Show</option>
                    <option value="videogame">Game</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
        <div className="text-xs text-slate-400">
          Max One-Way Travel:{' '}
          <span className="text-white font-mono font-bold">{maxOneWayMinutes} min</span>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="py-3 px-6 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin text-lg">⚙</span> Running Agent Plan...
            </>
          ) : (
            <>Find Consensus Hangout Plan →</>
          )}
        </button>
      </div>
    </form>
  );
}
