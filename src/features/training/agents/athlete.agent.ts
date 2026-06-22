/** ───────────────────────────────────────────────
 *  Athlete Agent
 *
 *  Assesses athletic performance readiness — power
 *  output, speed, agility, and sport-specific demands.
 *  Recommends athletic-style sessions when the user
 *  shows signs of being in a performance window.
 *  ─────────────────────────────────────────────── */

import type { TrainingAgent, AgentContext, AgentOutput, AgentScores } from './types'

export const athleteAgent: TrainingAgent = {
  id: 'athlete',
  name: 'Athlete Agent',

  analyze(ctx: AgentContext): AgentOutput {
    const scores = computeScores(ctx)
    const recommendedType = pickType(scores, ctx)

    return {
      agentId: 'athlete',
      agentName: 'Athlete Agent',
      recommendedType,
      confidence: computeConfidence(ctx),
      scores,
      volumeMultiplier: pickVolume(ctx),
      intensityOverride: pickIntensity(ctx),
      reasoning: buildReasoning(scores, ctx),
      insights: buildInsights(scores, ctx),
    }
  },
}

function computeScores(ctx: AgentContext): AgentScores {
  const { fatigueScore, streakCount } = ctx

  const athletic = computeAthleticScore(ctx)
  const strength = computeStrengthScore(ctx)

  // Athletic performance is inversely related to fatigue
  const recovery = Math.max(10, 70 - fatigueScore * 0.5)

  // Hypertrophy as a base
  const hypertrophy = 50 + (streakCount * 2) - (fatigueScore * 0.3)

  return clampScores({ strength, hypertrophy, recovery, athletic })
}

function computeAthleticScore(ctx: AgentContext): number {
  const { fatigueScore, streakCount, daysSinceLastWorkout, weeklyFrequency, totalWorkoutsCompleted } = ctx

  let score = 40

  // Training age bonus
  score += Math.min(25, totalWorkoutsCompleted * 0.5)

  // Freshness (low fatigue) is key for athletic performance
  if (fatigueScore < 30) score += 20
  else if (fatigueScore < 50) score += 10
  else score -= 20

  // Regular frequency supports athletic conditioning
  if (weeklyFrequency >= 4) score += 10
  else if (weeklyFrequency <= 2) score -= 10

  // Streak consistency
  if (streakCount >= 10) score += 15
  else if (streakCount >= 5) score += 5

  // Layoff penalty
  if (daysSinceLastWorkout >= 4) score -= 20
  else if (daysSinceLastWorkout >= 2) score -= 5

  return score
}

function computeStrengthScore(ctx: AgentContext): number {
  const { fatigueScore, streakCount, daysSinceLastWorkout } = ctx

  let score = 45
  if (fatigueScore < 30) score += 20
  else if (fatigueScore < 50) score += 10
  else score -= 10

  if (streakCount >= 10) score += 10
  if (daysSinceLastWorkout >= 4) score -= 15

  return score
}

function pickType(scores: AgentScores, ctx: AgentContext): import('../types').WorkoutType | null {
  const { fatigueScore, userGoal, daysSinceLastWorkout } = ctx

  // Athletic only makes sense when fatigue is low
  if (fatigueScore >= 50) return null
  if (daysSinceLastWorkout >= 4) return null

  // If user goal is athletic and scores support it
  if (userGoal === 'athletic' && scores.athletic > 55) return 'athletic'

  const entries = Object.entries(scores) as [import('../types').WorkoutType, number][]
  entries.sort((a, b) => b[1] - a[1])

  if (entries[0][0] === 'athletic' && entries[0][1] - entries[1][1] > 10) {
    return 'athletic'
  }

  return null
}

function computeConfidence(ctx: AgentContext): number {
  if (ctx.fatigueScore < 30 && ctx.streakCount >= 10 && ctx.weeklyFrequency >= 4) return 0.85
  if (ctx.fatigueScore < 40) return 0.6
  return 0.3
}

function pickVolume(ctx: AgentContext): number {
  if (ctx.fatigueScore < 30 && ctx.streakCount >= 10) return 1.15
  if (ctx.fatigueScore < 40) return 1.0
  return 0.8
}

function pickIntensity(ctx: AgentContext): import('../types').IntensityZone | null {
  if (ctx.fatigueScore < 30) return 'high'
  if (ctx.fatigueScore < 45) return 'moderate'
  return null
}

function buildReasoning(scores: AgentScores, ctx: AgentContext): string {
  const parts: string[] = []

  if (scores.athletic > 60) {
    parts.push('Your athletic readiness is high — you are in a performance window.')
  } else if (scores.athletic > 45) {
    parts.push('Moderate athletic readiness — some explosive work can be included.')
  } else {
    parts.push('Athletic readiness is lower — focusing on strength and hypertrophy foundations.')
  }

  if (ctx.fatigueScore < 30) {
    parts.push('Low fatigue levels are ideal for power and speed work.')
  }

  if (ctx.weeklyFrequency < 3) {
    parts.push('Increasing weekly frequency will improve your athletic conditioning base.')
  }

  return parts.join(' ')
}

function buildInsights(scores: AgentScores, ctx: AgentContext): string[] {
  const insights: string[] = []

  if (scores.athletic > 60) {
    insights.push('You are in a performance window — great time for explosive work!')
  } else if (scores.athletic > 45) {
    insights.push('Moderate athletic readiness — include some power work.')
  } else {
    insights.push('Build your foundation before focusing on athletic performance.')
  }

  if (ctx.weeklyFrequency < 3) {
    insights.push('Aim for 3-4 sessions per week to build athletic conditioning.')
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
