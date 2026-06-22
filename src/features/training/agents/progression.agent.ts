/** ───────────────────────────────────────────────
 *  Progression Agent
 *
 *  Tracks long-term progress, deload requirements,
 *  and periodisation phases.  Recommends when to
 *  push intensity vs. pull back for a deload week.
 *  ─────────────────────────────────────────────── */

import type { TrainingAgent, AgentContext, AgentOutput, AgentScores } from './types'

export const progressionAgent: TrainingAgent = {
  id: 'progression',
  name: 'Progression Agent',

  analyze(ctx: AgentContext): AgentOutput {
    const scores = computeScores(ctx)
    const { recommendedType, confidence } = pickTypeAndConfidence(scores, ctx)

    return {
      agentId: 'progression',
      agentName: 'Progression Agent',
      recommendedType,
      confidence,
      scores,
      volumeMultiplier: pickVolume(ctx),
      intensityOverride: pickIntensity(ctx),
      reasoning: buildReasoning(scores, ctx),
      insights: buildInsights(scores, ctx),
    }
  },
}

function computeScores(ctx: AgentContext): AgentScores {
  const { totalWorkoutsCompleted, streakCount, weeklyFrequency } = ctx

  // More experience = better suited for strength/athletic
  const progressRatio = Math.min(1, totalWorkoutsCompleted / 50)

  const strength = 40 + 40 * progressRatio
  const hypertrophy = 50 + 30 * progressRatio
  const athletic = 35 + 40 * progressRatio
  const recovery = 30 + 20 * (1 - progressRatio)

  // High frequency without deload → recovery needed
  if (weeklyFrequency >= 5 && totalWorkoutsCompleted >= 20) {
    return clampScores({
      strength: strength - 10,
      hypertrophy: hypertrophy - 5,
      recovery: recovery + 20,
      athletic: athletic - 15,
    })
  }

  // Streak momentum
  if (streakCount >= 10) {
    return clampScores({
      strength: strength + 10,
      hypertrophy: hypertrophy + 10,
      recovery: recovery - 5,
      athletic: athletic + 15,
    })
  }

  return clampScores({ strength, hypertrophy, recovery, athletic })
}

function pickTypeAndConfidence(
  scores: AgentScores,
  ctx: AgentContext,
): { recommendedType: import('../types').WorkoutType | null; confidence: number } {
  const entries = Object.entries(scores) as [import('../types').WorkoutType, number][]
  entries.sort((a, b) => b[1] - a[1])

  // Recommend deload if accumulated volume is high
  if (ctx.totalWorkoutsCompleted > 30 && ctx.weeklyFrequency >= 5 && ctx.fatigueScore > 50) {
    return { recommendedType: 'recovery', confidence: 0.8 }
  }

  if (ctx.totalWorkoutsCompleted < 10) {
    // Early stage — focus on base building
    return { recommendedType: 'hypertrophy', confidence: 0.6 }
  }

  if (entries[0][1] - entries[1][1] < 5) {
    return { recommendedType: null, confidence: 0.4 } // No strong opinion
  }

  return { recommendedType: entries[0][0], confidence: 0.6 }
}

function pickVolume(ctx: AgentContext): number {
  const { totalWorkoutsCompleted, streakCount, fatigueScore, weeklyFrequency } = ctx
  // Deload signal
  if (totalWorkoutsCompleted > 30 && weeklyFrequency >= 5) {
    return 0.6
  }

  // Progressing well — slight volume increase
  if (streakCount >= 10 && fatigueScore < 40) {
    return 1.2
  }

  return 1.0
}

function pickIntensity(ctx: AgentContext): import('../types').IntensityZone | null {
  const { totalWorkoutsCompleted, weeklyFrequency, fatigueScore } = ctx
  if (totalWorkoutsCompleted > 30 && weeklyFrequency >= 5 && fatigueScore > 50) {
    return 'low'
  }
  if (totalWorkoutsCompleted > 20 && fatigueScore < 40) {
    return 'high'
  }
  return null
}

function buildReasoning(_scores: AgentScores, ctx: AgentContext): string {
  const parts: string[] = []
  const total = ctx.totalWorkoutsCompleted

  if (total > 30 && ctx.weeklyFrequency >= 5) {
    parts.push(`You have completed ${total} sessions — accumulated volume suggests a deload may be due.`)
  } else if (total < 10) {
    parts.push('You are in the early phase of training — building a base with moderate volume.')
  } else {
    parts.push(`With ${total} sessions logged, you are building solid training momentum.`)
  }

  if (ctx.streakCount >= 10) {
    parts.push(`Your ${ctx.streakCount}-session streak shows excellent adherence — progressive overload is working.`)
  }

  return parts.join(' ')
}

function buildInsights(_scores: AgentScores, ctx: AgentContext): string[] {
  const insights: string[] = []

  if (ctx.totalWorkoutsCompleted > 30 && ctx.weeklyFrequency >= 5) {
    insights.push('Consider a deload week to let connective tissue catch up.')
  } else if (ctx.totalWorkoutsCompleted > 20) {
    insights.push('Good momentum — your training age supports moderate intensity.')
  } else {
    insights.push('Building your foundation — consistency matters more than intensity right now.')
  }

  if (ctx.streakCount >= 10) {
    insights.push('Your streak shows excellent adherence — keep showing up!')
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
