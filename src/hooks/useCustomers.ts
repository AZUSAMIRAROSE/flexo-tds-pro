import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Customer, CustomerInsert, CustomerUpdate } from '@/types/tds.types'
import { toast } from '@/components/ui/use-toast'

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name')

      if (error) throw error
      return data as Customer[]
    },
  })
}

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: async () => {
      if (!id) return null
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Customer
    },
    enabled: !!id,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (customer: CustomerInsert) => {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single()

      if (error) throw error
      return data as Customer
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast({
        title: 'Customer created',
        description: 'Customer has been successfully created.',
      })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error creating customer',
        description: error.message,
      })
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: CustomerUpdate }) => {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Customer
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast({
        title: 'Customer updated',
        description: 'Customer has been successfully updated.',
      })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error updating customer',
        description: error.message,
      })
    },
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast({
        title: 'Customer deleted',
        description: 'Customer has been successfully deleted.',
      })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error deleting customer',
        description: error.message,
      })
    },
  })
}