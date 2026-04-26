import { useState, useMemo } from 'react'
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
  const { isAdmin, isTechnicalOfficer } = useAuth()
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

    return allRecords.filter((record) => {
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

  const handleDelete = async () => {
    if (!recordToDelete) return

    await deleteMutation.mutateAsync(recordToDelete)
    setDeleteDialogOpen(false)
    setRecordToDelete(null)
  }

  const canDelete = (record: any) => {
    return record.status === 'Draft' && (isTechnicalOfficer() || isAdmin())
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Order, Customer, Machine..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Customer Filter */}
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Customers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    {customers?.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Machine Filter */}
              <div className="space-y-2">
                <Label>Machine</Label>
                <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Machines" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Machines</SelectItem>
                    {machines?.map((machine) => (
                      <SelectItem key={machine.id} value={machine.id}>
                        {machine.machine_code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
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
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <span>Showing {filteredRecords.length} of {allRecords?.length || 0} records</span>
                <Button
                  variant="ghost"
                  size="sm"
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
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : paginatedRecords.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery || selectedCustomer !== 'all' || selectedMachine !== 'all' || selectedStatus !== 'all'
                    ? 'No records match your filters'
                    : 'No TDS records yet'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Machine</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.order_number}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.customer?.name}</div>
                          {record.customer?.location && (
                            <div className="text-xs text-muted-foreground">
                              {record.customer.location}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{record.machine?.machine_code}</TableCell>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>{record.num_units}</TableCell>
                      <TableCell>
                        <StatusBadge status={record.status as any} />
                      </TableCell>
                      <TableCell className="text-right">
                        <RowActions
                          record={record}
                          canDelete={canDelete(record)}
                          onDelete={(recordId) => {
                            setRecordToDelete(recordId)
                            setDeleteDialogOpen(true)
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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