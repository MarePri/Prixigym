/**
 * MOCK DATA — Phase 3 (UI shell) only.
 * Shapes intentionally mirror the future Firestore doc types so swapping
 * these for real `useStreak` / `useRecovery` / `useProgress` hooks later
 * is a drop-in change, not a rewrite.
 */

export const mockStreak = {
  currentStreak: 12,
  longestStreak: 21,
  lastTrainedDate: '2026-06-21',
}

export const mockRecovery = {
  recoveryScore: 78, // 0-100, placeholder — real calc lands with AI phase
  trend: 'up' as const, // 'up' | 'down' | 'flat'
}

export const mockStrength = {
  strengthScore: 64, // 0-100 composite, placeholder
  trend: 'flat' as const,
}

export const mockNextSession = {
  split: 'Push Day',
  exerciseCount: 6,
}
