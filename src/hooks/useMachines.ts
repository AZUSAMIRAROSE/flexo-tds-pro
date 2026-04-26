import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Machine, MachineInsert, MachineUpdate, MachineWithCustomer } from '@/types/tds.types'
import { toast } from '@/components/ui/use-toast'

export function useMachines(customerId?: string) {
  return useQuery({
    queryKey: customerId ? ['machines', customerId] : ['machines'],
    queryFn: async () => {
      let query = supabase
        .from('machines')
        .select('*, customer:customers(*)')
        .order('machine_code')

      if (customerId) {
        query = query.eq('customer_id', customerId)
      }

      const { data, error } = await query

      if (error) throw error
      return data as MachineWithCustomer[]
    },
  })
}

export function useMachine(id: string | undefined) {
  return useQuery({
    queryKey: ['machines', id],
    queryFn: async () => {
      if (!id) return null
      
      const { data, error } = await supabase
        .from('machines')
        .select('*, customer:customers(*)')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as MachineWithCustomer
    },
    enabled: !!id,
  })
}

export function useCreateMachine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (machine: MachineInsert) => {
      const { data, error } = await supabase
        .from('machines')
        .insert(machine)
        .select('*, customer:customers(*)')
        .single()

      if (error) throw error
      return data as MachineWithCustomer
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machines'] })
      toast({
        title: 'Machine created',
        description: 'Machine has been successfully created.',
      })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error creating machine',
        description: error.message,
      })
    },
  })
}

export function useUpdateMachine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: MachineUpdate }) => {
      const { data, error } = await supabase
        .from('machines')
        .update(updates)
        .eq('id', id)
        .select('*, customer:customers(*)')
        .single()

      if (error) throw error
      return data as MachineWithCustomer
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machines'] })
      toast({
        title: 'Machine updated',
        description: 'Machine has been successfully updated.',
      })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error updating machine',
        description: error.message,
      })
    },
  })
}

export function useDeleteMachine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('machines')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['machines'] })
      toast({
        title: 'Machine deleted',
        description: 'Machine has been successfully deleted.',
      })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error deleting machine',
        description: error.message,
      })
    },
  })
}