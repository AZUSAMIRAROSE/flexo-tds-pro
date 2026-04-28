export declare function useExport(tdsId: string): {
    exportToExcel: () => Promise<void>;
    exportToPDF: () => Promise<void>;
    exportToWord: () => Promise<void>;
    exporting: boolean;
};
