import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useDashboardData } from '@/hooks/useDashboardData'
import Layout from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Download, Plus, Users, Server, Settings as SettingsIcon, Loader2, AlertCircle } from 'lucide-react'
import { KPICards } from '@/components/dashboard/KPICards'
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts'
import { DashboardActivityFeed } from '@/components/dashboard/DashboardActivityFeed'
import { Card, CardContent } from '@/components/ui/card'

export default function Dashboard() {
  const { user } = useAuth()
  const { data, isLoading, isError, error } = useDashboardData()

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest animate-pulse">
            Initializing Dashboard...
          </p>
        </div>
      </Layout>
    )
  }

  if (isError) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center max-w-md mx-auto">
          <div className="p-4 rounded-full bg-destructive/10">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-xl font-bold">Failed to load dashboard</h2>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'An unexpected error occurred while fetching system data.'}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
            Retry Connection
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* WELCOME HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">System Operational</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Welcome back, {user?.fullName?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-xl">
              Your industrial command center is ready. Monitoring production output and quality across all active machines.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-foreground rounded-full h-10 px-5">
              <Download className="mr-2 w-4 h-4" /> Export Report
            </Button>
            <Link to="/tds/new">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all rounded-full h-10 px-6 font-semibold">
                <Plus className="mr-2 w-4 h-4" /> New TDS Record
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI SECTION */}
        {data && <KPICards kpis={data.kpis} />}

        {/* ANALYTICS SECTION */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {data && (
              <AnalyticsCharts
                trends={data.trends}
                quality={data.qualityStats}
                machines={data.machineStats}
              />
            )}
          </div>

          {/* SIDEBAR: ACTIVITY & QUICK ACTIONS */}
          <div className="space-y-6">
            {data && <DashboardActivityFeed activities={data.recentActivity} />}
            
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Management</h3>
              <Link to="/customers" className="block">
                <Card className="bg-[#18181b]/30 border-white/5 hover:border-primary/50 hover:bg-white/[0.03] transition-all cursor-pointer group rounded-xl overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Customers</h3>
                      <p className="text-[10px] text-muted-foreground">Manage client database</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/machines" className="block">
                <Card className="bg-[#18181b]/30 border-white/5 hover:border-primary/50 hover:bg-white/[0.03] transition-all cursor-pointer group rounded-xl overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Machines</h3>
                      <p className="text-[10px] text-muted-foreground">Hardware configuration</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/settings" className="block">
                <Card className="bg-[#18181b]/30 border-white/5 hover:border-primary/50 hover:bg-white/[0.03] transition-all cursor-pointer group rounded-xl overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground group-hover:scale-110 transition-transform">
                      <SettingsIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Settings</h3>
                      <p className="text-[10px] text-muted-foreground">System & API Control</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
