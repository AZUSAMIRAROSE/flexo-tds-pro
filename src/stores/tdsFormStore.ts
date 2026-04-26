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
    set({ formData: data, isDirty: true }),

  updateField: (field, value) =>
    set((state) => ({
      formData: { ...state.formData, [field]: value },
      isDirty: true,
    })),

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
      return { units: [...state.units, newUnit as TDSUnit], isDirty: true }
    }),

  removeUnit: (index) =>
    set((state) => {
      const newUnits = state.units.filter((_, i) => i !== index)
      // Re-number units
      return {
        units: newUnits.map((unit, i) => ({ ...unit, unit_no: i + 1 })),
        isDirty: true,
      }
    }),

  resetForm: () =>
    set({ formData: {}, units: [], isDirty: false }),

  markClean: () =>
    set({ isDirty: false }),

  initData: (data, units) =>
    set({ formData: data, units, isDirty: false }),
}))