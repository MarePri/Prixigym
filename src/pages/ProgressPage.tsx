import { TelemetryCard } from '@/components/ui/TelemetryCard'

export function ProgressPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-text-muted">Progress</p>
        <h1 className="font-display text-2xl font-semibold text-text-primary">
          Trend overview
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TelemetryCard label="Strength" value={64} unit="/ 100" accent="primary" trend="flat" />
        <TelemetryCard label="Bodyweight" value={78.4} unit="kg" accent="neutral" trend="down" />
      </div>

      <div className="rounded-card border border-dashed border-border bg-surface px-6 py-10 text-center">
        <p className="text-sm text-text-muted">
          Charts and historical trends arrive once real progress data is wired in.
        </p>
      </div>
    </div>
  )
}
