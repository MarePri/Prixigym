/** ───────────────────────────────────────────────
 *  Decision Fusion Layer
 *
 *  Combines outputs from all 6 agents into a single
 *  fused recommendation.  Uses weighted voting with
 *  per-agent confidence as the primary weight.
 *  ─────────────────────────────────────────────── */

import type { AgentOutput, AgentScores, FusionResult, AgentContribution } from './types'
import type { WorkoutType, IntensityZone } from '../types'

/**
 * Fuse multiple agent outputs into one coherent decision.
 *
 * Strategy:
 *  1. Weighted score aggregation — each agent's score vector
 *     is multiplied by its confidence and summed.
 *  2. Workout type is selected from the aggregated scores,
 *     then adjusted by agent type recommendations (voting).
 *  3. Volume / intensity use the most conservative value
 *     among high-confidence agents to avoid injury.
 */
export function fuseAgentOutputs(outputs: AgentOutput[]): FusionResult {
  if (outputs.length === 0) {
    return fallbackFusion()
  }

  /* ── 1. Weighted score aggregation ────────── */

  const totalConfidence = outputs.reduce((s, o) => s + o.confidence, 0) || 1
  const aggregated: AgentScores = { strength: 0, hypertrophy: 0, recovery: 0, athletic: 0 }

  for (const out of outputs) {
    const w = out.confidence / totalConfidence
    aggregated.strength += out.scores.strength * w
    aggregated.hypertrophy += out.scores.hypertrophy * w
    aggregated.recovery += out.scores.recovery * w
    aggregated.athletic += out.scores.athletic * w
  }

  /* ── 2. Agent voting — each agent's type recommendation ── */

  const votes: Record<WorkoutType, { weight: number; agents: string[] }> = {
    strength: { weight: 0, agents: [] },
    hypertrophy: { weight: 0, agents: [] },
    recovery: { weight: 0, agents: [] },
    athletic: { weight: 0, agents: [] },
  }

  for (const out of outputs) {
    if (out.recommendedType) {
      votes[out.recommendedType].weight += out.confidence
      votes[out.recommendedType].agents.push(out.agentId)
    }
  }

  // Find the voted type (highest confidence-weighted votes)
  const voteEntries = Object.entries(votes) as [WorkoutType, { weight: number; agents: string[] }][]
  voteEntries.sort((a, b) => b[1].weight - a[1].weight)
  const votedType = voteEntries[0][1].weight > 0 ? voteEntries[0][0] : null

  /* ── 3. Resolve final type ───────────────── */

  const sortedScores = Object.entries(aggregated) as [WorkoutType, number][]
  sortedScores.sort((a, b) => b[1] - a[1])
  const scoreLeader = sortedScores[0][0]
  const scoreGap = sortedScores[0][1] - sortedScores[1][1]

  let selectedType: WorkoutType

  if (votedType && votes[votedType].weight >= 0.3) {
    // Strong voting consensus
    selectedType = votedType
  } else if (scoreGap > 15) {
    // Clear score leader
    selectedType = scoreLeader
  } else if (votedType) {
    // Weak consensus — use voted type as tiebreaker
    selectedType = votedType
  } else {
    selectedType = scoreLeader
  }

  /* ── 4. Volume / intensity — take conservative approach ── */

  const highConfOutputs = outputs.filter((o) => o.confidence >= 0.6)
  const volMultipliers = highConfOutputs.length > 0
    ? highConfOutputs.map((o) => o.volumeMultiplier)
    : outputs.map((o) => o.volumeMultiplier)

  // Use median volume
  const sortedVols = [...volMultipliers].sort((a, b) => a - b)
  const medianVol = sortedVols.length % 2 === 0
    ? (sortedVols[sortedVols.length / 2 - 1] + sortedVols[sortedVols.length / 2]) / 2
    : sortedVols[Math.floor(sortedVols.length / 2)]

  // Intensity: take the most common override, or fallback to base
  const intensityOverrides = outputs
    .filter((o): o is AgentOutput & { intensityOverride: IntensityZone } => o.intensityOverride !== null)
    .map((o) => o.intensityOverride)

  const intensityMode = intensityOverrides.length > 0
    ? intensityOverrides.sort((a, b) =>
        intensityOverrides.filter((v) => v === a).length -
        intensityOverrides.filter((v) => v === b).length
      )[0]
    : null

  /* ── 5. Build agent contributions ────────── */

  const contributions: AgentContribution[] = outputs.map((o) => ({
    agentId: o.agentId,
    agentName: o.agentName,
    weight: o.confidence / totalConfidence,
    recommendedType: o.recommendedType,
    confidence: o.confidence,
    reasoning: o.reasoning,
  }))

  return {
    selectedType,
    confidence: computeFusionConfidence(outputs, votes, selectedType),
    volumeMultiplier: Math.round(medianVol * 100) / 100,
    intensityOverride: intensityMode,
    scores: aggregated,
    agentContributions: contributions,
  }
}

function computeFusionConfidence(
  outputs: AgentOutput[],
  votes: Record<WorkoutType, { weight: number; agents: string[] }>,
  selected: WorkoutType,
): number {
  const avgConf = outputs.reduce((s, o) => s + o.confidence, 0) / outputs.length
  const voteRatio = outputs.filter((o) => o.recommendedType === selected).length / outputs.length
  const voteWeight = votes[selected]?.weight ?? 0

  return Math.min(0.95, (avgConf * 0.4 + voteRatio * 0.3 + voteWeight * 0.3))
}

function fallbackFusion(): FusionResult {
  return {
    selectedType: 'hypertrophy',
    confidence: 0.5,
    volumeMultiplier: 1.0,
    intensityOverride: null,
    scores: { strength: 45, hypertrophy: 50, recovery: 40, athletic: 35 },
    agentContributions: [],
  }
}
