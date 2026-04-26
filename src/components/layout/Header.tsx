import { Link } from 'react-router-dom'
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
import { User, LogOut, Settings, FileText } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

export default function Header() {
  const { user, signOut, isAdmin, isTechnicalOfficer } = useAuth()

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
    if (isAdmin()) return <Badge variant="destructive">Admin</Badge>
    if (isTechnicalOfficer()) return <Badge variant="secondary">TO</Badge>
    return <Badge variant="outline">Viewer</Badge>
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo & Title */}
        <Link to="/dashboard" className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            F
          </div>
          <div>
            <h1 className="text-xl font-bold text-primary">Flexo TDS Pro</h1>
            <p className="text-xs text-muted-foreground">Technical Data Sheets</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            to="/dashboard"
            className="transition-colors hover:text-primary text-foreground/60"
          >
            Dashboard
          </Link>
          <Link
            to="/tds"
            className="transition-colors hover:text-primary text-foreground/60"
          >
            TDS Records
          </Link>
          <Link
            to="/customers"
            className="transition-colors hover:text-primary text-foreground/60"
          >
            Customers
          </Link>
          <Link
            to="/machines"
            className="transition-colors hover:text-primary text-foreground/60"
          >
            Machines
          </Link>
        </nav>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <Link to="/tds/new">
            <Button variant="default" size="sm" className="hidden md:flex">
              <FileText className="mr-2 h-4 w-4" />
              New TDS
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">{user?.fullName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-between p-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                {getRoleBadge()}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
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