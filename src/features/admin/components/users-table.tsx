'use client'

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCurrentSession } from '@/hooks/use-current-session'
import { formatBaselineRelativeDateTime } from '@/lib/date'
import { cn } from '@/lib/utils'
import { useSetUserRole } from '../hooks/use-user-mutations'
import { useUsers } from '../hooks/use-users'
import type { User } from '../schema/schema'
import { BulkActionsToolbar } from './bulk-actions-toolbar'
import { CreateUserSheet } from './create-user-sheet'
import { UserActionsMenu } from './user-actions-menu'
import { UsersTableSkeleton } from './users-table-skeleton'

const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'banned',
    header: 'Banned',
    cell: ({ row }) => {
      const banned = row.original.banned
      return (
        <Badge variant={banned ? 'default' : 'outline'}>{banned ? 'Banned' : 'Not Banned'}</Badge>
      )
    },
  },

  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const user = row.original
      return <RoleSelect user={user} />
    },
  },
  {
    accessorKey: 'emailVerified',
    header: 'Email Verified',
    cell: ({ row }) => {
      const verified = row.original.emailVerified
      return (
        <Badge
          variant="outline"
          className={cn(
            'relative overflow-visible',
            verified ? 'border-green-500/50 bg-green-500/10 ' : 'border-red-500/50 bg-red-500/10 '
          )}
        >
          <span
            className={cn(
              'absolute -top-1 -right-1 h-2 w-2 rounded-full',
              verified ? 'bg-green-500' : 'bg-red-500'
            )}
          />
          {verified ? 'Verified' : 'Not Verified'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      const date = row.original.createdAt
      return <span>{formatBaselineRelativeDateTime(date.toISOString())}</span>
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <UserActionsMenu user={row.original} />,
    enableSorting: false,
  },
]

function RoleSelect({ user }: { user: User }) {
  const setRoleMutation = useSetUserRole()
  const { userId: currentUserId } = useCurrentSession()
  const isCurrentUser = currentUserId === user.id

  const handleRoleChange = (newRole: 'admin' | 'user') => {
    if (newRole !== user.role && !isCurrentUser) {
      setRoleMutation.mutate({
        userId: user.id,
        role: newRole,
      })
    }
  }

  return (
    <Select
      value={user.role}
      onValueChange={handleRoleChange}
      disabled={setRoleMutation.isPending || isCurrentUser}
    >
      <SelectTrigger className="w-32 h-8">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="user">User</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
      </SelectContent>
    </Select>
  )
}

export function UsersTable() {
  const [createUserOpen, setCreateUserOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const query = {
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
    ...(sorting[0] && {
      sortBy: sorting[0].id,
      sortDirection: sorting[0].desc ? ('desc' as const) : ('asc' as const),
    }),
  }

  const { data, isLoading, isError, error } = useUsers(query)

  const table = useReactTable({
    data: data?.users || [],
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: data ? Math.ceil((data.total || 0) / pagination.pageSize) : 0,
    getRowId: (row) => row.id,
  })

  const selectedUsers = table.getSelectedRowModel().rows.map((row) => row.original)

  if (isLoading) {
    return <UsersTableSkeleton />
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive">
          Error: {error instanceof Error ? error.message : 'Failed to load users'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight ">User Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and view all users in the system
          </p>
        </div>
        <Button onClick={() => setCreateUserOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {createUserOpen && <CreateUserSheet open={createUserOpen} onOpenChange={setCreateUserOpen} />}
      <BulkActionsToolbar
        selectedUsers={selectedUsers}
        onClearSelection={() => setRowSelection({})}
      />

      <div className="rounded-xl border border-border overflow-hidden ">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-border hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-foreground font-semibold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-border transition-colors hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
          {Math.min((pagination.pageIndex + 1) * pagination.pageSize, data?.total || 0)} of{' '}
          {data?.total || 0} users
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
