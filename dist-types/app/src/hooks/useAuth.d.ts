import type { User, Session } from '@supabase/supabase-js';
import type { UserRoleType } from '@/types/tds.types';
export interface AuthUser extends User {
    roles?: UserRoleType[];
    fullName?: string;
}
export declare function useAuth(): {
    user: AuthUser | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{
        data: {
            user: User;
            session: Session;
            weakPassword?: import("@supabase/auth-js").WeakPassword;
        } | {
            user: null;
            session: null;
            weakPassword?: null | undefined;
        };
        error: import("@supabase/auth-js").AuthError | null;
    }>;
    signOut: () => Promise<{
        error: import("@supabase/auth-js").AuthError | null;
    }>;
    hasRole: (role: UserRoleType) => boolean;
    isAdmin: () => boolean;
    isTechnicalOfficer: () => boolean;
    isViewer: () => boolean;
};
