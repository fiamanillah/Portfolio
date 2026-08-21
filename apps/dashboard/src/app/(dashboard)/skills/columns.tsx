"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import {
  MoreHorizontal,
  Edit2,
  Copy,
  Trash2,
  Star,
  CheckCircle2,
  FileEdit,
  Archive,
} from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { DataTableColumnHeader } from "@workspace/ui/components/data-table-column-header"
import type { SkillListItemDTO, SkillStatus } from "@workspace/shared"
import type { SkillsTableFeatures } from "./data-table-features"

interface GetColumnsOptions {
  onEdit: (skill: SkillListItemDTO) => void
  onDuplicate: (id: string) => void
  onDelete: (skill: SkillListItemDTO) => void
  onStatusChange: (skill: SkillListItemDTO, status: SkillStatus) => void
}

const STATUS_VARIANTS: Record<
  SkillStatus,
  { label: string; class: string; dot: string }
> = {
  PUBLISHED: {
    label: "Published",
    class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  DRAFT: {
    label: "Draft",
    class: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    dot: "bg-amber-500",
  },
  ARCHIVED: {
    label: "Archived",
    class: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
    dot: "bg-zinc-500",
  },
}

export function getSkillColumns({
  onEdit,
  onDuplicate,
  onDelete,
  onStatusChange,
}: GetColumnsOptions): ColumnDef<SkillsTableFeatures, SkillListItemDTO>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "order",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="#" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.getValue("order")}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Skill & Labels" />
      ),
      cell: ({ row }) => {
        const skill = row.original
        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
              <span>{skill.name}</span>
              {skill.featured && (
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              )}
            </div>
            {(skill.leftLabel || skill.rightLabel) && (
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
                {skill.leftLabel && <span>{skill.leftLabel}</span>}
                {skill.leftLabel && skill.rightLabel && (
                  <span className="text-muted-foreground/40">/</span>
                )}
                {skill.rightLabel && <span>{skill.rightLabel}</span>}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "categoryName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => {
        const skill = row.original
        if (!skill.categoryName) {
          return (
            <span className="font-mono text-xs text-muted-foreground">
              Unassigned
            </span>
          )
        }
        return (
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="font-mono text-[11px]">
              {skill.categoryCode || skill.categoryName}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "level",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Proficiency" />
      ),
      cell: ({ row }) => {
        const level = row.getValue("level") as number
        return (
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-3 w-3 ${
                  star <= level
                    ? "fill-primary text-primary"
                    : "text-muted-foreground/20"
                }`}
              />
            ))}
          </div>
        )
      },
    },
    {
      accessorKey: "tags",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tags" />
      ),
      cell: ({ row }) => {
        const tags = (row.getValue("tags") as string[]) || []
        if (tags.length === 0) {
          return <span className="text-xs text-muted-foreground">—</span>
        }
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-sm bg-secondary/80 px-1.5 py-0.5 font-mono text-[10px] text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="font-mono text-[10px] text-muted-foreground">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const skill = row.original
        const status = skill.status as SkillStatus
        const variant = STATUS_VARIANTS[status] || STATUS_VARIANTS.PUBLISHED

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 focus:outline-none group">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${variant.class} group-hover:opacity-80 transition-opacity`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${variant.dot}`} />
                  {variant.label}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-36">
              <DropdownMenuLabel className="text-[10px] font-mono uppercase text-muted-foreground">
                Set Status
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onStatusChange(skill, "PUBLISHED")}>
                <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                Published
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(skill, "DRAFT")}>
                <FileEdit className="mr-2 h-3.5 w-3.5 text-amber-500" />
                Draft
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(skill, "ARCHIVED")}>
                <Archive className="mr-2 h-3.5 w-3.5 text-zinc-500" />
                Archived
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const skill = row.original
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => onEdit(skill)}>
                  <Edit2 className="mr-2 h-3.5 w-3.5" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(skill.id)}>
                  <Copy className="mr-2 h-3.5 w-3.5" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(skill)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
