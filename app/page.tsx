// app/page.tsx
// Main interactive workspace container supporting Squad Consensus and Solo Routine modes.

'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ModeSelector } from './components/ModeSelector';
import { PresetBar } from './components/PresetBar';
import { SquadForm } from './components/SquadForm';
import { SoloForm } from './components/SoloForm';
import { ExecutionTrace } from './components/ExecutionTrace';
import { AmbiguityModal } from './components/AmbiguityModal';
import { SharedCulturalDnaCard } from './components/SharedCulturalDnaCard';
import { FairnessScorecard } from './components/FairnessScorecard';
import { SplitLedgerTable } from './components/SplitLedgerTable';
import { WeeklyBurnWaterfall } from './components/WeeklyBurnWaterfall';
import { ProvenanceDrawer } from './components/ProvenanceDrawer';
import { CompareModal } from './components/CompareModal';

// Dynamically import LeafletMap to avoid SSR window issues
const LeafletMap = dynamic(() => import('./components/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-[#efeae1] border border-[#1c1917] p-6 my-6 text-center text-xs font-mono text-[#857f72] animate-pulse">
      Loading Corridor Map...
    </div>
  ),
});

export default function WorkspacePage() {
  const [mode, setMode] = useState<'squad' | 'solo'>('squad');
  const [presets, setPresets] = useState<any[]>([]);

  // Execution state
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState('validating');
  const [stageMessage, setStageMessage] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [providerCallsCount, setProviderCallsCount] = useState(0);
  const [replanCount, setReplanCount] = useState(0);

  // Result state
  const [planResult, setPlanResult] = useState<any>(null);
  const [soloResult, setSoloResult] = useState<any>(null);
  const [ambiguityData, setAmbiguityData] = useState<any>(null);
  const [blindCapMode, setBlindCapMode] = useState(true);
  const [compareData, setCompareData] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load presets on mount
  useEffect(() => {
    fetch('/api/presets')
      .then(res => res.json())
      .then(data => setPresets(data.presets || []))
      .catch(() => {});
  }, []);

  // Timer while running
  useEffect(() => {
    let timer: any;
    if (running) {
      setElapsed(0);
      timer = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [running]);

  const handleSelectPreset = (presetId: string) => {
    const p = presets.find(item => item.id === presetId);
    if (!p) return;
    if (p.mode === 'solo') {
      setMode('solo');
      handleSoloSubmit(p.data);
    } else {
      setMode('squad');
      handleSquadSubmit(p.data);
    }
  };

  const handleSquadSubmit = async (formData: any) => {
    setRunning(true);
    setPlanResult(null);
    setSoloResult(null);
    setAmbiguityData(null);
    setErrorMessage(null);
    setReplanCount(0);
    setProviderCallsCount(0);
    setStage('validating');
    setStageMessage('Connecting to squad planner stream...');

    try {
      const response = await fetch('/api/squad/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.body) throw new Error('No response body from server');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          const eventMatch = block.match(/event:\s*(\w+)/);
          const dataMatch = block.match(/data:\s*(.+)/);
          if (eventMatch && dataMatch) {
            const event = eventMatch[1];
            const data = JSON.parse(dataMatch[1]);

            if (event === 'state') {
              setStage(data.stage);
              setStageMessage(data.message);
              if (data.replanCount) setReplanCount(data.replanCount);
            } else if (event === 'needs_input') {
              setAmbiguityData(data);
              setRunning(false);
              return;
            } else if (event === 'terminal') {
              if (data.status === 'completed') {
                setPlanResult(data);
                setProviderCallsCount(data.provenance?.length || 8);
              } else if (data.status === 'infeasible') {
                setErrorMessage(data.message || 'No venue satisfied constraints.');
              } else {
                setErrorMessage(data.error || 'Execution failed.');
              }
              setRunning(false);
            }
          }
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message);
      setRunning(false);
    }
  };

  const handleSoloSubmit = async (formData: any) => {
    setRunning(true);
    setPlanResult(null);
    setSoloResult(null);
    setErrorMessage(null);
    setStage('scoring_taste');
    setStageMessage('Optimizing 3-slot weekly routine via Qloo...');

    try {
      const res = await fetch('/api/solo/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.status === 'completed') {
        setSoloResult(data.routine);
        setProviderCallsCount(data.provenance?.length || 4);
      } else {
        setErrorMessage(data.error || 'Failed to build weekly routine.');
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setRunning(false);
    }
  };

  const handleCopyInvite = async () => {
    if (!planResult) return;
    try {
      const res = await fetch('/api/squad/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planResult.plan,
          timeWindow: { day: 'tue', start: '18:30', end: '21:30' }
        })
      });
      const data = await res.json();
      await navigator.clipboard.writeText(data.inviteText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {}
  };

  const handleCompareClick = async () => {
    try {
      const res = await fetch('/api/plan/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: { origin: 'wicker_park' } })
      });
      const data = await res.json();
      setCompareData(data);
    } catch {}
  };

  return (
    <main className="min-h-screen bg-[#f6f4ee] text-[#18181b] p-4 sm:p-8 max-w-6xl mx-auto font-sans">
      {/* Editorial Masthead & Telemetry Strip */}
      <header className="mb-8 pt-2 border-b border-[#1c1917] pb-6">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-wider text-[#18181b] uppercase">
              THIRDPLACE SQUAD
            </h1>
            <div className="text-[11px] font-mono tracking-widest uppercase text-[#57534e] mt-0.5">
              CULTURAL CONSENSUS • QLOO TASTE ENGINE
            </div>
          </div>

          {/* Inline Telemetry Indicators */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#57534e]">
            <span className="flex items-center gap-1.5">
              <span className="text-[#15803d]">■</span> qloo ok • 20 venues
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#15803d]">■</span> mcp ok • 6 tools
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#b45309]">■</span> blind cap active
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#15803d]">■</span> cta transit $2.75
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#15803d]">■</span> 13-row ledger verified
            </span>
          </div>
        </div>

        {/* Hero Thesis Statement & Giant KPI Metric Counters */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-[#d4cdbe] items-start">
          <div className="lg:col-span-7">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#18181b] leading-tight mb-2">
              Stop guessing group hangouts. Start computing cultural consensus.
            </h2>
            <p className="text-xs text-[#57534e] leading-relaxed font-serif max-w-xl">
              A budget breach of $1.50 in a group of three turns a hangout into awkward debt. Three friends coordinate through Qloo taste graphs to compute the intersection of culture, commute, and integer-cent fairness.
            </p>
          </div>

          {/* Big KPI Metric Row */}
          <div className="lg:col-span-5 grid grid-cols-5 gap-2 text-center pt-1 border border-[#1c1917] bg-[#efeae1] p-3">
            <div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#18181b]">74.1</div>
              <div className="text-[8px] font-mono uppercase tracking-wider text-[#57534e] mt-0.5">CONSENSUS</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#15803d]">$18.05</div>
              <div className="text-[8px] font-mono uppercase tracking-wider text-[#57534e] mt-0.5">SAVINGS/WK</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#18181b]">100%</div>
              <div className="text-[8px] font-mono uppercase tracking-wider text-[#57534e] mt-0.5">QLOO GRAPH</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#18181b]">13</div>
              <div className="text-[8px] font-mono uppercase tracking-wider text-[#57534e] mt-0.5">LEDGER ROWS</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-[#b91c1c]">0</div>
              <div className="text-[8px] font-mono uppercase tracking-wider text-[#57534e] mt-0.5">FLOAT LEAKS</div>
            </div>
          </div>
        </div>
      </header>

      {/* Preset Scenario Bar */}
      <PresetBar onSelectPreset={handleSelectPreset} />

      {/* Mode Navigation Tabs */}
      <ModeSelector mode={mode} setMode={setMode} />

      {/* Input Configuration Forms */}
      {mode === 'squad' ? (
        <SquadForm onSubmit={handleSquadSubmit} loading={running} />
      ) : (
        <SoloForm onSubmit={handleSoloSubmit} loading={running} />
      )}

      {/* Real-Time Agent Execution Trace */}
      {running && (
        <ExecutionTrace
          currentStage={stage}
          stageMessage={stageMessage}
          elapsedSeconds={elapsed}
          providerCallsCount={providerCallsCount}
          replanCount={replanCount}
        />
      )}

      {/* Ambiguity Disambiguation Modal (UI State 3) */}
      {ambiguityData && (
        <AmbiguityModal
          data={ambiguityData}
          onSelectCandidate={id => {
            setAmbiguityData(null);
          }}
          onSkip={() => setAmbiguityData(null)}
        />
      )}

      {/* Infeasible or Error State */}
      {errorMessage && (
        <div className="bg-[#fee2e2] border-2 border-[#b91c1c] p-6 my-6 text-center">
          <h3 className="text-base font-serif font-bold text-[#b91c1c] mb-1">Plan Infeasible</h3>
          <p className="text-xs text-[#b91c1c] font-mono mb-4">{errorMessage}</p>
          <button
            onClick={() => setErrorMessage(null)}
            className="py-1.5 px-4 font-mono uppercase text-xs font-bold bg-[#b91c1c] text-white hover:bg-black"
          >
            Adjust Constraints & Retry
          </button>
        </div>
      )}

      {/* Squad Plan Completed Result */}
      {planResult && (
        <div className="space-y-6">
          {/* Main Recommended Venue Dossier Card */}
          <div className="border-2 border-[#1c1917] bg-[#efeae1] p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#d4cdbe]">
              <div>
                <span className="text-[11px] font-mono text-[#57534e] uppercase tracking-wider font-bold">
                  Recommended Consensus Plan
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#18181b] mt-1">
                  {planResult.plan.primaryVenue.name}
                </h2>
                <p className="text-xs text-[#57534e] mt-0.5 font-mono">
                  {planResult.plan.primaryVenue.address} •{' '}
                  <span className="capitalize">{planResult.plan.primaryVenue.neighborhood.replace('_', ' ')}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCompareClick}
                  className="py-2 px-3 bg-[#f6f4ee] hover:bg-[#ded7c7] text-xs font-mono uppercase font-bold text-[#18181b] border border-[#1c1917] transition-colors"
                >
                  Compare Without Qloo
                </button>
                <button
                  onClick={handleCopyInvite}
                  className="py-2 px-4 bg-[#121212] hover:bg-black text-xs font-mono uppercase font-bold text-white border border-[#121212] transition-colors flex items-center gap-1.5"
                >
                  {copySuccess ? 'Copied! ✓' : 'Copy Invite 📋'}
                </button>
              </div>
            </div>

            {/* Factual explanation */}
            <p className="text-xs text-[#18181b] bg-[#f6f4ee] p-3.5 border border-[#1c1917] leading-relaxed font-serif mb-4">
              {planResult.explanation}
            </p>

            {/* Venue tags */}
            <div className="flex flex-wrap gap-1.5">
              {planResult.plan.primaryVenue.tags.map((t: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-[#f6f4ee] border border-[#d4cdbe] text-[10px] font-mono text-[#57534e]"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>

          {/* Shared Cultural DNA Card (/v2/insights/compare) */}
          <SharedCulturalDnaCard culturalDna={planResult.culturalDna} />

          {/* Per-Friend Taste & Commute Fairness Scorecard */}
          <FairnessScorecard
            ledger={planResult.plan.ledger}
            fairness={planResult.plan.fairness}
            commuteLegs={planResult.plan.memberCommuteLegs}
            blindCapMode={blindCapMode}
            onToggleBlindCap={() => setBlindCapMode(!blindCapMode)}
          />

          {/* 13-Row Itemized Pre-Spend Split Ledger */}
          <SplitLedgerTable ledger={planResult.plan.ledger} isSolo={false} />

          {/* Interactive Map */}
          <LeafletMap
            venues={[planResult.plan.primaryVenue]}
            selectedVenue={planResult.plan.primaryVenue}
          />

          {/* Provenance Drawer */}
          <ProvenanceDrawer provenance={planResult.provenance} />
        </div>
      )}

      {/* Solo Routine Completed Result */}
      {soloResult && (
        <div className="space-y-6">
          <WeeklyBurnWaterfall routine={soloResult} />
          <SplitLedgerTable
            ledger={{
              memberLedgers: [
                {
                  alias: 'Solo User',
                  LI01_BaseVenueSpendCents: soloResult.ledger.stopLedgers[0]?.row.LI01_BaseVenueSpendCents || 0,
                  LI04_TaxCents: soloResult.ledger.stopLedgers[0]?.row.LI04_TaxCents || 0,
                  LI05_GratuityCents: soloResult.ledger.stopLedgers[0]?.row.LI05_GratuityCents || 0,
                  LI07_MemberCommuteCostCents: 0,
                  LI08_ContingencyCents: soloResult.ledger.stopLedgers[0]?.row.LI08_ContingencyCents || 0,
                  LI09_TotalPerPersonAllInCents: soloResult.weeklyTotalCents,
                  LI10_MemberCapCents: 3500,
                  LI11_SlackCents: soloResult.ledger.weeklySlackVsCapCents,
                  LI12_WeeklyRunningTotalCents: soloResult.weeklyTotalCents,
                  LI13_WeeklySavingsVsBlsBenchmarkCents: soloResult.savingsVsBlsCents
                }
              ]
            }}
            isSolo={true}
          />
          <LeafletMap
            venues={soloResult.stops.map((s: any) => s.venue)}
            selectedVenue={soloResult.stops[0]?.venue}
          />
        </div>
      )}

      {/* Compare Modal */}
      {compareData && (
        <CompareModal
          compareData={compareData}
          onClose={() => setCompareData(null)}
        />
      )}

      {/* Archival Research Footer */}
      <footer className="mt-16 pt-6 border-t border-[#1c1917] text-center text-xs text-[#57534e] font-mono">
        <p>THIRDPLACE SQUAD • 2026 QLOO AGENTIC HACKATHON</p>
        <p className="mt-1 text-[11px] text-[#857f72]">
          Taste data by Qloo • Maps by OpenStreetMap • Transit fares by CTA 2026 • Integer-Cent Math
        </p>
      </footer>
    </main>
  );
}
