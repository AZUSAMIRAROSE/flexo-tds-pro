import { useEffect, useRef } from 'react'
import { useUpdateTDS } from './useTDS'
import { useTDSFormStore } from '@/stores/tdsFormStore'
import { useDebounce } from './useDebounce'

export function useAutoSave(tdsId: string | undefined, enabled: boolean = true) {
  const { formData, units, isDirty, markClean } = useTDSFormStore()
  const updateMutation = useUpdateTDS()
  const lastSavedRef = useRef<string>('')
  const isSavingRef = useRef(false)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Debounce form data changes (1000ms - increased for better stability)
  const debouncedFormData = useDebounce(formData, 1000)
  const debouncedUnits = useDebounce(units, 1000)

  useEffect(() => {
    if (!enabled || !tdsId || !isDirty || isSavingRef.current) return

    const currentSnapshot = JSON.stringify({ formData: debouncedFormData, units: debouncedUnits })
    
    if (currentSnapshot === lastSavedRef.current) return

    const autoSave = async () => {
      isSavingRef.current = true
      
      // Capture the modification timestamp BEFORE we start saving.
      // If this changes by the time save completes, the user made new edits.
      const modifiedAtBeforeSave = useTDSFormStore.getState()._lastModifiedAt
      
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
        
        // Smart markClean: only mark clean if the user did NOT make
        // additional changes while the save was in-flight.
        const modifiedAtAfterSave = useTDSFormStore.getState()._lastModifiedAt
        if (modifiedAtAfterSave === modifiedAtBeforeSave) {
          markClean()
        }
        // else: user changed something during save — stay dirty for next cycle
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFormData, debouncedUnits, tdsId, enabled, isDirty])

  return {
    isSaving: updateMutation.isPending || isSavingRef.current,
    lastSaved: lastSavedRef.current ? new Date() : null,
  }
}