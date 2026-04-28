interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: readonly string[];
    placeholder?: string;
    allowCustom?: boolean;
}
export declare function CustomSelect({ value, onChange, options, placeholder, allowCustom, }: CustomSelectProps): import("react/jsx-runtime").JSX.Element;
export {};
