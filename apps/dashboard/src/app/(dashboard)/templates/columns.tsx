"use client"

import * as React from "react"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import {
  CheckCircle2,
  Cloud,
  CloudOff,
  Code2,
  Copy,
  ExternalLink,
  Eye,
  FileCode2,
  Layers,
  MoreVertical,
  Pencil,
  RotateCcw,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react"

import type { EmailTemplate } from "@workspace/shared"
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
import { toast } from "@workspace/ui/components/sonner"
import { type TemplatesTableFeatures } from "./data-table-features"

export interface TemplateColumnActions {
  onPreview: (template: EmailTemplate) => void
  onEdit: (template: EmailTemplate) => void
  onDelete: (template: EmailTemplate) => void
  onDuplicate: (template: EmailTemplate) => void
  onSendTest: (template: EmailTemplate) => void
  onSyncSingle: (template: EmailTemplate) => void
  onResetDefault: (template: EmailTemplate) => void
}

function formatRelativeTime(dateString: string | Date): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays === 1) return "Yesterday"
  if (diffInDays < 30) return `${diffInDays}d ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo ago`
  return `${Math.floor(diffInDays / 365)}y ago`
}

function formatFullDate(dateString: string | Date): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const columnHelper = createColumnHelper<TemplatesTableFeatures, EmailTemplate>()

export function getTemplateColumns(
  actions: TemplateColumnActions
): ColumnDef<TemplatesTableFeatures, EmailTemplate>[] {
  return columnHelper.columns([
    columnHelper.display({
      id: "select",
      header: ({ table }) => {
        const isAllSelected =
          typeof table.getIsAllPageRowsSelected === "function"
            ? table.getIsAllPageRowsSelected()
            : false
        const isSomeSelected =
          typeof table.getIsSomePageRowsSelected === "function"
            ? table.getIsSomePageRowsSelected()
            : false

        return (
          <Checkbox
            checked={
              isAllSelected || (isSomeSelected ? "indeterminate" : false)
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected?.(!!value)
            }
            aria-label="Select all templates on page"
            className="translate-y-[2px]"
          />
        )
      },
      cell: ({ row }) => (
        <Checkbox
          checked={
            typeof row.getIsSelected === "function"
              ? row.getIsSelected()
              : false
          }
          onCheckedChange={(value) => row.toggleSelected?.(!!value)}
          aria-label={`Select ${row.original.name}`}
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }),

    columnHelper.accessor("name", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Template Name & Slug" />
      ),
      cell: ({ row }) => {
        const template = row.original
        return (
          <div className="flex max-w-[280px] items-center gap-3">
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                template.isSystem
                  ? "border border-blue-500/20 bg-blue-500/10 text-blue-500"
                  : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
              }`}
            >
              {template.isSystem ? (
                <Code2 className="size-4.5" />
              ) : (
                <Sparkles className="size-4.5" />
              )}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold text-foreground">
                {template.name}
              </span>
              <div className="mt-0.5 flex items-center gap-1.5">
                <code className="max-w-[170px] truncate font-mono text-[11px] text-muted-foreground">
                  {template.slug}
                </code>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigator.clipboard.writeText(template.slug)
                    toast.success("Slug copied to clipboard")
                  }}
                  className="text-muted-foreground/60 transition-colors hover:text-foreground"
                  title="Copy slug"
                >
                  <Copy className="size-3" />
                </button>
              </div>
            </div>
          </div>
        )
      },
      enableSorting: true,
    }),

    columnHelper.accessor("isSystem", {
      id: "source",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Source Origin" />
      ),
      cell: ({ row }) => {
        const isSystem = row.original.isSystem
        return isSystem ? (
          <Badge
            variant="outline"
            className="gap-1 border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-medium text-blue-400"
          >
            <Code2 className="size-3" />
            Codebase
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="gap-1 border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400"
          >
            <Sparkles className="size-3" />
            Custom Made
          </Badge>
        )
      },
      enableSorting: true,
    }),

    columnHelper.accessor("type", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const type = row.original.type
        if (type === "TRANSACTIONAL") {
          return (
            <Badge
              variant="outline"
              className="border-amber-500/30 bg-amber-500/10 text-[11px] font-medium text-amber-400"
            >
              Transactional
            </Badge>
          )
        }
        if (type === "MARKETING") {
          return (
            <Badge
              variant="outline"
              className="border-purple-500/30 bg-purple-500/10 text-[11px] font-medium text-purple-400"
            >
              Marketing
            </Badge>
          )
        }
        return (
          <Badge
            variant="outline"
            className="border-sky-500/30 bg-sky-500/10 text-[11px] font-medium text-sky-400"
          >
            Headless
          </Badge>
        )
      },
      enableSorting: true,
    }),

    columnHelper.accessor("subject", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Subject Line" />
      ),
      cell: ({ row }) => {
        const subject = row.original.subject
        return (
          <span
            className="line-clamp-1 max-w-[260px] text-xs text-muted-foreground"
            title={subject}
          >
            {subject}
          </span>
        )
      },
      enableSorting: false,
    }),

    columnHelper.accessor("plunkId", {
      id: "syncStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Plunk Sync" />
      ),
      cell: ({ row }) => {
        const plunkId = row.original.plunkId
        const syncedAt = row.original.syncedAt

        return plunkId ? (
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className="gap-1 border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400"
            >
              <CheckCircle2 className="size-3" />
              Synced
            </Badge>
            {syncedAt && (
              <span
                className="hidden text-[10px] text-muted-foreground lg:inline"
                title={`Synced at: ${formatFullDate(syncedAt)}`}
              >
                {formatRelativeTime(syncedAt)}
              </span>
            )}
          </div>
        ) : (
          <Badge
            variant="outline"
            className="gap-1 border-zinc-700 bg-zinc-800/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
          >
            <CloudOff className="size-3" />
            Local Only
          </Badge>
        )
      },
      enableSorting: true,
    }),

    columnHelper.accessor("updatedAt", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last Updated" />
      ),
      cell: ({ row }) => {
        const updatedAt = row.original.updatedAt
        return (
          <span
            className="text-xs text-muted-foreground"
            title={formatFullDate(updatedAt)}
          >
            {formatRelativeTime(updatedAt)}
          </span>
        )
      },
      enableSorting: true,
    }),

    columnHelper.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const template = row.original

        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
              onClick={() => actions.onPreview(template)}
              title="Preview Liquid Template"
            >
              <Eye className="size-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
              onClick={() => actions.onEdit(template)}
              title="Edit Template"
            >
              <Pencil className="size-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical className="size-4" />
                  <span className="sr-only">Open options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                  Template Actions
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => actions.onPreview(template)}
                  className="cursor-pointer gap-2 text-xs"
                >
                  <Eye className="size-3.5 text-blue-400" />
                  Live Preview
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => actions.onEdit(template)}
                  className="cursor-pointer gap-2 text-xs"
                >
                  <Pencil className="size-3.5 text-amber-400" />
                  Edit Template
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => actions.onSendTest(template)}
                  className="cursor-pointer gap-2 text-xs"
                >
                  <Send className="size-3.5 text-purple-400" />
                  Send Test Email
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => actions.onSyncSingle(template)}
                  className="cursor-pointer gap-2 text-xs"
                >
                  <Cloud className="size-3.5 text-emerald-400" />
                  Sync to Plunk
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => actions.onDuplicate(template)}
                  className="cursor-pointer gap-2 text-xs"
                >
                  <Copy className="size-3.5 text-sky-400" />
                  Duplicate
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {template.isSystem ? (
                  <DropdownMenuItem
                    onClick={() => actions.onResetDefault(template)}
                    className="cursor-pointer gap-2 text-xs text-amber-400 focus:text-amber-400"
                  >
                    <RotateCcw className="size-3.5" />
                    Reset to Codebase Default
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => actions.onDelete(template)}
                    className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    Delete Template
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    }),
  ])
}
