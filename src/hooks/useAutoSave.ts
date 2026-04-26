import { useEffect, useRef } from 'react'
import { useUpdateTDS } from './useTDS'
import { useTDSFormStore } from '@/stores/tdsFormStore'
import { useDebounce } from './useDebounce'

export function useAutoSave(tdsId: string | undefined, enabled: boolean = true) {
  const { formData, units, isDirty, markClean } = useTDSFormStore()
  const updateMutation = useUpdateTDS()
  const lastSavedRef = useRef<string>('')
  const isSavingRef = useRef(false)

  // Debounce form data changes (500ms)
  const debouncedFormData = useDebounce(formData, 500)
  const debouncedUnits = useDebounce(units, 500)

  useEffect(() => {
    if (!enabled || !tdsId || !isDirty || isSavingRef.current) return

    const currentSnapshot = JSON.stringify({ formData: debouncedFormData, units: debouncedUnits })
    
    if (currentSnapshot === lastSavedRef.current) return

    const autoSave = async () => {
      isSavingRef.current = true
      try {
        await updateMutation.mutateAsync({
          id: tdsId,
          updates: debouncedFormData as any,
          unitUpdates: debouncedUnits as any,
        })
        
        lastSavedRef.current = currentSnapshot
        markClean()
      } catch (error) {
        console.error('Auto-save failed:', error)
      } finally {
        isSavingRef.current = false
      }
    }

    autoSave()
  }, [debouncedFormData, debouncedUnits, tdsId, enabled, isDirty])

  return {
    isSaving: updateMutation.isPending,
    lastSaved: lastSavedRef.current ? new Date() : null,
  }
}