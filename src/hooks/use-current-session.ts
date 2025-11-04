import { useQuery } from '@tanstack/react-query'
import { authClient, type Session } from '@/lib/auth-client'

// Extended user type to include optional role and features
type ExtendedUser = Session['user'] & {
  role?: string
  allowed_features?: string[]
}

// Query keys for session-related queries
export const sessionQueryKeys = {
  all: ['session'] as const,
  current: () => [...sessionQueryKeys.all, 'current'] as const,
  user: () => [...sessionQueryKeys.current(), 'user'] as const,
}

// Fetcher function to get current session
async function fetchCurrentSession(): Promise<Session | null> {
  try {
    const session = await authClient.getSession()
    return session.data
  } catch (error) {
    console.error('Failed to fetch current session:', error)
    return null
  }
}

/**
 * Hook to retrieve the current session information using TanStack Query
 * Provides caching, loading states, and error handling for session data
 *
 * @returns Object containing session data, loading state, error state, and utility functions
 */
export function useCurrentSession() {
  const query = useQuery({
    queryKey: sessionQueryKeys.current(),
    queryFn: fetchCurrentSession,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication errors (401, 403)
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status
        if (status === 401 || status === 403) {
          return false
        }
      }
      return failureCount < 2
    },
    refetchOnWindowFocus: false, // Don't refetch on window focus for session
    refetchOnMount: true, // Always refetch on mount to ensure fresh session
  })

  const session = query.data
  const user = session?.user || null
  const isAuthenticated = !!user
  const isLoading = query.isLoading
  const isError = query.isError
  const error = query.error

  return {
    // Session data
    session,
    user,
    isAuthenticated,

    // Loading and error states
    isLoading,
    isError,
    error,

    // TanStack Query utilities
    refetch: query.refetch,
    invalidate: () => query.refetch(),

    // Convenience methods
    hasRole: (role: string) => {
      // Check if user has a specific role
      // Note: Better Auth user type doesn't include role by default
      // You may need to extend the user model or use a separate user preferences system
      return (user as ExtendedUser)?.role === role || false
    },
    hasFeature: (feature: string) => {
      // Check if user has access to a specific feature
      // This would depend on your user model structure
      // You may need to implement this through user preferences or a separate system
      return (user as ExtendedUser)?.allowed_features?.includes(feature) || false
    },

    // User info helpers
    userId: user?.id || null,
    userEmail: user?.email || null,
    userName: user?.name || null,
    userImage: user?.image || null,
  }
}

/**
 * Hook to get only the user information from the current session
 * Useful when you only need user data and not the full session object
 */
export function useCurrentUser() {
  const { user, isLoading, isError, error, refetch } = useCurrentSession()

  return {
    user,
    isLoading,
    isError,
    error,
    refetch,
    isAuthenticated: !!user,
  }
}

/**
 * Hook to check if the current user has a specific role
 * @param role - The role to check for
 */
export function useHasRole(role: string) {
  const { hasRole, isLoading } = useCurrentSession()

  return {
    hasRole: hasRole(role),
    isLoading,
  }
}

/**
 * Hook to check if the current user has access to a specific feature
 * @param feature - The feature to check for
 */
export function useHasFeature(feature: string) {
  const { hasFeature, isLoading } = useCurrentSession()

  return {
    hasFeature: hasFeature(feature),
    isLoading,
  }
}
