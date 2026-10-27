// lib/agent/stateMachine.ts
// State machine definitions and lifecycle interfaces for agent orchestration.

export type AgentStage =
  | 'validating'
  | 'needs_input'
  | 'resolving_seeds'
  | 'scoring_taste'
  | 'checking_constraints'
  | 'replanning'
  | 'packaging';

export type TerminalStatus =
  | 'completed'
  | 'partial'
  | 'infeasible'
  | 'failed'
  | 'cancelled';

export interface OrchestratorRunRecord {
  runId: string;
  mode: 'squad' | 'solo';
  stage: AgentStage | TerminalStatus;
  replanCount: number;
  maxReplans: number;
  providerRequestCount: number;
  llmCallCount: number;
  history: Array<{ timestamp: string; stage: string; summary: string }>;
}
