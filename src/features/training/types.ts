/** ───────────────────────────────────────────────
 *  PRIXI V2 — Training Engine Types
 *  ─────────────────────────────────────────────── */

export type MovementCategory = 'push' | 'pull' | 'squat' | 'hinge' | 'core' | 'carry'

export type WorkoutType = 'strength' | 'hypertrophy' | 'recovery' | 'athletic'

export type UserGoal = 'strength' | 'hypertrophy' | 'athletic' | 'general'

/** The intensity / loading zone for a given exercise within a workout type. */
export type IntensityZone = 'low' | 'moderate' | 'high'

/* ── Core data shapes ─────────────────────────── */

export interface ExerciseTemplate {
  /** Stable key (e.g. "bench-press") so we can reference / log it. */
  id: string
  name: string
  category: MovementCategory
  /** Estimated per-set rep target for this template.  Overridden per-workout-type below. */
  defaultReps: string
  /** Pre-configured RPE / intensity note. */
  intensityNote?: string
}

/**
 * Per-workout-type prescription for an exercise template.
 * The engine selects exercises and applies these overrides.
 */
export interface ExercisePrescription {
  templateId: string
  sets: number
  reps: string
  restSeconds: number
  intensityZone: IntensityZone
  notes?: string
}

export interface WorkoutPhase {
  label: string
  exercises: ExercisePrescription[]
}

/** A fully generated workout ready to display & store. */
export interface GeneratedWorkout {
  type: WorkoutType
  title: string
  phases: WorkoutPhase[]
  estimatedMinutes: number
  /** Snapshot of the inputs that produced this workout. */
  generatedFrom: TrainingInput
  createdAt: string // ISO string
}

/** Firestore document shape for a completed or saved workout session. */
export interface WorkoutSession extends GeneratedWorkout {
  id?: string
  userId: string
  completedAt?: string // ISO string — set when user marks done
}

/** Inputs the rule engine uses to pick a workout type & compose the session. */
export interface TrainingInput {
  lastWorkoutDate: string | null
  userGoal: UserGoal
  fatigueScore: number  // 0 – 100
  streakCount: number
}
