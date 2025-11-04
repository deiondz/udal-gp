'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatBaselineRelativeDateTime } from '@/lib/date'
import { useListUserSessions, useRevokeUserSession } from '../hooks/use-user-mutations'
import type { User } from '../schema/schema'
import { RevokeSessionAlertDialog } from './revoke-session-alert-dialog'

interface UserSessionsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
}

export function UserSessionsSheet({ open, onOpenChange, user }: UserSessionsSheetProps) {
  const [revokeAlertOpen, setRevokeAlertOpen] = useState(false)
  const [revokeSessionToken, setRevokeSessionToken] = useState<string | null>(null)

  const { data: sessions = [], isLoading, isError } = useListUserSessions(user.id, open)
  const revokeSessionMutation = useRevokeUserSession()

  const handleRevokeSession = (sessionToken: string) => {
    setRevokeSessionToken(sessionToken)
    setRevokeAlertOpen(true)
  }

  const confirmRevokeSession = () => {
    if (revokeSessionToken) {
      revokeSessionMutation.mutate(
        { sessionToken: revokeSessionToken },
        {
          onSuccess: () => {
            setRevokeAlertOpen(false)
            setRevokeSessionToken(null)
          },
        }
      )
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl px-6">
        <SheetHeader className=" px-0 border-b border-border">
          <SheetTitle>Sessions for {user.name}</SheetTitle>
          <SheetDescription>View and manage active sessions</SheetDescription>
        </SheetHeader>
        <div className="mt-2">
          {isLoading ? (
            <div className="text-center py-8">Loading sessions...</div>
          ) : isError ? (
            <div className="text-center py-8 text-destructive">
              Failed to load sessions. Please try again.
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No sessions found</div>
          ) : (
            <div className="rounded-md border ">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>User Agent</TableHead>
                    <TableHead>Impersonated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-mono text-xs">
                        {session.token.substring(0, 20)}...
                      </TableCell>
                      <TableCell>
                        {formatBaselineRelativeDateTime(session.createdAt.toISOString())}
                      </TableCell>
                      <TableCell>
                        {formatBaselineRelativeDateTime(session.expiresAt.toISOString())}
                      </TableCell>
                      <TableCell>{session.ipAddress || 'N/A'}</TableCell>
                      <TableCell className="max-w-xs truncate">{session.userAgent}</TableCell>
                      <TableCell>
                        {session.impersonatedBy ? (
                          <Badge variant="outline">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevokeSession(session.token)}
                          disabled={revokeSessionMutation.isPending}
                        >
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <RevokeSessionAlertDialog
          open={revokeAlertOpen}
          onOpenChange={setRevokeAlertOpen}
          onConfirm={confirmRevokeSession}
          isLoading={revokeSessionMutation.isPending}
        />
      </SheetContent>
    </Sheet>
  )
}
