'use client'

import { Activity, Ban, Key, MoreHorizontal, Pencil, Trash2, UserCog } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCurrentSession } from '@/hooks/use-current-session'
import { useDeleteUser, useImpersonateUser } from '../hooks/use-user-mutations'
import type { User } from '../schema/schema'
import { BanUserDialog } from './ban-user-dialog'
import { DeleteUserAlertDialog } from './delete-user-alert-dialog'
import { EditUserSheet } from './edit-user-sheet'
import { ImpersonateUserAlertDialog } from './impersonate-user-alert-dialog'
import { SetPasswordDialog } from './set-password-dialog'
import { UserSessionsSheet } from './user-sessions-sheet'

interface UserActionsMenuProps {
  user: User
}

export function UserActionsMenu({ user }: UserActionsMenuProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [setPasswordOpen, setSetPasswordOpen] = useState(false)
  const [banOpen, setBanOpen] = useState(false)
  const [sessionsOpen, setSessionsOpen] = useState(false)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [impersonateAlertOpen, setImpersonateAlertOpen] = useState(false)

  const { userId: currentUserId } = useCurrentSession()
  const isCurrentUser = currentUserId === user.id

  const deleteUser = useDeleteUser()
  const impersonateUser = useImpersonateUser()

  const handleDelete = () => {
    setDeleteAlertOpen(true)
  }

  const confirmDelete = () => {
    deleteUser.mutate({ userId: user.id })
    setDeleteAlertOpen(false)
  }

  const handleImpersonate = () => {
    setImpersonateAlertOpen(true)
  }

  const confirmImpersonate = () => {
    impersonateUser.mutate({ userId: user.id })
    setImpersonateAlertOpen(false)
  }

  const handleViewSessions = () => {
    setSessionsOpen(true)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" size="icon">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit User
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSetPasswordOpen(true)}>
            <Key className="mr-2 h-4 w-4" />
            Set Password
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setBanOpen(true)} disabled={isCurrentUser}>
            <Ban className="mr-2 h-4 w-4" />
            {user.banned ? 'Unban User' : 'Ban User'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleViewSessions}>
            <Activity className="mr-2 h-4 w-4" />
            View Sessions
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleImpersonate}>
            <UserCog className="mr-2 h-4 w-4" />
            Impersonate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleDelete} disabled={isCurrentUser}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {editOpen && <EditUserSheet open={editOpen} onOpenChange={setEditOpen} user={user} />}
      {setPasswordOpen && (
        <SetPasswordDialog open={setPasswordOpen} onOpenChange={setSetPasswordOpen} user={user} />
      )}
      {banOpen && <BanUserDialog open={banOpen} onOpenChange={setBanOpen} user={user} />}
      {sessionsOpen && (
        <UserSessionsSheet open={sessionsOpen} onOpenChange={setSessionsOpen} user={user} />
      )}

      <DeleteUserAlertDialog
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        userName={user.name}
        onConfirm={confirmDelete}
        isLoading={deleteUser.isPending}
      />
      <ImpersonateUserAlertDialog
        open={impersonateAlertOpen}
        onOpenChange={setImpersonateAlertOpen}
        userName={user.name}
        onConfirm={confirmImpersonate}
        isLoading={impersonateUser.isPending}
      />
    </>
  )
}
