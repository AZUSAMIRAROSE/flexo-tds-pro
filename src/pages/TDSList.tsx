import { useState, useMemo, useEffect } from 'react'
import { Link } from "react-router-dom";
import { useTDSRecords, useDeleteTDS } from '@/hooks/useTDS'
import { useCustomers } from '@/hooks/useCustomers'
import { useMachines } from '@/hooks/useMachines'
import { useAuth } from '@/hooks/useAuth'
import Layout from '@/components/layout/Layout'
import { RowActions } from '@/components/shared/RowActions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'
import {
  FileText,
  Plus,
  Search,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const ITEMS_PER_PAGE = 25

export default function TDSList() {
  const { user, isAdmin, isTechnicalOfficer } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all')
  const [selectedMachine, setSelectedMachine] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null)

  const { data: customers } = useCustomers()
  const { data: machines } = useMachines()
  const { data: allRecords, isLoading } = useTDSRecords()
  const deleteMutation = useDeleteTDS()

  // Filter and search
  const filteredRecords = useMemo(() => {
    if (!allRecords) return []

    return allRecords.filter((record: any) => {
      const matchesSearch = searchQuery === '' || 
        record.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.machine?.machine_code.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCustomer = selectedCustomer === 'all' || record.customer_id === selectedCustomer
      const matchesMachine = selectedMachine === 'all' || record.machine_id === selectedMachine
      const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus

      return matchesSearch && matchesCustomer && matchesMachine && matchesStatus
    })
  }, [allRecords, searchQuery, selectedCustomer, selectedMachine, selectedStatus])

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE)
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCustomer, selectedMachine, selectedStatus])

  const handleDelete = async () => {
    if (!recordToDelete) return

    await deleteMutation.mutateAsync(recordToDelete)
    setDeleteDialogOpen(false)
    setRecordToDelete(null)
  }

  const canDelete = (record: any) => {
    if (record.status !== 'Draft') return false
    if (isAdmin()) return true
    return isTechnicalOfficer() && record.prepared_by === user?.id
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">TDS Records</h1>
            <p className="text-muted-foreground mt-1">
              Manage and view all Technical Data Sheets
            </p>
          </div>
          <Link to="/tds/new">
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              New TDS
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="glass-panel border-white/5">
          <CardHeader className="border-b border-white/5 bg-white/[0.02]">
            <CardTitle className="flex items-center text-lg font-semibold tracking-wide">
              <Filter className="mr-2 h-5 w-5 text-primary" />
              SYSTEM FILTERS
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-4">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search" className="label-caps text-muted-foreground">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Order, Customer, Machine..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-background/50 border-white/10 focus-visible:ring-primary/50"
                  />
                </div>
              </div>

              {/* Customer Filter */}
              <div className="space-y-2">
                <Label className="label-caps text-muted-foreground">Customer</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger className="bg-background/50 border-white/10 focus:ring-primary/50">
                    <SelectValue placeholder="All Customers" />
                  </SelectTrigger>
                  <SelectContent className="glass-modal border-white/10">
                    <SelectItem value="all">All Customers</SelectItem>
                    {customers?.map((customer: any) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Machine Filter */}
              <div className="space-y-2">
                <Label className="label-caps text-muted-foreground">Machine</Label>
                <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                  <SelectTrigger className="bg-background/50 border-white/10 focus:ring-primary/50">
                    <SelectValue placeholder="All Machines" />
                  </SelectTrigger>
                  <SelectContent className="glass-modal border-white/10">
                    <SelectItem value="all">All Machines</SelectItem>
                    {machines?.map((machine: any) => (
                      <SelectItem key={machine.id} value={machine.id}>
                        {machine.machine_code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="label-caps text-muted-foreground">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="bg-background/50 border-white/10 focus:ring-primary/50">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent className="glass-modal border-white/10">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(searchQuery || selectedCustomer !== 'all' || selectedMachine !== 'all' || selectedStatus !== 'all') && (
              <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground border-t border-white/5 pt-4">
                <span className="font-medium">Showing {filteredRecords.length} of {allRecords?.length || 0} records</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-white/5 hover:text-foreground"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCustomer('all')
                    setSelectedMachine('all')
                    setSelectedStatus('all')
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="glass-panel border-white/5 overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="label-caps text-muted-foreground">Accessing Records...</p>
              </div>
            ) : paginatedRecords.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Records Found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || selectedCustomer !== 'all' || selectedMachine !== 'all' || selectedStatus !== 'all'
                    ? 'No records match your filters'
                    : 'The database is currently empty.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/[0.02]">
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="label-caps">Order Number</TableHead>
                      <TableHead className="label-caps">Customer</TableHead>
                      <TableHead className="label-caps">Machine</TableHead>
                      <TableHead className="label-caps">Date</TableHead>
                      <TableHead className="label-caps">Units</TableHead>
                      <TableHead className="label-caps">Status</TableHead>
                      <TableHead className="text-right label-caps">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRecords.map((record: any) => (
                      <TableRow key={record.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                        <TableCell>
                          <span className="font-mono text-sm px-2 py-1 bg-white/5 rounded border border-white/10 text-foreground">
                            {record.order_number}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{record.customer?.name}</div>
                            {record.customer?.location && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {record.customer.location}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-muted-foreground">{record.machine?.machine_code}</TableCell>
                        <TableCell className="data-mono">{formatDate(record.date)}</TableCell>
                        <TableCell className="data-mono">{record.num_units}</TableCell>
                        <TableCell>
                          <StatusBadge status={record.status as any} />
                        </TableCell>
                        <TableCell className="text-right">
                          <RowActions
                            record={record}
                            canDelete={canDelete(record)}
                            onDelete={(recordId: string) => {
                              setRecordToDelete(recordId)
                              setDeleteDialogOpen(true)
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the TDS record
              and all associated unit data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  )
}
