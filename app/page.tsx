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
const LeafletMap = dynamic(
  () => import('./components/LeafletMap').then(mod => mod.LeafletMap),
  { ssr: false }
);

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
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <header className="text-center mb-8 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-[11px] font-mono text-indigo-300 mb-3">
          <span>Qloo Agentic Hackathon 2026</span>
          <span>•</span>
          <span>Agents, but with taste.</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          ThirdPlace Squad
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
          Culturally grounded hangouts & solo routines with deterministic 13-row integer-cent splits and P0 Blind Cap privacy.
        </p>
      </header>

      {/* Preset Bar */}
      <PresetBar onSelectPreset={handleSelectPreset} />

      {/* Mode Selector */}
      <ModeSelector mode={mode} setMode={setMode} />

      {/* Forms */}
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
            // Resume with selected candidate
          }}
          onSkip={() => setAmbiguityData(null)}
        />
      )}

      {/* Infeasible or Error State */}
      {errorMessage && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-6 my-6 text-center">
          <h3 className="text-base font-semibold text-rose-300 mb-1">Plan Infeasible</h3>
          <p className="text-xs text-rose-400 font-mono mb-4">{errorMessage}</p>
          <button
            onClick={() => setErrorMessage(null)}
            className="py-1.5 px-4 rounded-lg bg-rose-900/60 text-xs text-white hover:bg-rose-800"
          >
            Adjust Constraints & Retry
          </button>
        </div>
      )}

      {/* Squad Plan Completed Result */}
      {planResult && (
        <div className="space-y-6">
          {/* Main Recommended Venue Card */}
          <div className="bg-slate-900 border border-indigo-500/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider font-bold">
                  Recommended Consensus Plan
                </span>
                <h2 className="text-2xl font-bold text-white mt-1">
                  {planResult.plan.primaryVenue.name}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {planResult.plan.primaryVenue.address} •{' '}
                  <span className="capitalize">{planResult.plan.primaryVenue.neighborhood.replace('_', ' ')}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCompareClick}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-all"
                >
                  Compare Without Qloo
                </button>
                <button
                  onClick={handleCopyInvite}
                  className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                >
                  {copySuccess ? 'Copied! ✓' : 'Copy Invite 📋'}
                </button>
              </div>
            </div>

            {/* Factual explanation */}
            <p className="text-xs text-slate-300 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed font-sans mb-4">
              {planResult.explanation}
            </p>

            {/* Venue tags */}
            <div className="flex flex-wrap gap-1.5">
              {planResult.plan.primaryVenue.tags.map((t: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-[11px] font-mono text-slate-300"
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

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-slate-900 text-center text-xs text-slate-500 font-mono">
        <p>ThirdPlace Squad • Built for the 2026 Qloo Agentic Hackathon</p>
        <p className="mt-1">
          Taste data by Qloo • Maps by OpenStreetMap • Transit fares by CTA 2026
        </p>
      </footer>
    </main>
  );
}
