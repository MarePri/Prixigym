import { useState } from 'react'
import {
  Dumbbell,
  Flame,
  Zap,
  Heart,
  Activity,
  Timer,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useTrainingEngine } from '@/features/training/hooks/useTrainingEngine'
import type { GeneratedWorkout, WorkoutPhase, WorkoutType } from '@/features/training/types'
import { getMovementById } from '@/features/training/data/movements'
import { cn } from '@/lib/utils'

/* ── Phase icon map ───────────────────────────── */

const phaseIcons: Record<string, typeof Dumbbell> = {
  warmup: Heart,
  mainlifts: Zap,
  accessories: Dumbbell,
  finisher: Flame,
  cooldown: Activity,
}

const phaseKey = (label: string) => label.toLowerCase().replace(/[^a-z]/g, '')

/* ═══════════════════════════════════════════════
 *  WORKOUT TYPE BADGE
 *  ═══════════════════════════════════════════════ */

const typeMeta: Record<WorkoutType, { label: string; icon: typeof Dumbbell; color: string }> = {
  strength: { label: 'Strength', icon: Zap, color: 'text-danger border-danger/30 bg-danger/10' },
  hypertrophy: { label: 'Hypertrophy', icon: Dumbbell, color: 'text-primary border-primary/30 bg-primary/10' },
  recovery: { label: 'Recovery', icon: Heart, color: 'text-xp border-xp/30 bg-xp/10' },
  athletic: { label: 'Athletic', icon: Activity, color: 'text-primary border-primary/30 bg-primary/10' },
}

function WorkoutTypeBadge({ type }: { type: WorkoutType }) {
  const meta = typeMeta[type]
  const Icon = meta.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider',
        meta.color,
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
      {meta.label}
    </span>
  )
}

/* ═══════════════════════════════════════════════
 *  EXERCISE ROW
 *  ═══════════════════════════════════════════════ */

function ExerciseRow({
  templateId,
  sets,
  reps,
  restSeconds,
  intensityZone,
  notes,
}: {
  templateId: string
  sets: number
  reps: string
  restSeconds: number
  intensityZone: string
  notes?: string
}) {
  const template = getMovementById(templateId)
  if (!template) return null

  return (
    <div className="flex items-center justify-between rounded-lg border border-border/50 bg-surface-elevated/30 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-medium text-text-primary">
          {template.name}
        </p>
        {notes && <p className="mt-0.5 text-xs text-text-muted">{notes}</p>}
      </div>
      <div className="ml-4 flex shrink-0 items-center gap-4 text-xs tabular-nums text-text-muted">
        <span className="text-right">
          <span className="block font-mono font-medium text-text-primary">
            {sets}×{reps}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <Timer className="h-3 w-3" strokeWidth={2} />
          {restSeconds > 0 ? `${restSeconds}s` : '—'}
        </span>
        <span
          className={cn(
            'hidden rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider sm:block',
            intensityZone === 'high' && 'bg-danger/20 text-danger',
            intensityZone === 'moderate' && 'bg-primary/20 text-primary',
            intensityZone === 'low' && 'bg-xp/20 text-xp',
          )}
        >
          {intensityZone}
        </span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
 *  PHASE SECTION (collapsible)
 *  ═══════════════════════════════════════════════ */

function PhaseSection({ phase, defaultOpen }: { phase: WorkoutPhase; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? true)
  const key = phaseKey(phase.label)
  const Icon = phaseIcons[key] ?? Dumbbell

  if (phase.exercises.length === 0) return null

  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-surface-elevated/50"
      >
        <div className="flex items-center gap-2.5">
          <Icon className="h-4 w-4 text-primary" strokeWidth={2} />
          <span className="font-display text-sm font-semibold text-text-primary">
            {phase.label}
          </span>
          <span className="rounded-full bg-border/60 px-2 py-0.5 text-[10px] font-mono tabular-nums text-text-muted">
            {phase.exercises.length}
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-text-muted" strokeWidth={2} />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-muted" strokeWidth={2} />
        )}
      </button>
      {open && (
        <div className="space-y-2 border-t border-border px-4 py-3">
          {phase.exercises.map((ex, i) => (
            <ExerciseRow key={`${ex.templateId}-${i}`} {...ex} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
 *  WORKOUT CARD (full generated workout)
 *  ═══════════════════════════════════════════════ */

function WorkoutCard({ workout }: { workout: GeneratedWorkout }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <WorkoutTypeBadge type={workout.type} />
        </div>
        <span className="flex items-center gap-1.5 text-xs text-text-muted">
          <Timer className="h-3.5 w-3.5" strokeWidth={2} />
          ~{workout.estimatedMinutes} min
        </span>
      </div>

      {/* Title */}
      <h2 className="font-display text-lg font-semibold text-text-primary">
        {workout.title}
      </h2>

      {/* Phases */}
      {workout.phases.map((phase, i) => (
        <PhaseSection key={phase.label} phase={phase} defaultOpen={i < 2} />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════
 *  MAIN PAGE
 *  ═══════════════════════════════════════════════ */

export function TrainingPage() {
  const { currentWorkout, isSaving, error, generate, clear } = useTrainingEngine()
  const [showSuccess, setShowSuccess] = useState(false)

  const handleTrainToday = async () => {
    setShowSuccess(false)
    await generate()
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <p className="text-sm text-text-muted">Training</p>
        <h1 className="font-display text-2xl font-semibold text-text-primary">
          {currentWorkout ? 'Today\'s Session' : 'Ready to train?'}
        </h1>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-card border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      {/* Success toast */}
      {showSuccess && (
        <div className="flex animate-pulse items-center gap-2.5 rounded-card border border-xp/30 bg-xp/10 px-4 py-3 text-sm text-xp">
          <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
          <span className="font-medium">Workout saved! Let&apos;s go.</span>
        </div>
      )}

      {/* TRAIN TODAY Button */}
      <button
        type="button"
        onClick={handleTrainToday}
        disabled={isSaving}
        className="group relative flex items-center justify-between overflow-hidden rounded-card border border-primary/40 bg-primary px-5 py-4 text-left shadow-glow transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div>
          <p className="font-display text-lg font-bold tracking-wide text-white">
            {isSaving ? 'Generating…' : 'TRAIN TODAY'}
          </p>
          <p className="mt-0.5 text-sm text-white/80">
            {currentWorkout
              ? `${currentWorkout.title} · ~${currentWorkout.estimatedMinutes} min`
              : 'Generate a workout based on your readiness'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSaving ? (
            <Loader2 className="h-6 w-6 animate-spin text-white/90" strokeWidth={2} />
          ) : (
            <Flame className="h-8 w-8 text-white/90" strokeWidth={2} />
          )}
        </div>
      </button>

      {/* Generated Workout */}
      {currentWorkout && !isSaving && (
        <>
          <WorkoutCard workout={currentWorkout} />

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleTrainToday}
              className="flex-1 rounded-card bg-primary py-3 text-center font-display text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Generate new
            </button>
            <button
              type="button"
              onClick={clear}
              className="rounded-card border border-border px-5 font-display text-sm font-semibold text-text-muted transition-colors hover:border-primary hover:text-text-primary"
            >
              Clear
            </button>
          </div>
        </>
      )}

      {/* Empty state */}
      {!currentWorkout && !isSaving && (
        <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border bg-surface px-6 py-12 text-center">
          <Dumbbell className="h-8 w-8 text-text-muted" strokeWidth={1.5} />
          <p className="text-sm text-text-muted">
            Tap <span className="font-semibold text-text-primary">TRAIN TODAY</span> to generate
            a personalised session based on your fatigue, streak, and goals.
          </p>
        </div>
      )}
    </div>
  )
}
