// app/components/ProvenanceDrawer.tsx
// Provider call telemetry inspector with privacy redaction and relative-score disclaimer.

import React, { useState } from 'react';

export function ProvenanceDrawer({ provenance }: { provenance: any[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-slate-800/80 mt-10 pt-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-xs font-mono text-slate-400 hover:text-white py-2 px-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all"
      >
        <div className="flex items-center gap-2">
          <span className="text-indigo-400">🔍</span>
          <span>Inspect Provenance & Qloo API Telemetry ({provenance?.length || 0} provider calls logged)</span>
        </div>
        <span className="text-slate-500">{open ? '▲ Hide Trace' : '▼ View Trace'}</span>
      </button>

      {open && (
        <div className="mt-4 bg-slate-950 border border-slate-800 rounded-2xl p-5 font-mono text-xs shadow-2xl">
          <div className="mb-4 pb-3 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-400">
            <span className="font-semibold text-white">Taste data by Qloo (2026 Agentic API)</span>
            <span className="text-[11px] text-amber-400/90 bg-amber-950/40 px-2.5 py-1 rounded border border-amber-800/30">
              Disclaimer: Qloo scores are relative to the query, not probabilities or guarantees of enjoyment.
            </span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {provenance?.length > 0 ? (
              provenance.map((p, idx) => (
                <div key={idx} className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px]">
                  <div className="flex items-center justify-between text-slate-300 mb-1.5">
                    <span className="font-bold text-indigo-400 flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-[10px] text-indigo-300">
                        {p.method}
                      </span>
                      {p.path}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {p.durationMs}ms {p.cached ? '(Cached 24h)' : ''}
                    </span>
                  </div>
                  <div className="text-slate-400 font-mono break-all text-[10px]">
                    Params: {JSON.stringify(p.redactedParams)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-xs italic py-2">
                No outbound calls recorded for this run (mock or preset snapshot).
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
