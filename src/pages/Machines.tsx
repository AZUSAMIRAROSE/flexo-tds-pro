import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  useMachines,
  useCreateMachine,
  useUpdateMachine,
  useDeleteMachine,
} from '@/hooks/useMachines'
import { useCustomers } from '@/hooks/useCustomers'
import { useTDSRecords } from '@/hooks/useTDS'
import Layout from '@/components/layout/Layout'
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
import { Plus, Edit, Trash2, Loader2, Settings } from 'lucide-react'
import { MachineWithCustomer } from '@/types/tds.types'

const machineSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  machine_code: z.string().min(1, 'Machine code is required'),
  machine_name: z.string().optional(),
  default_unit_count: z.number().min(1).max(20),
})

type MachineFormData = z.infer<typeof machineSchema>

export default function Machines() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingMachine, setEditingMachine] = useState<MachineWithCustomer | null>(null)
  const [deletingMachine, setDeletingMachine] = useState<MachineWithCustomer | null>(null)

  const { data: machines, isLoading } = useMachines()
  const { data: customers } = useCustomers()
  const { data: allTDS } = useTDSRecords()
  const createMutation = useCreateMachine()
  const updateMutation = useUpdateMachine()
  const deleteMutation = useDeleteMachine()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MachineFormData>({
    resolver: zodResolver(machineSchema),
    defaultValues: {
      default_unit_count: 10,
    },
  })

  const selectedCustomerId = watch('customer_id')

  const openDialog = (machine?: MachineWithCustomer) => {
    if (machine) {
      setEditingMachine(machine)
      reset({
        customer_id: machine.customer_id,
        machine_code: machine.machine_code,
        machine_name: machine.machine_name || '',
        default_unit_count: machine.default_unit_count,
      })
    } else {
      setEditingMachine(null)
      reset({
        customer_id: '',
        machine_code: '',
        machine_name: '',
        default_unit_count: 10,
      })
    }
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingMachine(null)
    reset()
  }

  const onSubmit = async (data: MachineFormData) => {
    if (editingMachine) {
      await updateMutation.mutateAsync({
        id: editingMachine.id,
        updates: data,
      })
    } else {
      await createMutation.mutateAsync(data)
    }
    closeDialog()
  }

  const handleDelete = async () => {
    if (!deletingMachine) return
    await deleteMutation.mutateAsync(deletingMachine.id)
    setDeleteDialogOpen(false)
    setDeletingMachine(null)
  }

  const getMachineStats = (machineId: string) => {
    return allTDS?.filter(t => t.machine_id === machineId).length || 0
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Machines</h1>
            <p className="text-muted-foreground mt-1">
              Configure machines and their default unit counts
            </p>
          </div>
          <Button size="lg" onClick={() => openDialog()}>
            <Plus className="mr-2 h-5 w-5" />
            Add Machine
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !machines || machines.length === 0 ? (
              <div className="text-center py-12">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No machines yet</p>
                <Button onClick={() => openDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Machine
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Machine Code</TableHead>
                    <TableHead>Machine Name</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Default Units</TableHead>
                    <TableHead>TDS Records</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {machines.map((machine) => (
                    <TableRow key={machine.id}>
                      <TableCell className="font-medium">
                        {machine.machine_code}
                      </TableCell>
                      <TableCell>{machine.machine_name || '—'}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{machine.customer?.name}</div>
                          {machine.customer?.location && (
                            <div className="text-xs text-muted-foreground">
                              {machine.customer.location}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{machine.default_unit_count}</TableCell>
                      <TableCell>{getMachineStats(machine.id)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog(machine)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDeletingMachine(machine)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMachine ? 'Edit Machine' : 'Add Machine'}
            </DialogTitle>
            <DialogDescription>
              {editingMachine
                ? 'Update machine configuration below'
                : 'Enter machine details to create a new machine'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="customer_id">
                  Customer <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedCustomerId}
                  onValueChange={(value) => setValue('customer_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customer_id && (
                  <p className="text-sm text-destructive">{errors.customer_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="machine_code">
                  Machine Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="machine_code"
                  placeholder="FX-200A"
                  {...register('machine_code')}
                />
                {errors.machine_code && (
                  <p className="text-sm text-destructive">{errors.machine_code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="machine_name">Machine Name</Label>
                <Input
                  id="machine_name"
                  placeholder="Siegwerk India Pvt. Ltd."
                  {...register('machine_name')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default_unit_count">
                  Default Unit Count <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="default_unit_count"
                  type="number"
                  min={1}
                  max={20}
                  {...register('default_unit_count', { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  Number of printing units (1-20)
                </p>
                {errors.default_unit_count && (
                  <p className="text-sm text-destructive">
                    {errors.default_unit_count.message}
                  </p>
                )}
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
                ) : editingMachine ? (
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
              This will permanently delete machine <strong>{deletingMachine?.machine_code}</strong>
              {' '}and all associated TDS records. This action cannot be undone.
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