import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { 
  TDSRecord, 
  TDSRecordInsert, 
  TDSRecordUpdate, 
  TDSRecordWithRelations,
  TDSUnitInsert,
  TDSUnitUpdate 
} from '@/types/tds.types'
import { toast } from '@/components/ui/use-toast'
import { computeOverallResult } from '@/lib/utils'
import { logActivity } from '@/lib/activityLog'

const TDS_RECORD_COLUMNS = [
  'customer_id',
  'machine_id',
  'date',
  'order_number',
  'num_units',
  'job_type',
  'job_product_name',
  'design_artwork_bromide',
  'operator_name',
  'speed_mpm',
  'downtime_min',
  'shift_no',
  'action_on_job',
  'substrate_laminate',
  'surface_type',
  'width_mm',
  'corona_treatment',
  'corona_wattage',
  'corona_treatment_side',
  'corona_dyne_level',
  'foil_supplier',
  'foil_type',
  'foil_colour_finish',
  'tape_test',
  'flow_marks',
  'flex_test',
  'graphite_test',
  'adhesion_test',
  'rub_scuff_test',
  'ink_lay_tone_check',
  'overall_result',
  'quality_notes',
  'status',
  'prepared_by',
  'prepared_at',
  'approved_by',
  'approved_at',
] as const

const TDS_UNIT_COLUMNS = [
  'tds_record_id',
  'unit_no',
  'color_station',
  'anilox_value',
  'anilox_unit',
  'volume_value',
  'volume_unit',
  'ink_name',
  'batch_code',
  'lamp_hrs',
  'intensity_pct',
  'unit_remarks',
  'plate_tape',
] as const

const NUMERIC_RULES: Record<string, { min?: number; max?: number; integer?: boolean }> = {
  num_units: { min: 1, max: 20, integer: true },
  speed_mpm: { min: 0, max: 500, integer: true },
  downtime_min: { min: 0, max: 999, integer: true },
  width_mm: { min: 50, max: 2000, integer: true },
  corona_wattage: { min: 0, max: 2000, integer: true },
  corona_dyne_level: { min: 0, max: 100, integer: true },
  unit_no: { min: 1, max: 20, integer: true },
  lamp_hrs: { min: 0, max: 9999, integer: true },
  intensity_pct: { min: 0, max: 100, integer: true },
}

function normalizePayloadValue(column: string, value: unknown) {
  if (value === undefined) return undefined
  if (value === '') return null

  const numericRule = NUMERIC_RULES[column]
  if (!numericRule) {
    if (typeof value === 'number' && !Number.isFinite(value)) return null
    return value
  }

  if (value === null) return null

  const numericValue = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numericValue)) return null

  return numericRule.integer ? Math.trunc(numericValue) : numericValue
}

function assertNumericRules(payload: Record<string, unknown>, context: string) {
  Object.entries(NUMERIC_RULES).forEach(([column, rule]) => {
    const value = payload[column]
    if (value === null || value === undefined) return
    if (typeof value !== 'number' || !Number.isFinite(value)) return

    if (rule.min !== undefined && value < rule.min) {
      throw new Error(`${context}: ${column} must be at least ${rule.min}.`)
    }

    if (rule.max !== undefined && value > rule.max) {
      throw new Error(`${context}: ${column} must be ${rule.max} or less.`)
    }
  })
}

function assertUnitCheckConstraints(payload: Record<string, unknown>) {
  if (payload.lamp_hrs === null || payload.lamp_hrs === undefined) return
  const lampHours = payload.lamp_hrs
  if (typeof lampHours !== 'number' || lampHours < 0 || lampHours > 9999) {
    throw new Error('Lamp Hrs must be between 0 and 9999.')
  }
}

function preparePayload<T extends readonly string[]>(source: Record<string, unknown>, columns: T, context: string) {
  const payload = pickPayload(source, columns)
  assertNumericRules(payload, context)
  return payload
}

function pickPayload<T extends readonly string[]>(source: Record<string, unknown>, columns: T) {
  return columns.reduce((payload, column) => {
    const value = normalizePayloadValue(column, source[column])
    if (value !== undefined) {
      payload[column] = value
    }
    return payload
  }, {} as Record<string, unknown>)
}

function cleanTDSRecordPayload(record: TDSRecordInsert | TDSRecordUpdate) {
  return preparePayload(record as Record<string, unknown>, TDS_RECORD_COLUMNS, 'TDS record')
}

function cleanTDSUnitPayload(unit: TDSUnitInsert | TDSUnitUpdate, index?: number) {
  const context = index === undefined ? 'TDS unit' : `TDS unit ${index + 1}`
  const payload = preparePayload(unit as Record<string, unknown>, TDS_UNIT_COLUMNS, context)
  assertUnitCheckConstraints(payload)
  return payload
}

export function useTDSRecords(filters?: {
  customerId?: string
  machineId?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  includeUnits?: boolean
}) {
  return useQuery({
    queryKey: ['tds-records', filters],
    queryFn: async () => {
      const selectClause = filters?.includeUnits
        ? `
          *,
          customer:customers(*),
          machine:machines(*),
          units:tds_units(*)
        `
        : `
          *,
          customer:customers(*),
          machine:machines(*)
        `

      let query = supabase
        .from('tds_records')
        .select(selectClause)
        .order('date', { ascending: false })

      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId)
      }
      if (filters?.machineId) {
        query = query.eq('machine_id', filters.machineId)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.dateFrom) {
        query = query.gte('date', filters.dateFrom)
      }
      if (filters?.dateTo) {
        query = query.lte('date', filters.dateTo)
      }

      const { data, error } = await query

      if (error) throw error
      return data as unknown as TDSRecordWithRelations[]
    },
  })
}

export function useTDSRecord(id: string | undefined) {
  return useQuery({
    queryKey: ['tds-records', id],
    queryFn: async () => {
      if (!id) return null
      
      const { data, error } = await supabase
        .from('tds_records')
        .select(`
          *,
          customer:customers(*),
          machine:machines(*),
          units:tds_units(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      
      // Sort units by unit_no
      if (data && data.units) {
        data.units.sort((a: any, b: any) => a.unit_no - b.unit_no)
      }
      
      return data as unknown as TDSRecordWithRelations
    },
    enabled: !!id,
  })
}

export function useCreateTDS() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      record, 
      units 
    }: { 
      record: TDSRecordInsert
      units: TDSUnitInsert[]
    }) => {
      // Create TDS record
      const { data: tdsRecord, error: recordError } = await supabase
        .from('tds_records')
        .insert(cleanTDSRecordPayload(record) as any)
        .select()
        .single()

      if (recordError) throw recordError

      // Create units
      if (units.length > 0) {
        const unitsWithTdsId = units.map((unit, index) => ({
          ...cleanTDSUnitPayload(unit, index),
          tds_record_id: tdsRecord.id,
        }))

        const { error: unitsError } = await supabase
          .from('tds_units')
          .insert(unitsWithTdsId as any)

        if (unitsError) throw unitsError
      }

      await logActivity({
        tdsRecordId: tdsRecord.id,
        action: 'created',
      })

      return tdsRecord as TDSRecord
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tds-records'] })
      toast({
        title: 'TDS created',
        description: 'TDS record has been successfully created.',
      })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error creating TDS',
        description: error.message,
      })
    },
  })
}

export function useUpdateTDS() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates,
      unitUpdates
    }: { 
      id: string
      updates: TDSRecordUpdate
      unitUpdates?: TDSUnitUpdate[]
      isAutoSave?: boolean
    }) => {
      // Auto-compute overall result if quality tests changed
      if (updates.tape_test || updates.flow_marks || updates.flex_test || 
          updates.graphite_test || updates.adhesion_test || updates.rub_scuff_test || 
          updates.ink_lay_tone_check) {
        
        const { data: current } = await supabase
          .from('tds_records')
          .select('*')
          .eq('id', id)
          .single()

        if (current) {
          const merged = { ...current, ...updates }
          updates.overall_result = computeOverallResult({
            tape_test: merged.tape_test,
            flow_marks: merged.flow_marks,
            flex_test: merged.flex_test,
            graphite_test: merged.graphite_test,
            adhesion_test: merged.adhesion_test,
            rub_scuff_test: merged.rub_scuff_test,
            ink_lay_tone_check: merged.ink_lay_tone_check,
          })
        }
      }

      // Update TDS record
      const { error } = await supabase
        .from('tds_records')
        .update(cleanTDSRecordPayload(updates) as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Handle unit updates: delete old ones, update existing, insert new
      if (unitUpdates !== undefined) {
        // Get current units from database
        const { data: currentUnits, error: fetchError } = await supabase
          .from('tds_units')
          .select('id')
          .eq('tds_record_id', id)

        if (fetchError) throw fetchError

        const currentUnitIds = new Set(currentUnits?.map((u: any) => u.id) || [])
        const newUnitIds = new Set(unitUpdates.filter(u => u.id).map(u => u.id!))

        // Delete units that are no longer in the array
        const unitsToDelete = Array.from(currentUnitIds).filter((id: any) => !newUnitIds.has(id)) as string[]
        if (unitsToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('tds_units')
            .delete()
            .in('id', unitsToDelete)

          if (deleteError) throw deleteError
        }

        // Update or insert units
        for (const [index, unit] of unitUpdates.entries()) {
          if (unit.id && newUnitIds.has(unit.id)) {
            // Update existing unit
            const { error: unitError } = await supabase
              .from('tds_units')
              .update(cleanTDSUnitPayload(unit, index) as any)
              .eq('id', unit.id)

            if (unitError) throw unitError
          } else if (!unit.id) {
            // Insert new unit
            const { error: insertError } = await supabase
              .from('tds_units')
              .insert({
                ...cleanTDSUnitPayload(unit, index),
                tds_record_id: id,
              } as any)

            if (insertError) throw insertError
          }
        }
      }

      await logActivity({
        tdsRecordId: id,
        action: 'updated',
      })

      // Fetch the full updated record to return and update cache
      const { data: updatedRecord, error: reloadError } = await supabase
        .from('tds_records')
        .select(`
          *,
          customer:customers(*),
          machine:machines(*),
          units:tds_units(*)
        `)
        .eq('id', id)
        .single()

      if (reloadError) throw reloadError

      // Sort units by unit_no
      if (updatedRecord && (updatedRecord as any).units) {
        (updatedRecord as any).units.sort((a: any, b: any) => a.unit_no - b.unit_no)
      }

      return updatedRecord as unknown as TDSRecordWithRelations
    },
    onSuccess: (data, variables) => {
      // Update single-record cache with fresh data
      queryClient.setQueryData(['tds-records', variables.id], data)
      
      if (variables.isAutoSave) {
        // Auto-save: ONLY update cache silently. 
        // DO NOT invalidateQueries — that triggers a refetch which can 
        // overwrite the user's in-progress form edits.
      } else {
        // Manual save: full cache invalidation + user feedback
        queryClient.invalidateQueries({ queryKey: ['tds-records'] })
        toast({
          title: 'TDS updated',
          description: 'TDS record has been successfully updated.',
        })
      }
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error updating TDS',
        description: error.message,
      })
    },
  })
}

export function useUpdateTDSStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: TDSRecordUpdate = { status }

      if (status === 'Approved') {
        updates.approved_at = new Date().toISOString()
        updates.approved_by = (await supabase.auth.getUser()).data.user?.id
      }

      const { data, error } = await supabase
        .from('tds_records')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      await logActivity({
        tdsRecordId: id,
        action: status.toLowerCase(),
      })

      return data as TDSRecord
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tds-records', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['tds-records'] })
      toast({
        title: 'Status updated',
        description: `TDS has been marked as ${variables.status}.`,
      })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error updating status',
        description: error.message,
      })
    },
  })
}

export function useDeleteTDS() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tds_records')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tds-records'] })
      toast({
        title: 'TDS deleted',
        description: 'TDS record has been successfully deleted.',
      })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error deleting TDS',
        description: error.message,
      })
    },
  })
}

export function useBatchCodeSuggestions(query: string) {
  return useQuery({
    queryKey: ['batch-codes', query],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tds_units')
        .select('batch_code, ink_name, created_at')
        .ilike('batch_code', `%${query}%`)
        .not('batch_code', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      
      // Group by batch code and count usage
      const grouped = data.reduce((acc: any[], item: any) => {
        const existing = acc.find((x: any) => x.batch_code === item.batch_code)
        if (existing) {
          existing.usage_count = (existing.usage_count || 0) + 1
        } else {
          acc.push({ ...item, usage_count: 1 })
        }
        return acc
      }, [] as any[])

      return grouped
    },
    enabled: query.length >= 2,
  })
}
