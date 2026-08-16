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
            checked={isAllSelected || (isSomeSelected ? "indeterminate" : false)}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected?.(!!value)}
            aria-label="Select all templates on page"
            className="translate-y-[2px]"
          />
        )
      },
      cell: ({ row }) => (
        <Checkbox
          checked={
            typeof row.getIsSelected === "function" ? row.getIsSelected() : false
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
          <div className="flex items-center gap-3 max-w-[280px]">
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                template.isSystem
                  ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                  : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              }`}
            >
              {template.isSystem ? (
                <Code2 className="size-4.5" />
              ) : (
                <Sparkles className="size-4.5" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm truncate text-foreground">
                {template.name}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <code className="text-[11px] font-mono text-muted-foreground truncate max-w-[170px]">
                  {template.slug}
                </code>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigator.clipboard.writeText(template.slug)
                    toast.success("Slug copied to clipboard")
                  }}
                  className="text-muted-foreground/60 hover:text-foreground transition-colors"
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
            className="border-blue-500/30 bg-blue-500/10 text-blue-400 font-medium text-[11px] gap-1 px-2.5 py-0.5"
          >
            <Code2 className="size-3" />
            Codebase
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-medium text-[11px] gap-1 px-2.5 py-0.5"
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
              className="border-amber-500/30 bg-amber-500/10 text-amber-400 font-medium text-[11px]"
            >
              Transactional
            </Badge>
          )
        }
        if (type === "MARKETING") {
          return (
            <Badge
              variant="outline"
              className="border-purple-500/30 bg-purple-500/10 text-purple-400 font-medium text-[11px]"
            >
              Marketing
            </Badge>
          )
        }
        return (
          <Badge
            variant="outline"
            className="border-sky-500/30 bg-sky-500/10 text-sky-400 font-medium text-[11px]"
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
            className="text-xs text-muted-foreground line-clamp-1 max-w-[260px]"
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
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-medium text-[11px] gap-1 px-2 py-0.5"
            >
              <CheckCircle2 className="size-3" />
              Synced
            </Badge>
            {syncedAt && (
              <span
                className="text-[10px] text-muted-foreground hidden lg:inline"
                title={`Synced at: ${formatFullDate(syncedAt)}`}
              >
                {formatRelativeTime(syncedAt)}
              </span>
            )}
          </div>
        ) : (
          <Badge
            variant="outline"
            className="border-zinc-700 bg-zinc-800/40 text-muted-foreground font-medium text-[11px] gap-1 px-2 py-0.5"
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
                  className="text-xs gap-2 cursor-pointer"
                >
                  <Eye className="size-3.5 text-blue-400" />
                  Live Preview
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => actions.onEdit(template)}
                  className="text-xs gap-2 cursor-pointer"
                >
                  <Pencil className="size-3.5 text-amber-400" />
                  Edit Template
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => actions.onSendTest(template)}
                  className="text-xs gap-2 cursor-pointer"
                >
                  <Send className="size-3.5 text-purple-400" />
                  Send Test Email
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => actions.onSyncSingle(template)}
                  className="text-xs gap-2 cursor-pointer"
                >
                  <Cloud className="size-3.5 text-emerald-400" />
                  Sync to Plunk
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => actions.onDuplicate(template)}
                  className="text-xs gap-2 cursor-pointer"
                >
                  <Copy className="size-3.5 text-sky-400" />
                  Duplicate
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {template.isSystem ? (
                  <DropdownMenuItem
                    onClick={() => actions.onResetDefault(template)}
                    className="text-xs gap-2 cursor-pointer text-amber-400 focus:text-amber-400"
                  >
                    <RotateCcw className="size-3.5" />
                    Reset to Codebase Default
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => actions.onDelete(template)}
                    className="text-xs gap-2 cursor-pointer text-destructive focus:text-destructive"
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
