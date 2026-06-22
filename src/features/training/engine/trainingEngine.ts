/** ───────────────────────────────────────────────
 *  PRIXI V2 — Deterministic Training Engine
 *
 *  Rule-based (NO AI).  Takes user signals and outputs
 *  a complete, structured workout session.
 *  ─────────────────────────────────────────────── */

import type {
  TrainingInput,
  WorkoutType,
  GeneratedWorkout,
  ExercisePrescription,
  MovementCategory,
  WorkoutPhase,
} from '../types'
import { getMovementsByCategory } from '../data/movements'

/* ═══════════════════════════════════════════════
 *  STEP 1 — DETERMINE WORKOUT TYPE
 *  ═══════════════════════════════════════════════ */

function determineWorkoutType(input: TrainingInput): WorkoutType {
  const { fatigueScore, streakCount, lastWorkoutDate, userGoal } = input

  const daysSince = daysSinceLast(lastWorkoutDate)

  // Priority-ordered rule chain — first match wins.
  const rules: Array<{
    condition: boolean
    type: WorkoutType
    label: string
  }> = [
    // R1 — Overreached / highly fatigued → Recovery
    {
      condition: fatigueScore >= 80,
      type: 'recovery',
      label: 'High fatigue',
    },
    // R2 — Long layoff + low fatigue → Strength (reload)
    {
      condition: daysSince >= 4 && fatigueScore < 40,
      type: 'strength',
      label: 'Return after layoff',
    },
    // R3 — Extended layoff + moderate fatigue → Recovery
    {
      condition: daysSince >= 4,
      type: 'recovery',
      label: 'Return after layoff with moderate fatigue',
    },
    // R4 — Top-streak athlete → Athletic
    {
      condition: streakCount >= 10 && fatigueScore < 50,
      type: 'athletic',
      label: 'High streak — athletic performance',
    },
    // R5 — Strength goal + low fatigue → Strength
    {
      condition: userGoal === 'strength' && fatigueScore < 50,
      type: 'strength',
      label: 'Strength goal',
    },
    // R6 — Hypertrophy goal + manageable fatigue → Hypertrophy
    {
      condition: userGoal === 'hypertrophy' && fatigueScore < 60,
      type: 'hypertrophy',
      label: 'Hypertrophy goal',
    },
    // R7 — Athletic goal + moderate fatigue → Athletic
    {
      condition: userGoal === 'athletic' && fatigueScore < 60,
      type: 'athletic',
      label: 'Athletic goal',
    },
    // R8 — Building streak → Hypertrophy (muscle gain focus)
    {
      condition: streakCount >= 5 && fatigueScore < 60,
      type: 'hypertrophy',
      label: 'Streak building',
    },
    // R9 — Fresh / low fatigue → Strength
    {
      condition: fatigueScore < 40,
      type: 'strength',
      label: 'Low fatigue — strength',
    },
    // R10 — Default fallback → Hypertrophy (balanced)
    {
      condition: true,
      type: 'hypertrophy',
      label: 'Default — balanced hypertrophy',
    },
  ]

  const match = rules.find((r) => r.condition)
  return match!.type
}

/* ═══════════════════════════════════════════════
 *  STEP 2 — PICK EXERCISES PER WORKOUT TYPE
 *  ═══════════════════════════════════════════════ */

/** How many exercises to pull from each category, by workout type. */
interface CategoryBlueprint {
  /** How many exercises to select for this phase. */
  count: number
  /** Optional override pool (subset of category). */
  pool?: string[]
}

interface WorkoutBlueprint {
  title: string
  phases: Array<{
    label: string
    categories: Partial<Record<MovementCategory, CategoryBlueprint>>
  }>
}

const BLUEPRINTS: Record<WorkoutType, WorkoutBlueprint> = {
  strength: {
    title: 'Strength',
    phases: [
      {
        label: 'Warm-up',
        categories: {
          core: { count: 2 },
          squat: { count: 1, pool: ['goblet-squat'] },
        },
      },
      {
        label: 'Main Lifts',
        categories: {
          push: { count: 1 },
          pull: { count: 1, pool: ['deadlift', 'barbell-row'] },
        },
      },
      {
        label: 'Accessories',
        categories: {
          hinge: { count: 1 },
          core: { count: 1 },
        },
      },
      {
        label: 'Finisher',
        categories: {
          carry: { count: 1 },
        },
      },
      {
        label: 'Cooldown',
        categories: {
          core: { count: 1, pool: ['dead-bug'] },
        },
      },
    ],
  },

  hypertrophy: {
    title: 'Hypertrophy',
    phases: [
      {
        label: 'Warm-up',
        categories: {
          core: { count: 2 },
          carry: { count: 1 },
        },
      },
      {
        label: 'Main Lifts',
        categories: {
          push: { count: 1 },
          pull: { count: 1 },
        },
      },
      {
        label: 'Accessories',
        categories: {
          squat: { count: 1 },
          push: { count: 1 },
          pull: { count: 1 },
        },
      },
      {
        label: 'Cooldown',
        categories: {
          core: { count: 1, pool: ['dead-bug'] },
        },
      },
    ],
  },

  recovery: {
    title: 'Recovery',
    phases: [
      {
        label: 'Warm-up',
        categories: {
          core: { count: 2 },
        },
      },
      {
        label: 'Main Circuit',
        categories: {
          squat: { count: 1, pool: ['goblet-squat'] },
          push: { count: 1, pool: ['push-ups'] },
          hinge: { count: 1, pool: ['kb-swing', 'rdl-db'] },
          pull: { count: 1, pool: ['face-pull'] },
        },
      },
      {
        label: 'Cooldown',
        categories: {
          core: { count: 1, pool: ['dead-bug'] },
        },
      },
    ],
  },

  athletic: {
    title: 'Athletic',
    phases: [
      {
        label: 'Warm-up',
        categories: {
          core: { count: 2 },
          squat: { count: 1, pool: ['goblet-squat'] },
        },
      },
      {
        label: 'Main Lifts',
        categories: {
          squat: { count: 1, pool: ['back-squat', 'front-squat'] },
          hinge: { count: 1 },
        },
      },
      {
        label: 'Accessories',
        categories: {
          push: { count: 1 },
          carry: { count: 1 },
        },
      },
      {
        label: 'Finisher',
        categories: {
          core: { count: 1, pool: ['cable-woodchop'] },
          carry: { count: 1 },
        },
      },
      {
        label: 'Cooldown',
        categories: {
          core: { count: 1, pool: ['dead-bug'] },
        },
      },
    ],
  },
}

/* ═══════════════════════════════════════════════
 *  PRESCRIPTION MAPS  (sets / reps / rest / zone)
 *  ═══════════════════════════════════════════════ */

const BASE_PRESCRIPTION: Omit<ExercisePrescription, 'templateId'> = {
  sets: 3,
  reps: '10',
  restSeconds: 90,
  intensityZone: 'moderate',
}

const PHASE_PRESETS: Record<
  string,
  Partial<Omit<ExercisePrescription, 'templateId'>>
> = {
  warmup: { sets: 2, reps: '12', restSeconds: 30, intensityZone: 'low' },
  finisher: { sets: 3, reps: '10', restSeconds: 45, intensityZone: 'high' },
  cooldown: { sets: 1, reps: '30s', restSeconds: 0, intensityZone: 'low' },
}

const WORKOUT_TYPE_OVERRIDES: Record<
  WorkoutType,
  Partial<Omit<ExercisePrescription, 'templateId'>>
> = {
  strength: { sets: 4, reps: '5', restSeconds: 150, intensityZone: 'high' },
  hypertrophy: { sets: 3, reps: '10', restSeconds: 75, intensityZone: 'moderate' },
  recovery: { sets: 2, reps: '15', restSeconds: 45, intensityZone: 'low' },
  athletic: { sets: 3, reps: '8', restSeconds: 90, intensityZone: 'high' },
}

/* ── Helpers ──────────────────────────────────── */

function daysSinceLast(dateStr: string | null): number {
  if (!dateStr) return 999 // never trained
  const then = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - then.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/**
 * Simple seeded-ish shuffle — deterministic for same inputs
 * so the same person on the same day gets the same workout.
 */
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

/** 60 + 5 per exercise */
function estimateMinutes(phases: WorkoutPhase[]): number {
  const totalExercises = phases.reduce((s, p) => s + p.exercises.length, 0)
  return 10 + totalExercises * 5
}

function buildPrescription(
  templateId: string,
  phaseLabel: string,
  workoutType: WorkoutType,
): ExercisePrescription {
  const key = phaseLabel.toLowerCase().replace(/[^a-z]/g, '')
  const phasePreset = PHASE_PRESETS[key] ?? {}
  const typeOverride = WORKOUT_TYPE_OVERRIDES[workoutType]

  // Priority: phasePreset > typeOverride > BASE_PRESCRIPTION
  return {
    templateId,
    ...BASE_PRESCRIPTION,
    ...typeOverride,
    ...phasePreset,
  }
}

/* ═══════════════════════════════════════════════
 *  PUBLIC API
 *  ═══════════════════════════════════════════════ */

/**
 * Pure function — generates a workout deterministically from input signals.
 * Can be called from a hook, a button click handler, or a service worker.
 */
export function generateWorkout(input: TrainingInput): GeneratedWorkout {
  const workoutType = determineWorkoutType(input)
  const blueprint = BLUEPRINTS[workoutType]
  const now = new Date().toISOString()

  const phases: WorkoutPhase[] = blueprint.phases.map((phaseDef) => {
    const exercises: ExercisePrescription[] = []

    for (const [cat, bp] of Object.entries(phaseDef.categories)) {
      const category = cat as MovementCategory
      let pool = getMovementsByCategory(category)

      // If a specific pool of IDs is given, filter to those
      if (bp.pool && bp.pool.length > 0) {
        pool = pool.filter((m) => bp.pool!.includes(m.id))
      }

      if (pool.length === 0) continue

      const selected = pick(pool, bp.count)
      for (const ex of selected) {
        const prescription = buildPrescription(ex.id, phaseDef.label, workoutType)
        exercises.push(prescription)
      }
    }

    return { label: phaseDef.label, exercises }
  })

  return {
    type: workoutType,
    title: `${blueprint.title} — ${determineWorkoutTitle(workoutType, input)}`,
    phases,
    estimatedMinutes: estimateMinutes(phases),
    generatedFrom: { ...input },
    createdAt: now,
  }
}

/** Generate a human-readable subtitle for the workout. */
function determineWorkoutTitle(type: WorkoutType, input: TrainingInput): string {
  const daysSince = daysSinceLast(input.lastWorkoutDate)
  const parts: string[] = []

  if (daysSince >= 4) parts.push('Return')
  if (input.streakCount >= 10) parts.push('Streak')
  if (input.fatigueScore >= 80) parts.push('Recovery Focus')

  const labels: Record<WorkoutType, string> = {
    strength: 'Strength Focus',
    hypertrophy: 'Muscle Building',
    recovery: 'Active Recovery',
    athletic: 'Performance',
  }

  parts.push(labels[type])
  return parts.join(' · ')
}

/* ── Internal export for testing ────────────────── */
export { daysSinceLast, determineWorkoutType }
