import type { Database } from './database.types';
export type Customer = Database['public']['Tables']['customers']['Row'];
export type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
export type CustomerUpdate = Database['public']['Tables']['customers']['Update'];
export type Machine = Database['public']['Tables']['machines']['Row'];
export type MachineInsert = Database['public']['Tables']['machines']['Insert'];
export type MachineUpdate = Database['public']['Tables']['machines']['Update'];
export type TDSRecord = Database['public']['Tables']['tds_records']['Row'];
export type TDSRecordInsert = Database['public']['Tables']['tds_records']['Insert'];
export type TDSRecordUpdate = Database['public']['Tables']['tds_records']['Update'];
export type TDSUnit = Database['public']['Tables']['tds_units']['Row'];
export type TDSUnitInsert = Database['public']['Tables']['tds_units']['Insert'];
export type TDSUnitUpdate = Database['public']['Tables']['tds_units']['Update'];
export type ActivityLog = Database['public']['Tables']['activity_log']['Row'];
export type UserRole = Database['public']['Tables']['user_roles']['Row'];
export interface TDSRecordWithRelations extends TDSRecord {
    customer?: Customer | null;
    machine?: Machine | null;
    units?: TDSUnit[];
}
export interface MachineWithCustomer extends Machine {
    customer?: Customer;
}
export type TDSStatus = 'Draft' | 'Completed' | 'Approved';
export type TestResult = 'Pass' | 'Fail' | 'N/A';
export type OverallResult = 'Pass' | 'Conditional' | 'Fail';
export type PlateTapeColor = 'Red' | 'Blue' | 'Green' | 'Orange';
export type AniloxUnit = 'LPI' | 'LCM';
export type VolumeUnit = 'CCM' | 'BCM';
export type UserRoleType = 'Admin' | 'Technical Officer' | 'Viewer';
export interface BatchCodeSuggestion {
    batch_code: string;
    ink_name: string | null;
    created_at: string;
    usage_count?: number;
}
