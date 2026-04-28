import { type ClassValue } from "clsx";
export declare function cn(...inputs: ClassValue[]): string;
export declare function formatDate(date: Date | string | null | undefined, formatStr?: string): string;
export declare function formatDateTime(date: Date | string | null | undefined): string;
export declare function computeOverallResult(tests: {
    tape_test?: string | null;
    flow_marks?: string | null;
    flex_test?: string | null;
    graphite_test?: string | null;
    adhesion_test?: string | null;
    rub_scuff_test?: string | null;
    ink_lay_tone_check?: string | null;
}): 'Pass' | 'Conditional' | 'Fail';
