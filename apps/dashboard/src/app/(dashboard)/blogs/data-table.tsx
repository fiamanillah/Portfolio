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

import type { BlogPostListItemDTO, BlogStatus } from "@workspace/shared"
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
import { features, type BlogsTableFeatures } from "./data-table-features"

interface BlogsDataTableProps {
  columns: ColumnDef<BlogsTableFeatures, BlogPostListItemDTO>[]
  data: BlogPostListItemDTO[]
  isLoading?: boolean
  totalCount?: number
  currentPage?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  onBulkStatusChange?: (selectedIds: string[], status: BlogStatus) => void
  onBulkDelete?: (selectedIds: string[]) => void
}

export function BlogsDataTable({
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
}: BlogsDataTableProps) {
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
    .map((r) => (r.original as { id?: string })?.id)
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
              {selectedCount} {selectedCount === 1 ? "article" : "articles"}{" "}
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
              className="h-8 border-emerald-600/30 text-xs font-medium text-emerald-600 hover:bg-emerald-600/10"
              onClick={() => {
                onBulkStatusChange?.(selectedIds, "PUBLISHED")
                clearSelection()
              }}
            >
              <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Publish Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-amber-600/30 text-xs font-medium text-amber-600 hover:bg-amber-600/10"
              onClick={() => {
                onBulkStatusChange?.(selectedIds, "DRAFT")
                clearSelection()
              }}
            >
              <FileEdit className="mr-1.5 h-3.5 w-3.5" /> Move to Draft
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-zinc-600/30 text-xs font-medium text-zinc-600 hover:bg-zinc-600/10"
              onClick={() => {
                onBulkStatusChange?.(selectedIds, "ARCHIVED")
                clearSelection()
              }}
            >
              <Archive className="mr-1.5 h-3.5 w-3.5" /> Archive
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-8 text-xs font-medium"
              onClick={() => {
                onBulkDelete?.(selectedIds)
                clearSelection()
              }}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="h-10 text-xs font-semibold tracking-wider uppercase"
                    >
                      {header.isPlaceholder
                        ? null
                        : header.column.columnDef.header instanceof Function
                          ? header.column.columnDef.header(header.getContext())
                          : header.column.columnDef.header}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell
                    colSpan={columns.length}
                    className="h-16 text-center"
                  >
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-10 w-14 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="transition-colors hover:bg-muted/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5">
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
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  No blog posts found matching your criteria.
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
