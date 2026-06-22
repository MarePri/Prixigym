import type { ReactNode } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center border-b border-border px-4">
        <span className="font-display text-base font-semibold text-text-primary">PRIXI</span>
      </header>
      <main className="flex-1 overflow-y-auto px-4 py-6">{children}</main>
      <BottomNav />
    </div>
  )
}
