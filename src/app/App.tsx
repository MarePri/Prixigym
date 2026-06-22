import { AnimatePresence } from 'framer-motion'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { PageTransition } from '@/components/layout/PageTransition'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { AuthProvider } from '@/providers/AuthProvider'
import { DashboardPage } from '@/pages/DashboardPage'
import { ProgressPage } from '@/pages/ProgressPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { TrainingPage } from '@/pages/TrainingPage'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <DashboardPage />
            </PageTransition>
          }
        />
        <Route
          path="/training"
          element={
            <PageTransition>
              <TrainingPage />
            </PageTransition>
          }
        />
        <Route
          path="/progress"
          element={
            <PageTransition>
              <ProgressPage />
            </PageTransition>
          }
        />
        <Route
          path="/settings"
          element={
            <PageTransition>
              <SettingsPage />
            </PageTransition>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-text-muted">Loading…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-background px-4">
        <h1 className="mb-6 font-display text-xl font-semibold text-text-primary">
          Sign in to PRIXI
        </h1>
        <LoginForm />
      </div>
    )
  }

  return (
    <AppShell>
      <AnimatedRoutes />
    </AppShell>
  )
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  )
}
