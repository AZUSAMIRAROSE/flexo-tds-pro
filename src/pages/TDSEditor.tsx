import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTDSRecord, useCreateTDS, useUpdateTDS, useUpdateTDSStatus } from '@/hooks/useTDS'
import { useCustomers } from '@/hooks/useCustomers'
import { useMachines } from '@/hooks/useMachines'
import { useTDSFormStore } from '@/stores/tdsFormStore'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useExport } from '@/hooks/useExport'
import Layout from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ActivityLog } from '@/components/shared/ActivityLog'
import { JobInfoSection } from '@/components/forms/JobInfoSection'
import { SubstrateSection } from '@/components/forms/SubstrateSection'
import { UnitSequenceTable } from '@/components/forms/UnitSequenceTable'
import { QualitySection } from '@/components/forms/QualitySection'
import { UnitLookupSidebar } from '@/components/forms/UnitLookupSidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'
import { ArrowLeft, Save, Loader2, Download, CheckCircle, CheckCircle2, Cloud, AlertCircle } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export default function TDSEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin, isTechnicalOfficer } = useAuth()
  const isNew = !id

  const { formData, units, setFormData, setUnits, resetForm, isDirty, markClean } = useTDSFormStore()
  const { data: tdsRecord, isLoading } = useTDSRecord(id)
  const { data: customers } = useCustomers()
  const { data: allMachines } = useMachines()
  
  const createMutation = useCreateTDS()
  const updateMutation = useUpdateTDS()
  const statusMutation = useUpdateTDSStatus()

  const [saving, setSaving] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')

  const { exportToExcel, exportToPDF, exportToWord, exporting } = useExport(id || '')

  // Filter machines by selected customer
  const machines = allMachines?.filter(m => m.customer_id === selectedCustomerId) || []

  // Load existing TDS data
  useEffect(() => {
    if (tdsRecord) {
      setFormData(tdsRecord)
      setUnits(tdsRecord.units || [])
      setSelectedCustomerId(tdsRecord.customer_id || '')
    } else if (isNew) {
      resetForm()
      // Initialize with default units based on machine selection
      const defaultUnits = Array.from({ length: formData.num_units || 10 }, (_, i) => ({
        unit_no: i + 1,
        anilox_unit: 'LPI',
        volume_unit: 'CCM',
      }))
      setUnits(defaultUnits as any)
    }

    return () => {
      if (isNew) resetForm()
    }
  }, [tdsRecord, isNew])

  // Auto-generate units when num_units changes
  useEffect(() => {
    if (formData.num_units && formData.num_units !== units.length) {
      const count = formData.num_units
      if (count > units.length) {
        // Add units
        const newUnits = Array.from({ length: count - units.length }, (_, i) => ({
          unit_no: units.length + i + 1,
          anilox_unit: 'LPI',
          volume_unit: 'CCM',
        }))
        setUnits([...units, ...newUnits] as any)
      } else {
        // Remove units
        setUnits(units.slice(0, count))
      }
    }
  }, [formData.num_units])

  // Machine selection auto-fill
  const handleMachineChange = (machineId: string) => {
    const machine = machines.find(m => m.id === machineId)
    if (machine) {
      setFormData({
        ...formData,
        machine_id: machineId,
        num_units: machine.default_unit_count,
      })
    }
  }

  const handleSave = async (changeStatus?: 'Completed' | 'Approved') => {
    setSaving(true)
    try {
      // Validate required fields
      if (!formData.order_number) {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: 'Order Number is required',
        })
        return
      }

      if (!selectedCustomerId) {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: 'Customer is required',
        })
        return
      }

      const dataToSave = {
        ...formData,
        customer_id: selectedCustomerId,
        prepared_by: user?.id,
      }

      if (isNew) {
        const result = await createMutation.mutateAsync({
          record: dataToSave as any,
          units: units,
        })
        markClean()
        navigate(`/tds/${result.id}`)
      } else {
        await updateMutation.mutateAsync({
          id: id!,
          updates: dataToSave as any,
          unitUpdates: units as any,
        })
        markClean()
      }

      // Change status if requested
      if (changeStatus && id) {
        await statusMutation.mutateAsync({ id, status: changeStatus })
      }
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  const canEdit = () => {
    if (isNew) return true
    if (formData.status === 'Draft') return true
    if (formData.status === 'Completed' && (isTechnicalOfficer() || isAdmin())) return true
    if (formData.status === 'Approved' && isAdmin()) return true
    return false
  }

  const canApprove = () => {
    return formData.status === 'Completed' && isAdmin()
  }

  const canComplete = () => {
    return formData.status === 'Draft' && (isTechnicalOfficer() || isAdmin())
  }

  const { isSaving: autoSaving, lastSaved } = useAutoSave(id, canEdit())

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/tds">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to List
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-primary">
                {isNew ? 'New TDS Record' : `TDS: ${formData.order_number}`}
              </h1>
              {!isNew && (
                <p className="text-sm text-muted-foreground mt-1">
                  Created {formatDateTime(formData.created_at)}
                  {formData.prepared_by && user && ` by ${user.fullName}`}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isNew && (
              <>
                <StatusBadge status={formData.status as any} />
                {canEdit() && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {autoSaving ? (
                      <>
                        <Cloud className="h-4 w-4 animate-pulse" />
                        <span>Saving...</span>
                      </>
                    ) : isDirty ? (
                      <>
                        <Cloud className="h-4 w-4" />
                        <span>Unsaved changes</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span>All changes saved</span>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={exporting || !id}>
                  {exporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToExcel}>
                  <Download className="mr-2 h-4 w-4" />
                  Export to Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  Export to PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToWord}>
                  <Download className="mr-2 h-4 w-4" />
                  Export to Word
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {canEdit() && (
              <Button onClick={() => handleSave()} disabled={saving || !isDirty}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Draft
                  </>
                )}
              </Button>
            )}

            {canComplete() && (
              <Button onClick={() => handleSave('Completed')} disabled={saving}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark Completed
              </Button>
            )}

            {canApprove() && (
              <Button onClick={() => handleSave('Approved')} disabled={saving} variant="default">
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
            )}
          </div>
        </div>

        {/* Main Layout: Form + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Form */}
          <Tabs defaultValue="form" className="space-y-6">
            <TabsList>
              <TabsTrigger value="form">TDS Form</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
            </TabsList>

            <TabsContent value="form" className="space-y-6">
              {/* Header Section */}
            <div className="bg-primary/5 border rounded-lg p-6 space-y-4">
              <div className="text-center">
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Select
                    value={selectedCustomerId}
                    onValueChange={(value) => {
                      setSelectedCustomerId(value)
                      setFormData({ ...formData, customer_id: value, machine_id: undefined })
                    }}
                    disabled={!canEdit()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}{customer.location && `, ${customer.location}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <h2 className="text-2xl font-bold text-primary mt-4">
                  FLEXO NARROW WEB · TECHNICAL DATA SHEET
                </h2>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Machine</Label>
                    <Select
                      value={formData.machine_id || ''}
                      onValueChange={handleMachineChange}
                      disabled={!selectedCustomerId || !canEdit()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select machine" />
                      </SelectTrigger>
                      <SelectContent>
                        {machines.map((machine) => (
                          <SelectItem key={machine.id} value={machine.id}>
                            {machine.machine_code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Machine Name</Label>
                    <div className="h-10 px-3 py-2 border rounded-md bg-muted/50 flex items-center text-sm">
                      {machines.find(m => m.id === formData.machine_id)?.machine_name || 'Siegwerk India Pvt. Ltd.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {!canEdit() && (
              <div className="bg-warning/10 border border-warning rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-warning" />
                <p className="text-sm text-warning-foreground">
                  This TDS is <strong>{formData.status}</strong> and cannot be edited.
                  {formData.status === 'Completed' && !isAdmin() && ' Only admins can edit completed records.'}
                  {formData.status === 'Approved' && ' Only admins can edit approved records.'}
                </p>
              </div>
            )}

            {/* Job Information */}
            <JobInfoSection />

            {/* Substrate Section */}
            <SubstrateSection />

            {/* Unit Sequence */}
            <UnitSequenceTable />

            {/* Quality Parameters */}
            <QualitySection />

              {/* Footer */}
              <div className="border-t pt-6">
                <div className="text-sm text-muted-foreground">
                  <p>Prepared By: {user?.fullName}</p>
                  <p>{formatDateTime(new Date())}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity">
              {!isNew && <ActivityLog tdsRecordId={id!} />}
            </TabsContent>
          </Tabs>

          {/* Sidebar */}
          <div>
            <UnitLookupSidebar />
          </div>
        </div>
      </div>
    </Layout>
  )
}

