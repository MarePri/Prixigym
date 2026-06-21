# Prixi V2

Fitness RPG — train, level up, become the character.

This is **Phase 1: Foundation**. No feature screens yet — just architecture,
theming, build config, and an auth scaffold to prove the pieces connect.

## Stack

- React 18 + Vite
- TypeScript (strict)
- Tailwind CSS (dark-first token system)
- Firebase Auth + Firestore
- PWA (vite-plugin-pwa)

## Folder structure

```
src/
  app/              App.tsx — top-level composition root
  components/
    ui/             Themed primitives (Button, Input, …)
    layout/         Structural shells (AppShell, …)
  features/
    auth/           Self-contained feature module
      components/   Feature-specific UI
      hooks/         useAuth, etc.
      services/      Firebase calls live here, not in components
      types.ts
  lib/              firebase.ts (SDK init), utils.ts
  providers/        React context providers (AuthProvider, …)
  styles/           globals.css — design tokens
  types/            Shared/global TypeScript types (env.d.ts)
  main.tsx
```

Future features (workouts, character/progression, gamification, AI coach)
each get their own folder under `src/features/` following the same
`components / hooks / services / types.ts` shape as `auth`. Nothing about
this structure is auth-specific — it's the template for every module to come.

## Theme system

Design tokens are CSS variables in `src/styles/globals.css`, wired into
Tailwind via `tailwind.config.ts`. Change a value once, it propagates
everywhere — no hunting through components for hardcoded hex codes.

- **Background**: near-black with a cold-violet undertone (`#0A0A0F`), not flat gray
- **Primary (volt)**: `#7C5CFC` — reserved for primary actions and active states
- **XP (amber)**: `#F2B705` — reserved exclusively for progression/level-up moments, so it stays meaningful instead of becoming decoration
- **Type**: Space Grotesk (display) / Inter (body) / JetBrains Mono (stats — XP, reps, weight, all numbers get tabular mono treatment via `.stat-figure`)

## Setup

```bash
npm install
cp .env.example .env.local   # fill in Firebase project values
npm run dev
```

You'll need a Firebase project with **Authentication → Email/Password**
enabled and a **Firestore database** created (rules/schema come in a later
phase — for now the SDK is initialized but nothing reads or writes yet).

## What's deliberately NOT here yet

- No workout tracking, character/XP logic, or gamification — that's the
  feature work for later phases
- No Firestore data model or security rules
- No routing beyond a single screen (react-router-dom is installed and ready
  for when there's more than one screen to route between)
- No real PWA icons (see `public/icons/README.txt`)

## Phase roadmap (proposed)

1. ✅ Foundation — architecture, theme, auth scaffold, PWA config
2. Firestore data model + security rules, real auth flow (sign-up, error states)
3. Character/progression feature (stats, leveling, XP)
4. Workout tracking feature (PPL split logging)
5. AI coach integration
6. Polish pass — animations, empty states, offline behavior
