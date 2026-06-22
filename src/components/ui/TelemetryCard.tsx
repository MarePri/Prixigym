import type { ReactNode } from 'react'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

type Trend = 'up' | 'down' | 'flat'

interface TelemetryCardProps {
  label: string
  value: ReactNode
  unit?: string
  trend?: Trend
  accent?: 'primary' | 'xp' | 'neutral'
  footnote?: string
  className?: string
}

const accentBar: Record<NonNullable<TelemetryCardProps['accent']>, string> = {
  primary: 'bg-primary',
  xp: 'bg-xp',
  neutral: 'bg-border',
}

const trendIcon: Record<Trend, typeof TrendingUp> = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
}

const trendColor: Record<Trend, string> = {
  up: 'text-xp',
  down: 'text-danger',
  flat: 'text-text-muted',
}

/**
 * Styled after car telemetry readouts: a clipped label, one dominant
 * tabular-mono number, and a quiet trend delta — nothing competes with
 * the figure for attention.
 */
export function TelemetryCard({
  label,
  value,
  unit,
  trend,
  accent = 'primary',
  footnote,
  className,
}: TelemetryCardProps) {
  const TrendIcon = trend ? trendIcon[trend] : null

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-card border border-border bg-surface pl-4 pr-4 py-4',
        className,
      )}
    >
      <span className={cn('absolute inset-y-0 left-0 w-1', accentBar[accent])} aria-hidden />
      <div className="flex items-center justify-between">
        <span className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-text-muted">
          {label}
        </span>
        {TrendIcon && trend && (
          <TrendIcon className={cn('h-3.5 w-3.5', trendColor[trend])} strokeWidth={2.5} />
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="stat-figure text-3xl font-semibold leading-none text-text-primary">
          {value}
        </span>
        {unit && <span className="stat-figure text-sm text-text-muted">{unit}</span>}
      </div>
      {footnote && <p className="mt-1.5 text-xs text-text-muted">{footnote}</p>}
    </div>
  )
}
