import { create } from 'zustand'
import { TDSRecordWithRelations, TDSUnit } from '@/types/tds.types'

interface TDSFormState {
  formData: Partial<TDSRecordWithRelations>
  units: TDSUnit[]
  isDirty: boolean
  
  setFormData: (data: Partial<TDSRecordWithRelations>) => void
  updateField: (field: string, value: any) => void
  setUnits: (units: TDSUnit[]) => void
  updateUnit: (index: number, updates: Partial<TDSUnit>) => void
  addUnit: () => void
  removeUnit: (index: number) => void
  resetForm: () => void
  markClean: () => void
  initData: (data: Partial<TDSRecordWithRelations>, units: TDSUnit[]) => void
}

export const useTDSFormStore = create<TDSFormState>((set) => ({
  formData: {},
  units: [],
  isDirty: false,

  setFormData: (data) =>
    set((state) => {
      const newState: any = { formData: data, isDirty: true }
      
      if (data.num_units !== undefined && data.num_units !== state.units.length) {
        const newCount = data.num_units
        const currentUnits = state.units
        
        if (newCount > currentUnits.length) {
          const unitsToAdd = newCount - currentUnits.length
          const newUnits = [...currentUnits]
          for (let i = 0; i < unitsToAdd; i++) {
            newUnits.push({
              unit_no: currentUnits.length + i + 1,
              anilox_unit: 'LPI',
              volume_unit: 'CCM',
            } as TDSUnit)
          }
          newState.units = newUnits
        } else {
          newState.units = currentUnits.slice(0, newCount)
        }
      }
      
      return newState
    }),

  updateField: (field, value) =>
    set((state) => {
      const newState = {
        formData: { ...state.formData, [field]: value },
        isDirty: true,
      } as Partial<TDSFormState>

      // If num_units changed, synchronize units array
      if (field === 'num_units' && typeof value === 'number') {
        const newCount = value
        const currentUnits = state.units
        
        if (newCount > currentUnits.length) {
          // Add units
          const unitsToAdd = newCount - currentUnits.length
          const newUnits = [...currentUnits]
          for (let i = 0; i < unitsToAdd; i++) {
            newUnits.push({
              unit_no: currentUnits.length + i + 1,
              anilox_unit: 'LPI',
              volume_unit: 'CCM',
            } as TDSUnit)
          }
          newState.units = newUnits
        } else if (newCount < currentUnits.length) {
          // Remove units
          newState.units = currentUnits.slice(0, newCount)
        }
      }

      return newState
    }),

  setUnits: (units) =>
    set({ units, isDirty: true }),

  updateUnit: (index, updates) =>
    set((state) => {
      const newUnits = [...state.units]
      newUnits[index] = { ...newUnits[index], ...updates }
      return { units: newUnits, isDirty: true }
    }),

  addUnit: () =>
    set((state) => {
      const newUnitNo = state.units.length + 1
      if (newUnitNo > 20) return state
      
      const newUnit: Partial<TDSUnit> = {
        unit_no: newUnitNo,
        anilox_unit: 'LPI',
        volume_unit: 'CCM',
      }
      const newUnits = [...state.units, newUnit as TDSUnit]
      return { 
        units: newUnits, 
        formData: { ...state.formData, num_units: newUnits.length },
        isDirty: true 
      }
    }),

  removeUnit: (index) =>
    set((state) => {
      const newUnits = state.units.filter((_, i) => i !== index)
      // Re-number units
      const renumberedUnits = newUnits.map((unit, i) => ({ ...unit, unit_no: i + 1 }))
      return {
        units: renumberedUnits,
        formData: { ...state.formData, num_units: renumberedUnits.length },
        isDirty: true,
      }
    }),

  resetForm: () =>
    set({ formData: { status: 'Draft' }, units: [], isDirty: false }),

  markClean: () =>
    set({ isDirty: false }),

  initData: (data, units) =>
    set({ formData: data, units, isDirty: false }),
}))