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
  Check,
  Filter,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  UserX,
  X,
} from "lucide-react"

import type { SubscriberItem } from "@workspace/shared"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { DataTablePagination } from "@workspace/ui/components/data-table-pagination"
import { DataTableViewOptions } from "@workspace/ui/components/data-table-view-options"
import { features, type DataTableFeatures } from "./data-table-features"

interface DataTableProps {
  columns: ColumnDef<DataTableFeatures, SubscriberItem>[]
  data: SubscriberItem[]
  isLoading?: boolean
  totalCount?: number
  currentPage?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
  statusFilter?: string
  onStatusFilterChange?: (status: string) => void
  sourceFilter?: string
  onSourceFilterChange?: (source: string) => void
  onBulkStatusChange?: (
    selectedIds: string[],
    status: "subscribed" | "unsubscribed" | "pending"
  ) => void
  onBulkDelete?: (selectedIds: string[]) => void
  onAddNew?: () => void
  onRefresh?: () => void
  availableSources?: string[]
}

export function SubscribersDataTable({
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
  statusFilter = "ALL",
  onStatusFilterChange,
  sourceFilter = "ALL",
  onSourceFilterChange,
  onBulkStatusChange,
  onBulkDelete,
  onAddNew,
  onRefresh,
  availableSources = [
    "hero_section",
    "blog_post",
    "newsletter_modal",
    "admin_portal",
    "api_docs",
  ],
}: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] = React.useState<
    Record<string, boolean>
  >({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  const [pagination, setPagination] = React.useState({
    pageIndex: Math.max(0, currentPage - 1),
    pageSize,
  })

  // Synchronize internal pagination state when external page/pageSize props update
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
    // Provide row ID for stable selection tracking
    getRowId: (row) => row.id,
  })

  // Selected Row IDs
  const selectedIds = React.useMemo(() => {
    return Object.keys(rowSelection).filter((id) => rowSelection[id])
  }, [rowSelection])

  const selectedCount = selectedIds.length

  const handleClearFilters = () => {
    onSearchChange?.("")
    onStatusFilterChange?.("ALL")
    onSourceFilterChange?.("ALL")
  }

  const isFiltered =
    searchQuery !== "" || statusFilter !== "ALL" || sourceFilter !== "ALL"

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search & Quick Filters */}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search email, name, source..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="h-8 bg-background/80 pl-8 text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange?.("")}
                className="absolute top-1/2 right-2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-muted/50 p-0.5 text-xs">
            {[
              { label: "All", value: "ALL" },
              { label: "Subscribed", value: "subscribed" },
              { label: "Pending", value: "pending" },
              { label: "Unsubscribed", value: "unsubscribed" },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => onStatusFilterChange?.(tab.value)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                  statusFilter === tab.value
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Source Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
              >
                <Filter className="size-3 text-muted-foreground" />
                <span>
                  {sourceFilter === "ALL"
                    ? "Source: All"
                    : `Source: ${sourceFilter.replace(/_/g, " ")}`}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel className="text-xs">
                Filter by Channel
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onSourceFilterChange?.("ALL")}
                className="justify-between text-xs"
              >
                <span>All Sources</span>
                {sourceFilter === "ALL" && (
                  <Check className="size-3.5 text-primary" />
                )}
              </DropdownMenuItem>
              {availableSources.map((src) => (
                <DropdownMenuItem
                  key={src}
                  onClick={() => onSourceFilterChange?.(src)}
                  className="justify-between text-xs capitalize"
                >
                  <span>{src.replace(/_/g, " ")}</span>
                  {sourceFilter === src && (
                    <Check className="size-3.5 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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
              <RefreshCw
                className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          )}
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Bulk Actions Floating Banner */}
      {selectedCount > 0 && (
        <div className="flex animate-in flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/10 p-2.5 px-4 text-xs fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <Badge
              variant="default"
              className="px-2 py-0.5 font-mono text-[11px]"
            >
              {selectedCount} selected
            </Badge>
            <span className="text-muted-foreground">
              Perform bulk management actions on selected subscribers:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkStatusChange?.(selectedIds, "subscribed")}
              className="h-7 gap-1 border-emerald-500/30 text-xs text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
            >
              <UserCheck className="size-3" />
              Mark Subscribed
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkStatusChange?.(selectedIds, "unsubscribed")}
              className="h-7 gap-1 border-amber-500/30 text-xs text-amber-600 hover:bg-amber-500/10 dark:text-amber-400"
            >
              <UserX className="size-3" />
              Mark Unsubscribed
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => onBulkDelete?.(selectedIds)}
              className="h-7 gap-1 text-xs"
            >
              <Trash2 className="size-3" />
              Delete ({selectedCount})
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRowSelection({})}
              className="h-7 text-xs text-muted-foreground"
            >
              Deselect
            </Button>
          </div>
        </div>
      )}

      {/* Main Table Structure */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card/60">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-muted/40 hover:bg-muted/40"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="h-10 text-xs font-semibold"
                    >
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
                <TableRow key={`skeleton-sub-${index}`}>
                  <TableCell className="w-10 pl-4">
                    <Skeleton className="size-4 rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-8 shrink-0 rounded-full" />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-28 max-w-full" />
                        <Skeleton className="h-3 w-40 max-w-full" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Skeleton className="ml-auto size-8 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const isSelected =
                  typeof row.getIsSelected === "function"
                    ? row.getIsSelected()
                    : false
                return (
                  <TableRow
                    key={row.id}
                    data-state={isSelected && "selected"}
                    className={
                      isSelected
                        ? "bg-primary/5 hover:bg-primary/10"
                        : "hover:bg-muted/50"
                    }
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
                <TableCell
                  colSpan={columns.length}
                  className="h-40 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                      <Layers className="size-5 text-muted-foreground/80" />
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      No subscribers found
                    </div>
                    <p className="max-w-sm text-xs">
                      {isFiltered
                        ? "No subscribers match your search or filter parameters. Try clearing your filters."
                        : "There are no subscribers in your audience database yet."}
                    </p>
                    {isFiltered ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearFilters}
                        className="mt-2 text-xs"
                      >
                        Clear Filters
                      </Button>
                    ) : (
                      onAddNew && (
                        <Button
                          size="sm"
                          onClick={onAddNew}
                          className="mt-2 gap-1.5 text-xs"
                        >
                          <Plus className="size-3.5" />
                          Add First Subscriber
                        </Button>
                      )
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
