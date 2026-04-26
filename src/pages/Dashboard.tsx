import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTDSRecords } from '@/hooks/useTDS'
import Layout from '@/components/layout/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'
import { FileText, Users, Settings as SettingsIcon, TrendingUp, Loader2, Edit, Download } from 'lucide-react'

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

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Welcome back, {user?.fullName}
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your TDS records today.
            </p>
          </div>
          <Link to="/tds/new">
            <Button size="lg" className="shadow-md">
              <FileText className="mr-2 h-5 w-5" />
              New TDS
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total TDS</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All time records
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <Edit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draft}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pending completion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Ready for export
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent TDS Records */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent TDS Records</CardTitle>
              <Link to="/tds">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : recentRecords.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No TDS records yet</p>
                <Link to="/tds/new">
                  <Button className="mt-4">
                    Create Your First TDS
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">
                          {record.order_number}
                        </h3>
                        <StatusBadge status={record.status as any} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{record.customer?.name}</span>
                        <span>•</span>
                        <span>{record.machine?.machine_code}</span>
                        <span>•</span>
                        <span>{formatDate(record.date)}</span>
                        <span>•</span>
                        <span>{record.num_units} units</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/tds/${record.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
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
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Users className="mr-2 h-5 w-5" />
                  Manage Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Add, edit, or view customer information
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/machines">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <SettingsIcon className="mr-2 h-5 w-5" />
                  Manage Machines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configure machines and default settings
                </p>
              </CardContent>
            </Card>
          </Link>

          {isAdmin() && (
            <Link to="/settings">
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <SettingsIcon className="mr-2 h-5 w-5" />
                    System Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    User management and system configuration
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