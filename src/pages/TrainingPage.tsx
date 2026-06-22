import { Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { mockNextSession } from '@/mock/dashboardMock'

export function TrainingPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-text-muted">Training</p>
        <h1 className="font-display text-2xl font-semibold text-text-primary">
          {mockNextSession.split}
        </h1>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border bg-surface px-6 py-12 text-center">
        <Dumbbell className="h-8 w-8 text-text-muted" strokeWidth={1.5} />
        <p className="text-sm text-text-muted">
          Session logging lands in a later phase. For now this is the shell —
          {mockNextSession.exerciseCount} exercises are queued for today's split.
        </p>
        <Button variant="ghost" disabled className="mt-1">
          Log session (coming soon)
        </Button>
      </div>
    </div>
  )
}
