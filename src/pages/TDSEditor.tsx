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

  const { formData, units, setFormData, setUnits, resetForm, isDirty, markClean, initData } = useTDSFormStore()
  const { data: tdsRecord, isLoading } = useTDSRecord(id)
  const { data: customers } = useCustomers()
  const { data: allMachines } = useMachines()
  
  const createMutation = useCreateTDS()
  const updateMutation = useUpdateTDS()
  const statusMutation = useUpdateTDSStatus()

  const [saving, setSaving] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [activeSubTab, setActiveSubTab] = useState('job')

  const { exportToExcel, exportToPDF, exportToWord, exporting } = useExport(id || '')

  // Filter machines by selected customer
  const machines = allMachines?.filter(m => m.customer_id === selectedCustomerId) || []

  // Load existing TDS data - but don't override if there are unsaved changes
  useEffect(() => {
    if (tdsRecord && !isDirty) {
      // Only reinitialize if not dirty (no unsaved changes)
      initData(tdsRecord, tdsRecord.units || [])
      setSelectedCustomerId(tdsRecord.customer_id || '')
    } else if (isNew && !isDirty) {
      resetForm()
      // Initialize with default units based on machine selection
      const defaultUnits = Array.from({ length: formData.num_units || 10 }, (_, i) => ({
        unit_no: i + 1,
        anilox_unit: 'LPI',
        volume_unit: 'CCM',
      }))
      initData(formData, defaultUnits as any)
    }

    return () => {
      if (isNew) resetForm()
    }
  }, [tdsRecord, isNew, isDirty])



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
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-1">
            <Link to="/tds">
              <Button variant="ghost" size="sm" className="hover:bg-white/5 shrink-0">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Log
              </Button>
            </Link>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-1 h-8 bg-primary rounded-full shrink-0"></div>
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3 truncate">
                  {isNew ? 'INITIATE NEW SEQUENCE' : `SEQUENCE: ${formData.order_number}`}
                </h1>
                {!isNew && (
                  <p className="text-xs md:text-sm text-muted-foreground mt-1 font-mono truncate">
                    LOGGED {formatDateTime(formData.created_at)}
                    {formData.prepared_by && user && ` // OP: ${user.fullName}`}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto justify-start md:justify-end">
            {!isNew && (
              <>
                <StatusBadge status={formData.status as any} />
                {canEdit() && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded bg-white/5 border border-white/10">
                      {autoSaving ? (
                        <>
                          <Cloud className="h-3 w-3 animate-pulse text-secondary" />
                          <span className="text-secondary">AUTO-SYNCING...</span>
                        </>
                      ) : isDirty ? (
                        <>
                          <Cloud className="h-3 w-3 text-warning" />
                          <span className="text-warning">PENDING CHANGES</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-success" />
                          <span className="text-success">ALL CHANGES SYNCED</span>
                        </>
                      )}
                    </div>
                    
                    {isDirty && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleSave()} 
                        disabled={saving}
                        className="bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 animate-pulse"
                      >
                        <Cloud className="mr-2 h-3 w-3" />
                        SYNC NOW
                      </Button>
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
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          {/* Main Form */}
          <Tabs defaultValue="form" className="space-y-6">
            <TabsList className="glass-panel border-white/5 p-1 h-auto inline-flex rounded-lg">
              <TabsTrigger value="form" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary px-6 py-2.5 rounded-md font-semibold tracking-wide text-sm transition-all">TDS SEQUENCE</TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary px-6 py-2.5 rounded-md font-semibold tracking-wide text-sm transition-all">SYSTEM LOG</TabsTrigger>
            </TabsList>

            <TabsContent value="form" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Header Section */}
            <div className="glass-panel border-primary/20 p-4 md:p-6 space-y-4 relative overflow-hidden rounded-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-white/10 pb-4">
                  <div>
                    <h2 className="text-lg md:text-xl font-black text-foreground tracking-[0.15em] uppercase">
                      FLEXO NARROW WEB
                    </h2>
                    <p className="text-primary tracking-[0.2em] text-xs font-semibold mt-0.5">TECHNICAL DATA SHEET</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 text-left">
                  <div className="space-y-1.5">
                    <Label className="label-caps text-muted-foreground text-[10px]">Client Identifier</Label>
                    <Select
                      value={selectedCustomerId}
                      onValueChange={(value) => {
                        setSelectedCustomerId(value)
                        setFormData({ ...formData, customer_id: value, machine_id: undefined })
                      }}
                      disabled={!canEdit()}
                    >
                      <SelectTrigger className="bg-background/50 border-white/10 h-10 w-full">
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

                  <div className="space-y-1.5">
                    <Label className="label-caps text-muted-foreground text-[10px]">Hardware Unit</Label>
                    <Select
                      value={formData.machine_id || ''}
                      onValueChange={handleMachineChange}
                      disabled={!selectedCustomerId || !canEdit()}
                    >
                      <SelectTrigger className="bg-background/50 border-white/10 h-10 w-full">
                        <SelectValue placeholder="Assign Hardware" />
                      </SelectTrigger>
                      <SelectContent className="glass-modal border-white/10">
                        {machines.map((machine) => (
                          <SelectItem key={machine.id} value={machine.id} className="cursor-pointer">
                            <div className="flex items-center justify-between w-full gap-4">
                              <span className="font-medium">{machine.machine_code}</span>
                              <span className="text-[10px] text-muted-foreground font-mono bg-white/5 px-1.5 py-0.5 rounded shrink-0">
                                {machine.default_unit_count} UNITS
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 min-w-0 sm:col-span-2 lg:col-span-1">
                    <Label className="label-caps text-muted-foreground text-[10px]">System Designation</Label>
                    <div className="h-10 px-3 py-2 border border-white/5 rounded-md bg-white/[0.02] flex items-center text-sm font-mono text-muted-foreground/80 overflow-hidden">
                      <span className="truncate">{machines.find(m => m.id === formData.machine_id)?.machine_name || 'SIEGWERK INDIA PVT. LTD.'}</span>
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
            <div className="space-y-6 mt-8">
              <div className="glass-panel border-white/5 p-1 flex flex-wrap rounded-lg gap-1">
                {['job', 'substrate', 'printing', 'quality'].map((tab) => (
                  <button
                    key={tab}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveSubTab(tab);
                    }}
                    className={`flex-1 px-4 py-2.5 rounded-md font-semibold tracking-wide text-xs md:text-sm transition-all uppercase ${
                      activeSubTab === tab 
                        ? 'bg-primary/20 text-primary shadow-sm' 
                        : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                    }`}
                  >
                    {tab === 'job' ? 'JOB INFO' : tab === 'substrate' ? 'SUBSTRATE' : tab === 'printing' ? 'PRINTING' : 'QUALITY'}
                  </button>
                ))}
              </div>
              
              <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {activeSubTab === 'job' && <JobInfoSection />}
                {activeSubTab === 'substrate' && <SubstrateSection />}
                {activeSubTab === 'printing' && <UnitSequenceTable />}
                {activeSubTab === 'quality' && <QualitySection />}
              </div>
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

