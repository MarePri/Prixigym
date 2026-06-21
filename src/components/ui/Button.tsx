import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'h-11 rounded-card px-5 font-display text-sm font-semibold tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-primary text-white hover:bg-primary-hover shadow-glow',
        variant === 'ghost' &&
          'border border-border bg-transparent text-text-primary hover:border-primary',
        className,
      )}
      {...props}
    />
  )
}
