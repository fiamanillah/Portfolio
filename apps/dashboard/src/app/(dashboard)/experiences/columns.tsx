"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import type { ExperiencesTableFeatures } from "./data-table-features"
import {
  MoreHorizontal,
  Edit2,
  Eye,
  Copy,
  Trash2,
  ExternalLink,
  Briefcase,
  Calendar,
  CheckCircle2,
  MapPin,
  Clock,
  Archive,
  FileEdit,
  ArrowUpDown,
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
import type { ExperienceListItemDTO, ExperienceStatus } from "@workspace/shared"

interface GetColumnsOptions {
  onEdit: (exp: ExperienceListItemDTO) => void
  onPreview: (exp: ExperienceListItemDTO) => void
  onDuplicate: (exp: ExperienceListItemDTO) => void
  onDelete: (exp: ExperienceListItemDTO) => void
  onStatusChange: (exp: ExperienceListItemDTO, status: ExperienceStatus) => void
}

const STATUS_VARIANTS: Record<
  ExperienceStatus,
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

export function getExperienceColumns({
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  onStatusChange,
}: GetColumnsOptions): ColumnDef<ExperiencesTableFeatures, ExperienceListItemDTO>[] {
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
          {String(row.original.order).padStart(2, "0")}
        </span>
      ),
    },
    {
      accessorKey: "year",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Period" />
      ),
      cell: ({ row }) => {
        const exp = row.original
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs font-bold text-foreground">
              {exp.year}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground uppercase">
              {exp.period}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role & Company" />
      ),
      cell: ({ row }) => {
        const exp = row.original
        return (
          <div className="flex flex-col gap-1 max-w-[280px]">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-foreground truncate">
                {exp.role}
              </span>
              {exp.isCurrent && (
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20 text-[9px] px-1.5 py-0 h-4 font-mono font-medium"
                >
                  CURRENT
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80 flex items-center gap-1">
                <Briefcase className="h-3 w-3 text-primary" />
                {exp.company}
              </span>
              {exp.companyUrl && (
                <a
                  href={exp.companyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title="Open company website"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <span>•</span>
              <span className="truncate flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {exp.location}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "employmentType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="border-border bg-muted/30 font-mono text-[10px] font-semibold text-foreground uppercase"
        >
          {row.original.employmentType}
        </Badge>
      ),
    },
    {
      accessorKey: "technologies",
      header: "Technologies",
      cell: ({ row }) => {
        const tech = row.original.technologies || []
        const displayed = tech.slice(0, 3)
        const remainder = tech.length - displayed.length

        return (
          <div className="flex flex-wrap items-center gap-1 max-w-[240px]">
            {displayed.map((t, idx) => (
              <span
                key={idx}
                className="border border-border/80 bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
              >
                {t}
              </span>
            ))}
            {remainder > 0 && (
              <span className="border border-primary/30 bg-primary/5 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                +{remainder}
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
        const status = row.original.status as ExperienceStatus
        const variant = STATUS_VARIANTS[status] || STATUS_VARIANTS.DRAFT
        return (
          <Badge
            variant="outline"
            className={`${variant.class} flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider uppercase w-fit`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${variant.dot}`} />
            {variant.label}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const exp = row.original

        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => onPreview(exp)}
              title="Live Preview"
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">Preview</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(exp)}
              title="Edit Experience"
            >
              <Edit2 className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-mono text-[11px] text-muted-foreground uppercase">
                  Actions
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(exp)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPreview(exp)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Live Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(exp)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate as Draft
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel className="font-mono text-[11px] text-muted-foreground uppercase">
                  Status
                </DropdownMenuLabel>
                {exp.status !== "PUBLISHED" && (
                  <DropdownMenuItem
                    onClick={() => onStatusChange(exp, "PUBLISHED")}
                    className="text-emerald-500 focus:text-emerald-500"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Set to Published
                  </DropdownMenuItem>
                )}
                {exp.status !== "DRAFT" && (
                  <DropdownMenuItem
                    onClick={() => onStatusChange(exp, "DRAFT")}
                    className="text-amber-500 focus:text-amber-500"
                  >
                    <FileEdit className="mr-2 h-4 w-4" />
                    Set to Draft
                  </DropdownMenuItem>
                )}
                {exp.status !== "ARCHIVED" && (
                  <DropdownMenuItem
                    onClick={() => onStatusChange(exp, "ARCHIVED")}
                    className="text-zinc-400 focus:text-zinc-400"
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(exp)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
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
