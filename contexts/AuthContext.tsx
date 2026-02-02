'use client'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  query,
  where,
  collection,
  getDocs,
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import bcrypt from 'bcryptjs'

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type UserType = {
  id: string
  uid?: string
  email: string
  displayName?: string | null
}

type ProfileType = {
  id: string
  email: string
  full_name?: string
  phone?: string
  avatar_url?: string
  role: 'customer' | 'agent' | 'admin'
  user_type?: string
  status?: string
  location?: string
  bio?: string
  preferences?: any
  created_at?: any
  updated_at?: any
}

type AuthContextType = {
  user: UserType | null
  profile: ProfileType | null
  loading: boolean
  signUp: (
    email: string,
    password: string,
    userData?: Partial<ProfileType>,
  ) => Promise<any>
  signIn: (email: string, password: string, role?: string) => Promise<any>
  signInAsAgent: (email: string, password: string) => Promise<any>
  signInAsAdmin: (email: string, password: string) => Promise<any>
  refreshProfile: () => Promise<void>
  logout: () => Promise<void>
  signOut: () => Promise<void>
}
/* -------------------------------------------------------------------------- */

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

/* -------------------------------------------------------------------------- */
/*                              AUTH PROVIDER                                 */
/* -------------------------------------------------------------------------- */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null)
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [loading, setLoading] = useState(true)

  /* ------------------------------------------------------------------------ */
  /*                    🔥 FIREBASE SESSION LISTENER 🔥                        */
  /* --------- PERSISTENT LOGIN: SAVED TO LOCALSTORAGE --------- */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null)
          setProfile(null)
          // Clear localStorage when user logs out
          if (typeof window !== 'undefined') {
            localStorage.removeItem('userSession')
          }
          setLoading(false)
          return
        }

        // First try to find user in Firestore by email (for manually added users)
        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('email', '==', firebaseUser.email))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0]
          const userData = userDoc.data()
          
          const userData_obj = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName,
          }

          const profileData_obj = {
            id: firebaseUser.uid,
            ...userData,
          } as ProfileType

          setUser(userData_obj)
          setProfile(profileData_obj)

          // Save to localStorage for persistence
          if (typeof window !== 'undefined') {
            localStorage.setItem('userSession', JSON.stringify({
              user: userData_obj,
              profile: profileData_obj,
              timestamp: new Date().toISOString()
            }))
          }
        }

        setLoading(false)
      } catch (error) {
        console.error('Error in onAuthStateChanged:', error)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  // Restore session from localStorage on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSession = localStorage.getItem('userSession')
      if (savedSession) {
        try {
          const { user: savedUser, profile: savedProfile } = JSON.parse(savedSession)
          setUser(savedUser)
          setProfile(savedProfile)
        } catch (error) {
          console.error('Error restoring session:', error)
          localStorage.removeItem('userSession')
        }
      }
      setLoading(false)
    }
  }, [])

  /* ------------------------------------------------------------------------ */
  /*                           CHECK MANUALLY ADDED USER                      */
  /* ------------------------------------------------------------------------ */

  const checkManuallyAddedUser = async (email: string, password: string) => {
    try {
      // Find user in Firestore by email
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('email', '==', email))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return null // User not found in Firestore
      }

      const userDoc = querySnapshot.docs[0]
      const userData = userDoc.data()

      // Check if user has password stored (manually added user)
      if (!userData.password) {
        return null // Not a manually added user
      }

      // IMPORTANT: In production, use proper password hashing!
      // For now, using simple comparison (you should implement bcrypt)
      if (userData.password !== password) {
        return { error: { message: 'Invalid password' } }
      }

      // Check role
      if (!userData.role) {
        return { error: { message: 'User role not defined' } }
      }

      return {
        user: {
          id: userDoc.id,
          email: userData.email,
          role: userData.role,
          ...userData
        },
        isManuallyAdded: true
      }
    } catch (error) {
      console.error('Error checking manually added user:', error)
      return null
    }
  }

  /* ------------------------------------------------------------------------ */
  /*                               SIGN UP                                    */
  /* ------------------------------------------------------------------------ */

  const signUp = async (
    email: string,
    password: string,
    userData?: Partial<ProfileType>
  ) => {
    setLoading(true)
    try {
      // First check if user already exists in Firestore (manually added)
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('email', '==', email))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const existingUser = querySnapshot.docs[0].data()
        if (existingUser.password) {
          return { error: { message: 'User already exists. Please login instead.' } }
        }
      }

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      const profileData: ProfileType = {
        id: firebaseUser.uid,
        email,
        role: userData?.role || 'customer',
        full_name: userData?.full_name || '',
        phone: userData?.phone || '',
        avatar_url: userData?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      }

      await setDoc(doc(db, 'users', firebaseUser.uid), profileData)

      return { error: null }
    } catch (error: any) {
      return { error: { message: error.message } }
    } finally {
      setLoading(false)
    }
  }

  /* ------------------------------------------------------------------------ */
  /*                         SIGN IN (GENERIC)                                */
  /* ------------------------------------------------------------------------ */

  const signIn = async (email: string, password: string, role?: string) => {
    setLoading(true)
    try {
      // First check if it's a manually added user
      const manualUser = await checkManuallyAddedUser(email, password)
      
      if (manualUser?.user) {
        // Manually added user found and password matches
        if (role && manualUser.user.role !== role) {
          return { 
            error: { 
              message: `Access denied. ${role.charAt(0).toUpperCase() + role.slice(1)} only.` 
            } 
          }
        }

        // For manually added users, we need to create Firebase Auth user
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password)
          const firebaseUser = userCredential.user

          // Update Firestore with Firebase UID
          const usersRef = collection(db, 'users')
          const q = query(usersRef, where('email', '==', email))
          const querySnapshot = await getDocs(q)
          
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0]
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              ...manualUser.user,
              id: firebaseUser.uid,
              password: null, // Remove password after linking with Firebase Auth
              updated_at: serverTimestamp(),
            }, { merge: true })
            
            // Delete old document
            await setDoc(userDoc.ref, { 
              migrated: true 
            }, { merge: true })
          }

          return { error: null }
        } catch (firebaseError: any) {
          // If Firebase Auth user already exists, just sign in
          if (firebaseError.code === 'auth/email-already-in-use') {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            return { error: null }
          }
          throw firebaseError
        }
      }

      // Regular Firebase Auth user
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Check role in Firestore
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('email', '==', email))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data()
        
        if (role && userData.role !== role) {
          await signOut(auth)
          return { 
            error: { 
              message: `Access denied. ${role.charAt(0).toUpperCase() + role.slice(1)} only.` 
            } 
          }
        }
      }

      return { error: null }
    } catch (error: any) {
      console.error('Sign in error:', error)
      return { 
        error: { 
          message: error.code === 'auth/invalid-credential' 
            ? 'Invalid email or password' 
            : error.message || 'Login failed' 
        } 
      }
    } finally {
      setLoading(false)
    }
  }

  /* ------------------------------------------------------------------------ */
  /*                              SIGN IN (AGENT)                             */
  /* ------------------------------------------------------------------------ */

  const signInAsAgent = async (email: string, password: string) => {
    return await signIn(email, password, 'agent')
  }

  /* ------------------------------------------------------------------------ */
  /*                              SIGN IN (ADMIN)                             */
  /* ------------------------------------------------------------------------ */

  const signInAsAdmin = async (email: string, password: string) => {
    return await signIn(email, password, 'admin')
  }

  /* ---------------------------------------------------------------------- */
  /*                              REFRESH PROFILE                           */
  /* ---------------------------------------------------------------------- */

  const refreshProfile = async () => {
    const currentUser = auth.currentUser
    if (!currentUser) return

    const profileRef = doc(db, 'users', currentUser.uid)
    const snapshot = await getDoc(profileRef)

    if (snapshot.exists()) {
      const data = snapshot.data()

      setUser({
        id: currentUser.uid,
        uid: currentUser.uid,
        email: currentUser.email || data.email,
        displayName: currentUser.displayName,
      })

      setProfile({
        id: currentUser.uid,
        ...data,
      } as ProfileType)
    }
  }

  /* ------------------------------------------------------------------------ */
  /*                                  LOGOUT                                  */
  /* --------- CLEARS AUTH SESSION AND LOCALSTORAGE --------- */
  /* ------------------------------------------------------------------------ */

  const logout = async () => {
    await signOut(auth)
    setUser(null)
    setProfile(null)
    // Clear localStorage when user explicitly logs out
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userSession')
    }
  }

  /* ------------------------------------------------------------------------ */

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signInAsAgent,
        signInAsAdmin,
        refreshProfile,
        logout,
        signOut: logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}