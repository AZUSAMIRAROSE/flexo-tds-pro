import type { TDSRecordWithRelations } from '@/types/tds.types';
export declare function injectDataIntoExcelTemplate(templateBuffer: ArrayBuffer, tdsData: TDSRecordWithRelations): Promise<Blob>;
export declare function downloadExcel(blob: Blob, filename: string): void;
