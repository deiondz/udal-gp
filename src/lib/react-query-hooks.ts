/**
 * TanStack Query utility hooks and helpers
 * 
 * This file contains reusable query hooks and utilities for data fetching.
 * 
 * Example usage:
 * ```tsx
 * // In a component
 * const { data: user, isLoading } = useUser();
 * 
 * // Mutations
 * const mutation = useUserMutation();
 * mutation.mutate({ name: "John" });
 * ```
 */

export { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Re-export commonly used types
export type {
    UseQueryResult,
    UseMutationResult,
    QueryClient,
} from "@tanstack/react-query";
