/** ───────────────────────────────────────────────
 *  PRIXI V2 — Agent System Types
 *  ─────────────────────────────────────────────── */

import type { WorkoutType, UserGoal, IntensityZone, WorkoutSession } from '../types'

/* ── Experience level ─────────────────────────── */

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

/* ── Agent Context (what every agent receives) ─ */

export interface AgentContext {
  userId: string

  /* User profile */
  userGoal: UserGoal
  experienceLevel: ExperienceLevel
  age: number
  weightKg: number
  heightCm: number

  /* Current state */
  fatigueScore: number
  streakCount: number
  lastWorkoutDate: string | null
  daysSinceLastWorkout: number

  /* Training history */
  recentWorkouts: WorkoutSession[]
  totalWorkoutsCompleted: number
  weeklyFrequency: number // average workouts per week

  /* Physique */
  currentWeightKg: number
  targetWeightKg: number
  estimatedBodyFatPercent: number

  /* Performance (exercise -> estimated 1RM in kg) */
  estimatedMaxes: Record<string, number>
}

/* ── Agent Score Vector ──────────────────────── */

export interface AgentScores {
  strength: number    // 0 – 100
  hypertrophy: number // 0 – 100
  recovery: number    // 0 – 100
  athletic: number    // 0 – 100
}

/* ── Agent Output (what every agent returns) ─── */

export interface AgentOutput {
  agentId: string
  agentName: string

  /** The workout type this agent recommends (null = no preference). */
  recommendedType: WorkoutType | null
  /** How confident the agent is in its recommendation (0 – 1). */
  confidence: number

  /** Scores across all four workout dimensions. */
  scores: AgentScores

  /** Workload modifiers. */
  volumeMultiplier: number     // 0.5 – 1.5
  intensityOverride: IntensityZone | null

  /** Human-readable reasoning for this agent's output. */
  reasoning: string
  /** 1-3 short insight bullets shown to the user. */
  insights: string[]
}

/* ── Agent interface ─────────────────────────── */

export interface TrainingAgent {
  readonly id: string
  readonly name: string
  analyze(ctx: AgentContext): AgentOutput
}

/* ── Fusion result ───────────────────────────── */

export interface AgentContribution {
  agentId: string
  agentName: string
  weight: number
  recommendedType: WorkoutType | null
  confidence: number
  reasoning: string
}

export interface FusionResult {
  selectedType: WorkoutType
  confidence: number
  volumeMultiplier: number
  intensityOverride: IntensityZone | null
  scores: AgentScores
  agentContributions: AgentContribution[]
}

/* ── Agent-managed workout (adds explanation) ── */

export interface AgentExplanation {
  agentId: string
  agentName: string
  insight: string
}

export interface AgentDrivenWorkout {
  type: WorkoutType
  title: string
  subtitle: string
  phases: import('../types').WorkoutPhase[]
  estimatedMinutes: number
  generatedFrom: import('../types').TrainingInput
  createdAt: string
  fusionResult: FusionResult
  explanations: AgentExplanation[]
}
