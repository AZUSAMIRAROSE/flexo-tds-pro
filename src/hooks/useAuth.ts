import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { UserRoleType } from '@/types/tds.types'

export interface AuthUser extends User {
  roles?: UserRoleType[]
  fullName?: string
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

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

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchUserWithRoles(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserWithRoles = async (authUser: User) => {
    try {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUser.id)

      const userRoles = roles?.map(r => r.role as UserRoleType) || []
      
      setUser({
        ...authUser,
        roles: userRoles,
        fullName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
      })
    } catch (error) {
      console.error('Error fetching user roles:', error)
      setUser(authUser as AuthUser)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
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
    signOut,
    hasRole,
    isAdmin,
    isTechnicalOfficer,
    isViewer,
  }
}