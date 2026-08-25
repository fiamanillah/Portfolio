"use client"

import * as React from "react"
import {
  useTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table"
import { CheckCircle2, FileEdit, Archive, Trash2, X, Cpu, Sparkles, Plus, Loader2 } from "lucide-react"

import type { SkillListItemDTO, SkillStatus } from "@workspace/shared"
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
import { features, type SkillsTableFeatures } from "./data-table-features"

interface SkillsDataTableProps {
  columns: ColumnDef<SkillsTableFeatures, SkillListItemDTO>[]
  data: SkillListItemDTO[]
  isLoading?: boolean
  totalCount?: number
  currentPage?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  onBulkStatusChange?: (selectedIds: string[], status: SkillStatus) => void
  onBulkDelete?: (selectedIds: string[]) => void
  onSeedDefaults?: () => void
  onAddSkill?: () => void
  isSeeding?: boolean
}

export function SkillsDataTable({
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
  onSeedDefaults,
  onAddSkill,
  isSeeding = false,
}: SkillsDataTableProps) {
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
    onPaginationChange: (updaterOrValue) => {
      const nextPagination =
        typeof updaterOrValue === "function"
          ? updaterOrValue(pagination)
          : updaterOrValue
      setPagination(nextPagination)
      if (nextPagination.pageIndex !== pagination.pageIndex) {
        onPageChange?.(nextPagination.pageIndex + 1)
      }
      if (nextPagination.pageSize !== pagination.pageSize) {
        onPageSizeChange?.(nextPagination.pageSize)
      }
    },
  })

  const selectedRows = table.getSelectedRowModel().rows
  const selectedIds = selectedRows.map((r) => r.original.id)

  return (
    <div className="space-y-4">
      {/* Selection Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary">
              {selectedIds.length} of {data.length} skills selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => table.toggleAllRowsSelected(false)}
            >
              <X className="mr-1 h-3 w-3" /> Clear
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {onBulkStatusChange && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10"
                  onClick={() => onBulkStatusChange(selectedIds, "PUBLISHED")}
                >
                  <CheckCircle2 className="h-3 w-3" /> Publish
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 border-amber-500/20 text-amber-500 hover:bg-amber-500/10"
                  onClick={() => onBulkStatusChange(selectedIds, "DRAFT")}
                >
                  <FileEdit className="h-3 w-3" /> Draft
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 border-zinc-500/20 text-zinc-500 hover:bg-zinc-500/10"
                  onClick={() => onBulkStatusChange(selectedIds, "ARCHIVED")}
                >
                  <Archive className="h-3 w-3" /> Archive
                </Button>
              </>
            )}

            {onBulkDelete && (
              <Button
                size="sm"
                variant="destructive"
                className="h-7 text-xs gap-1"
                onClick={() => onBulkDelete(selectedIds)}
              >
                <Trash2 className="h-3 w-3" /> Delete Selected
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table & Visibility Toolbar */}
      <div className="flex items-center justify-end">
        <DataTableViewOptions table={table} />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className="font-mono text-xs text-muted-foreground uppercase"
                  >
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
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  {columns.map((_, j) => (
                    <TableCell key={j} className="py-4">
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-border transition-colors hover:bg-muted/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {cell.column.columnDef.cell instanceof Function
                        ? cell.column.columnDef.cell(cell.getContext())
                        : (cell.getValue() as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-60 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 max-w-md mx-auto py-6">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                      <Cpu className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-base text-foreground font-mono">
                        No Skills In Database
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Your skills database is currently empty. You can quickly seed standard full-stack defaults or create your own custom skills.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      {onSeedDefaults && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onSeedDefaults}
                          disabled={isSeeding || isLoading}
                          className="font-mono text-xs font-semibold gap-1.5"
                        >
                          {isSeeding ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                          )}
                          ✨ Seed Default 15+ Skills
                        </Button>
                      )}
                      {onAddSkill && (
                        <Button
                          size="sm"
                          onClick={onAddSkill}
                          className="font-mono text-xs font-bold gap-1.5"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add First Skill
                        </Button>
                      )}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
