"use client"

import * as React from "react"
import {
  type Column,
  type RowData,
  type TableFeatures,
  type Table,
} from "@tanstack/react-table"
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

export interface DataTableViewOptionsColumn {
  id: string
  getCanHide?: () => boolean
  getIsVisible?: () => boolean
  toggleVisibility?: (value: boolean) => void
}

export interface DataTableViewOptionsTable {
  getAllColumns?: () => DataTableViewOptionsColumn[]
}

export interface DataTableViewOptionsProps {
  table: DataTableViewOptionsTable
}

export function DataTableViewOptions({ table }: DataTableViewOptionsProps) {
  const allColumns =
    typeof table?.getAllColumns === "function" ? table.getAllColumns() : []

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
        <DropdownMenuLabel className="text-xs">
          Toggle columns
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {allColumns
          .filter((column) =>
            typeof column.getCanHide === "function" ? column.getCanHide() : true
          )
          .map((column) => {
            const isVisible =
              typeof column.getIsVisible === "function"
                ? column.getIsVisible()
                : true
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="text-xs capitalize"
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
