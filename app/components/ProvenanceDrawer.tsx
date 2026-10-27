// app/components/ProvenanceDrawer.tsx
// Provider call telemetry inspector with privacy redaction and relative-score disclaimer.

import React, { useState } from 'react';

export function ProvenanceDrawer({ provenance }: { provenance: any[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-[#d4cdbe] mt-8 pt-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-xs font-mono text-[#18181b] py-2 px-3 bg-[#efeae1] border border-[#1c1917] hover:bg-[#ded7c7] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span>■</span>
          <span className="font-bold uppercase tracking-wider">
            INSPECT PROVENANCE & API TELEMETRY ({provenance?.length || 0} CALLS LOGGED)
          </span>
        </div>
        <span className="text-[#57534e]">{open ? '[ - CLOSE TRACE ]' : '[ + EXPAND TRACE ]'}</span>
      </button>

      {open && (
        <div className="mt-3 bg-[#efeae1] border border-[#1c1917] p-4 font-mono text-xs">
          <div className="mb-3 pb-2 border-b border-[#d4cdbe] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[#57534e]">
            <span className="font-bold text-[#18181b] uppercase">Taste data by Qloo (2026 Agentic API)</span>
            <span className="text-[10px] text-[#b45309] bg-[#fef3c7] px-2 py-0.5 border border-[#d97706]">
              Disclaimer: Qloo scores are relative to query, not absolute probability of enjoyment.
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {provenance?.length > 0 ? (
              provenance.map((p, idx) => (
                <div key={idx} className="p-2.5 bg-[#f6f4ee] border border-[#1c1917] text-[11px]">
                  <div className="flex items-center justify-between text-[#18181b] mb-1">
                    <span className="font-bold flex items-center gap-2">
                      <span className="px-1 py-0.2 bg-[#121212] text-white text-[9px]">
                        {p.method}
                      </span>
                      {p.path}
                    </span>
                    <span className="text-[#57534e] font-mono text-[10px]">
                      {p.durationMs}ms {p.cached ? '(Cached 24h)' : ''}
                    </span>
                  </div>
                  <div className="text-[#57534e] font-mono break-all text-[10px]">
                    Params: {JSON.stringify(p.redactedParams)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[#857f72] text-xs italic py-2">
                No outbound calls recorded for this run (mock or preset snapshot).
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
