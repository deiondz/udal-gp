import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  type BanUserInput,
  banUserSchema,
  type CreateUserInput,
  createUserSchema,
  type SetPasswordInput,
  type SetRoleInput,
  setPasswordSchema,
  setRoleSchema,
  type UnbanUserInput,
  type UpdateUserInput,
  unbanUserSchema,
  updateUserSchema,
} from '../schema/schema'

export function useCreateUserForm() {
  return useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      role: 'user',
      data: {
        contactDetails: '',
      },
    },
  })
}

const updateUserDataSchema = updateUserSchema.shape.data

export function useUpdateUserForm(initialData?: Partial<UpdateUserInput['data']>) {
  return useForm<UpdateUserInput['data']>({
    resolver: zodResolver(updateUserDataSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      role: initialData?.role || undefined,
      data: initialData?.data || {},
    },
  })
}

export function useSetRoleForm(initialRole?: 'admin' | 'user') {
  return useForm<SetRoleInput>({
    resolver: zodResolver(setRoleSchema),
    defaultValues: {
      userId: '',
      role: initialRole || 'user',
    },
  })
}

export function useSetPasswordForm() {
  return useForm<SetPasswordInput>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      userId: '',
      newPassword: '',
    },
  })
}

export function useBanUserForm() {
  return useForm<BanUserInput>({
    resolver: zodResolver(banUserSchema),
    defaultValues: {
      userId: '',
      banReason: '',
      banExpiresIn: undefined,
    },
  })
}

export function useUnbanUserForm() {
  return useForm<UnbanUserInput>({
    resolver: zodResolver(unbanUserSchema),
    defaultValues: {
      userId: '',
    },
  })
}
