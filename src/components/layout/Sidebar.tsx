import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, Users, Settings as SettingsIcon, Server, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

export default function Sidebar() {
  const location = useLocation()
  const { isAdmin } = useAuth()

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'TDS Records', path: '/tds', icon: FileText },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Machines', path: '/machines', icon: Server },
    ...(isAdmin() ? [{ name: 'Settings', path: '/settings', icon: SettingsIcon }] : []),
  ]

  return (
    <aside className="w-64 border-r border-white/5 bg-[#09090b]/95 backdrop-blur-xl h-screen sticky top-0 flex flex-col z-40 hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <Link to="/dashboard" className="flex items-center space-x-3 group">
          <div className="flex items-center justify-center w-8 h-8 rounded shadow-[0_0_15px_rgba(99,102,241,0.5)] bg-primary text-primary-foreground transition-transform group-hover:scale-105">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">Flexo<span className="text-primary">TDS</span> Pro</h1>
          </div>
        </Link>
      </div>

      <div className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto">
        <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-primary/10 text-primary shadow-sm" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              {item.name}
            </Link>
          )
        })}
      </div>
      
      <div className="p-4 border-t border-white/5">
        <div className="glass-panel p-4 rounded-xl text-xs relative overflow-hidden bg-[#18181b]/50">
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 rounded-full blur-xl -translate-y-1/2 translate-x-1/2"></div>
          <p className="font-semibold text-foreground mb-1">FlexoTDS Pro v2.0</p>
          <p className="text-muted-foreground">Industrial Grade Specs</p>
        </div>
      </div>
    </aside>
  )
}
