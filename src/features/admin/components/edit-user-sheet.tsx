'use client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useCurrentSession } from '@/hooks/use-current-session'
import { useUpdateUserForm } from '../hooks/use-user-forms'
import { useUpdateUser } from '../hooks/use-user-mutations'
import type { User } from '../schema/schema'

interface EditUserSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
}

export function EditUserSheet({ open, onOpenChange, user }: EditUserSheetProps) {
  const { userId: currentUserId } = useCurrentSession()

  const isCurrentUser = currentUserId === user.id
  const form = useUpdateUserForm({
    name: user.name,
    email: user.email,
    role: user.role,
    data: {
      contactDetails: user.contactDetails || '',
    },
  })
  const updateMutation = useUpdateUser()

  const onSubmit = (formData: {
    name?: string
    email?: string
    role?: 'admin' | 'user'
    data?: Record<string, unknown>
  }) => {
    // Remove role from data if user is editing themselves
    const updateData = isCurrentUser
      ? { name: formData.name, email: formData.email, data: formData.data }
      : formData

    updateMutation.mutate(
      { userId: user.id, data: updateData },
      {
        onSuccess: () => {
          onOpenChange(false)
          form.reset()
        },
      }
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader className="pb-6 border-b border-border">
          <SheetTitle className="text-xl font-extrabold tracking-tight text-foreground">
            Edit User
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground mt-1">
            Update user information for {user.name}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                      className="rounded-lg bg-muted/50 border-border placeholder:text-muted-foreground"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      {...field}
                      className="rounded-lg bg-muted/50 border-border placeholder:text-muted-foreground"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isCurrentUser}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-lg bg-muted/50 border-border">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                  {isCurrentUser && (
                    <p className="text-xs text-muted-foreground">You cannot change your own role</p>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="data.contactDetails"
              render={() => {
                const contactDetails = form.watch('data')?.contactDetails as string | undefined
                return (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Contact Details{' '}
                      <span className="text-muted-foreground font-normal">(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+91 9876543210"
                        value={contactDetails || ''}
                        onChange={(e) => {
                          const currentData = form.getValues('data') || {}
                          form.setValue('data', {
                            ...currentData,
                            contactDetails: e.target.value || undefined,
                          })
                        }}
                        className="rounded-lg bg-muted/50 border-border placeholder:text-muted-foreground"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )
              }}
            />
            <SheetFooter className="mt-10 pt-6 border-t px-0 border-border gap-3">
              <Button type="submit" disabled={updateMutation.isPending} className="flex-1">
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
