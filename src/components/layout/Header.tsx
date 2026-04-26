import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { User, LogOut, Settings, FileText, Layers } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

export default function Header() {
  const { user, signOut, isAdmin, isTechnicalOfficer } = useAuth()
  const location = useLocation()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Sign out failed',
        description: error.message,
      })
    } else {
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      })
    }
  }

  const getRoleBadge = () => {
    if (isAdmin()) return <Badge variant="destructive" className="label-caps px-2 py-0">ADMIN</Badge>
    if (isTechnicalOfficer()) return <Badge variant="secondary" className="label-caps px-2 py-0 bg-secondary/10 text-secondary border-secondary/20">TECH_OFFICER</Badge>
    return <Badge variant="outline" className="label-caps px-2 py-0">VIEWER</Badge>
  }

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'TDS Records', path: '/tds' },
    { name: 'Customers', path: '/customers' },
    { name: 'Machines', path: '/machines' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b-0 rounded-none mb-6">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo & Title */}
        <Link to="/dashboard" className="flex items-center space-x-3 group">
          <div className="flex items-center justify-center w-10 h-10 rounded shadow-[0_0_15px_rgba(99,102,241,0.5)] bg-primary text-primary-foreground font-bold text-lg transition-transform group-hover:scale-105">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">Flexo<span className="text-primary">TDS</span> Pro</h1>
            <p className="label-caps text-muted-foreground">Industrial Specs</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-white/10 text-primary shadow-[inset_0_-2px_0_0_hsl(var(--primary))]" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <Link to="/tds/new">
            <Button variant="default" size="sm" className="hidden md:flex shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all">
              <FileText className="mr-2 h-4 w-4" />
              <span className="font-semibold tracking-wide">NEW TDS</span>
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center space-x-2 bg-transparent border-white/10 hover:bg-white/5 hover:text-primary transition-colors">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">{user?.fullName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-modal border-white/10">
              <div className="flex items-center justify-between p-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                {getRoleBadge()}
              </div>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-primary cursor-pointer">
                <Link to="/settings" className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={handleSignOut} className="focus:bg-destructive/20 focus:text-destructive cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}