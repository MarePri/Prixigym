/** ───────────────────────────────────────────────
 *  Habit Agent
 *
 *  Focuses on behavioural consistency — streak
 *  psychology, habit formation, and barrier analysis.
 *  When streaks are at risk, it favours anything that
 *  keeps the user moving (low barrier entry).
 *  ─────────────────────────────────────────────── */

import type { TrainingAgent, AgentContext, AgentOutput, AgentScores } from './types'

export const habitAgent: TrainingAgent = {
  id: 'habit',
  name: 'Habit Agent',

  analyze(ctx: AgentContext): AgentOutput {
    const scores = computeScores(ctx)
    const recommendedType = pickType(ctx)
    const confidence = computeConfidence(ctx)

    return {
      agentId: 'habit',
      agentName: 'Habit Agent',
      recommendedType,
      confidence,
      scores,
      volumeMultiplier: pickVolume(ctx),
      intensityOverride: pickIntensity(ctx),
      reasoning: buildReasoning(ctx),
      insights: buildInsights(ctx),
    }
  },
}

function computeScores(ctx: AgentContext): AgentScores {
  const { streakCount, daysSinceLastWorkout } = ctx

  const base = { strength: 45, hypertrophy: 45, recovery: 45, athletic: 45 }

  // Long streak → maintain momentum with preferred type
  if (streakCount >= 10) {
    base.strength += 15
    base.hypertrophy += 15
    base.athletic += 15
    base.recovery += 5
  } else if (streakCount >= 5) {
    base.strength += 8
    base.hypertrophy += 8
    base.athletic += 5
  }

  // Streak at risk → lower barrier
  if (daysSinceLastWorkout >= 3 && streakCount < 5) {
    base.recovery += 15 // Easy win to keep streak alive
    base.hypertrophy += 5
    base.strength -= 5
    base.athletic -= 5
  }

  // Layoff → get back in the door with anything
  if (daysSinceLastWorkout >= 5) {
    base.recovery += 20
    base.strength -= 10
    base.athletic -= 10
  }

  return clampScores(base)
}

function pickType(ctx: AgentContext): import('../types').WorkoutType | null {
  const { streakCount, daysSinceLastWorkout } = ctx

  // Streak at risk: recommend the easiest option
  if (streakCount >= 3 && daysSinceLastWorkout >= 2) {
    return 'recovery'
  }

  // Long break: just get moving
  if (daysSinceLastWorkout >= 4) {
    return 'recovery'
  }

  // Strong habit: no strong preference
  return null
}

function computeConfidence(ctx: AgentContext): number {
  // Most confident when streak is at risk or just started
  if (ctx.streakCount <= 5 && ctx.daysSinceLastWorkout >= 2) return 0.85
  if (ctx.streakCount >= 10) return 0.7
  if (ctx.streakCount >= 5) return 0.5
  return 0.6
}

function pickVolume(ctx: AgentContext): number {
  const { streakCount, daysSinceLastWorkout } = ctx

  // At risk — lower the barrier
  if (streakCount >= 3 && daysSinceLastWorkout >= 2) return 0.65
  if (daysSinceLastWorkout >= 4) return 0.6
  if (streakCount >= 10) return 1.1 // strong habit can handle more

  return 1.0
}

function pickIntensity(ctx: AgentContext): import('../types').IntensityZone | null {
  const { streakCount, daysSinceLastWorkout } = ctx

  if (streakCount >= 3 && daysSinceLastWorkout >= 2) return 'low'
  if (daysSinceLastWorkout >= 4) return 'low'
  return null
}

function buildReasoning(ctx: AgentContext): string {
  const parts: string[] = []

  if (ctx.streakCount >= 10) {
    parts.push(`You have built a strong ${ctx.streakCount}-session habit — consistency is your superpower.`)
  } else if (ctx.streakCount >= 3 && ctx.daysSinceLastWorkout >= 2) {
    parts.push(`Your ${ctx.streakCount}-session streak is at risk — the key is to keep moving, even lightly.`)
  } else if (ctx.daysSinceLastWorkout >= 4) {
    parts.push(`It has been ${ctx.daysSinceLastWorkout} days — the hardest part is starting. Keep it simple today.`)
  } else {
    parts.push('You are on track with your training habit. Keep showing up.')
  }

  return parts.join(' ')
}

function buildInsights(ctx: AgentContext): string[] {
  const insights: string[] = []

  if (ctx.streakCount >= 10) {
    insights.push(`🔥 ${ctx.streakCount}-day streak! Momentum is on your side.`)
  } else if (ctx.streakCount >= 3 && ctx.daysSinceLastWorkout >= 2) {
    insights.push(`Your ${ctx.streakCount}-day streak needs a top-up — even a light session counts.`)
  } else if (ctx.daysSinceLastWorkout >= 4) {
    insights.push('The best workout is the one you show up for — keep it light and rebuild.')
  }

  if (ctx.weeklyFrequency >= 4) {
    insights.push('Great weekly frequency — you are building an automatic routine.')
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
