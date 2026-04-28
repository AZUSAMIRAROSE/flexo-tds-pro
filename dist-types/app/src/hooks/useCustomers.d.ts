import type { CustomerUpdate } from '@/types/tds.types';
export declare function useCustomers(): import("@tanstack/react-query").UseQueryResult<{
    id: string;
    name: string;
    location: string | null;
    created_at: string;
    created_by: string | null;
    updated_at: string;
}[], Error>;
export declare function useCustomer(id: string | undefined): import("@tanstack/react-query").UseQueryResult<{
    id: string;
    name: string;
    location: string | null;
    created_at: string;
    created_by: string | null;
    updated_at: string;
} | null, Error>;
export declare function useCreateCustomer(): import("@tanstack/react-query").UseMutationResult<{
    id: string;
    name: string;
    location: string | null;
    created_at: string;
    created_by: string | null;
    updated_at: string;
}, Error, {
    id?: string;
    name: string;
    location?: string | null;
    created_at?: string;
    created_by?: string | null;
    updated_at?: string;
}, unknown>;
export declare function useUpdateCustomer(): import("@tanstack/react-query").UseMutationResult<{
    id: string;
    name: string;
    location: string | null;
    created_at: string;
    created_by: string | null;
    updated_at: string;
}, Error, {
    id: string;
    updates: CustomerUpdate;
}, unknown>;
export declare function useDeleteCustomer(): import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
