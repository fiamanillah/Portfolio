"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import type { CaseStudiesTableFeatures } from "./data-table-features"
import {
  MoreHorizontal,
  Edit2,
  Eye,
  Copy,
  Trash2,
  ExternalLink,
  ThumbsUp,
  Clock,
  Calendar,
  CheckCircle,
  FileEdit,
  Archive,
  Layers,
  Sparkles,
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
import type { CaseStudyListItemDTO, CaseStudyStatus } from "@workspace/shared"

interface GetColumnsOptions {
  onEdit: (study: CaseStudyListItemDTO) => void
  onPreview: (study: CaseStudyListItemDTO) => void
  onDuplicate: (study: CaseStudyListItemDTO) => void
  onDelete: (study: CaseStudyListItemDTO) => void
  onStatusChange: (study: CaseStudyListItemDTO, status: CaseStudyStatus) => void
}

const STATUS_VARIANTS: Record<
  CaseStudyStatus,
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

export function getCaseStudyColumns({
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  onStatusChange,
}: GetColumnsOptions): ColumnDef<CaseStudiesTableFeatures, CaseStudyListItemDTO>[] {
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
      cell: ({ row }) => {
        const order = row.original.order
        return (
          <span className="font-mono text-xs font-semibold text-muted-foreground">
            {String(order).padStart(2, "0")}
          </span>
        )
      },
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Case Study" />
      ),
      cell: ({ row }) => {
        const study = row.original
        return (
          <div className="flex max-w-md items-center gap-3 py-1">
            {study.image ? (
              <div className="h-12 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-muted/30">
                <img
                  src={study.image}
                  alt={study.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 font-mono text-[10px] text-muted-foreground">
                No img
              </div>
            )}
            <div className="min-w-0 space-y-0.5">
              <div className="line-clamp-1 flex items-center gap-1.5 text-sm leading-tight font-semibold text-foreground">
                <span
                  className="cursor-pointer transition-colors hover:text-primary"
                  onClick={() => onEdit(study)}
                >
                  {study.title}
                </span>
                {study.projectType === "PROJECT" ? (
                  <Badge
                    variant="outline"
                    className="border-purple-500/30 bg-purple-500/10 px-1 py-0 font-mono text-[9px] text-purple-400"
                  >
                    Project
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-primary/30 bg-primary/10 px-1 py-0 font-mono text-[9px] text-primary"
                  >
                    Deep Dive
                  </Badge>
                )}
                {study.featured && (
                  <Badge
                    variant="outline"
                    className="border-amber-500/30 bg-amber-500/10 px-1 py-0 text-[10px] text-amber-500"
                  >
                    <Sparkles className="mr-0.5 size-2.5" /> Featured
                  </Badge>
                )}
                {study.pinned && (
                  <Badge
                    variant="outline"
                    className="border-blue-500/30 bg-blue-500/10 px-1 py-0 text-[10px] text-blue-500"
                  >
                    Pinned
                  </Badge>
                )}
              </div>
              <p className="line-clamp-1 font-mono text-xs text-muted-foreground">
                /case-study/{study.slug}
              </p>
              {study.client && (
                <p className="line-clamp-1 text-[11px] text-muted-foreground/80">
                  Client: {study.client} • {study.role || "Architect"}
                </p>
              )}
            </div>
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
        const status = row.original.status as CaseStudyStatus
        const config = STATUS_VARIANTS[status] || STATUS_VARIANTS.DRAFT
        return (
          <div className="flex flex-col gap-1 items-start">
            <Badge
              variant="outline"
              className={`flex items-center gap-1.5 px-2 py-0.5 font-mono text-xs ${config.class}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
              {config.label}
            </Badge>
            {row.original.projectStatus && (
              <span className="text-[10px] text-muted-foreground">
                {row.original.projectStatus}
              </span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "techStack",
      header: "Technologies",
      cell: ({ row }) => {
        const stack = row.original.techStack || []
        return (
          <div className="flex max-w-[200px] flex-wrap gap-1">
            {stack.slice(0, 3).map((tech) => (
              <Badge
                key={tech}
                variant="secondary"
                className="px-1.5 py-0 font-mono text-[10px]"
              >
                {tech}
              </Badge>
            ))}
            {stack.length > 3 && (
              <Badge
                variant="outline"
                className="px-1.5 py-0 font-mono text-[10px] text-muted-foreground"
              >
                +{stack.length - 3}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "views",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Views" />
      ),
      cell: ({ row }) => {
        const study = row.original
        return (
          <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="size-3 text-muted-foreground/70" />
              {study.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="size-3 text-muted-foreground/70" />
              {study.likesCount}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "publishedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => {
        const study = row.original
        const dateStr = study.publishedAt || study.createdAt
        const date = new Date(dateStr)
        return (
          <div className="flex flex-col text-xs">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Calendar className="size-3 text-muted-foreground" />
              {date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {study.timeline || "2026"}
            </span>
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const study = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-mono text-[11px] text-muted-foreground uppercase">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onEdit(study)}
                className="cursor-pointer text-xs"
              >
                <Edit2 className="mr-2 size-3.5" />
                Edit Case Study
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onPreview(study)}
                className="cursor-pointer text-xs"
              >
                <Eye className="mr-2 size-3.5" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDuplicate(study)}
                className="cursor-pointer text-xs"
              >
                <Copy className="mr-2 size-3.5" />
                Duplicate as Draft
              </DropdownMenuItem>

              {study.liveUrl && (
                <DropdownMenuItem asChild className="cursor-pointer text-xs">
                  <a
                    href={study.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center"
                  >
                    <ExternalLink className="mr-2 size-3.5" />
                    Open Live Demo
                  </a>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="font-mono text-[11px] text-muted-foreground uppercase">
                Change Status
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onStatusChange(study, "PUBLISHED")}
                disabled={study.status === "PUBLISHED"}
                className="cursor-pointer text-xs text-emerald-600 focus:text-emerald-600"
              >
                <CheckCircle className="mr-2 size-3.5" />
                Mark as Published
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange(study, "DRAFT")}
                disabled={study.status === "DRAFT"}
                className="cursor-pointer text-xs text-amber-600 focus:text-amber-600"
              >
                <FileEdit className="mr-2 size-3.5" />
                Move to Draft
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange(study, "ARCHIVED")}
                disabled={study.status === "ARCHIVED"}
                className="cursor-pointer text-xs text-zinc-500 focus:text-zinc-500"
              >
                <Archive className="mr-2 size-3.5" />
                Archive
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(study)}
                className="cursor-pointer text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <Trash2 className="mr-2 size-3.5" />
                Delete Case Study
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
