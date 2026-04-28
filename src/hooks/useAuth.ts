import { useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { UserRoleType } from '@/types/tds.types'
import { useAuthStore, type AuthUser } from '@/store/authStore'

let authInitPromise: Promise<void> | null = null
let authSubscription: { unsubscribe: () => void } | null = null

function toAuthUser(authUser: User, roles: UserRoleType[] = []): AuthUser {
  return {
    ...authUser,
    roles,
    fullName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
  }
}

async function fetchUserWithRoles(authUser: User) {
  try {
    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authUser.id)

    if (error) throw error

    const userRoles = (roles ?? []).map((r: { role: string }) => r.role as UserRoleType)
    useAuthStore.getState().setUser(toAuthUser(authUser, userRoles))
  } catch (error) {
    console.error('Error fetching user roles:', error)
    useAuthStore.getState().setUser(toAuthUser(authUser))
  } finally {
    useAuthStore.getState().setLoading(false)
  }
}

function initializeAuth() {
  if (authInitPromise) return authInitPromise

  authInitPromise = (async () => {
    if (!authSubscription) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, currentSession) => {
        const store = useAuthStore.getState()
        store.setSession(currentSession)

        if (currentSession?.user) {
          void fetchUserWithRoles(currentSession.user)
        } else {
          store.reset()
        }
      })

      authSubscription = subscription
    }

    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession()

    useAuthStore.getState().setSession(currentSession)

    if (currentSession?.user) {
      await fetchUserWithRoles(currentSession.user)
    } else {
      useAuthStore.getState().setLoading(false)
    }
  })().catch((error) => {
    console.error('Error initializing auth:', error)
    useAuthStore.getState().reset()
    authInitPromise = null
  })

  return authInitPromise
}

export function useAuth() {
  const { user, session, isLoading: loading, setLoading, reset } = useAuthStore()

  useEffect(() => {
    void initializeAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) setLoading(false)
    return { data, error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    if (error || !data.session) setLoading(false)
    return { data, error }
  }

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
  }

  const updatePassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      reset()
    }
    return { error }
  }

  const refreshRoles = async () => {
    const currentSession = useAuthStore.getState().session
    if (currentSession?.user) {
      await fetchUserWithRoles(currentSession.user)
    }
  }

  const hasRole = (role: UserRoleType): boolean => {
    return user?.roles?.includes(role) || false
  }

  const isAdmin = (): boolean => hasRole('Admin')
  const isTechnicalOfficer = (): boolean => hasRole('Technical Officer')
  const isViewer = (): boolean => hasRole('Viewer')

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshRoles,
    hasRole,
    isAdmin,
    isTechnicalOfficer,
    isViewer,
  }
}
