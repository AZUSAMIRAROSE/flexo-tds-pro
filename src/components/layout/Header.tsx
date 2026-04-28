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
import { User, LogOut, Settings, Plus, Search } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { NotificationCenter } from './NotificationCenter'

export default function Header() {
  const { user, signOut, isAdmin, isTechnicalOfficer } = useAuth()
  const location = useLocation()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      toast({ variant: 'destructive', title: 'Sign out failed', description: error.message })
    } else {
      toast({ title: 'Signed out', description: 'You have been successfully signed out.' })
    }
  }

  const getRoleBadge = () => {
    if (isAdmin()) return <Badge variant="destructive" className="text-[10px] uppercase tracking-wider px-2 py-0">Admin</Badge>
    if (isTechnicalOfficer()) return <Badge variant="secondary" className="text-[10px] uppercase tracking-wider px-2 py-0 bg-secondary/10 text-secondary border-secondary/20">Tech Officer</Badge>
    return <Badge variant="outline" className="text-[10px] uppercase tracking-wider px-2 py-0">Viewer</Badge>
  }

  // Determine page title based on path
  const getPageTitle = () => {
    if (location.pathname.startsWith('/dashboard')) return 'Dashboard'
    if (location.pathname.startsWith('/tds')) return 'TDS Records'
    if (location.pathname.startsWith('/customers')) return 'Customers'
    if (location.pathname.startsWith('/machines')) return 'Machines'
    if (location.pathname.startsWith('/settings')) return 'Settings'
    return 'FlexoTDS Pro'
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-[#09090b]/80 backdrop-blur-md border-b border-white/5">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        {/* Page Title & Search */}
        <div className="flex items-center gap-6 flex-1">
          <h2 className="text-xl font-semibold text-foreground tracking-tight hidden sm:block">
            {getPageTitle()}
          </h2>
          
          <div className="relative max-w-md flex-1 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search records, customers, or machines..." 
              className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <NotificationCenter />

          <Link to="/tds/new" className="hidden sm:block">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] transition-all rounded-full px-4">
              <Plus className="mr-2 h-4 w-4" />
              New TDS
            </Button>
          </Link>

          <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block"></div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden ring-1 ring-white/10 hover:ring-white/30 transition-all">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-primary/5"></div>
                <User className="h-5 w-5 text-foreground/80 relative z-10" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-[#18181b] border-white/10 shadow-2xl rounded-xl p-2">
              <div className="flex items-center gap-3 p-2 mb-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-semibold text-foreground leading-none">{user?.fullName || 'User'}</p>
                  <p className="text-xs text-muted-foreground leading-none truncate max-w-[140px]">{user?.email}</p>
                </div>
              </div>
              <div className="px-2 pb-2">
                {getRoleBadge()}
              </div>
              <DropdownMenuSeparator className="bg-white/5 mb-1" />
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer focus:bg-white/5 focus:text-foreground">
                <Link to="/settings" className="w-full flex items-center py-2">
                  <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                  Account Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="rounded-lg cursor-pointer focus:bg-destructive/10 focus:text-destructive text-destructive py-2 mt-1">
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