"use client"

import * as React from "react"
import { type RowData, type Table } from "@tanstack/react-table"
import { SlidersHorizontal } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

interface DataTableViewOptionsProps<TData extends RowData> {
  table: Table<any, TData> | any
}

export function DataTableViewOptions<TData extends RowData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const allColumns = typeof table.getAllColumns === "function" ? table.getAllColumns() : []

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 gap-1.5 text-xs lg:flex"
        >
          <SlidersHorizontal className="size-3.5" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuLabel className="text-xs">Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {allColumns
          .filter((column: any) => typeof column.getCanHide === "function" ? column.getCanHide() : true)
          .map((column: any) => {
            const isVisible = typeof column.getIsVisible === "function" ? column.getIsVisible() : true
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize text-xs"
                checked={isVisible}
                onCheckedChange={(value) => column.toggleVisibility?.(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
