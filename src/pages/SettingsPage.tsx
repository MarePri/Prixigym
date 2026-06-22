import { ChevronRight } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'

const placeholderRows = ['Notifications', 'Units', 'About']

export function SettingsPage() {
  const { user, signOut } = useAuth()

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm text-text-muted">Settings</p>
        <h1 className="font-display text-2xl font-semibold text-text-primary">Account</h1>
      </div>

      <div className="rounded-card border border-border bg-surface px-4 py-3">
        <p className="text-sm text-text-primary">{user?.email ?? 'Not signed in'}</p>
      </div>

      <ul className="overflow-hidden rounded-card border border-border bg-surface">
        {placeholderRows.map((row, i) => (
          <li
            key={row}
            className={i > 0 ? 'border-t border-border' : undefined}
          >
            <button
              type="button"
              disabled
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-text-muted"
            >
              {row}
              <ChevronRight className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      {user && (
        <button
          onClick={() => void signOut()}
          className="self-start text-sm font-medium text-danger"
        >
          Sign out
        </button>
      )}
    </div>
  )
}
