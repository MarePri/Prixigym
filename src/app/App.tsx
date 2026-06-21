import { AppShell } from '@/components/layout/AppShell'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { AuthProvider } from '@/providers/AuthProvider'

function AppContent() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return <p className="text-sm text-text-muted">Loading…</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl font-semibold text-text-primary">
          Foundation ready
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Architecture, theme, and auth scaffold are in place. Feature modules land in
          later phases.
        </p>
      </div>

      {user ? (
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-sm text-text-primary">Signed in as {user.email}</p>
          <button
            onClick={() => void signOut()}
            className="mt-3 text-sm font-medium text-primary"
          >
            Sign out
          </button>
        </div>
      ) : (
        <LoginForm />
      )}
    </div>
  )
}

export function App() {
  return (
    <AuthProvider>
      <AppShell>
        <AppContent />
      </AppShell>
    </AuthProvider>
  )
}
