/** ───────────────────────────────────────────────
 *  Recovery Agent
 *
 *  Analyses fatigue, sleep proxies, training density,
 *  and layoffs to determine how recovered the user is.
 *  ─────────────────────────────────────────────── */

import type { TrainingAgent, AgentContext, AgentOutput, AgentScores } from './types'
import type { WorkoutType } from '../types'

export const recoveryAgent: TrainingAgent = {
  id: 'recovery',
  name: 'Recovery Agent',

  analyze(ctx: AgentContext): AgentOutput {
    const scores = computeScores(ctx)
    const recommendedType = pickType(scores, ctx)
    const confidence = computeConfidence(ctx)

    return {
      agentId: 'recovery',
      agentName: 'Recovery Agent',
      recommendedType,
      confidence,
      scores,
      volumeMultiplier: pickVolume(ctx.fatigueScore),
      intensityOverride: ctx.fatigueScore > 60 ? 'low' : ctx.fatigueScore > 35 ? 'moderate' : null,
      reasoning: buildReasoning(ctx),
      insights: buildInsights(ctx),
    }
  },
}

function computeScores(ctx: AgentContext): AgentScores {
  const f = ctx.fatigueScore

  // Recovery score: inverse of fatigue
  const recovery = Math.max(10, 100 - f)

  // Strength score drops with fatigue
  const strength = Math.max(5, 80 - f * 0.6)

  // Hypertrophy tolerant to moderate fatigue
  const hypertrophy = Math.max(5, 75 - f * 0.4)

  // Athletic performance sensitive to fatigue
  const athletic = Math.max(5, 85 - f * 0.8)

  // Layoff penalty
  const days = ctx.daysSinceLastWorkout
  if (days >= 5) {
    return {
      recovery: Math.min(90, recovery + 20),
      strength: Math.max(10, strength - 15),
      hypertrophy: Math.max(10, hypertrophy - 10),
      athletic: Math.max(5, athletic - 20),
    }
  }

  return clampScores({ strength, hypertrophy, recovery, athletic })
}

function pickType(scores: AgentScores, ctx: AgentContext): WorkoutType | null {
  if (ctx.fatigueScore >= 80) return 'recovery'
  if (ctx.daysSinceLastWorkout >= 5) return 'recovery'

  const entries = Object.entries(scores) as [WorkoutType, number][]
  entries.sort((a, b) => b[1] - a[1])

  // Only recommend if recovery isn't dominant
  if (entries[0][0] !== 'recovery' || entries[0][1] - entries[1][1] < 10) {
    return null // No strong opinion
  }

  return entries[0][0]
}

function computeConfidence(ctx: AgentContext): number {
  // Recovery agent is more confident when it has clear signals
  if (ctx.fatigueScore > 70 || ctx.daysSinceLastWorkout >= 5) return 0.9
  if (ctx.fatigueScore > 50) return 0.7
  return 0.5
}

function pickVolume(fatigue: number): number {
  if (fatigue > 75) return 0.6
  if (fatigue > 55) return 0.8
  return 1.0
}

function buildReasoning(ctx: AgentContext): string {
  const parts: string[] = []

  if (ctx.fatigueScore >= 80) {
    parts.push('Fatigue is critically high — active recovery strongly recommended.')
  } else if (ctx.fatigueScore >= 60) {
    parts.push('Fatigue is elevated — consider reducing volume today.')
  } else if (ctx.fatigueScore >= 40) {
    parts.push('Moderate fatigue levels — manageable with normal volume.')
  } else {
    parts.push('Low fatigue — you are well recovered.')
  }

  if (ctx.daysSinceLastWorkout >= 5) {
    parts.push(`The ${ctx.daysSinceLastWorkout}-day gap since your last session suggests detraining has begun.`)
  } else if (ctx.daysSinceLastWorkout >= 3) {
    parts.push('A 3+ day gap means cautiously ramping intensity back up.')
  }

  return parts.join(' ')
}

function buildInsights(ctx: AgentContext): string[] {
  const insights: string[] = []

  if (ctx.fatigueScore >= 80) {
    insights.push('High fatigue detected — today is a rest or active recovery day.')
  } else if (ctx.fatigueScore >= 60) {
    insights.push('Moderate fatigue — trim volume by 20% and watch form.')
  } else {
    insights.push('Good recovery levels — ready to train at full capacity.')
  }

  if (ctx.daysSinceLastWorkout >= 4) {
    insights.push('Consider a lighter "re-entry" session after your layoff.')
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
