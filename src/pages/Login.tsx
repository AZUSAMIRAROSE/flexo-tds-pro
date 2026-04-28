import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  if (user) {
    navigate('/dashboard')
  }

  const handleSubmit = async (e: FormEvent) => {
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
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="label-caps text-muted-foreground">Operator Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="operator@siegwerk.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
              className="bg-black/50 border-white/10 focus:border-primary/50 transition-colors text-foreground h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="label-caps text-muted-foreground">Security Phrase</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="bg-black/50 border-white/10 focus:border-primary/50 transition-colors text-foreground h-12"
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
        </form>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-white/5 space-y-6">
          <a
            href="#"
            className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest font-mono"
            onClick={(e) => {
              e.preventDefault()
              toast({
                title: 'Contact Administrator',
                description: 'Please contact your system administrator to reset your password.',
              })
            }}
          >
            Request Access Reset
          </a>
          
          <div className="text-center text-[10px] text-muted-foreground/50 uppercase tracking-widest font-mono space-y-1">
            <p>Flexo TDS Pro v1.0.0</p>
            <p>System by Irshad Ansari // Pusa Institute of Technology</p>
          </div>
        </div>
      </div>
    </div>
  )
}