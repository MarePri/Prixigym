/** ───────────────────────────────────────────────
 *  PRIXI V2 — useTrainingEngine Hook
 *
 *  Wraps the agent-driven engine AND Firestore persistence
 *  so pages only need to call `generate` and read `currentWorkout`.
 *  ─────────────────────────────────────────────── */

import { useCallback, useState } from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { generateWorkout } from '../engine/trainingEngine'
import { saveWorkout } from '../services/trainingService'
import { mockStreak } from '@/mock/dashboardMock'
import type { AgentDrivenWorkout, TrainingInput, UserGoal } from '../types'

interface UseTrainingEngineReturn {
  /** The most recently generated workout (null before first generate). */
  currentWorkout: AgentDrivenWorkout | null
  /** True while saving to Firestore. */
  isSaving: boolean
  /** Error message if something went wrong. */
  error: string | null
  /**
   * Generate a workout and persist it.
   * Uses a default userGoal of 'general' if none provided.
   */
  generate: (overrides?: Partial<TrainingInput>) => Promise<void>
  /** Clear the current workout from state. */
  clear: () => void
}

export function useTrainingEngine(): UseTrainingEngineReturn {
  const { user } = useAuth()
  const [currentWorkout, setCurrentWorkout] = useState<AgentDrivenWorkout | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(
    async (overrides?: Partial<TrainingInput>) => {
      if (!user) {
        setError('You must be signed in to generate a workout.')
        return
      }

      setError(null)
      setIsSaving(true)

      try {
        // Build input from overrides + mock defaults
        const input: TrainingInput = {
          lastWorkoutDate: mockStreak.lastTrainedDate,
          userGoal: (overrides?.userGoal ?? 'general') as UserGoal,
          fatigueScore: overrides?.fatigueScore ?? 78,
          streakCount: overrides?.streakCount ?? mockStreak.currentStreak,
          ...overrides,
        }

        // Generate using the Multi-Agent AI system
        const workout = generateWorkout(input)
        setCurrentWorkout(workout)

        // Persist to Firestore
        await saveWorkout(user.uid, workout)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to generate workout'
        setError(msg)
      } finally {
        setIsSaving(false)
      }
    },
    [user],
  )

  const clear = useCallback(() => {
    setCurrentWorkout(null)
    setError(null)
  }, [])

  return { currentWorkout, isSaving, error, generate, clear }
}
