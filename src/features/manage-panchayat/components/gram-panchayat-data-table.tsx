"use client";

import * as React from "react";
import {
	IconChevronDown,
	IconChevronLeft,
	IconChevronRight,
	IconChevronsLeft,
	IconChevronsRight,
	IconCircleCheckFilled,
	IconDotsVertical,
	IconLayoutColumns,
	IconX,
	IconFileDescription,
	IconLink,
	IconLinkOff,
	IconTrash,
} from "@tabler/icons-react";
import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { GramPanchayat } from "../schema";
import { GramPanchayatDetailDrawer } from "./gram-panchayat-detail-drawer";
import { AddGramPanchayatDialog } from "./add-gram-panchayat-dialog";
import { deleteGramPanchayat, mapMRF, unmapMRF } from "../actions";

const columns: ColumnDef<GramPanchayat>[] = [
	{
		id: "select",
		header: ({ table }) => (
			<div className="flex items-center justify-center">
				<Checkbox
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
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
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => {
			return <GramPanchayatDetailDrawer item={row.original} />;
		},
		enableHiding: false,
	},
	{
		accessorKey: "taluk",
		header: "Taluk",
		cell: ({ row }) => row.original.taluk,
	},
	{
		accessorKey: "village",
		header: "Village",
		cell: ({ row }) => row.original.village,
	},
	{
		accessorKey: "sarpanch",
		header: "Sarpanch",
		cell: ({ row }) => row.original.sarpanch,
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => (
			<Badge
				variant={row.original.status === "Active" ? "default" : "secondary"}
				className="px-1.5"
			>
				{row.original.status === "Active" ? (
					<IconCircleCheckFilled className="mr-1 size-3 fill-green-500 dark:fill-green-400" />
				) : (
					<IconX className="mr-1 size-3" />
				)}
				{row.original.status}
			</Badge>
		),
	},
	{
		accessorKey: "mrfMapped",
		header: "MRF Mapped",
		cell: ({ row }) => {
			const isMapped = row.original.mrfMapped;
			return (
				<Badge variant={isMapped ? "default" : "outline"} className="px-1.5">
					{isMapped ? (
						<>
							<IconLink className="mr-1 size-3" />
							{row.original.mrfUnitName ?? "Mapped"}
						</>
					) : (
						<>
							<IconLinkOff className="mr-1 size-3" />
							Not Mapped
						</>
					)}
				</Badge>
			);
		},
	},
	// Compliance Score column removed - now in PerformanceMetrics model
	// TODO: Fetch latest performance metrics to display compliance score
	{
		id: "actions",
		cell: ({ row }) => {
			const item = row.original;
			const [isDeleting, setIsDeleting] = React.useState(false);
			const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
			const [unmapDialogOpen, setUnmapDialogOpen] = React.useState(false);

			async function handleDelete() {
				setIsDeleting(true);
				try {
					await deleteGramPanchayat(item.id);
					toast.success(`${item.name} deleted successfully`);
					window.location.reload();
				} catch (error) {
					toast.error("Failed to delete Gram Panchayat");
				} finally {
					setIsDeleting(false);
					setDeleteDialogOpen(false);
				}
			}

			async function handleMapMRF() {
				const mrfId = prompt("Enter MRF Unit ID:");
				const mrfName = prompt("Enter MRF Unit Name:");
				if (!mrfId || !mrfName) return;

				try {
					await mapMRF(item.id, mrfId, mrfName);
					toast.success("MRF mapped successfully");
					window.location.reload();
				} catch (error) {
					toast.error("Failed to map MRF");
				}
			}

			async function handleUnmapMRF() {
				try {
					await unmapMRF(item.id);
					toast.success("MRF unmapped successfully");
					window.location.reload();
				} catch (error) {
					toast.error("Failed to unmap MRF");
				} finally {
					setUnmapDialogOpen(false);
				}
			}

			return (
				<>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
								size="icon"
							>
								<IconDotsVertical />
								<span className="sr-only">Open menu</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48">
							<GramPanchayatDetailDrawer
								item={item}
								trigger={
									<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
										View Details
									</DropdownMenuItem>
								}
							/>
							<DropdownMenuItem
								onClick={() => toast.info("View Reports feature coming soon")}
							>
								<IconFileDescription className="mr-2 size-4" />
								View Reports
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							{item.mrfMapped ? (
								<DropdownMenuItem onClick={() => setUnmapDialogOpen(true)}>
									<IconLinkOff className="mr-2 size-4" />
									Unmap MRF
								</DropdownMenuItem>
							) : (
								<DropdownMenuItem onClick={handleMapMRF}>
									<IconLink className="mr-2 size-4" />
									Map MRF
								</DropdownMenuItem>
							)}
							<DropdownMenuSeparator />
							<DropdownMenuItem
								variant="destructive"
								onClick={() => setDeleteDialogOpen(true)}
								disabled={isDeleting}
							>
								<IconTrash className="mr-2 size-4" />
								{isDeleting ? "Deleting..." : "Delete"}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					<AlertDialog
						open={deleteDialogOpen}
						onOpenChange={setDeleteDialogOpen}
					>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete Gram Panchayat</AlertDialogTitle>
								<AlertDialogDescription>
									Are you sure you want to delete {item.name}? This action
									cannot be undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel disabled={isDeleting}>
									Cancel
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={handleDelete}
									disabled={isDeleting}
									className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									{isDeleting ? "Deleting..." : "Delete"}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>

					<AlertDialog open={unmapDialogOpen} onOpenChange={setUnmapDialogOpen}>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Unmap MRF</AlertDialogTitle>
								<AlertDialogDescription>
									Are you sure you want to unmap MRF from {item.name}?
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction onClick={handleUnmapMRF}>
									Unmap MRF
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</>
			);
		},
	},
];

export function GramPanchayatDataTable({
	data: initialData,
}: {
	data: GramPanchayat[];
}) {
	const [data, setData] = React.useState(() => initialData);
	const [rowSelection, setRowSelection] = React.useState({});
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [pagination, setPagination] = React.useState({
		pageIndex: 0,
		pageSize: 10,
	});

	const refreshData = React.useCallback(async () => {
		// Reload page to get fresh data
		window.location.reload();
	}, []);

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			pagination,
		},
		getRowId: (row) => row.id.toString(),
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	});

	return (
		<Tabs defaultValue="all" className="w-full flex-col justify-start gap-6">
			<div className="flex items-center justify-between px-4 lg:px-6">
				<div className="flex items-center gap-2">
					<Input
						placeholder="Filter by name..."
						value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
						onChange={(event) =>
							table.getColumn("name")?.setFilterValue(event.target.value)
						}
						className="max-w-sm"
					/>
					<Select
						value={
							(table.getColumn("status")?.getFilterValue() as string) ?? "all"
						}
						onValueChange={(value) =>
							table
								.getColumn("status")
								?.setFilterValue(value === "all" ? undefined : value)
						}
					>
						<SelectTrigger className="w-40">
							<SelectValue placeholder="Filter by status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="Active">Active</SelectItem>
							<SelectItem value="Inactive">Inactive</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="flex items-center gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm">
								<IconLayoutColumns />
								<span className="hidden lg:inline">Customize Columns</span>
								<span className="lg:hidden">Columns</span>
								<IconChevronDown />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-56">
							{table
								.getAllColumns()
								.filter(
									(column) =>
										typeof column.accessorFn !== "undefined" &&
										column.getCanHide(),
								)
								.map((column) => {
									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className="capitalize"
											checked={column.getIsVisible()}
											onCheckedChange={(value) =>
												column.toggleVisibility(!!value)
											}
										>
											{column.id}
										</DropdownMenuCheckboxItem>
									);
								})}
						</DropdownMenuContent>
					</DropdownMenu>
					<AddGramPanchayatDialog onSuccess={refreshData} />
				</div>
			</div>
			<TabsContent
				value="all"
				className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
			>
				<div className="overflow-hidden rounded-lg border">
					<Table>
						<TableHeader className="bg-muted sticky top-0 z-10">
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => {
										return (
											<TableHead key={header.id} colSpan={header.colSpan}>
												{header.isPlaceholder
													? null
													: flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
											</TableHead>
										);
									})}
								</TableRow>
							))}
						</TableHeader>
						<TableBody className="**:data-[slot=table-cell]:first:w-8">
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row) => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center"
									>
										No results.
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
				<div className="flex items-center justify-between px-4">
					<div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
						{table.getFilteredSelectedRowModel().rows.length} of{" "}
						{table.getFilteredRowModel().rows.length} row(s) selected.
					</div>
					<div className="flex w-full items-center gap-8 lg:w-fit">
						<div className="hidden items-center gap-2 lg:flex">
							<Label htmlFor="rows-per-page" className="text-sm font-medium">
								Rows per page
							</Label>
							<Select
								value={`${table.getState().pagination.pageSize}`}
								onValueChange={(value) => {
									table.setPageSize(Number(value));
								}}
							>
								<SelectTrigger size="sm" className="w-20" id="rows-per-page">
									<SelectValue
										placeholder={table.getState().pagination.pageSize}
									/>
								</SelectTrigger>
								<SelectContent side="top">
									{[10, 20, 30, 40, 50].map((pageSize) => (
										<SelectItem key={pageSize} value={`${pageSize}`}>
											{pageSize}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex w-fit items-center justify-center text-sm font-medium">
							Page {table.getState().pagination.pageIndex + 1} of{" "}
							{table.getPageCount()}
						</div>
						<div className="ml-auto flex items-center gap-2 lg:ml-0">
							<Button
								variant="outline"
								className="hidden h-8 w-8 p-0 lg:flex"
								onClick={() => table.setPageIndex(0)}
								disabled={!table.getCanPreviousPage()}
							>
								<span className="sr-only">Go to first page</span>
								<IconChevronsLeft />
							</Button>
							<Button
								variant="outline"
								className="size-8"
								size="icon"
								onClick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
							>
								<span className="sr-only">Go to previous page</span>
								<IconChevronLeft />
							</Button>
							<Button
								variant="outline"
								className="size-8"
								size="icon"
								onClick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
							>
								<span className="sr-only">Go to next page</span>
								<IconChevronRight />
							</Button>
							<Button
								variant="outline"
								className="hidden size-8 lg:flex"
								size="icon"
								onClick={() => table.setPageIndex(table.getPageCount() - 1)}
								disabled={!table.getCanNextPage()}
							>
								<span className="sr-only">Go to last page</span>
								<IconChevronsRight />
							</Button>
						</div>
					</div>
				</div>
			</TabsContent>
		</Tabs>
	);
}
