import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTDSRecords } from '@/hooks/useTDS'
import Layout from '@/components/layout/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'
import { FileText, Users, Settings as SettingsIcon, Server, ArrowRight, Activity, Download, Plus, Search, Layers, Clock } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const { data: allRecords, isLoading } = useTDSRecords()
  const recentRecords = allRecords?.slice(0, 5) || []

  // Stats logic
  const stats = {
    total: allRecords?.length || 0,
    draft: allRecords?.filter(r => r.status === 'Draft').length || 0,
    completed: allRecords?.filter(r => r.status === 'Completed').length || 0,
    approved: allRecords?.filter(r => r.status === 'Approved').length || 0,
  }

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* SECTION A — Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Welcome back, {user?.fullName?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-xl">
              Here's what's happening with your TDS records today. System is operating at peak performance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-transparent border-white/10 hover:bg-white/5 text-foreground rounded-full">
              <Download className="mr-2 w-4 h-4" /> Export Report
            </Button>
            <Link to="/tds/new">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all rounded-full px-6">
                <Plus className="mr-2 w-4 h-4" /> New TDS
              </Button>
            </Link>
          </div>
        </div>

        {/* SECTION B — Stats Cards (grid) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total */}
          <Card className="relative overflow-hidden bg-[#18181b] border-white/5 hover:border-white/10 transition-colors group rounded-2xl shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Layers className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold text-foreground tracking-tight">{stats.total}</h3>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  Total TDS Records
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Draft */}
          <Card className="relative overflow-hidden bg-[#18181b] border-white/5 hover:border-white/10 transition-colors group rounded-2xl shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center text-muted-foreground group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold text-foreground tracking-tight">{stats.draft}</h3>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  Drafts in Progress
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Completed */}
          <Card className="relative overflow-hidden bg-[#18181b] border-white/5 hover:border-white/10 transition-colors group rounded-2xl shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold text-foreground tracking-tight">{stats.completed}</h3>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  Completed (Review)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Approved */}
          <Card className="relative overflow-hidden bg-[#18181b] border-white/5 hover:border-white/10 transition-colors group rounded-2xl shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold text-foreground tracking-tight">{stats.approved}</h3>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                  Approved & Exported
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* BOTTOM SECTIONS */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* SECTION C — Recent TDS Table (Span 2) */}
          <Card className="lg:col-span-2 bg-[#18181b] border-white/5 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Recent TDS Activity</h2>
                <p className="text-sm text-muted-foreground mt-1">Latest updates from your production line.</p>
              </div>
              <Link to="/tds">
                <Button variant="ghost" size="sm" className="text-sm font-medium text-primary hover:text-primary hover:bg-primary/10 rounded-full">
                  View All <ArrowRight className="ml-1.5 w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-white/[0.01] border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 font-semibold tracking-wider">Order ID</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Customer</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Machine</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                    <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center">
                          <Activity className="h-6 w-6 animate-pulse mb-2 text-primary" />
                          <p>Loading records...</p>
                        </div>
                      </td>
                    </tr>
                  ) : recentRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
                          <Search className="h-6 w-6" />
                        </div>
                        <p className="text-foreground font-medium">No records found</p>
                        <p className="text-sm text-muted-foreground mt-1">Create your first TDS to see it here.</p>
                      </td>
                    </tr>
                  ) : (
                    recentRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-foreground font-medium">
                          {record.order_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground group-hover:text-foreground transition-colors">
                          {record.customer?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground group-hover:text-foreground transition-colors">
                          {record.machine?.machine_code || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={record.status as any} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link to={`/tds/${record.id}`}>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 rounded-md text-foreground">
                              Edit Details
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* SECTION D — Quick Actions Panel */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground px-1">Quick Actions</h2>
            
            <Link to="/customers" className="block">
              <Card className="bg-[#18181b] border-white/5 hover:border-primary/50 hover:bg-white/[0.02] transition-all cursor-pointer group rounded-2xl shadow-sm">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">Manage Customers</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">View and edit client database</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/machines" className="block">
              <Card className="bg-[#18181b] border-white/5 hover:border-primary/50 hover:bg-white/[0.02] transition-all cursor-pointer group rounded-2xl shadow-sm">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                    <Server className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">Manage Machines</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">Configure hardware profiles</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/settings" className="block">
              <Card className="bg-[#18181b] border-white/5 hover:border-primary/50 hover:bg-white/[0.02] transition-all cursor-pointer group rounded-2xl shadow-sm">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-foreground group-hover:scale-110 transition-all">
                    <SettingsIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">System Settings</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">Global configuration and routing</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

        </div>
      </div>
    </Layout>
  )
}