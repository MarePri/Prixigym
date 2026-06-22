/** ───────────────────────────────────────────────
 *  Physique Agent
 *
 *  Analyses body composition trajectory, weight
 *  trends, and aesthetic goals.  Adjusts recommendations
 *  based on whether the user is in a cut, maintenance,
 *  or bulk phase.
 *  ─────────────────────────────────────────────── */

import type { TrainingAgent, AgentContext, AgentOutput, AgentScores } from './types'

export const physiqueAgent: TrainingAgent = {
  id: 'physique',
  name: 'Physique Agent',

  analyze(ctx: AgentContext): AgentOutput {
    const phase = determinePhase(ctx)
    const scores = computeScores(phase, ctx)
    const recommendedType = pickType(scores, phase, ctx)

    return {
      agentId: 'physique',
      agentName: 'Physique Agent',
      recommendedType,
      confidence: computeConfidence(phase, ctx),
      scores,
      volumeMultiplier: pickVolume(phase),
      intensityOverride: pickIntensity(phase),
      reasoning: buildReasoning(phase, ctx),
      insights: buildInsights(phase, scores, ctx),
    }
  },
}

type PhysiquePhase = 'cut' | 'maintenance' | 'bulk' | 'unknown'

function determinePhase(ctx: AgentContext): PhysiquePhase {
  const { currentWeightKg, targetWeightKg } = ctx
  const diff = targetWeightKg - currentWeightKg

  if (Math.abs(diff) < 2) return 'maintenance'
  if (diff < -2) return 'cut' // target lighter → cut
  return 'bulk' // target heavier → bulk
}

function computeScores(phase: PhysiquePhase, ctx: AgentContext): AgentScores {
  const base = { strength: 45, hypertrophy: 45, recovery: 40, athletic: 40 }

  switch (phase) {
    case 'cut':
      // Cutting favours hypertrophy to preserve muscle, moderate volume
      base.hypertrophy += 20
      base.strength += 10
      base.recovery += 10 // cuts are fatiguing
      base.athletic -= 5
      break

    case 'bulk':
      // Bulking favours strength and hypertrophy
      base.strength += 20
      base.hypertrophy += 15
      base.athletic += 5
      break

    case 'maintenance':
      // Balanced across all
      base.strength += 10
      base.hypertrophy += 10
      base.athletic += 10
      base.recovery += 5
      break
  }

  // Body fat proxy adjustments
  if (ctx.estimatedBodyFatPercent > 25) {
    base.athletic -= 10
    base.recovery += 5
  }

  return clampScores(base)
}

function pickType(
  scores: AgentScores,
  phase: PhysiquePhase,
  _ctx: AgentContext,
): import('../types').WorkoutType | null {
  const entries = Object.entries(scores) as [import('../types').WorkoutType, number][]
  entries.sort((a, b) => b[1] - a[1])

  // Strong lean toward hypertrophy in cut or bulk
  if ((phase === 'cut' || phase === 'bulk') && scores.hypertrophy > 55) {
    return 'hypertrophy'
  }

  if (entries[0][1] - entries[1][1] < 8) return null
  return entries[0][0]
}

function computeConfidence(phase: PhysiquePhase, ctx: AgentContext): number {
  if (phase !== 'unknown' && ctx.totalWorkoutsCompleted > 10) return 0.7
  if (ctx.estimatedBodyFatPercent > 0) return 0.5
  return 0.3
}

function pickVolume(phase: PhysiquePhase): number {
  switch (phase) {
    case 'cut': return 0.85
    case 'bulk': return 1.15
    case 'maintenance': return 1.0
    default: return 1.0
  }
}

function pickIntensity(phase: PhysiquePhase): import('../types').IntensityZone | null {
  switch (phase) {
    case 'cut': return 'moderate'
    case 'bulk': return 'high'
    case 'maintenance': return 'moderate'
    default: return null
  }
}

function buildReasoning(phase: PhysiquePhase, ctx: AgentContext): string {
  const parts: string[] = []

  switch (phase) {
    case 'cut':
      parts.push('You are in a cutting phase — prioritising muscle preservation with moderate volume.')
      break
    case 'bulk':
      parts.push('You are in a building phase — higher volume and intensity support muscle growth.')
      break
    case 'maintenance':
      parts.push('You are near your target weight — maintaining with balanced training.')
      break
    default:
      parts.push('Tracking your physique trajectory to optimise training focus.')
  }

  const diff = ctx.targetWeightKg - ctx.currentWeightKg
  const absDiff = Math.abs(diff).toFixed(1)
  if (Math.abs(diff) > 2) {
    parts.push(`You are ${absDiff}kg ${diff > 0 ? 'from your target' : 'above your target weight'}.`)
  }

  return parts.join(' ')
}

function buildInsights(phase: PhysiquePhase, _scores: AgentScores, _ctx: AgentContext): string[] {
  const insights: string[] = []

  switch (phase) {
    case 'cut':
      insights.push('Cutting phase — focus on maintaining strength with moderate volume.')
      insights.push('Keep protein high and manage fatigue for best results.')
      break
    case 'bulk':
      insights.push('Building phase — progressive overload is your primary driver.')
      break
    case 'maintenance':
      insights.push('Maintenance phase — balanced training with steady-state volume.')
      break
  }

  return insights
}

function clampScores(s: Record<string, number>): AgentScores {
  return {
    strength: Math.max(0, Math.min(100, s.strength)),
    hypertrophy: Math.max(0, Math.min(100, s.hypertrophy)),
    recovery: Math.max(0, Math.min(100, s.recovery)),
    athletic: Math.max(0, Math.min(100, s.athletic)),
  }
}
