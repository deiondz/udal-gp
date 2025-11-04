'use server'

import { headers } from 'next/headers'
import { z } from 'zod'

import {
  type ListUsersQuery,
  listUsersQuerySchema,
  type UserListResponse,
  userListResponseSchema,
} from '../schema/schema'
import { auth } from 'auth';

export async function listUsersAction(
  query: ListUsersQuery
): Promise<{ success: boolean; data?: UserListResponse; error?: string }> {
  try {
    const validatedQuery = listUsersQuerySchema.parse(query)
    const headersList = await headers()

    const result = await auth.api.listUsers({
      query: validatedQuery,
      headers: headersList,
    })

    const validatedResult = userListResponseSchema.parse({
      users: result.users || [],
      total: result.total || 0,
      limit: 'limit' in result ? result.limit : undefined,
      offset: 'offset' in result ? result.offset : undefined,
    })

    return {
      success: true,
      data: validatedResult,
    }
  } catch (error) {
    console.error('List users error:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
      }
    }

    if (error && typeof error === 'object' && 'message' in error) {
      return {
        success: false,
        error: (error as { message: string }).message,
      }
    }

    return {
      success: false,
      error: 'An unexpected error occurred while listing users',
    }
  }
}
