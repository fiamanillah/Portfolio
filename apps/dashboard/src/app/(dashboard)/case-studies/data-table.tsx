"use client"

import * as React from "react"
import {
  useTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table"
import { CheckCircle, FileEdit, Archive, Trash2, X, Layers } from "lucide-react"

import type { CaseStudyListItemDTO, CaseStudyStatus } from "@workspace/shared"
import { Button } from "@workspace/ui/components/button"
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
import { features, type CaseStudiesTableFeatures } from "./data-table-features"

interface CaseStudiesDataTableProps {
  columns: ColumnDef<CaseStudiesTableFeatures, CaseStudyListItemDTO>[]
  data: CaseStudyListItemDTO[]
  isLoading?: boolean
  totalCount?: number
  currentPage?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  onBulkStatusChange?: (selectedIds: string[], status: CaseStudyStatus) => void
  onBulkDelete?: (selectedIds: string[]) => void
}

export function CaseStudiesDataTable({
  columns,
  data,
  isLoading = false,
  totalCount = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onBulkStatusChange,
  onBulkDelete,
}: CaseStudiesDataTableProps) {
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

  const selectedRows = table.getSelectedRowModel?.()?.rows || []
  const selectedCount = selectedRows.length
  const selectedIds = selectedRows
    .map((r: any) => r.original?.id)
    .filter(Boolean) as string[]

  const clearSelection = () => {
    table.resetRowSelection?.()
  }

  return (
    <div className="space-y-4">
      {/* Batch Action Toolbar */}
      {selectedCount > 0 && (
        <div className="flex animate-in flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm duration-200 fade-in-50">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <Layers className="h-4 w-4 text-primary" />
              {selectedCount} {selectedCount === 1 ? "case study" : "case studies"}{" "}
              selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={clearSelection}
            >
              <X className="mr-1 h-3 w-3" /> Clear
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
              onClick={() => {
                onBulkStatusChange?.(selectedIds, "PUBLISHED")
                clearSelection()
              }}
            >
              <CheckCircle className="size-3.5" />
              Publish Selected
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-amber-500/30 text-amber-600 hover:bg-amber-500/10 dark:text-amber-400"
              onClick={() => {
                onBulkStatusChange?.(selectedIds, "DRAFT")
                clearSelection()
              }}
            >
              <FileEdit className="size-3.5" />
              Draft Selected
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-zinc-500/30 text-zinc-600 hover:bg-zinc-500/10 dark:text-zinc-400"
              onClick={() => {
                onBulkStatusChange?.(selectedIds, "ARCHIVED")
                clearSelection()
              }}
            >
              <Archive className="size-3.5" />
              Archive Selected
            </Button>

            <Button
              variant="destructive"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => {
                onBulkDelete?.(selectedIds)
                clearSelection()
              }}
            >
              <Trash2 className="size-3.5" />
              Delete ({selectedCount})
            </Button>
          </div>
        </div>
      )}

      {/* Table view options header */}
      <div className="flex items-center justify-end">
        <DataTableViewOptions table={table} />
      </div>

      {/* Main Table Container */}
      <div className="rounded-xl border border-border bg-card shadow-xs">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : header.column.columnDef.header instanceof Function
                        ? header.column.columnDef.header(header.getContext())
                        : header.column.columnDef.header}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="w-10">
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell className="w-10">
                    <Skeleton className="h-4 w-6" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-20 rounded-md" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="w-10">
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="group transition-colors hover:bg-muted/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.column.columnDef.cell instanceof Function
                        ? cell.column.columnDef.cell(cell.getContext())
                        : (cell.getValue() as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-48 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60">
                      <Layers className="h-6 w-6 text-muted-foreground/60" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      No case studies found
                    </p>
                    <p className="text-xs">
                      Try adjusting your search query or status filters.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <DataTablePagination table={table} />
    </div>
  )
}
