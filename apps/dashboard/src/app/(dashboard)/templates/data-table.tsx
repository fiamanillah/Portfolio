"use client"

import * as React from "react"
import {
  useTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table"
import { Cloud, Layers, RefreshCw, Search, X } from "lucide-react"

import type { EmailTemplate } from "@workspace/shared"
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
import { features, type TemplatesTableFeatures } from "./data-table-features"

interface TemplatesDataTableProps {
  columns: ColumnDef<TemplatesTableFeatures, EmailTemplate>[]
  data: EmailTemplate[]
  isLoading?: boolean
  totalCount?: number
  currentPage?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  onRefresh?: () => void
  onBulkSync?: (selectedTemplates: EmailTemplate[]) => void
}

export function TemplatesDataTable({
  columns,
  data,
  isLoading = false,
  totalCount = 0,
  currentPage = 1,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  onRefresh,
  onBulkSync,
}: TemplatesDataTableProps) {
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
  const selectedTemplates = selectedRows.map((r) => r.original)

  return (
    <div className="space-y-4">
      {/* Bulk Action Toolbar if items are selected */}
      {selectedCount > 0 && (
        <div className="flex animate-in items-center justify-between gap-4 rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs text-primary fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{selectedCount}</span>
            <span>template{selectedCount > 1 ? "s" : ""} selected</span>
          </div>
          <div className="flex items-center gap-2">
            {onBulkSync && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 bg-background/80 text-xs"
                onClick={() => onBulkSync(selectedTemplates)}
              >
                <Cloud className="size-3.5 text-emerald-400" />
                Sync Selected to Plunk
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => table.toggleAllRowsSelected?.(false)}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card/60 shadow-sm backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-4 py-3 text-xs font-semibold"
                  >
                    {header.isPlaceholder
                      ? null
                      : header.column.columnDef.header
                        ? typeof header.column.columnDef.header === "function"
                          ? header.column.columnDef.header(header.getContext())
                          : header.column.columnDef.header
                        : null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <TableRow key={`skeleton-row-${idx}`}>
                  {columns.map((_, colIdx) => (
                    <TableCell
                      key={`skeleton-col-${colIdx}`}
                      className="px-4 py-3"
                    >
                      <Skeleton className="h-5 w-full rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-border/50 transition-colors hover:bg-muted/30"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3">
                      {typeof cell.column.columnDef.cell === "function"
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
                  className="h-40 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Layers className="size-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium">No templates found</p>
                    <p className="text-xs text-muted-foreground/70">
                      Try adjusting your search query or filters.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Column Options & Pagination Footer */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/60 bg-muted/20 p-4 sm:flex-row">
          <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start">
            <span className="text-xs text-muted-foreground">
              Total{" "}
              <span className="font-semibold text-foreground">
                {totalCount}
              </span>{" "}
              templates
            </span>
            <DataTableViewOptions table={table} />
          </div>

          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <DataTablePagination
              table={table}
              totalItemsCount={totalCount}
              currentPage={currentPage}
              pageSize={pageSize}
              pageCount={computedPageCount}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              pageSizeOptions={[8, 12, 20, 50]}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
