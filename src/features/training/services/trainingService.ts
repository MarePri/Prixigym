/** ───────────────────────────────────────────────
 *  PRIXI V2 — Training Firestore Service
 *  ─────────────────────────────────────────────── */

import {
  collection,
  addDoc,
  getDocs,
  doc as fsDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { GeneratedWorkout, WorkoutSession } from '../types'

const COLLECTION = 'workouts'

/* ── Write ─────────────────────────────────────── */

/** Save a generated workout to Firestore (not yet completed). */
export async function saveWorkout(
  userId: string,
  workout: GeneratedWorkout,
): Promise<string> {
  const doc: Omit<WorkoutSession, 'id'> = {
    ...workout,
    userId,
    createdAt: workout.createdAt,
  }

  const ref = await addDoc(collection(db, COLLECTION), {
    ...doc,
    // Store dates as Firestore Timestamps for queryability
    createdAt: Timestamp.fromDate(new Date(workout.createdAt)),
  })

  return ref.id
}

/** Mark a saved workout as completed. */
export async function completeWorkout(
  workoutId: string,
): Promise<void> {
  const ref = fsDoc(db, COLLECTION, workoutId)
  await updateDoc(ref, {
    completedAt: Timestamp.fromDate(new Date()),
  })
}

/* ── Read ──────────────────────────────────────── */

/** Fetch the most recent workout for a user (used for "last workout" check). */
export async function fetchLatestWorkout(
  userId: string,
): Promise<WorkoutSession | null> {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(1),
  )

  const snap = await getDocs(q)
  if (snap.empty) return null

  return mapDoc(snap.docs[0]!)
}

/** Fetch recent workouts (for progress/history). */
export async function fetchWorkoutHistory(
  userId: string,
  max = 20,
): Promise<WorkoutSession[]> {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(max),
  )

  const snap = await getDocs(q)
  return snap.docs.map(mapDoc)
}

/* ── Mapper ────────────────────────────────────── */

function mapDoc(d: DocumentData): WorkoutSession {
  const data = d.data()
  return {
    id: d.id,
    ...data,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt,
    completedAt:
      data.completedAt instanceof Timestamp
        ? data.completedAt.toDate().toISOString()
        : data.completedAt ?? undefined,
  } as WorkoutSession
}
