import { useNavigate } from 'react-router-dom'
import { Flame } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TelemetryCard } from '@/components/ui/TelemetryCard'
import {
  mockNextSession,
  mockRecovery,
  mockStrength,
  mockStreak,
} from '@/mock/dashboardMock'

export function DashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-text-muted">Today</p>
        <h1 className="font-display text-2xl font-semibold text-text-primary">
          Ready to train?
        </h1>
      </div>

      <TelemetryCard
        label="Current streak"
        value={mockStreak.currentStreak}
        unit="days"
        accent="xp"
        trend="up"
        footnote={`Longest: ${mockStreak.longestStreak} days`}
      />

      <button
        type="button"
        onClick={() => navigate('/training')}
        className="group relative flex items-center justify-between overflow-hidden rounded-card border border-primary/40 bg-primary px-5 py-4 text-left shadow-glow transition-transform active:scale-[0.98]"
      >
        <div>
          <p className="font-display text-lg font-bold tracking-wide text-white">
            TRAIN TODAY
          </p>
          <p className="mt-0.5 text-sm text-white/80">
            {mockNextSession.split} · {mockNextSession.exerciseCount} exercises
          </p>
        </div>
        <Flame className="h-8 w-8 text-white/90" strokeWidth={2} />
      </button>

      <div className="grid grid-cols-2 gap-3">
        <TelemetryCard
          label="Recovery"
          value={mockRecovery.recoveryScore}
          unit="/ 100"
          accent="primary"
          trend={mockRecovery.trend}
          footnote="Fatigue-based readiness"
        />
        <TelemetryCard
          label="Strength"
          value={mockStrength.strengthScore}
          unit="/ 100"
          accent="neutral"
          trend={mockStrength.trend}
          footnote="Placeholder"
        />
      </div>

      <Button variant="ghost" className="mt-1">
        View full readiness breakdown
      </Button>
    </div>
  )
}
