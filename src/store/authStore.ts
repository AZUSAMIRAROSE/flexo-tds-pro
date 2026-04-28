import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import type { UserRoleType } from '@/types/tds.types'

export interface AuthUser extends User {
  roles?: UserRoleType[]
  fullName?: string
}

interface AuthState {
  user: AuthUser | null
  session: Session | null
  isLoading: boolean
  setUser: (user: AuthUser | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

function sameRoles(a?: UserRoleType[], b?: UserRoleType[]) {
  if (a === b) return true
  if (!a || !b || a.length !== b.length) return false
  return a.every((role, index) => role === b[index])
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,
      setUser: (user) =>
        set((state) => {
          if (
            state.user?.id === user?.id &&
            state.user?.email === user?.email &&
            state.user?.fullName === user?.fullName &&
            sameRoles(state.user?.roles, user?.roles) &&
            state.isLoading === false
          ) {
            return state
          }

          return { user, isLoading: false }
        }),
      setSession: (session) =>
        set((state) => {
          if (state.session?.access_token === session?.access_token) {
            return state
          }

          return { session }
        }),
      setLoading: (isLoading) =>
        set((state) => (state.isLoading === isLoading ? state : { isLoading })),
      reset: () =>
        set((state) => {
          if (!state.user && !state.session && state.isLoading === false) {
            return state
          }

          return { user: null, session: null, isLoading: false }
        }),
    }),
    {
      name: 'flexo-auth-storage',
      // Only persist the user and session, not the loading state
      partialize: (state) => ({ 
        user: state.user, 
        session: state.session 
      }),
    }
  )
)
