import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

export async function signInWithEmail(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email, password)
}

export async function signUpWithEmail(email: string, password: string) {
  await createUserWithEmailAndPassword(auth, email, password)
}

export async function signOutUser() {
  await firebaseSignOut(auth)
}
