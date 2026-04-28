import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Loader2, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react'

type PageState = 'loading' | 'expired' | 'form' | 'success'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { updatePassword } = useAuth()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageState, setPageState] = useState<PageState>('loading')

  // Validate that we have a valid recovery session from the email link
  useEffect(() => {
    const checkSession = async () => {
      // Supabase automatically processes the URL hash fragment (#access_token=...)
      // from the reset email link and sets the session. We just check for it.
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        // No session = expired or invalid token
        setPageState('expired')
      } else {
        setPageState('form')
      }
    }

    // Small delay to allow Supabase to process the URL hash
    const timer = setTimeout(checkSession, 500)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Password mismatch',
        description: 'Passwords do not match.',
      })
      return
    }

    if (password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Weak password',
        description: 'Password must be at least 6 characters.',
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await updatePassword(password)

      if (error) {
        // Handle specific expired-token error
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          setPageState('expired')
        } else {
          toast({
            variant: 'destructive',
            title: 'Reset failed',
            description: error.message,
          })
        }
      } else {
        setPageState('success')
        toast({
          title: 'Password updated!',
          description: 'Your password has been successfully changed.',
        })
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred.',
      })
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "bg-black/50 border-white/10 focus:border-primary/50 transition-colors text-foreground h-12"

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#09090b]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px] pointer-events-none"></div>

      <div className="w-full max-w-md p-8 md:p-10 space-y-8 glass-panel border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 mx-4">
        
        {/* LOADING — waiting for session validation */}
        {pageState === 'loading' && (
          <div className="text-center space-y-4 py-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground font-mono tracking-widest uppercase">
              Validating reset link...
            </p>
          </div>
        )}

        {/* EXPIRED / INVALID TOKEN */}
        {pageState === 'expired' && (
          <div className="text-center space-y-4 py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 mx-auto">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-lg font-bold tracking-widest text-foreground uppercase">
              Link Expired
            </h2>
            <p className="text-sm text-muted-foreground">
              This password reset link has expired or is invalid.
              <br />
              Please request a new reset link from the login page.
            </p>
            <Button
              onClick={() => navigate('/login')}
              className="mt-4 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
            >
              Back to Login
            </Button>
          </div>
        )}

        {/* SUCCESS */}
        {pageState === 'success' && (
          <div className="text-center space-y-4 py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mx-auto">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold tracking-widest text-foreground uppercase">
              Password Updated
            </h2>
            <p className="text-sm text-muted-foreground">
              Your password has been successfully changed. You can now sign in with your new credentials.
            </p>
            <Button
              onClick={() => navigate('/login')}
              className="mt-4 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
            >
              Go to Login
            </Button>
          </div>
        )}

        {/* FORM — valid session, show password inputs */}
        {pageState === 'form' && (
          <>
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/[0.05] border border-white/10 mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-black tracking-widest text-foreground uppercase">
                Set New Password
              </h1>
              <p className="text-xs text-muted-foreground tracking-widest uppercase font-mono">
                Flexo TDS Pro — Security Reset
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="label-caps text-muted-foreground">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  autoFocus
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="label-caps text-muted-foreground">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className={inputClass}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-md tracking-wider font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    UPDATING...
                  </>
                ) : (
                  'UPDATE PASSWORD'
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
