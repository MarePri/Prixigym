/** ───────────────────────────────────────────────
 *  Agent Manager
 *
 *  Orchestrates all 6 agents, collects their outputs,
 *  and runs decision fusion to produce the final
 *  training recommendation.
 *
 *  Designed so agents can be run in parallel (they
 *  are stateless pure functions) and new agents can
 *  be added by simply importing them into the registry.
 *  ─────────────────────────────────────────────── */

import type { AgentContext, AgentOutput, FusionResult, TrainingAgent } from './types'
import { coachAgent } from './coach.agent'
import { recoveryAgent } from './recovery.agent'
import { progressionAgent } from './progression.agent'
import { habitAgent } from './habit.agent'
import { physiqueAgent } from './physique.agent'
import { athleteAgent } from './athlete.agent'
import { fuseAgentOutputs } from './decision-fusion'

/** All registered agents.  Add new agents here to include them. */
const AGENTS: TrainingAgent[] = [
  coachAgent,
  recoveryAgent,
  progressionAgent,
  habitAgent,
  physiqueAgent,
  athleteAgent,
]

export interface OrchestrationResult {
  fusion: FusionResult
  outputs: AgentOutput[]
}

/**
 * Run the full agent pipeline synchronously.
 *
 * In a production build this could be trivially parallelised
 * with `Promise.all(agents.map(a => a.analyze(ctx)))` once agents
 * need async IO (e.g. fetching additional metrics from an API).
 */
export function orchestrateAgents(ctx: AgentContext): OrchestrationResult {
  const outputs: AgentOutput[] = AGENTS.map((agent) => agent.analyze(ctx))
  const fusion = fuseAgentOutputs(outputs)

  return { fusion, outputs }
}

export { AGENTS }
