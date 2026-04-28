import type { TDSRecordWithRelations } from '@/types/tds.types';
export declare function generatePDF(data: TDSRecordWithRelations): Promise<Blob>;
export declare function downloadPDF(blob: Blob, filename: string): void;
