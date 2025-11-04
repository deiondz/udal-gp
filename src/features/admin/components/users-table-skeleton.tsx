import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function UsersTableSkeleton() {
  const rows = Array.from({ length: 10 })
  const columns = 8

  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Bulk Actions Skeleton */}
      <Skeleton className="h-10 w-full rounded-lg" />

      {/* Table Skeleton */}
      <div className="rounded-xl border border-border bg-card overflow-hidden  dark:bg-muted/60 dark:border-muted/50">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent dark:border-muted/50 bg-muted/50 dark:bg-muted">
              {Array.from({ length: columns }).map((_, i) => (
                <TableHead key={`header-${i + 1}`}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((_, rowIndex) => (
              <TableRow
                key={`row-${rowIndex + 1}`}
                className="border-b border-border hover:bg-transparent dark:border-muted/50"
              >
                {Array.from({ length: columns }).map((_, cellIndex) => (
                  <TableCell key={`cell-${cellIndex + 1}`}>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-4 w-64" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  )
}
