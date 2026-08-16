"use client"

import * as React from "react"
import {
  useTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table"
import {
  Layers,
  RefreshCw,
  Search,
  X,
} from "lucide-react"

import type { AuthUser } from "@workspace/shared"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { DataTablePagination } from "@workspace/ui/components/data-table-pagination"
import { DataTableViewOptions } from "@workspace/ui/components/data-table-view-options"
import { features, type UsersTableFeatures } from "./data-table-features"

interface UsersDataTableProps {
  columns: ColumnDef<UsersTableFeatures, AuthUser>[]
  data: AuthUser[]
  isLoading?: boolean
  totalCount?: number
  currentPage?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
  roleFilter?: string
  onRoleFilterChange?: (role: string) => void
  onRefresh?: () => void
}

export function UsersDataTable({
  columns,
  data,
  isLoading = false,
  totalCount = 0,
  currentPage = 1,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  searchQuery = "",
  onSearchChange,
  roleFilter = "ALL",
  onRoleFilterChange,
  onRefresh,
}: UsersDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  const [pagination, setPagination] = React.useState({
    pageIndex: Math.max(0, currentPage - 1),
    pageSize,
  })

  React.useEffect(() => {
    setPagination({
      pageIndex: Math.max(0, currentPage - 1),
      pageSize,
    })
  }, [currentPage, pageSize])

  const computedPageCount = Math.max(1, Math.ceil(totalCount / pageSize))

  const table = useTable({
    features,
    data,
    columns,
    manualPagination: true,
    pageCount: computedPageCount,
    rowCount: totalCount,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(pagination) : updater
      setPagination(next)
      if (next.pageIndex !== pagination.pageIndex) {
        onPageChange?.(next.pageIndex + 1)
      }
      if (next.pageSize !== pagination.pageSize) {
        onPageSizeChange?.(next.pageSize)
        onPageChange?.(1)
      }
    },
    getRowId: (row) => row.id,
  })

  const handleClearFilters = () => {
    onSearchChange?.("")
    onRoleFilterChange?.("ALL")
  }

  const isFiltered = searchQuery !== "" || roleFilter !== "ALL"

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search & Role Filter Tabs */}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, username, email..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-8 h-8 text-xs bg-background/80"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange?.("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-lg border border-border/80 text-xs">
            {[
              { label: "All Roles", value: "ALL" },
              { label: "Admin", value: "ADMIN" },
              { label: "Moderator", value: "MODERATOR" },
              { label: "Author", value: "AUTHOR" },
              { label: "User", value: "USER" },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => onRoleFilterChange?.(tab.value)}
                className={`px-2.5 py-1 text-[11px] rounded-md font-medium transition-all ${
                  roleFilter === tab.value
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Reset Filters */}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
              <X className="ml-1 size-3" />
            </Button>
          )}
        </div>

        {/* View Options & Refresh */}
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-8 gap-1.5 text-xs"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          )}
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Main Table Structure */}
      <div className="rounded-xl border border-border/80 overflow-hidden bg-card/60">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="h-10 text-xs font-semibold">
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: Math.min(pageSize, 6) }).map((_, index) => (
                <TableRow key={`skeleton-user-${index}`}>
                  <TableCell className="pl-4 w-10">
                    <Skeleton className="size-4 rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-8 rounded-lg shrink-0" />
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <Skeleton className="h-3.5 w-28 max-w-full" />
                        <Skeleton className="h-3 w-36 max-w-full" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Skeleton className="size-8 rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const isSelected = typeof row.getIsSelected === "function" ? row.getIsSelected() : false
                return (
                  <TableRow
                    key={row.id}
                    data-state={isSelected && "selected"}
                    className={isSelected ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2.5 text-xs">
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                      <Layers className="size-5 text-muted-foreground/80" />
                    </div>
                    <div className="font-medium text-foreground text-sm">
                      No users found
                    </div>
                    <p className="text-xs max-w-sm">
                      {isFiltered
                        ? "No users match your search query or role filter. Try clearing your filters."
                        : "There are no users registered in the platform yet."}
                    </p>
                    {isFiltered && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearFilters}
                        className="mt-2 text-xs"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Bar */}
      <DataTablePagination
        table={table}
        totalItemsCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        pageCount={computedPageCount}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={[10, 20, 50, 100]}
      />
    </div>
  )
}
