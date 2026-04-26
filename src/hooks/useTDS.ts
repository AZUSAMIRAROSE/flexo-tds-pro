import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { 
  TDSRecord, 
  TDSRecordInsert, 
  TDSRecordUpdate, 
  TDSRecordWithRelations,
  TDSUnitInsert,
  TDSUnitUpdate 
} from '@/types/tds.types'
import { toast } from '@/components/ui/use-toast'
import { computeOverallResult } from '@/lib/utils'

export function useTDSRecords(filters?: {
  customerId?: string
  machineId?: string
  status?: string
  dateFrom?: string
  dateTo?: string
}) {
  return useQuery({
    queryKey: ['tds-records', filters],
    queryFn: async () => {
      let query = supabase
        .from('tds_records')
        .select(`
          *,
          customer:customers(*),
          machine:machines(*),
          units:tds_units(*)
        `)
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
      return data as TDSRecordWithRelations[]
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
      return data as TDSRecordWithRelations
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
        .insert(record)
        .select()
        .single()

      if (recordError) throw recordError

      // Create units
      if (units.length > 0) {
        const unitsWithTdsId = units.map(unit => ({
          ...unit,
          tds_record_id: tdsRecord.id,
        }))

        const { error: unitsError } = await supabase
          .from('tds_units')
          .insert(unitsWithTdsId)

        if (unitsError) throw unitsError
      }

      // Log activity
      await supabase.from('activity_log').insert({
        tds_record_id: tdsRecord.id,
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
      const { data, error } = await supabase
        .from('tds_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Update units if provided
      if (unitUpdates && unitUpdates.length > 0) {
        for (const unit of unitUpdates) {
          const { error: unitError } = await supabase
            .from('tds_units')
            .update(unit)
            .eq('id', unit.id!)

          if (unitError) throw unitError
        }
      }

      // Log activity
      await supabase.from('activity_log').insert({
        tds_record_id: id,
        action: 'updated',
      })

      return data as TDSRecord
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tds-records', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['tds-records'] })
      toast({
        title: 'TDS updated',
        description: 'TDS record has been successfully updated.',
      })
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
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Log activity
      await supabase.from('activity_log').insert({
        tds_record_id: id,
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
      const grouped = data.reduce((acc, item) => {
        const existing = acc.find(x => x.batch_code === item.batch_code)
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