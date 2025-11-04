import { z } from 'zod'

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().url().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  role: z.enum(['admin', 'user']),
  banned: z.boolean().optional().nullable(),
  banReason: z.string().optional().nullable(),
  banExpires: z.coerce.date().optional().nullable(),
  contactDetails: z.string().optional().nullable(),
})

export type User = z.infer<typeof userSchema>

export const sessionSchema = z.object({
  id: z.string(),
  token: z.string(),
  userId: z.string(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  ipAddress: z.string().optional().nullable(),
  userAgent: z.string(),
  impersonatedBy: z.string().optional().nullable(),
  contactDetails: z.string().optional().nullable(),
})

export type Session = z.infer<typeof sessionSchema>

export const userListResponseSchema = z.object({
  users: z.array(userSchema),
  total: z.number(),
  limit: z.number().optional(),
  offset: z.number().optional(),
})

export type UserListResponse = z.infer<typeof userListResponseSchema>

export const listUsersQuerySchema = z.object({
  searchValue: z.string().optional(),
  searchField: z.enum(['email', 'name']).optional(),
  searchOperator: z.enum(['contains', 'starts_with', 'ends_with']).optional(),
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
  sortBy: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
  filterField: z.string().optional(),
  filterValue: z.string().optional(),
  filterOperator: z.enum(['eq', 'ne', 'lt', 'lte', 'gt', 'gte']).optional(),
})

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>

export const createUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['admin', 'user']).optional(),
  data: z.object({
    contactDetails: z.string().optional(),
  }),
})

export type CreateUserInput = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  userId: z.string(),
  data: z
    .object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      role: z.enum(['admin', 'user']).optional(),
      data: z.record(z.string(), z.unknown()).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>

export const setRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(['admin', 'user']),
})

export type SetRoleInput = z.infer<typeof setRoleSchema>

export const setPasswordSchema = z.object({
  userId: z.string(),
  newPassword: z.string(),
})

export type SetPasswordInput = z.infer<typeof setPasswordSchema>

export const banUserSchema = z.object({
  userId: z.string(),
  banReason: z.string().optional(),
  banExpiresIn: z.number().optional(),
})

export type BanUserInput = z.infer<typeof banUserSchema>

export const unbanUserSchema = z.object({
  userId: z.string(),
})

export type UnbanUserInput = z.infer<typeof unbanUserSchema>

export const deleteUserSchema = z.object({
  userId: z.string(),
})

export type DeleteUserInput = z.infer<typeof deleteUserSchema>

export const impersonateUserSchema = z.object({
  userId: z.string(),
})

export type ImpersonateUserInput = z.infer<typeof impersonateUserSchema>

export const listUserSessionsSchema = z.object({
  userId: z.string(),
})

export type ListUserSessionsInput = z.infer<typeof listUserSessionsSchema>

export const revokeUserSessionSchema = z.object({
  sessionToken: z.string(),
})

export type RevokeUserSessionInput = z.infer<typeof revokeUserSessionSchema>
