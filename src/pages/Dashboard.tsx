import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTDSRecords } from '@/hooks/useTDS'
import Layout from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'
import { FileText, Users, Settings as SettingsIcon, TrendingUp, Loader2, Edit, Download, Activity, Play } from 'lucide-react'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const { user, isAdmin } = useAuth()
  const { data: allRecords, isLoading } = useTDSRecords()
  const recentRecords = allRecords?.slice(0, 5) || []

  // Compute stats
  const stats = {
    total: allRecords?.length || 0,
    draft: allRecords?.filter(r => r.status === 'Draft').length || 0,
    completed: allRecords?.filter(r => r.status === 'Completed').length || 0,
    approved: allRecords?.filter(r => r.status === 'Approved').length || 0,
  }

  // Mock data for the chart, ideally this would come from a real aggregation query
  const chartData = [
    { name: 'Mon', records: 4, completed: 3 },
    { name: 'Tue', records: 7, completed: 5 },
    { name: 'Wed', records: 5, completed: 4 },
    { name: 'Thu', records: 12, completed: 8 },
    { name: 'Fri', records: 8, completed: 7 },
    { name: 'Sat', records: 3, completed: 2 },
    { name: 'Sun', records: 2, completed: 2 },
  ]

  return (
    <Layout>
      <div className="space-y-8 fade-in">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Dashboard Overview
              </h1>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
              </span>
            </div>
            <p className="text-muted-foreground mt-2 font-medium">
              Welcome back, <span className="text-foreground">{user?.fullName}</span>. System active and recording.
            </p>
          </div>
          <Link to="/tds/new">
            <Button size="lg" className="shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all font-semibold tracking-wide">
              <Play className="mr-2 h-4 w-4 fill-current" />
              INITIATE TDS WIZARD
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="glass-panel overflow-hidden relative group border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Total Volume</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold data-mono text-foreground">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center">
                <span className="text-primary mr-1">All time</span> records logged
              </p>
            </CardContent>
          </Card>

          <Card className="glass-panel overflow-hidden relative group border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">In Progress</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold data-mono text-foreground">{stats.draft}</div>
              <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center">
                Pending completion steps
              </p>
            </CardContent>
          </Card>

          <Card className="glass-panel overflow-hidden relative group border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Quality Check</CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold data-mono text-foreground">{stats.completed}</div>
              <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center">
                Awaiting final review
              </p>
            </CardContent>
          </Card>

          <Card className="glass-panel overflow-hidden relative group border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Production Ready</CardTitle>
              <Download className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold data-mono text-foreground">{stats.approved}</div>
              <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center">
                Cleared for export
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Section */}
        <div className="grid gap-4 md:grid-cols-7">
          <Card className="glass-panel border-white/5 col-span-4 lg:col-span-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <CardHeader className="pb-2 border-b border-white/5 bg-white/[0.02]">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Performance Metrics (7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRecords" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.9)', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#e4e4e7' }}
                    />
                    <Area type="monotone" dataKey="records" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRecords)" name="Logged" />
                    <Area type="monotone" dataKey="completed" stroke="#2dd4bf" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" name="Completed" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-panel border-white/5 col-span-3 lg:col-span-2 relative overflow-hidden">
            <CardHeader className="pb-2 border-b border-white/5 bg-white/[0.02]">
              <CardTitle className="text-lg font-bold">System Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Server Connectivity</span>
                    <span className="text-success font-medium">OPTIMAL</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-success w-[98%]"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Database Storage</span>
                    <span className="text-warning font-medium">42%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-warning w-[42%]"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Export Engine</span>
                    <span className="text-success font-medium">ONLINE</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-success w-[100%] shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/5 text-center">
                  <p className="text-xs text-muted-foreground font-mono">
                    LAST SYNC: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent TDS Records */}
        <Card className="glass-panel border-white/5">
          <CardHeader className="border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">System Log</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Most recent TDS creations and updates.</p>
              </div>
              <Link to="/tds">
                <Button variant="outline" size="sm" className="bg-transparent border-white/10 hover:bg-white/5">
                  View Full History
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="label-caps text-muted-foreground">Fetching records...</p>
              </div>
            ) : recentRecords.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Active Records</h3>
                <p className="text-muted-foreground mb-6">The system log is currently empty. Initiate a new wizard sequence to begin.</p>
                <Link to="/tds/new">
                  <Button className="shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                    Create Your First TDS
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-6 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex-1 w-full md:w-auto mb-4 md:mb-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-mono text-sm px-2 py-1 bg-white/5 rounded border border-white/10 text-foreground">
                          {record.order_number}
                        </span>
                        <StatusBadge status={record.status as any} />
                      </div>
                      <div className="grid grid-cols-2 md:flex items-center gap-x-8 gap-y-2 text-sm">
                        <div className="flex flex-col">
                          <span className="label-caps text-muted-foreground/70 mb-1">Customer</span>
                          <span className="font-medium">{record.customer?.name}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="label-caps text-muted-foreground/70 mb-1">Machine</span>
                          <span className="font-medium">{record.machine?.machine_code}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="label-caps text-muted-foreground/70 mb-1">Date</span>
                          <span className="data-mono">{formatDate(record.date)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="label-caps text-muted-foreground/70 mb-1">Units</span>
                          <span className="data-mono">{record.num_units}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-white/5 md:border-none">
                      <Link to={`/tds/${record.id}`} className="w-full md:w-auto">
                        <Button variant="outline" size="sm" className="w-full bg-transparent border-white/10 hover:bg-white/5">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-3">
          <Link to="/customers">
            <Card className="glass-panel border-white/5 hover:border-primary/50 transition-all cursor-pointer group h-full">
              <CardHeader>
                <CardTitle className="flex items-center text-base group-hover:text-primary transition-colors">
                  <Users className="mr-2 h-5 w-5" />
                  Client Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage customer profiles and historical data parameters.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/machines">
            <Card className="glass-panel border-white/5 hover:border-primary/50 transition-all cursor-pointer group h-full">
              <CardHeader>
                <CardTitle className="flex items-center text-base group-hover:text-primary transition-colors">
                  <SettingsIcon className="mr-2 h-5 w-5" />
                  Machine Specs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configure hardware profiles, defaults, and unit parameters.
                </p>
              </CardContent>
            </Card>
          </Link>

          {isAdmin() && (
            <Link to="/settings">
              <Card className="glass-panel border-white/5 hover:border-primary/50 transition-all cursor-pointer group h-full">
                <CardHeader>
                  <CardTitle className="flex items-center text-base group-hover:text-primary transition-colors">
                    <Activity className="mr-2 h-5 w-5" />
                    System Core
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Access administrative controls, roles, and global routing.
                  </p>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      </div>
    </Layout>
  )
}