import { type TDSStatus, type OverallResult } from '@/types/tds.types';
interface StatusBadgeProps {
    status: TDSStatus;
}
export declare function StatusBadge({ status }: StatusBadgeProps): import("react/jsx-runtime").JSX.Element;
interface QualityBadgeProps {
    result: OverallResult;
}
export declare function QualityBadge({ result }: QualityBadgeProps): import("react/jsx-runtime").JSX.Element;
export {};
