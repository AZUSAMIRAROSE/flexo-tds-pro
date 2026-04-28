import { useEffect, useState, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { UserRoleType } from '@/types/tds.types'

export interface AuthUser extends User {
  roles?: UserRoleType[]
  fullName?: string
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserWithRoles = useCallback(async (authUser: User) => {
    try {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUser.id);

      const userRoles = (roles ?? []).map((r: { role: string }) => r.role as UserRoleType);
      
      setUser({
        ...authUser,
        roles: userRoles,
        fullName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
      });
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setUser({
        ...authUser,
        roles: [],
        fullName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
      });
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchUserWithRoles(session.user)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes (login, logout, token refresh, password recovery)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (session?.user) {
        fetchUserWithRoles(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchUserWithRoles])

  // ─── Auth Actions ────────────────────────────────────────────

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
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
      setUser(null)
      setSession(null)
    }
    return { error }
  }

  const refreshRoles = async () => {
    if (user) {
      await fetchUserWithRoles(user)
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