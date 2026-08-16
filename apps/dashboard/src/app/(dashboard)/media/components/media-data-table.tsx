"use client"

import * as React from "react"
import {
  useTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table"

import type { MediaFileDTO } from "@workspace/shared"
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
import { features, type MediaTableFeatures } from "./media-table-features"

interface MediaDataTableProps {
  columns: ColumnDef<MediaTableFeatures, MediaFileDTO>[]
  data: MediaFileDTO[]
  isLoading?: boolean
  totalCount?: number
  currentPage?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  selectedIds?: string[]
  onSelectionChange?: (ids: string[]) => void
}

export function MediaDataTable({
  columns,
  data,
  isLoading = false,
  totalCount = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  selectedIds = [],
  onSelectionChange,
}: MediaDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] = React.useState<
    Record<string, boolean>
  >({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(
    () => {
      const initial: RowSelectionState = {}
      selectedIds.forEach((id) => {
        initial[id] = true
      })
      return initial
    }
  )

  // Sync external selectedIds when modified from elsewhere
  React.useEffect(() => {
    const updated: RowSelectionState = {}
    selectedIds.forEach((id) => {
      updated[id] = true
    })
    setRowSelection(updated)
  }, [selectedIds])

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
    onRowSelectionChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(rowSelection) : updater
      setRowSelection(next)
      if (onSelectionChange) {
        const ids = Object.keys(next).filter((k) => next[k])
        onSelectionChange(ids)
      }
    },
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

  return (
    <div className="space-y-4">
      {/* Table view controls */}
      <div className="flex items-center justify-end">
        <DataTableViewOptions table={table} />
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-muted/40 hover:bg-muted/40"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className="text-xs font-semibold"
                  >
                    {header.isPlaceholder
                      ? null
                      : header.column.columnDef.header instanceof Function
                        ? header.column.columnDef.header(header.getContext())
                        : (header.column.columnDef.header as React.ReactNode)}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pageSize > 10 ? 10 : pageSize }).map(
                (_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, colIdx) => (
                      <TableCell key={colIdx} className="py-3">
                        <Skeleton className="h-4 w-full max-w-[120px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                )
              )
            ) : table.getRowModel().rows.length > 0 ? (
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
                  className="h-32 text-center text-xs text-muted-foreground"
                >
                  No media files found matching the criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="py-2">
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}
