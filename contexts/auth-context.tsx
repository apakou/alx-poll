"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

/**
 * Authentication Context Interface
 * 
 * Defines the shape of the authentication context that provides
 * user state, session management, and authentication methods.
 */
interface AuthContextType {
  /** Current authenticated user object from Supabase */
  user: User | null
  /** Current session object containing auth tokens */
  session: Session | null
  /** Loading state for initial authentication check */
  loading: boolean
  /** Sign out the current user */
  signOut: () => Promise<void>
  /** Sign in with email and password */
  signIn: (email: string, password: string) => Promise<{ error: any }>
  /** Sign up new user with email, password and full name */
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
}

/**
 * Authentication Context
 * 
 * React context for managing application-wide authentication state.
 * Provides centralized access to user session, loading states, and auth operations.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Authentication Provider Component
 * 
 * Wraps the application to provide authentication context to all child components.
 * Manages user session state, authentication loading states, and provides
 * methods for sign in, sign up, and sign out operations.
 * 
 * Features:
 * - Automatic session restoration on app load
 * - Real-time auth state change listening
 * - Centralized error handling for auth operations
 * - Session persistence across page refreshes
 * 
 * @param children - React components that need access to auth context
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Authentication state management
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    /**
     * Get Initial Session
     * 
     * Retrieves the current session on component mount to restore
     * authentication state from stored tokens (localStorage/cookies).
     */
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    /**
     * Auth State Change Listener
     * 
     * Subscribes to authentication state changes to keep the context
     * synchronized with Supabase auth events (login, logout, token refresh).
     * This ensures real-time updates across tabs and handles automatic
     * token refresh when sessions expire.
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    // Cleanup subscription on unmount to prevent memory leaks
    return () => subscription.unsubscribe()
  }, [supabase.auth])

  /**
   * Sign In Function
   * 
   * Authenticates a user with email and password credentials.
   * 
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise with error object if authentication fails
   */
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  /**
   * Sign Up Function
   * 
   * Creates a new user account with email, password, and profile data.
   * Sends email confirmation link for account verification.
   * 
   * @param email - New user's email address
   * @param password - New user's password (min 6 characters)
   * @param fullName - User's full name for profile metadata
   * @returns Promise with error object if registration fails
   */
  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName, // Store full name in user metadata
        },
      },
    })
    return { error }
  }

  /**
   * Sign Out Function
   * 
   * Logs out the current user and clears all session data.
   * Triggers auth state change that will update context state.
   */
  const signOut = async () => {
    await supabase.auth.signOut()
  }

  // Context value object containing all auth state and methods
  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * useAuth Hook
 * 
 * Custom hook for accessing authentication context from components.
 * Provides type-safe access to auth state and operations.
 * 
 * @throws Error if used outside of AuthProvider
 * @returns AuthContextType object with user, session, loading state, and auth methods
 * 
 * @example
 * ```tsx
 * const { user, loading, signIn, signOut } = useAuth()
 * 
 * if (loading) return <LoadingSpinner />
 * if (!user) return <LoginForm onSignIn={signIn} />
 * 
 * return <Dashboard user={user} onSignOut={signOut} />
 * ```
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
