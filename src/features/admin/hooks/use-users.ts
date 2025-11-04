import { useQuery } from '@tanstack/react-query'
import { listUsersAction } from '../actions/admin-actions'
import type { ListUsersQuery, UserListResponse } from '../schema/schema'

export const usersQueryKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...usersQueryKeys.all, 'list'] as const,
  list: (query: ListUsersQuery) => [...usersQueryKeys.lists(), query] as const,
}

export function useUsers(query: ListUsersQuery) {
  return useQuery<UserListResponse>({
    queryKey: usersQueryKeys.list(query),
    queryFn: async () => {
      const result = await listUsersAction(query)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch users')
      }
      return result.data
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}
