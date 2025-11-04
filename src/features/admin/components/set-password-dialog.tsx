'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { useSetPasswordForm } from '../hooks/use-user-forms'
import { useSetUserPassword } from '../hooks/use-user-mutations'
import type { User } from '../schema/schema'

interface SetPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
}

export function SetPasswordDialog({ open, onOpenChange, user }: SetPasswordDialogProps) {
  const [showPassword, setShowPassword] = useState(false)
  const form = useSetPasswordForm()
  const setPasswordMutation = useSetUserPassword()

  const onSubmit = (data: { newPassword: string }) => {
    setPasswordMutation.mutate(
      { userId: user.id, newPassword: data.newPassword },
      {
        onSuccess: () => {
          onOpenChange(false)
          form.reset()
          setShowPassword(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Password</DialogTitle>
          <DialogDescription>Set a new password for {user.name}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => onSubmit(data))}>
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={setPasswordMutation.isPending}>
                {setPasswordMutation.isPending ? 'Setting...' : 'Set Password'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
