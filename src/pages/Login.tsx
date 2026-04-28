import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Loader2, ArrowLeft, CheckCircle2, Mail } from 'lucide-react'

type AuthView = 'login' | 'signup' | 'forgot'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, signUp, resetPassword, user } = useAuth()
  
  const [view, setView] = useState<AuthView>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const resetFields = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setFullName('')
    setResetSent(false)
  }

  const switchView = (newView: AuthView) => {
    resetFields()
    setView(newView)
  }

  // ─── LOGIN ───────────────────────────────────────────────────
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Sign in failed',
          description: error.message,
        })
      } else {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        })
        navigate('/dashboard')
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  // ─── SIGNUP ──────────────────────────────────────────────────
  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Password mismatch',
        description: 'Passwords do not match. Please re-enter.',
      })
      return
    }
    
    if (password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Weak password',
        description: 'Password must be at least 6 characters long.',
      })
      return
    }

    if (!fullName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Name required',
        description: 'Please enter your full name.',
      })
      return
    }

    setLoading(true)

    try {
      const { error } = await signUp(email, password, fullName.trim())
      
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Sign up failed',
          description: error.message,
        })
      } else {
        toast({
          title: 'Account created!',
          description: 'Check your email for a confirmation link, then sign in.',
        })
        switchView('login')
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  // ─── FORGOT PASSWORD ────────────────────────────────────────
  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await resetPassword(email)
      
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Reset failed',
          description: error.message,
        })
      } else {
        setResetSent(true)
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  // ─── SHARED STYLES ──────────────────────────────────────────
  const inputClass = "bg-black/50 border-white/10 focus:border-primary/50 transition-colors text-foreground h-12"

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#09090b]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[128px] pointer-events-none"></div>
      
      <div className="w-full max-w-md p-8 md:p-10 space-y-8 glass-panel border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 mx-4">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/[0.05] border border-white/10 mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-3xl font-black tracking-widest text-foreground uppercase">Flexo <span className="text-primary">TDS</span> Pro</h1>
          <p className="text-sm tracking-widest text-muted-foreground uppercase font-mono">
            Industrial Data Systems
          </p>
        </div>

        {/* ─── LOGIN FORM ──────────────────────────────────── */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="label-caps text-muted-foreground">Operator Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="operator@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password" className="label-caps text-muted-foreground">Security Phrase</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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
                  AUTHENTICATING...
                </>
              ) : (
                'INITIALIZE SESSION'
              )}
            </Button>

            <div className="text-center pt-4 border-t border-white/5 space-y-4">
              <button
                type="button"
                onClick={() => switchView('forgot')}
                className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest font-mono block w-full"
              >
                Forgot Password?
              </button>
              <button
                type="button"
                onClick={() => switchView('signup')}
                className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest font-mono block w-full"
              >
                Create New Account →
              </button>
            </div>
          </form>
        )}

        {/* ─── SIGNUP FORM ─────────────────────────────────── */}
        {view === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-5">
            <button
              type="button"
              onClick={() => switchView('login')}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest font-mono"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Login
            </button>

            <h2 className="text-lg font-bold tracking-widest text-foreground uppercase text-center">
              Create Account
            </h2>

            <div className="space-y-2">
              <Label htmlFor="signup-name" className="label-caps text-muted-foreground">Full Name</Label>
              <Input
                id="signup-name"
                type="text"
                placeholder="Irshad Ansari"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoFocus
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email" className="label-caps text-muted-foreground">Email Address</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="operator@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password" className="label-caps text-muted-foreground">Password</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-confirm" className="label-caps text-muted-foreground">Confirm Password</Label>
              <Input
                id="signup-confirm"
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
                  CREATING ACCOUNT...
                </>
              ) : (
                'REGISTER OPERATOR'
              )}
            </Button>

            <p className="text-[10px] text-center text-muted-foreground/60 font-mono uppercase tracking-wider">
              New accounts are assigned the default "Technical Officer" role.
              <br />An admin can modify your permissions after signup.
            </p>
          </form>
        )}

        {/* ─── FORGOT PASSWORD ─────────────────────────────── */}
        {view === 'forgot' && (
          <div className="space-y-5">
            <button
              type="button"
              onClick={() => switchView('login')}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest font-mono"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to Login
            </button>

            {resetSent ? (
              <div className="text-center space-y-4 py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <h2 className="text-lg font-bold tracking-widest text-foreground uppercase">
                  Reset Link Sent
                </h2>
                <p className="text-sm text-muted-foreground">
                  We've sent a password reset link to <strong className="text-foreground">{email}</strong>.
                  Check your inbox and follow the instructions.
                </p>
                <Button
                  variant="outline"
                  onClick={() => switchView('login')}
                  className="mt-4"
                >
                  Return to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20 mx-auto">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold tracking-widest text-foreground uppercase">
                    Reset Password
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Enter your email and we'll send you a reset link.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="label-caps text-muted-foreground">Email Address</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="operator@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
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
                      SENDING...
                    </>
                  ) : (
                    'SEND RESET LINK'
                  )}
                </Button>
              </form>
            )}
          </div>
        )}

        {/* Version Footer */}
        <div className="text-center text-[10px] text-muted-foreground/50 uppercase tracking-widest font-mono space-y-1 pt-4 border-t border-white/5">
          <p>FlexoTDS Pro v1.0.0</p>
          <p>System by Irshad Ansari // Pusa Institute of Technology</p>
        </div>
      </div>
    </div>
  )
}
