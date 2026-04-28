import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { UserRoleType } from '@/types/tds.types'
import { Loader2, ShieldAlert } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  /** If set, only users with one of these roles can access */
  allowedRoles?: UserRoleType[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase">
            Initializing Session...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Role-based access check
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = user.roles || []
    const hasAccess = allowedRoles.some(role => userRoles.includes(role))
    
    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
          <div className="text-center space-y-4 glass-panel p-10 border-white/10 max-w-md mx-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 mx-auto">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold tracking-widest text-foreground uppercase">
              Access Denied
            </h2>
            <p className="text-sm text-muted-foreground">
              You do not have the required permissions to access this page.
              <br />
              Required role: <strong>{allowedRoles.join(' or ')}</strong>
            </p>
            <p className="text-xs text-muted-foreground/60">
              Contact your system administrator to request access.
            </p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}