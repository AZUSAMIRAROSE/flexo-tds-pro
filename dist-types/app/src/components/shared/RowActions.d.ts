interface RowActionsProps {
    record: any;
    canDelete: boolean;
    onDelete: (recordId: string) => void;
}
export declare function RowActions({ record, canDelete, onDelete }: RowActionsProps): import("react/jsx-runtime").JSX.Element;
export {};
