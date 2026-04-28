import type { TDSRecordWithRelations } from '@/types/tds.types';
export declare function generateWordDocument(data: TDSRecordWithRelations): Promise<Blob>;
export declare function downloadWord(blob: Blob, filename: string): void;
