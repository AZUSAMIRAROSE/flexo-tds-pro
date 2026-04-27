import { useEffect, useRef } from 'react'
import { useUpdateTDS } from './useTDS'
import { useTDSFormStore } from '@/stores/tdsFormStore'
import { useDebounce } from './useDebounce'

export function useAutoSave(tdsId: string | undefined, enabled: boolean = true) {
  const { formData, units, isDirty, markClean } = useTDSFormStore()
  const updateMutation = useUpdateTDS()
  const lastSavedRef = useRef<string>('')
  const isSavingRef = useRef(false)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()

  // Debounce form data changes (1000ms - increased for better stability)
  const debouncedFormData = useDebounce(formData, 1000)
  const debouncedUnits = useDebounce(units, 1000)

  useEffect(() => {
    if (!enabled || !tdsId || !isDirty || isSavingRef.current) return

    const currentSnapshot = JSON.stringify({ formData: debouncedFormData, units: debouncedUnits })
    
    if (currentSnapshot === lastSavedRef.current) return

    const autoSave = async () => {
      isSavingRef.current = true
      try {
        // Strip nested relations to prevent schema errors
        const { customer, machine, units: _units, ...cleanFormData } = debouncedFormData as any

        await updateMutation.mutateAsync({
          id: tdsId,
          updates: cleanFormData,
          unitUpdates: debouncedUnits as any,
          isAutoSave: true,
        })
        
        lastSavedRef.current = currentSnapshot
        markClean()
      } catch (error) {
        console.error('Auto-save failed:', error)
        // Don't mark clean on error so it retries
      } finally {
        isSavingRef.current = false
      }
    }

    // Clear any existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Schedule auto-save with additional delay for debounce
    autoSaveTimeoutRef.current = setTimeout(autoSave, 300)

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [debouncedFormData, debouncedUnits, tdsId, enabled, isDirty, updateMutation])

  return {
    isSaving: updateMutation.isPending || isSavingRef.current,
    lastSaved: lastSavedRef.current ? new Date() : null,
  }
}