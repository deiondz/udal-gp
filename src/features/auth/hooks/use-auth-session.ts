"use client";

import { authClient } from "~/lib/auth-client";

/**
 * Synchronous hook to get the current auth session
 * Uses better-auth's useSession hook which is reactive and doesn't require async/await
 */
export function useAuthSession() {
    const { data: session, isPending, error } = authClient.useSession();

    return {
        session,
        user: session?.user ?? null,
        isPending,
        isAuthenticated: !!session?.user,
        error,
        signOut: () => authClient.signOut(),
    };
}

