'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
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
import { useCreateUserForm } from '../hooks/use-user-forms'
import { useCreateUser } from '../hooks/use-user-mutations'
import type { CreateUserInput } from '../schema/schema'

interface CreateUserSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateUserSheet({ open, onOpenChange }: CreateUserSheetProps) {
  const [showPassword, setShowPassword] = useState(false)
  const form = useCreateUserForm()
  const createMutation = useCreateUser()

  const onSubmit = (formData: CreateUserInput) => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        onOpenChange(false)
        form.reset()
        setShowPassword(false)
      },
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader className="pb-6 border-b border-border">
          <SheetTitle className="text-xl font-extrabold tracking-tight text-foreground">
            Create User
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground mt-1">
            Add a new user account to the system
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-6">
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        {...field}
                        className="rounded-lg bg-muted/50 border-border placeholder:text-muted-foreground pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
              <Button type="submit" disabled={createMutation.isPending} className="flex-1">
                {createMutation.isPending ? 'Creating...' : 'Create User'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
