interface BatchCodeInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    className?: string;
}
export declare function BatchCodeInput({ value, onChange, onBlur, placeholder, className, ...props }: BatchCodeInputProps): import("react/jsx-runtime").JSX.Element;
export {};
