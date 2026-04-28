import type { MachineUpdate, MachineWithCustomer } from '@/types/tds.types';
export declare function useMachines(customerId?: string): import("@tanstack/react-query").UseQueryResult<MachineWithCustomer[], Error>;
export declare function useMachine(id: string | undefined): import("@tanstack/react-query").UseQueryResult<MachineWithCustomer | null, Error>;
export declare function useCreateMachine(): import("@tanstack/react-query").UseMutationResult<MachineWithCustomer, Error, {
    id?: string;
    customer_id: string;
    machine_code: string;
    machine_name?: string | null;
    default_unit_count?: number;
    created_at?: string;
    updated_at?: string;
}, unknown>;
export declare function useUpdateMachine(): import("@tanstack/react-query").UseMutationResult<MachineWithCustomer, Error, {
    id: string;
    updates: MachineUpdate;
}, unknown>;
export declare function useDeleteMachine(): import("@tanstack/react-query").UseMutationResult<void, Error, string, unknown>;
