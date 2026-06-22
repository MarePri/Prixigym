/** ───────────────────────────────────────────────
 *  PRIXI V2 — Movement Template Library
 *
 *  Every exercise is tagged with its movement category.
 *  The engine selects from here based on workout type.
 *  ─────────────────────────────────────────────── */

import type { ExerciseTemplate } from '../types'

export const MOVEMENT_TEMPLATES: ExerciseTemplate[] = [
  /* ═══════════════ PUSH ═══════════════ */
  { id: 'bench-press',           name: 'Bench Press',            category: 'push', defaultReps: '5',   intensityNote: '70–85% 1RM' },
  { id: 'overhead-press',        name: 'Overhead Press',         category: 'push', defaultReps: '5',   intensityNote: '70–80% 1RM' },
  { id: 'incline-db-press',      name: 'Incline Dumbbell Press', category: 'push', defaultReps: '10',  intensityNote: 'Moderate' },
  { id: 'dips',                  name: 'Dips',                   category: 'push', defaultReps: '8',   intensityNote: 'Bodyweight / weighted' },
  { id: 'push-ups',              name: 'Push-ups',               category: 'push', defaultReps: '15',  intensityNote: 'Bodyweight' },
  { id: 'cable-fly',             name: 'Cable Fly',              category: 'push', defaultReps: '12',  intensityNote: 'Light–moderate' },
  { id: 'db-lateral-raise',      name: 'DB Lateral Raise',       category: 'push', defaultReps: '15',  intensityNote: 'Light' },
  { id: 'triceps-pushdown',      name: 'Triceps Pushdown',       category: 'push', defaultReps: '12',  intensityNote: 'Moderate' },

  /* ═══════════════ PULL ═══════════════ */
  { id: 'deadlift',              name: 'Deadlift',               category: 'pull', defaultReps: '5',   intensityNote: '75–85% 1RM' },
  { id: 'barbell-row',           name: 'Barbell Row',            category: 'pull', defaultReps: '8',   intensityNote: 'Moderate–heavy' },
  { id: 'pull-ups',              name: 'Pull-ups',               category: 'pull', defaultReps: '8',   intensityNote: 'Bodyweight / weighted' },
  { id: 'lat-pulldown',          name: 'Lat Pulldown',           category: 'pull', defaultReps: '10',  intensityNote: 'Moderate' },
  { id: 'face-pull',             name: 'Face Pull',              category: 'pull', defaultReps: '15',  intensityNote: 'Light' },
  { id: 'db-row',                name: 'Dumbbell Row',           category: 'pull', defaultReps: '10',  intensityNote: 'Moderate' },
  { id: 'cable-row',             name: 'Cable Row',              category: 'pull', defaultReps: '10',  intensityNote: 'Moderate' },
  { id: 'barbell-shrug',         name: 'Barbell Shrug',          category: 'pull', defaultReps: '12',  intensityNote: 'Moderate' },

  /* ═══════════════ SQUAT ═══════════════ */
  { id: 'back-squat',            name: 'Back Squat',             category: 'squat', defaultReps: '5',  intensityNote: '70–85% 1RM' },
  { id: 'front-squat',           name: 'Front Squat',            category: 'squat', defaultReps: '5',  intensityNote: '65–80% 1RM' },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat',  category: 'squat', defaultReps: '10', intensityNote: 'Moderate' },
  { id: 'goblet-squat',          name: 'Goblet Squat',           category: 'squat', defaultReps: '12', intensityNote: 'Light–moderate' },
  { id: 'leg-press',             name: 'Leg Press',              category: 'squat', defaultReps: '10', intensityNote: 'Moderate–heavy' },
  { id: 'hack-squat',            name: 'Hack Squat',             category: 'squat', defaultReps: '10', intensityNote: 'Moderate' },

  /* ═══════════════ HINGE ═══════════════ */
  { id: 'romanian-deadlift',     name: 'Romanian Deadlift',      category: 'hinge', defaultReps: '8',  intensityNote: 'Moderate' },
  { id: 'good-morning',          name: 'Good Morning',           category: 'hinge', defaultReps: '8',  intensityNote: 'Light–moderate' },
  { id: 'hip-thrust',            name: 'Hip Thrust',             category: 'hinge', defaultReps: '10', intensityNote: 'Moderate–heavy' },
  { id: 'kb-swing',              name: 'Kettlebell Swing',       category: 'hinge', defaultReps: '15', intensityNote: 'Light' },
  { id: 'rdl-db',                name: 'DB RDL',                 category: 'hinge', defaultReps: '10', intensityNote: 'Moderate' },
  { id: 'nordic-curl',           name: 'Nordic Curl',            category: 'hinge', defaultReps: '8',  intensityNote: 'Bodyweight' },

  /* ═══════════════ CORE ═══════════════ */
  { id: 'plank',                 name: 'Plank',                  category: 'core', defaultReps: '30s',  intensityNote: 'Hold' },
  { id: 'hanging-leg-raise',     name: 'Hanging Leg Raise',      category: 'core', defaultReps: '10',  intensityNote: 'Bodyweight' },
  { id: 'cable-woodchop',        name: 'Cable Woodchop',         category: 'core', defaultReps: '12',  intensityNote: 'Moderate' },
  { id: 'ab-wheel',              name: 'Ab Wheel',               category: 'core', defaultReps: '12',  intensityNote: 'Moderate' },
  { id: 'dead-bug',              name: 'Dead Bug',               category: 'core', defaultReps: '10',  intensityNote: 'Light — tempo' },
  { id: 'pallof-press',          name: 'Pallof Press',           category: 'core', defaultReps: '12',  intensityNote: 'Light–moderate' },
  { id: 'russian-twist',         name: 'Russian Twist',          category: 'core', defaultReps: '15',  intensityNote: 'Light' },

  /* ═══════════════ CARRY ═══════════════ */
  { id: 'farmers-walk',          name: "Farmer's Walk",          category: 'carry', defaultReps: '30s', intensityNote: 'Heavy — 2 hands' },
  { id: 'suitcase-carry',        name: 'Suitcase Carry',         category: 'carry', defaultReps: '30s', intensityNote: 'Single side' },
  { id: 'overhead-carry',        name: 'Overhead Carry',         category: 'carry', defaultReps: '20s', intensityNote: 'Lockout' },
  { id: 'kb-bottoms-up-carry',   name: 'KB Bottoms-up Carry',   category: 'carry', defaultReps: '20s', intensityNote: 'Stability' },
]

/* ── Lookup helpers ───────────────────────────── */

export function getMovementById(id: string): ExerciseTemplate | undefined {
  return MOVEMENT_TEMPLATES.find((m) => m.id === id)
}

export function getMovementsByCategory(cat: string): ExerciseTemplate[] {
  return MOVEMENT_TEMPLATES.filter((m) => m.category === cat)
}
