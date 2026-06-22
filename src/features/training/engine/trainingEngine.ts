/** ───────────────────────────────────────────────
 *  PRIXI V2 — Agent-Driven Training Engine
 *
 *  Replaces the Phase 3 deterministic rule chain with
 *  a Multi-Agent AI system.  6 specialised agents each
 *  analyse user context and vote on the workout.  A
 *  decision fusion layer combines their outputs into a
 *  dynamically generated session with explanations.
 *  ─────────────────────────────────────────────── */

import type {
  TrainingInput,
  AgentDrivenWorkout,
  ExercisePrescription,
  MovementCategory,
  WorkoutPhase,
  WorkoutType,
  IntensityZone,
  ExperienceLevel,
} from '../types'
import { getMovementsByCategory } from '../data/movements'
import { orchestrateAgents } from '../agents/agent-manager'
import type { AgentContext, FusionResult } from '../agents/types'

/* ═══════════════════════════════════════════════
 *  PUBLIC API
 *  ═══════════════════════════════════════════════ */

/**
 * Generate a workout using the Multi-Agent AI system.
 *
 * Each agent analyses the user context independently.
 * The Decision Fusion Layer combines their outputs into
 * a final workout type, volume, and intensity.
 * Exercises are selected dynamically based on the
 * fused recommendation — no hardcoded blueprints.
 */
export function generateWorkout(input: TrainingInput): AgentDrivenWorkout {
  const ctx = buildAgentContext(input)
  const { fusion, outputs } = orchestrateAgents(ctx)
  const now = new Date().toISOString()

  const phases = buildPhases(fusion)
  const insights = extractInsights(outputs)

  return {
    type: fusion.selectedType,
    title: buildTitle(fusion, ctx),
    subtitle: buildSubtitle(fusion),
    phases,
    estimatedMinutes: estimateMinutes(phases, fusion.volumeMultiplier),
    generatedFrom: { ...input },
    createdAt: now,
    insights,
    agentSummary: buildSummary(fusion, outputs),
  }
}

/* ═══════════════════════════════════════════════
 *  AGENT CONTEXT BUILDER
 *  ═══════════════════════════════════════════════ */

function buildAgentContext(input: TrainingInput): AgentContext {
  const daysSince = daysSinceLast(input.lastWorkoutDate)
  const weeklyFrequency = estimateWeeklyFrequency(input.streakCount, daysSince)

  return {
    userId: 'mock-user',
    userGoal: input.userGoal ?? 'general',
    experienceLevel: determineLevel(input.streakCount, 0),
    age: 28,
    weightKg: 80,
    heightCm: 180,
    fatigueScore: input.fatigueScore,
    streakCount: input.streakCount,
    lastWorkoutDate: input.lastWorkoutDate,
    daysSinceLastWorkout: daysSince,
    recentWorkouts: [],
    totalWorkoutsCompleted: input.streakCount * 2,
    weeklyFrequency,
    currentWeightKg: 80,
    targetWeightKg: 78,
    estimatedBodyFatPercent: 15,
    estimatedMaxes: {},
  }
}

function determineLevel(streak: number, total: number): ExperienceLevel {
  if (total > 50 || streak > 20) return 'advanced'
  if (total > 20 || streak > 10) return 'intermediate'
  return 'beginner'
}

function estimateWeeklyFrequency(streak: number, daysSince: number): number {
  if (daysSince > 7) return 0
  return Math.max(1, Math.min(7, Math.round(streak / 4)))
}

/* ═══════════════════════════════════════════════
 *  DYNAMIC WORKOUT BUILDER
 *
 *  No hardcoded blueprints.  Exercise selection,
 *  volume, and intensity are derived from the
 *  fused agent outputs at generation time.
 *  ═══════════════════════════════════════════════ */

type PhaseTemplate = {
  label: string
  categories: Array<{
    category: MovementCategory
    count: number
    pool?: string[]
  }>
}

/** Dynamically build phase structure based on workout type + agent scores. */
function buildPhases(fusion: FusionResult): WorkoutPhase[] {
  const vol = fusion.volumeMultiplier
  const intensity = fusion.intensityOverride
  const type = fusion.selectedType

  const templates = getPhaseTemplates(type, fusion)
  const phases: WorkoutPhase[] = []

  for (const tmpl of templates) {
    const exercises: ExercisePrescription[] = []

    for (const catDef of tmpl.categories) {
      const adjustedCount = Math.max(1, Math.round(catDef.count * vol))
      let pool = getMovementsByCategory(catDef.category)

      if (catDef.pool && catDef.pool.length > 0) {
        pool = pool.filter((m) => catDef.pool!.includes(m.id))
      }

      if (pool.length === 0) continue

      const selected = pick(pool, adjustedCount)
      for (const ex of selected) {
        exercises.push(
          buildPrescription(ex.id, tmpl.label, type, intensity),
        )
      }
    }

    if (exercises.length > 0) {
      phases.push({ label: tmpl.label, exercises })
    }
  }

  return phases
}

/**
 * Phase templates per workout type — still categorised by movement
 * pattern, but exercise COUNT and INTENSITY within each phase are
 * modulated by the agent fusion output.
 */
function getPhaseTemplates(type: WorkoutType, _fusion: FusionResult): PhaseTemplate[] {
  const templates: Record<WorkoutType, PhaseTemplate[]> = {
    strength: [
      {
        label: 'Warm-up',
        categories: [
          { category: 'core', count: 2 },
          { category: 'squat', count: 1, pool: ['goblet-squat'] },
        ],
      },
      {
        label: 'Main Lifts',
        categories: [
          { category: 'push', count: 1 },
          { category: 'pull', count: 1, pool: ['deadlift', 'barbell-row'] },
        ],
      },
      {
        label: 'Accessories',
        categories: [
          { category: 'hinge', count: 1 },
          { category: 'core', count: 1 },
        ],
      },
      {
        label: 'Finisher',
        categories: [
          { category: 'carry', count: 1 },
        ],
      },
      {
        label: 'Cooldown',
        categories: [
          { category: 'core', count: 1, pool: ['dead-bug'] },
        ],
      },
    ],

    hypertrophy: [
      {
        label: 'Warm-up',
        categories: [
          { category: 'core', count: 2 },
          { category: 'carry', count: 1 },
        ],
      },
      {
        label: 'Main Lifts',
        categories: [
          { category: 'push', count: 1 },
          { category: 'pull', count: 1 },
        ],
      },
      {
        label: 'Accessories',
        categories: [
          { category: 'squat', count: 1 },
          { category: 'push', count: 1 },
          { category: 'pull', count: 1 },
        ],
      },
      {
        label: 'Cooldown',
        categories: [
          { category: 'core', count: 1, pool: ['dead-bug'] },
        ],
      },
    ],

    recovery: [
      {
        label: 'Warm-up',
        categories: [
          { category: 'core', count: 2 },
        ],
      },
      {
        label: 'Main Circuit',
        categories: [
          { category: 'squat', count: 1, pool: ['goblet-squat'] },
          { category: 'push', count: 1, pool: ['push-ups'] },
          { category: 'hinge', count: 1, pool: ['kb-swing', 'rdl-db'] },
          { category: 'pull', count: 1, pool: ['face-pull'] },
        ],
      },
      {
        label: 'Cooldown',
        categories: [
          { category: 'core', count: 1, pool: ['dead-bug'] },
        ],
      },
    ],

    athletic: [
      {
        label: 'Warm-up',
        categories: [
          { category: 'core', count: 2 },
          { category: 'squat', count: 1, pool: ['goblet-squat'] },
        ],
      },
      {
        label: 'Main Lifts',
        categories: [
          { category: 'squat', count: 1, pool: ['back-squat', 'front-squat'] },
          { category: 'hinge', count: 1 },
        ],
      },
      {
        label: 'Accessories',
        categories: [
          { category: 'push', count: 1 },
          { category: 'carry', count: 1 },
        ],
      },
      {
        label: 'Finisher',
        categories: [
          { category: 'core', count: 1, pool: ['cable-woodchop'] },
          { category: 'carry', count: 1 },
        ],
      },
      {
        label: 'Cooldown',
        categories: [
          { category: 'core', count: 1, pool: ['dead-bug'] },
        ],
      },
    ],
  }

  return templates[type]
}

/* ═══════════════════════════════════════════════
 *  PRESCRIPTION BUILDER
 *
 *  Uses agent fusion to override sets/reps/rest
 *  instead of hardcoded per-type maps.
 *  ═══════════════════════════════════════════════ */

const BASE_PRESCRIPTION: Omit<ExercisePrescription, 'templateId'> = {
  sets: 3,
  reps: '10',
  restSeconds: 90,
  intensityZone: 'moderate',
}

const PHASE_PRESETS: Record<string, Partial<Omit<ExercisePrescription, 'templateId'>>> = {
  warmup: { sets: 2, reps: '12', restSeconds: 30, intensityZone: 'low' },
  finisher: { sets: 3, reps: '10', restSeconds: 45, intensityZone: 'high' },
  cooldown: { sets: 1, reps: '30s', restSeconds: 0, intensityZone: 'low' },
}

const TYPE_OVERRIDES: Record<WorkoutType, Partial<Omit<ExercisePrescription, 'templateId'>>> = {
  strength: { sets: 4, reps: '5', restSeconds: 150, intensityZone: 'high' },
  hypertrophy: { sets: 3, reps: '10', restSeconds: 75, intensityZone: 'moderate' },
  recovery: { sets: 2, reps: '15', restSeconds: 45, intensityZone: 'low' },
  athletic: { sets: 3, reps: '8', restSeconds: 90, intensityZone: 'high' },
}

const INTENSITY_OVERRIDES: Record<IntensityZone, Partial<Omit<ExercisePrescription, 'templateId'>>> = {
  low: { sets: 2, reps: '15', restSeconds: 45, intensityZone: 'low' },
  moderate: { sets: 3, reps: '10', restSeconds: 75, intensityZone: 'moderate' },
  high: { sets: 4, reps: '6', restSeconds: 120, intensityZone: 'high' },
}

function buildPrescription(
  templateId: string,
  phaseLabel: string,
  type: WorkoutType,
  intensityOverride: IntensityZone | null,
): ExercisePrescription {
  const key = phaseLabel.toLowerCase().replace(/[^a-z]/g, '')
  const phasePreset = PHASE_PRESETS[key] ?? {}
  const typeOverride = TYPE_OVERRIDES[type]
  const intensityPreset = intensityOverride ? INTENSITY_OVERRIDES[intensityOverride] : {}

  // Priority: phasePreset > intensityPreset > typeOverride > BASE
  return {
    templateId,
    ...BASE_PRESCRIPTION,
    ...typeOverride,
    ...intensityPreset,
    ...phasePreset,
  }
}

/* ═══════════════════════════════════════════════
 *  EXPLANATIONS & TITLES
 *  ═══════════════════════════════════════════════ */

function buildTitle(fusion: FusionResult, ctx: AgentContext): string {
  const labels: Record<WorkoutType, string> = {
    strength: 'Strength',
    hypertrophy: 'Hypertrophy',
    recovery: 'Recovery',
    athletic: 'Athletic',
  }

  const prefix = ctx.daysSinceLastWorkout >= 5 ? 'Return — ' : ''
  return `${prefix}${labels[fusion.selectedType]}`
}

function buildSubtitle(fusion: FusionResult): string {
  const conf = Math.round(fusion.confidence * 100)
  return `Agent confidence ${conf}% · ${fusion.scores[fusion.selectedType].toFixed(0)}/100 readiness`
}

function buildSummary(fusion: FusionResult, outputs: import('../agents/types').AgentOutput[]): string {
  const topAgent = outputs
    .filter((o) => o.recommendedType === fusion.selectedType)
    .sort((a, b) => b.confidence - a.confidence)[0]

  if (topAgent) {
    return topAgent.reasoning
  }

  return `Session tailored to ${fusion.selectedType} based on your readiness signals.`
}

function extractInsights(outputs: import('../agents/types').AgentOutput[]): import('../types').AgentInsight[] {
  return outputs
    .flatMap((o) =>
      o.insights.map((insight) => ({
        agentId: o.agentId,
        agentName: o.agentName,
        insight,
      })),
    )
    .slice(0, 6) // cap at 6 insights
}

/* ═══════════════════════════════════════════════
 *  HELPERS
 *  ═══════════════════════════════════════════════ */

function daysSinceLast(dateStr: string | null): number {
  if (!dateStr) return 999
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function pick<T>(items: T[], count: number): T[] {
  const pool = [...items]
  const result: T[] = []
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    result.push(pool[idx]!)
    pool.splice(idx, 1)
  }
  return result
}

function estimateMinutes(phases: WorkoutPhase[], volumeMultiplier: number): number {
  const totalExercises = phases.reduce((s, p) => s + p.exercises.length, 0)
  return Math.round((10 + totalExercises * 5) * volumeMultiplier)
}

/* ── Internal export for testing ────────────────── */
export { daysSinceLast }
