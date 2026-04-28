import type { TDSRecordWithRelations, TDSUnit } from '@/types/tds.types';
interface TDSFormState {
    formData: Partial<TDSRecordWithRelations>;
    units: TDSUnit[];
    isDirty: boolean;
    setFormData: (data: Partial<TDSRecordWithRelations>) => void;
    updateField: (field: string, value: any) => void;
    setUnits: (units: TDSUnit[]) => void;
    updateUnit: (index: number, updates: Partial<TDSUnit>) => void;
    addUnit: () => void;
    removeUnit: (index: number) => void;
    resetForm: () => void;
    markClean: () => void;
    initData: (data: Partial<TDSRecordWithRelations>, units: TDSUnit[]) => void;
}
export declare const useTDSFormStore: import("zustand").UseBoundStore<import("zustand").StoreApi<TDSFormState>>;
export {};
