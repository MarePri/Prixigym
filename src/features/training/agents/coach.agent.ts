/** ───────────────────────────────────────────────
 *  Coach Agent
 *
 *  The head coach — synthesises all signals into a
 *  holistic readiness assessment.  Acts as the
 *  "tiebreaker" when other agents disagree.
 *  ─────────────────────────────────────────────── */

import type { TrainingAgent, AgentContext, AgentOutput, AgentScores } from './types'
import type { WorkoutType } from '../types'

export const coachAgent: TrainingAgent = {
  id: 'coach',
  name: 'Coach',

  analyze(ctx: AgentContext): AgentOutput {
    const { fatigueScore, streakCount, daysSinceLastWorkout } = ctx

    /* ── Score calculation ──────────────────── */

    const scores = computeScores(ctx)
    const recommendedType = pickType(scores, ctx)
    const confidence = computeConfidence(scores, ctx)
    const intensityOverride = pickIntensity(fatigueScore, daysSinceLastWorkout)

    return {
      agentId: 'coach',
      agentName: 'Coach',
      recommendedType,
      confidence,
      scores,
      volumeMultiplier: pickVolume(streakCount, fatigueScore),
      intensityOverride,
      reasoning: buildReasoning(recommendedType, scores, ctx),
      insights: buildInsights(scores, recommendedType, ctx),
    }
  },
}

/* ── Helpers ──────────────────────────────────── */

function computeScores(ctx: AgentContext): AgentScores {
  const { fatigueScore, streakCount, daysSinceLastWorkout, userGoal, weeklyFrequency } = ctx

  // Base scores from user goal
  const base: Record<WorkoutType, number> = {
    strength: userGoal === 'strength' ? 70 : 40,
    hypertrophy: userGoal === 'hypertrophy' ? 70 : 40,
    recovery: 30,
    athletic: userGoal === 'athletic' ? 70 : 35,
  }

  // Fatigue heavily reduces strength/athletic scores
  if (fatigueScore > 70) {
    base.strength -= 30
    base.athletic -= 25
    base.recovery += 35
  } else if (fatigueScore > 50) {
    base.strength -= 15
    base.athletic -= 10
    base.recovery += 15
  }

  // Long layoff favours recovery then strength
  if (daysSinceLastWorkout >= 5) {
    base.recovery += 20
    base.strength -= 10
    base.hypertrophy -= 15
    base.athletic -= 20
  } else if (daysSinceLastWorkout >= 3) {
    base.strength -= 5
    base.hypertrophy -= 5
    base.recovery += 10
  }

  // Streak consistency boosts all
  if (streakCount >= 10) {
    base.strength += 10
    base.hypertrophy += 10
    base.athletic += 15
  }

  // High frequency favours recovery/hypertrophy
  if (weeklyFrequency >= 5) {
    base.recovery += 10
    base.hypertrophy += 5
  }

  return clampScores(base)
}

function pickType(scores: AgentScores, ctx: AgentContext): WorkoutType {
  const { userGoal, fatigueScore, daysSinceLastWorkout } = ctx

  // Hard constraints
  if (fatigueScore >= 85) return 'recovery'
  if (daysSinceLastWorkout >= 7) return 'recovery'

  // Goal alignment bonus
  const goalBonus: Record<string, WorkoutType> = {
    strength: 'strength',
    hypertrophy: 'hypertrophy',
    athletic: 'athletic',
  }

  const goalType = goalBonus[userGoal]
  const entries = Object.entries(scores) as [WorkoutType, number][]

  // Sort by score descending
  entries.sort((a, b) => b[1] - a[1])

  // If goal type is within 10 points of leader, choose goal type
  if (goalType && scores[goalType] >= entries[0][1] - 10) {
    return goalType
  }

  return entries[0][0]
}

function computeConfidence(scores: AgentScores, ctx: AgentContext): number {
  const sorted = Object.values(scores).sort((a, b) => b - a)
  const gap = sorted[0] - sorted[1]

  // Bigger gap = more confident
  let conf = 0.5 + gap / 100

  // More data = more confident
  if (ctx.totalWorkoutsCompleted > 20) conf += 0.15
  if (ctx.streakCount >= 5) conf += 0.1

  return Math.min(conf, 0.98)
}

function pickVolume(streak: number, fatigue: number): number {
  if (fatigue > 70) return 0.7
  if (fatigue > 50) return 0.85
  if (streak >= 10) return 1.15
  if (streak >= 5) return 1.05
  return 1.0
}

function pickIntensity(fatigue: number, daysSince: number): 'low' | 'moderate' | 'high' {
  if (fatigue > 70 || daysSince >= 5) return 'low'
  if (fatigue > 50) return 'moderate'
  return 'high'
}

function clampScores(s: Record<string, number>): AgentScores {
  return {
    strength: Math.max(0, Math.min(100, s.strength)),
    hypertrophy: Math.max(0, Math.min(100, s.hypertrophy)),
    recovery: Math.max(0, Math.min(100, s.recovery)),
    athletic: Math.max(0, Math.min(100, s.athletic)),
  }
}

function buildReasoning(type: WorkoutType, scores: AgentScores, ctx: AgentContext): string {
  const parts: string[] = [`Coach assessment shows readiness skewing toward ${type}.`]

  if (scores.recovery > 60) {
    parts.push('Recovery demand is elevated — prioritising tissue health.')
  }
  if (scores.strength > 60 && ctx.userGoal === 'strength') {
    parts.push('Your strength goal aligns with current readiness.')
  }
  if (ctx.daysSinceLastWorkout >= 5) {
    parts.push(`It has been ${ctx.daysSinceLastWorkout} days since your last session — easing back in.`)
  }

  return parts.join(' ')
}

function buildInsights(scores: AgentScores, _type: WorkoutType, ctx: AgentContext): string[] {
  const insights: string[] = []

  if (scores.recovery > 60) {
    insights.push('Prioritise recovery — your body is signalling accumulated fatigue.')
  }
  if (ctx.streakCount >= 10) {
    insights.push(`Impressive ${ctx.streakCount}-day streak! Great consistency.`)
  }
  if (ctx.daysSinceLastWorkout >= 4) {
    insights.push('Welcome back — start lighter and rebuild momentum.')
  }

  if (insights.length === 0) {
    insights.push('You are in a good spot to train. Stay consistent!')
  }

  return insights
}
