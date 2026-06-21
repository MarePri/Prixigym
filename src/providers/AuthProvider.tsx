import { createContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { signInWithEmail, signOutUser, signUpWithEmail } from '@/features/auth/services/authService'
import type { AuthContextValue, AuthUser } from '@/features/auth/types'

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(
        firebaseUser
          ? {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
            }
          : null,
      )
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value: AuthContextValue = {
    user,
    loading,
    signIn: signInWithEmail,
    signUp: signUpWithEmail,
    signOut: signOutUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
