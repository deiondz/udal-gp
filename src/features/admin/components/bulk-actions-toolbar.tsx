'use client'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCurrentSession } from '@/hooks/use-current-session'
import { useSetRoleForm } from '../hooks/use-user-forms'
import {
  useBanUser,
  useDeleteUser,
  useSetUserRole,
  useUnbanUser,
} from '../hooks/use-user-mutations'
import type { User } from '../schema/schema'
import { BanUsersAlertDialog } from './ban-users-alert-dialog'
import { BulkDeleteAlertDialog } from './bulk-delete-alert-dialog'
import { UnbanUsersAlertDialog } from './unban-users-alert-dialog'

interface BulkActionsToolbarProps {
  selectedUsers: User[]
  onClearSelection: () => void
}

export function BulkActionsToolbar({ selectedUsers, onClearSelection }: BulkActionsToolbarProps) {
  const [setRoleOpen, setSetRoleOpen] = useState(false)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [banAlertOpen, setBanAlertOpen] = useState(false)
  const [unbanAlertOpen, setUnbanAlertOpen] = useState(false)

  const { userId: currentUserId } = useCurrentSession()
  const selectedCount = selectedUsers.length
  // Filter out current user from bulk operations
  const selectedUserIds = selectedUsers.filter((u) => u.id !== currentUserId).map((u) => u.id)
  const filteredCount = selectedUserIds.length
  const hasCurrentUserInSelection = selectedUsers.some((u) => u.id === currentUserId)

  const deleteMutation = useDeleteUser()
  const setRoleMutation = useSetUserRole()
  const banMutation = useBanUser()
  const unbanMutation = useUnbanUser()
  const setRoleForm = useSetRoleForm()

  const handleBulkDelete = () => {
    setDeleteAlertOpen(true)
  }

  const confirmBulkDelete = () => {
    selectedUserIds.forEach((id) => {
      deleteMutation.mutate({ userId: id })
    })
    setDeleteAlertOpen(false)
    onClearSelection()
  }

  const handleBulkSetRole = (role: 'admin' | 'user') => {
    selectedUserIds.forEach((id) => {
      setRoleMutation.mutate({ userId: id, role })
    })
    setSetRoleOpen(false)
    onClearSelection()
  }

  const handleBulkBan = () => {
    setBanAlertOpen(true)
  }

  const confirmBulkBan = () => {
    selectedUserIds.forEach((id) => {
      banMutation.mutate({ userId: id })
    })
    setBanAlertOpen(false)
    onClearSelection()
  }

  const handleBulkUnban = () => {
    setUnbanAlertOpen(true)
  }

  const confirmBulkUnban = () => {
    selectedUserIds.forEach((id) => {
      unbanMutation.mutate({ userId: id })
    })
    setUnbanAlertOpen(false)
    onClearSelection()
  }

  if (selectedCount === 0) {
    return null
  }

  return (
    <>
      <div className="flex flex-col gap-4 rounded-lg border border-border p-4  sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-medium text-foreground">
          {selectedCount} user{selectedCount > 1 ? 's' : ''} selected
          {hasCurrentUserInSelection && (
            <span className="text-muted-foreground ml-2">
              (your account excluded from bulk actions)
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setSetRoleOpen(true)}>
            Set Role
          </Button>
          <Button variant="outline" size="sm" onClick={handleBulkBan}>
            Ban
          </Button>
          <Button variant="outline" size="sm" onClick={handleBulkUnban}>
            Unban
          </Button>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            Delete
          </Button>
        </div>
      </div>

      <Dialog open={setRoleOpen} onOpenChange={setSetRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Set Role for {filteredCount} User{filteredCount !== 1 ? 's' : ''}
            </DialogTitle>
            <DialogDescription>
              Change the role for all selected users
              {hasCurrentUserInSelection && ' (your account will be excluded)'}
            </DialogDescription>
          </DialogHeader>
          <Form {...setRoleForm}>
            <form onSubmit={setRoleForm.handleSubmit((data) => handleBulkSetRole(data.role))}>
              <FormField
                control={setRoleForm.control}
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
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setSetRoleOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={setRoleMutation.isPending}>
                  {setRoleMutation.isPending ? 'Setting...' : 'Set Role'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <BulkDeleteAlertDialog
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        count={filteredCount}
        onConfirm={confirmBulkDelete}
        isLoading={deleteMutation.isPending}
      />
      <BanUsersAlertDialog
        open={banAlertOpen}
        onOpenChange={setBanAlertOpen}
        count={filteredCount}
        onConfirm={confirmBulkBan}
        isLoading={banMutation.isPending}
      />
      <UnbanUsersAlertDialog
        open={unbanAlertOpen}
        onOpenChange={setUnbanAlertOpen}
        count={filteredCount}
        onConfirm={confirmBulkUnban}
        isLoading={unbanMutation.isPending}
      />
    </>
  )
}
