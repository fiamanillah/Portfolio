"use client"

import * as React from "react"
import {
  type RowData,
  type TableFeatures,
  type Table,
} from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

export interface DataTablePaginationTable {
  getFilteredSelectedRowModel?: () => { rows: unknown[] }
  getFilteredRowModel?: () => { rows: unknown[] }
  getState?: () => { pagination?: { pageIndex?: number; pageSize?: number } }
  state?: { pagination?: { pageIndex?: number; pageSize?: number } }
  setPageIndex?: (index: number) => void
  setPageSize?: (size: number) => void
}

export interface DataTablePaginationProps {
  table?: DataTablePaginationTable
  pageSizeOptions?: number[]
  totalItemsCount?: number
  pageCount?: number
  currentPage?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
}

export function DataTablePagination({
  table,
  pageSizeOptions = [10, 20, 50, 100],
  totalItemsCount,
  pageCount: explicitPageCount,
  currentPage: explicitCurrentPage,
  pageSize: explicitPageSize,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  const selectedRowsCount = table?.getFilteredSelectedRowModel
    ? (table.getFilteredSelectedRowModel()?.rows?.length ?? 0)
    : 0

  const state =
    (typeof table?.getState === "function" ? table.getState() : table?.state) ||
    {}

  // 1-indexed current page
  const activePage =
    explicitCurrentPage !== undefined
      ? explicitCurrentPage
      : (state.pagination?.pageIndex ?? 0) + 1

  const activePageSize =
    explicitPageSize !== undefined
      ? explicitPageSize
      : (state.pagination?.pageSize ?? 20)

  const totalRows =
    totalItemsCount !== undefined
      ? totalItemsCount
      : table?.getFilteredRowModel
        ? (table.getFilteredRowModel()?.rows?.length ?? 0)
        : 0

  const totalPages =
    explicitPageCount !== undefined
      ? explicitPageCount
      : Math.max(1, Math.ceil(totalRows / activePageSize))

  const canPreviousPage = activePage > 1
  const canNextPage = activePage < totalPages

  const startRecord =
    totalRows === 0 ? 0 : (activePage - 1) * activePageSize + 1
  const endRecord = Math.min(activePage * activePageSize, totalRows)

  const handlePageChange = (targetPage: number) => {
    if (targetPage < 1 || targetPage > totalPages || targetPage === activePage)
      return

    if (typeof table?.setPageIndex === "function") {
      table.setPageIndex(targetPage - 1)
    }
    onPageChange?.(targetPage)
  }

  const handlePageSizeChange = (newSize: number) => {
    if (typeof table?.setPageSize === "function") {
      table.setPageSize(newSize)
    }
    onPageSizeChange?.(newSize)
    onPageChange?.(1)
  }

  return (
    <div className="flex flex-col gap-4 px-2 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-xs text-muted-foreground">
        {selectedRowsCount > 0 ? (
          <span className="font-medium text-foreground">
            {selectedRowsCount} of {totalRows} row(s) selected
          </span>
        ) : (
          <span>
            Showing{" "}
            <span className="font-medium text-foreground">{startRecord}</span>{" "}
            to <span className="font-medium text-foreground">{endRecord}</span>{" "}
            of <span className="font-medium text-foreground">{totalRows}</span>{" "}
            total records
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8">
        <div className="flex items-center space-x-2">
          <p className="text-xs font-medium whitespace-nowrap text-muted-foreground">
            Rows per page
          </p>
          <Select
            value={`${activePageSize}`}
            onValueChange={(value) => handlePageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[72px] text-xs">
              <SelectValue placeholder={`${activePageSize}`} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`} className="text-xs">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-[110px] items-center justify-center text-xs font-medium text-muted-foreground">
          Page {activePage} of {totalPages}
        </div>

        <div className="flex items-center space-x-1">
          <Button
            type="button"
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => handlePageChange(1)}
            disabled={!canPreviousPage}
            title="Go to first page"
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="size-8 p-0"
            onClick={() => handlePageChange(activePage - 1)}
            disabled={!canPreviousPage}
            title="Go to previous page"
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="size-8 p-0"
            onClick={() => handlePageChange(activePage + 1)}
            disabled={!canNextPage}
            title="Go to next page"
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => handlePageChange(totalPages)}
            disabled={!canNextPage}
            title="Go to last page"
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
