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

      // Strip nested relation objects from the payload
      const { customer, machine, units: _units, ...cleanFormData } = formData as any

      const dataToSave = {
        ...cleanFormData,
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
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <Link to="/tds">
              <Button variant="ghost" size="sm" className="hover:bg-white/5">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Log
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-primary rounded-full"></div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                  {isNew ? 'INITIATE NEW SEQUENCE' : `SEQUENCE: ${formData.order_number}`}
                </h1>
                {!isNew && (
                  <p className="text-sm text-muted-foreground mt-1 font-mono">
                    LOGGED {formatDateTime(formData.created_at)}
                    {formData.prepared_by && user && ` // OP: ${user.fullName}`}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {!isNew && (
              <>
                <StatusBadge status={formData.status as any} />
                {canEdit() && (
                  <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded bg-white/5 border border-white/10">
                    {autoSaving ? (
                      <>
                        <Cloud className="h-3 w-3 animate-pulse text-secondary" />
                        <span className="text-secondary">SYNCING...</span>
                      </>
                    ) : isDirty ? (
                      <>
                        <Cloud className="h-3 w-3 text-warning" />
                        <span className="text-warning">UNSAVED</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-success" />
                        <span className="text-success">SYNCED</span>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={exporting || !id} className="bg-transparent border-white/10 hover:bg-white/5">
                  {exporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                      COMPILING...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4 text-primary" />
                      EXPORT DATA
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-modal border-white/10">
                <DropdownMenuItem onClick={exportToExcel} className="cursor-pointer focus:bg-white/5">
                  <Download className="mr-2 h-4 w-4 text-green-500" />
                  Excel Workbook (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF} className="cursor-pointer focus:bg-white/5">
                  <Download className="mr-2 h-4 w-4 text-red-500" />
                  PDF Document (.pdf)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToWord} className="cursor-pointer focus:bg-white/5">
                  <Download className="mr-2 h-4 w-4 text-blue-500" />
                  Word Document (.docx)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {canEdit() && (
              <Button onClick={() => handleSave()} disabled={saving || !isDirty} variant="secondary" className="shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    SAVING...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    COMMIT DRAFT
                  </>
                )}
              </Button>
            )}

            {canComplete() && (
              <Button onClick={() => handleSave('Completed')} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <CheckCircle className="mr-2 h-4 w-4" />
                MARK READY
              </Button>
            )}

            {canApprove() && (
              <Button onClick={() => handleSave('Approved')} disabled={saving} variant="default" className="bg-success text-success-foreground hover:bg-success/90 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                <CheckCircle className="mr-2 h-4 w-4" />
                AUTHORIZE
              </Button>
            )}
          </div>
        </div>

        {/* Main Layout: Form + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Form */}
          <Tabs defaultValue="form" className="space-y-6">
            <TabsList className="glass-panel border-white/5 p-1 h-auto inline-flex rounded-lg">
              <TabsTrigger value="form" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary px-6 py-2.5 rounded-md font-semibold tracking-wide text-sm transition-all">TDS SEQUENCE</TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary px-6 py-2.5 rounded-md font-semibold tracking-wide text-sm transition-all">SYSTEM LOG</TabsTrigger>
            </TabsList>

            <TabsContent value="form" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Header Section */}
            <div className="glass-panel border-primary/20 p-6 md:p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              
              <div className="text-center relative z-10">
                <div className="space-y-2 mb-8 max-w-md mx-auto">
                  <Label className="label-caps text-muted-foreground">Client Identifier</Label>
                  <Select
                    value={selectedCustomerId}
                    onValueChange={(value) => {
                      setSelectedCustomerId(value)
                      setFormData({ ...formData, customer_id: value, machine_id: undefined })
                    }}
                    disabled={!canEdit()}
                  >
                    <SelectTrigger className="bg-background/50 border-white/10 h-12 text-lg">
                      <SelectValue placeholder="Select Target Client" />
                    </SelectTrigger>
                    <SelectContent className="glass-modal border-white/10">
                      {customers?.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}{customer.location && <span className="text-muted-foreground ml-2">[{customer.location}]</span>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="inline-block border-y border-white/10 py-4 w-full mb-8">
                  <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-[0.2em] uppercase">
                    FLEXO NARROW WEB
                  </h2>
                  <p className="text-primary tracking-[0.3em] text-sm font-semibold mt-2">TECHNICAL DATA SHEET</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-2">
                    <Label className="label-caps text-muted-foreground">Hardware Unit</Label>
                    <Select
                      value={formData.machine_id || ''}
                      onValueChange={handleMachineChange}
                      disabled={!selectedCustomerId || !canEdit()}
                    >
                      <SelectTrigger className="bg-background/50 border-white/10">
                        <SelectValue placeholder="Assign Hardware" />
                      </SelectTrigger>
                      <SelectContent className="glass-modal border-white/10">
                        {machines.map((machine) => (
                          <SelectItem key={machine.id} value={machine.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{machine.machine_code}</span>
                              <span className="text-xs text-muted-foreground font-mono">{machine.default_unit_count} UNITS</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="label-caps text-muted-foreground">System Designation</Label>
                    <div className="h-10 px-3 py-2 border border-white/5 rounded-md bg-white/[0.02] flex items-center text-sm font-mono text-muted-foreground/80">
                      {machines.find(m => m.id === formData.machine_id)?.machine_name || 'SIEGWERK INDIA PVT. LTD.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {!canEdit() && (
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-center gap-3 glass-panel">
                <AlertCircle className="h-5 w-5 text-warning" />
                <p className="text-sm text-warning-foreground">
                  RECORD LOCKED: Status is <strong>{formData.status}</strong>.
                  {formData.status === 'Completed' && !isAdmin() && ' Authorization required to modify.'}
                  {formData.status === 'Approved' && ' Record is finalized.'}
                </p>
              </div>
            )}

            {/* Form Sections */}
            <div className="space-y-6">
              <JobInfoSection />
              <SubstrateSection />
              <UnitSequenceTable />
              <QualitySection />
            </div>

              {/* Footer */}
              <div className="border-t border-white/10 pt-6 mt-8 flex justify-between items-center text-xs font-mono text-muted-foreground/50">
                <p>OP_ID: {user?.fullName?.toUpperCase() || 'SYS_USER'}</p>
                <p>TS: {formatDateTime(new Date())}</p>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="glass-panel p-6 border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {!isNew && <ActivityLog tdsRecordId={id!} />}
            </TabsContent>
          </Tabs>

          {/* Sidebar */}
          <div className="hidden lg:block relative">
            <div className="sticky top-24">
              <UnitLookupSidebar />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

