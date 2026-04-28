export declare function useTemplates(): {
    uploadTemplate: (file: File) => Promise<boolean>;
    getTemplateUrl: () => Promise<string | null>;
    downloadTemplate: () => Promise<ArrayBuffer | null>;
    uploading: boolean;
};
