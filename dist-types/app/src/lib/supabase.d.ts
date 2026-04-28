import type { Database } from '@/types/database.types';
export declare const supabase: import("@supabase/supabase-js").SupabaseClient<Database, "public", "public", {
    Tables: {
        customers: {
            Row: {
                id: string;
                name: string;
                location: string | null;
                created_at: string;
                created_by: string | null;
                updated_at: string;
            };
            Insert: {
                id?: string;
                name: string;
                location?: string | null;
                created_at?: string;
                created_by?: string | null;
                updated_at?: string;
            };
            Update: {
                id?: string;
                name?: string;
                location?: string | null;
                created_at?: string;
                created_by?: string | null;
                updated_at?: string;
            };
            Relationships: [];
        };
        machines: {
            Row: {
                id: string;
                customer_id: string;
                machine_code: string;
                machine_name: string | null;
                default_unit_count: number;
                created_at: string;
                updated_at: string;
            };
            Insert: {
                id?: string;
                customer_id: string;
                machine_code: string;
                machine_name?: string | null;
                default_unit_count?: number;
                created_at?: string;
                updated_at?: string;
            };
            Update: {
                id?: string;
                customer_id?: string;
                machine_code?: string;
                machine_name?: string | null;
                default_unit_count?: number;
                created_at?: string;
                updated_at?: string;
            };
            Relationships: [{
                foreignKeyName: "machines_customer_id_fkey";
                columns: ["customer_id"];
                isOneToOne: false;
                referencedRelation: "customers";
                referencedColumns: ["id"];
            }];
        };
        tds_records: {
            Row: {
                id: string;
                customer_id: string | null;
                machine_id: string | null;
                date: string;
                order_number: string;
                num_units: number | null;
                job_type: string | null;
                job_product_name: string | null;
                design_artwork_bromide: string | null;
                operator_name: string | null;
                speed_mpm: number | null;
                downtime_min: number | null;
                shift_no: string | null;
                action_on_job: string | null;
                substrate_laminate: string | null;
                surface_type: string | null;
                width_mm: number | null;
                corona_treatment: boolean;
                corona_wattage: number | null;
                corona_treatment_side: string | null;
                corona_dyne_level: number | null;
                foil_supplier: string | null;
                foil_type: string | null;
                foil_colour_finish: string | null;
                tape_test: string | null;
                flow_marks: string | null;
                flex_test: string | null;
                graphite_test: string | null;
                adhesion_test: string | null;
                rub_scuff_test: string | null;
                ink_lay_tone_check: string | null;
                overall_result: string | null;
                quality_notes: string | null;
                status: string;
                prepared_by: string | null;
                prepared_at: string;
                approved_by: string | null;
                approved_at: string | null;
                created_at: string;
                updated_at: string;
            };
            Insert: {
                id?: string;
                customer_id?: string | null;
                machine_id?: string | null;
                date?: string;
                order_number: string;
                num_units?: number | null;
                job_type?: string | null;
                job_product_name?: string | null;
                design_artwork_bromide?: string | null;
                operator_name?: string | null;
                speed_mpm?: number | null;
                downtime_min?: number | null;
                shift_no?: string | null;
                action_on_job?: string | null;
                substrate_laminate?: string | null;
                surface_type?: string | null;
                width_mm?: number | null;
                corona_treatment?: boolean;
                corona_wattage?: number | null;
                corona_treatment_side?: string | null;
                corona_dyne_level?: number | null;
                foil_supplier?: string | null;
                foil_type?: string | null;
                foil_colour_finish?: string | null;
                tape_test?: string | null;
                flow_marks?: string | null;
                flex_test?: string | null;
                graphite_test?: string | null;
                adhesion_test?: string | null;
                rub_scuff_test?: string | null;
                ink_lay_tone_check?: string | null;
                overall_result?: string | null;
                quality_notes?: string | null;
                status?: string;
                prepared_by?: string | null;
                prepared_at?: string;
                approved_by?: string | null;
                approved_at?: string | null;
                created_at?: string;
                updated_at?: string;
            };
            Update: {
                id?: string;
                customer_id?: string | null;
                machine_id?: string | null;
                date?: string;
                order_number?: string;
                num_units?: number | null;
                job_type?: string | null;
                job_product_name?: string | null;
                design_artwork_bromide?: string | null;
                operator_name?: string | null;
                speed_mpm?: number | null;
                downtime_min?: number | null;
                shift_no?: string | null;
                action_on_job?: string | null;
                substrate_laminate?: string | null;
                surface_type?: string | null;
                width_mm?: number | null;
                corona_treatment?: boolean;
                corona_wattage?: number | null;
                corona_treatment_side?: string | null;
                corona_dyne_level?: number | null;
                foil_supplier?: string | null;
                foil_type?: string | null;
                foil_colour_finish?: string | null;
                tape_test?: string | null;
                flow_marks?: string | null;
                flex_test?: string | null;
                graphite_test?: string | null;
                adhesion_test?: string | null;
                rub_scuff_test?: string | null;
                ink_lay_tone_check?: string | null;
                overall_result?: string | null;
                quality_notes?: string | null;
                status?: string;
                prepared_by?: string | null;
                prepared_at?: string;
                approved_by?: string | null;
                approved_at?: string | null;
                created_at?: string;
                updated_at?: string;
            };
            Relationships: [{
                foreignKeyName: "tds_records_customer_id_fkey";
                columns: ["customer_id"];
                isOneToOne: false;
                referencedRelation: "customers";
                referencedColumns: ["id"];
            }, {
                foreignKeyName: "tds_records_machine_id_fkey";
                columns: ["machine_id"];
                isOneToOne: false;
                referencedRelation: "machines";
                referencedColumns: ["id"];
            }];
        };
        tds_units: {
            Row: {
                id: string;
                tds_record_id: string;
                unit_no: number;
                color_station: string | null;
                anilox_value: number | null;
                anilox_unit: string | null;
                volume_value: number | null;
                volume_unit: string | null;
                ink_name: string | null;
                batch_code: string | null;
                lamp_hrs: number | null;
                intensity_pct: number | null;
                unit_remarks: string | null;
                plate_tape: string | null;
                created_at: string;
                updated_at: string;
            };
            Insert: {
                id?: string;
                tds_record_id: string;
                unit_no: number;
                color_station?: string | null;
                anilox_value?: number | null;
                anilox_unit?: string | null;
                volume_value?: number | null;
                volume_unit?: string | null;
                ink_name?: string | null;
                batch_code?: string | null;
                lamp_hrs?: number | null;
                intensity_pct?: number | null;
                unit_remarks?: string | null;
                plate_tape?: string | null;
                created_at?: string;
                updated_at?: string;
            };
            Update: {
                id?: string;
                tds_record_id?: string;
                unit_no?: number;
                color_station?: string | null;
                anilox_value?: number | null;
                anilox_unit?: string | null;
                volume_value?: number | null;
                volume_unit?: string | null;
                ink_name?: string | null;
                batch_code?: string | null;
                lamp_hrs?: number | null;
                intensity_pct?: number | null;
                unit_remarks?: string | null;
                plate_tape?: string | null;
                created_at?: string;
                updated_at?: string;
            };
            Relationships: [{
                foreignKeyName: "tds_units_tds_record_id_fkey";
                columns: ["tds_record_id"];
                isOneToOne: false;
                referencedRelation: "tds_records";
                referencedColumns: ["id"];
            }];
        };
        activity_log: {
            Row: {
                id: string;
                tds_record_id: string | null;
                user_id: string | null;
                action: string;
                field_name: string | null;
                old_value: string | null;
                new_value: string | null;
                timestamp: string;
            };
            Insert: {
                id?: string;
                tds_record_id?: string | null;
                user_id?: string | null;
                action: string;
                field_name?: string | null;
                old_value?: string | null;
                new_value?: string | null;
                timestamp?: string;
            };
            Update: {
                id?: string;
                tds_record_id?: string | null;
                user_id?: string | null;
                action?: string;
                field_name?: string | null;
                old_value?: string | null;
                new_value?: string | null;
                timestamp?: string;
            };
            Relationships: [{
                foreignKeyName: "activity_log_tds_record_id_fkey";
                columns: ["tds_record_id"];
                isOneToOne: false;
                referencedRelation: "tds_records";
                referencedColumns: ["id"];
            }];
        };
        user_roles: {
            Row: {
                user_id: string;
                role: string;
                assigned_by: string | null;
                assigned_at: string;
            };
            Insert: {
                user_id: string;
                role: string;
                assigned_by?: string | null;
                assigned_at?: string;
            };
            Update: {
                user_id?: string;
                role?: string;
                assigned_by?: string | null;
                assigned_at?: string;
            };
            Relationships: [];
        };
    };
    Views: { [_ in never]: never; };
    Functions: {
        has_role: {
            Args: {
                check_user_id: string;
                check_role: string;
            };
            Returns: boolean;
        };
    };
    Enums: { [_ in never]: never; };
}, {
    PostgrestVersion: "12";
}>;
