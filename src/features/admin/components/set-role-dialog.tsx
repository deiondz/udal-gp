'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSetRoleForm } from '../hooks/use-user-forms'
import { useSetUserRole } from '../hooks/use-user-mutations'
import type { User } from '../schema/schema'

interface SetRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
}

export function SetRoleDialog({ open, onOpenChange, user }: SetRoleDialogProps) {
  const form = useSetRoleForm(user.role)
  const setRoleMutation = useSetUserRole()

  const onSubmit = (data: { userId: string; role: 'admin' | 'user' }) => {
    setRoleMutation.mutate(
      { userId: user.id, role: data.role },
      {
        onSuccess: () => {
          onOpenChange(false)
          form.reset()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set User Role</DialogTitle>
          <DialogDescription>Change the role for {user.name}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(() =>
              onSubmit({ userId: user.id, role: form.getValues('role') })
            )}
          >
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={setRoleMutation.isPending}>
                {setRoleMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
