"use client"

import * as React from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, EyeOff } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

export interface ColumnLike {
  getCanSort?: () => boolean
  getIsSorted?: () => "asc" | "desc" | false | undefined
  getCanHide?: () => boolean
  toggleSorting?: (desc?: boolean) => void
  toggleVisibility?: (value: boolean) => void
}

export interface DataTableColumnHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  column: ColumnLike
  title: string
}

export function DataTableColumnHeader({
  column,
  title,
  className,
}: DataTableColumnHeaderProps) {
  const canSort =
    typeof column?.getCanSort === "function" ? column.getCanSort() : false

  if (!canSort) {
    return <div className={cn("text-xs font-semibold", className)}>{title}</div>
  }

  const isSorted =
    typeof column?.getIsSorted === "function" ? column.getIsSorted() : false
  const canHide =
    typeof column?.getCanHide === "function" ? column.getCanHide() : false

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-xs font-medium data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {isSorted === "desc" ? (
              <ArrowDown className="ml-2 size-3.5" />
            ) : isSorted === "asc" ? (
              <ArrowUp className="ml-2 size-3.5" />
            ) : (
              <ArrowUpDown className="ml-2 size-3.5 text-muted-foreground/70" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() => column.toggleSorting?.(false)}
            className="gap-2 text-xs"
          >
            <ArrowUp className="size-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => column.toggleSorting?.(true)}
            className="gap-2 text-xs"
          >
            <ArrowDown className="size-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
          {canHide && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => column.toggleVisibility?.(false)}
                className="gap-2 text-xs"
              >
                <EyeOff className="size-3.5 text-muted-foreground/70" />
                Hide column
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
