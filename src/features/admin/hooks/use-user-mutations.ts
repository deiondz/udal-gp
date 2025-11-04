import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'
import type {
  BanUserInput,
  CreateUserInput,
  DeleteUserInput,
  ImpersonateUserInput,
  RevokeUserSessionInput,
  Session,
  SetPasswordInput,
  SetRoleInput,
  UnbanUserInput,
  UpdateUserInput,
} from '../schema/schema'
import { usersQueryKeys } from './use-users'

// Helper function to get current user ID
async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await authClient.getSession()
    return session.data?.user?.id || null
  } catch {
    return null
  }
}

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateUserInput) => {
      const { data, error } = await authClient.admin.createUser(input)
      if (error) throw new Error(error.message || 'Failed to create user')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all })
      toast.success('User created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create user')
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateUserInput) => {
      const currentUserId = await getCurrentUserId()
      if (currentUserId && input.userId === currentUserId && input.data?.role) {
        throw new Error('You cannot change your own role')
      }
      const { data, error } = await authClient.admin.updateUser(input)
      if (error) throw new Error(error.message || 'Failed to update user')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all })
      toast.success('User updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user')
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: DeleteUserInput) => {
      const currentUserId = await getCurrentUserId()
      if (currentUserId && input.userId === currentUserId) {
        throw new Error('You cannot delete your own account')
      }
      const { data, error } = await authClient.admin.removeUser(input)
      if (error) throw new Error(error.message || 'Failed to delete user')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all })
      toast.success('User deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete user')
    },
  })
}

export function useSetUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SetRoleInput) => {
      const currentUserId = await getCurrentUserId()
      if (currentUserId && input.userId === currentUserId) {
        throw new Error('You cannot change your own role')
      }
      const { data, error } = await authClient.admin.setRole(input)
      if (error) throw new Error(error.message || 'Failed to set user role')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all })
      toast.success('User role updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to set user role')
    },
  })
}

export function useSetUserPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SetPasswordInput) => {
      const { data, error } = await authClient.admin.setUserPassword(input)
      if (error) throw new Error(error.message || 'Failed to set password')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all })
      toast.success('Password set successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to set password')
    },
  })
}

export function useBanUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: BanUserInput) => {
      const currentUserId = await getCurrentUserId()
      if (currentUserId && input.userId === currentUserId) {
        throw new Error('You cannot ban yourself')
      }
      await authClient.admin.banUser(input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all })
      toast.success('User banned successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to ban user')
    },
  })
}

export function useUnbanUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UnbanUserInput) => {
      await authClient.admin.unbanUser(input)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all })
      toast.success('User unbanned successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unban user')
    },
  })
}

export function useImpersonateUser() {
  return useMutation({
    mutationFn: async (input: ImpersonateUserInput) => {
      const { data, error } = await authClient.admin.impersonateUser(input)
      if (error) throw new Error(error.message || 'Failed to impersonate user')
      return data
    },
    onSuccess: () => {
      toast.success('Impersonation started. Refreshing...')
      window.location.reload()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to impersonate user')
    },
  })
}

export const userSessionsQueryKeys = {
  all: ['admin', 'user-sessions'] as const,
  byUserId: (userId: string) => [...userSessionsQueryKeys.all, userId] as const,
}

export function useListUserSessions(userId: string, enabled = true) {
  return useQuery<Session[]>({
    queryKey: userSessionsQueryKeys.byUserId(userId),
    queryFn: async () => {
      const { data, error } = await authClient.admin.listUserSessions({ userId })
      if (error) throw new Error(error.message || 'Failed to list user sessions')

      // Handle different response formats
      if (Array.isArray(data)) {
        return data
      }
      if (data && typeof data === 'object') {
        const dataObj = data as Record<string, unknown>
        if (Array.isArray(dataObj.data)) {
          return dataObj.data as Session[]
        }
        if (Array.isArray(dataObj.sessions)) {
          return dataObj.sessions as Session[]
        }
      }
      return []
    },
    enabled: enabled && !!userId,
    staleTime: 10 * 1000, // 10 seconds
  })
}

export function useRevokeUserSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: RevokeUserSessionInput) => {
      const { data, error } = await authClient.admin.revokeUserSession(input)
      if (error) throw new Error(error.message || 'Failed to revoke session')
      return data
    },
    onSuccess: () => {
      // Invalidate all user sessions queries to refetch
      queryClient.invalidateQueries({ queryKey: userSessionsQueryKeys.all })
      toast.success('Session revoked successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to revoke session')
    },
  })
}

export function useRevokeUserSessions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { userId: string }) => {
      const { data, error } = await authClient.admin.revokeUserSessions(input)
      if (error) throw new Error(error.message || 'Failed to revoke sessions')
      return data
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific user's sessions query
      queryClient.invalidateQueries({ queryKey: userSessionsQueryKeys.byUserId(variables.userId) })
      toast.success('All sessions revoked successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to revoke sessions')
    },
  })
}
