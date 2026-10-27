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
    <form onSubmit={handleSubmit} className="border border-[#1c1917] bg-[#efeae1] p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#d4cdbe]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#18181b] uppercase tracking-wider">
              02 SQUAD CONFIGURATION DOSSIER
            </span>
            <span className="text-[10px] font-mono text-[#857f72]">M1..M4 Isolation Mode</span>
          </div>
          <p className="text-xs text-[#57534e] mt-1 font-serif">
            Friend labels remain strictly client-side. Only blind aliases and tastes leave for Qloo evaluation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-[#18181b] flex items-center gap-2 cursor-pointer bg-[#f6f4ee] px-3 py-1.5 border border-[#1c1917]">
            <input
              type="checkbox"
              checked={blindCapMode}
              onChange={e => setBlindCapMode(e.target.checked)}
              className="accent-[#18181b]"
            />
            <span className="font-bold text-[11px] uppercase tracking-wider">Blind Cap Mode [Active]</span>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        {members.map((m, idx) => (
          <div key={m.alias} className="bg-[#f6f4ee] border border-[#1c1917] p-4">
            <div className="flex items-center justify-between mb-3 border-b border-[#d4cdbe] pb-2">
              <span className="text-xs font-mono font-bold text-[#18181b] uppercase tracking-wider">
                M0{idx + 1} • {m.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#57534e] uppercase">Budget Cap:</span>
                <div className="relative">
                  <span className="absolute left-2 top-1 text-xs text-[#57534e] font-mono">$</span>
                  <input
                    type="number"
                    value={m.capDollars}
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0;
                      setMembers(prev => prev.map((item, i) => (i === idx ? { ...item, capDollars: val } : item)));
                    }}
                    className="w-20 pl-5 pr-2 py-0.5 text-xs bg-[#efeae1] border border-[#1c1917] text-[#18181b] font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#57534e] mb-1">
                  Origin Station / District
                </label>
                <select
                  value={m.origin}
                  onChange={e => {
                    const val = e.target.value;
                    setMembers(prev => prev.map((item, i) => (i === idx ? { ...item, origin: val } : item)));
                  }}
                  className="w-full py-1 px-2 text-xs bg-[#efeae1] border border-[#1c1917] text-[#18181b] font-mono"
                >
                  {NEIGHBORHOODS.map(n => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#57534e] mb-1">
                  Transit Mode
                </label>
                <select
                  value={m.mode}
                  onChange={e => {
                    const val = e.target.value;
                    setMembers(prev => prev.map((item, i) => (i === idx ? { ...item, mode: val } : item)));
                  }}
                  className="w-full py-1 px-2 text-xs bg-[#efeae1] border border-[#1c1917] text-[#18181b] font-mono"
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
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#57534e] mb-1">
                  Qloo Media Seed 01
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={m.seed1Text}
                    onChange={e => {
                      const val = e.target.value;
                      setMembers(prev => prev.map((item, i) => (i === idx ? { ...item, seed1Text: val } : item)));
                    }}
                    placeholder="e.g. Dune"
                    className="flex-1 py-1 px-2 text-xs bg-[#efeae1] border border-[#1c1917] text-[#18181b] font-mono"
                  />
                  <select
                    value={m.seed1Domain}
                    onChange={e => {
                      const val = e.target.value;
                      setMembers(prev => prev.map((item, i) => (i === idx ? { ...item, seed1Domain: val } : item)));
                    }}
                    className="w-24 text-[11px] bg-[#efeae1] border border-[#1c1917] text-[#18181b] font-mono"
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
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#57534e] mb-1">
                  Qloo Media Seed 02 (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={m.seed2Text}
                    onChange={e => {
                      const val = e.target.value;
                      setMembers(prev => prev.map((item, i) => (i === idx ? { ...item, seed2Text: val } : item)));
                    }}
                    placeholder="e.g. Alvvays"
                    className="flex-1 py-1 px-2 text-xs bg-[#efeae1] border border-[#1c1917] text-[#18181b] font-mono"
                  />
                  <select
                    value={m.seed2Domain}
                    onChange={e => {
                      const val = e.target.value;
                      setMembers(prev => prev.map((item, i) => (i === idx ? { ...item, seed2Domain: val } : item)));
                    }}
                    className="w-24 text-[11px] bg-[#efeae1] border border-[#1c1917] text-[#18181b] font-mono"
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

      <div className="mt-6 pt-4 border-t border-[#d4cdbe] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs font-mono text-[#57534e]">
          Max Transit Commute Window:{' '}
          <span className="text-[#18181b] font-bold">{maxOneWayMinutes} min one-way</span>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="py-2.5 px-6 font-mono font-bold text-xs uppercase tracking-wider bg-[#121212] hover:bg-black disabled:opacity-50 text-white border border-[#121212] transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⚙</span> Executing Consensus Search...
            </>
          ) : (
            <>Triage Latest Consensus Plan →</>
          )}
        </button>
      </div>
    </form>
  );
}
