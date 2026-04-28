import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from '@/hooks/useCustomers'
import { useMachines } from '@/hooks/useMachines'
import { useTDSRecords } from '@/hooks/useTDS'
import Layout from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Edit, Trash2, Loader2, Building2 } from 'lucide-react'
import type { Customer } from '@/types/tds.types'

const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  location: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerSchema>

export default function Customers() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)

  const { data: customers, isLoading } = useCustomers()
  const { data: allMachines } = useMachines()
  const { data: allTDS } = useTDSRecords()
  const createMutation = useCreateCustomer()
  const updateMutation = useUpdateCustomer()
  const deleteMutation = useDeleteCustomer()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  })

  const openDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer)
      reset({
        name: customer.name,
        location: customer.location || '',
      })
    } else {
      setEditingCustomer(null)
      reset({
        name: '',
        location: '',
      })
    }
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingCustomer(null)
    reset()
  }

  const onSubmit = async (data: CustomerFormData) => {
    if (editingCustomer) {
      await updateMutation.mutateAsync({
        id: editingCustomer.id,
        updates: data,
      })
    } else {
      await createMutation.mutateAsync(data)
    }
    closeDialog()
  }

  const handleDelete = async () => {
    if (!deletingCustomer) return
    await deleteMutation.mutateAsync(deletingCustomer.id)
    setDeleteDialogOpen(false)
    setDeletingCustomer(null)
  }

  const getCustomerStats = (customerId: string) => {
    const machines = allMachines?.filter(m => m.customer_id === customerId).length || 0
    const tdsCount = allTDS?.filter(t => t.customer_id === customerId).length || 0
    return { machines, tdsCount }
  }

  return (
    <Layout>
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-4 md:p-6 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              CLIENT DATABASE
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-mono">
              Manage customer profiles and system assignments
            </p>
          </div>
          <Button size="lg" onClick={() => openDialog()} className="shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <Plus className="mr-2 h-5 w-5" />
            ADD CLIENT
          </Button>
        </div>

        {/* Table */}
        <Card className="glass-panel border-white/5 overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="label-caps text-muted-foreground">Accessing Database...</p>
              </div>
            ) : !customers || customers.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <Building2 className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Clients Found</h3>
                <p className="text-muted-foreground mb-6">The database is currently empty. Add your first client to begin.</p>
                <Button onClick={() => openDialog()} className="shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Client
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/[0.02]">
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="label-caps">Name</TableHead>
                      <TableHead className="label-caps">Location</TableHead>
                      <TableHead className="label-caps">Machines</TableHead>
                      <TableHead className="label-caps">TDS Records</TableHead>
                      <TableHead className="text-right label-caps">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => {
                      const stats = getCustomerStats(customer.id)
                      return (
                        <TableRow key={customer.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                          <TableCell className="font-medium text-foreground">
                            {customer.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{customer.location || '—'}</TableCell>
                          <TableCell>
                            <span className="font-mono text-sm px-2 py-1 bg-white/5 rounded border border-white/10 text-foreground">
                              {stats.machines}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm px-2 py-1 bg-white/5 rounded border border-white/10 text-foreground">
                              {stats.tdsCount}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-transparent border-white/10 hover:bg-white/5"
                                onClick={() => openDialog(customer)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-transparent border-white/10 hover:bg-destructive/20 hover:text-destructive hover:border-destructive/30"
                                onClick={() => {
                                  setDeletingCustomer(customer)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? 'Edit Customer' : 'Add Customer'}
            </DialogTitle>
            <DialogDescription>
              {editingCustomer
                ? 'Update customer information below'
                : 'Enter customer details to create a new customer'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Customer Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="EPL, Location - Vapi"
                  {...register('name')}
                  autoFocus
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Vapi, Gujarat"
                  {...register('location')}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingCustomer ? (
                  'Update'
                ) : (
                  'Create'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deletingCustomer?.name}</strong>,
              all associated machines, and TDS records. This action cannot be undone.
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