"use client"

import * as React from "react"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import {
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Mail,
  MoreVertical,
  Pencil,
  RotateCw,
  Trash2,
  UserCheck,
  UserX,
  XCircle,
} from "lucide-react"

import type { SubscriberItem } from "@workspace/shared"
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
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { DataTableColumnHeader } from "@workspace/ui/components/data-table-column-header"
import { toast } from "@workspace/ui/components/sonner"
import { type DataTableFeatures } from "./data-table-features"

export interface SubscriberColumnActions {
  onViewDetails: (subscriber: SubscriberItem) => void
  onEdit: (subscriber: SubscriberItem) => void
  onDelete: (subscriber: SubscriberItem) => void
  onToggleStatus: (
    subscriber: SubscriberItem,
    newStatus: "subscribed" | "unsubscribed" | "pending"
  ) => void
  onResendEmail: (subscriber: SubscriberItem) => void
}

function formatRelativeTime(dateString: string | Date): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return "Today"
  if (diffInDays === 1) return "Yesterday"
  if (diffInDays < 30) return `${diffInDays} days ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} mo ago`
  return `${Math.floor(diffInDays / 365)} yr ago`
}

function formatFullDate(dateString: string | Date): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatSourceName(source: string): string {
  if (!source) return "Direct"
  return source
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const columnHelper = createColumnHelper<DataTableFeatures, SubscriberItem>()

export function getSubscriberColumns(
  actions: SubscriberColumnActions
): ColumnDef<DataTableFeatures, SubscriberItem>[] {
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
            aria-label="Select all subscribers on page"
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
          aria-label={`Select ${row.original.email}`}
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor("email", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Subscriber" />
      ),
      cell: ({ row }) => {
        const sub = row.original
        const initials = sub.name
          ? sub.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          : sub.email.slice(0, 2).toUpperCase()

        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8 rounded-full border border-border bg-muted">
              <AvatarFallback className="text-[11px] font-semibold text-foreground/80">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 leading-tight">
              <div className="flex items-center gap-1.5 truncate text-xs font-medium">
                <span className="truncate">
                  {sub.name || "Anonymous Subscriber"}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                <span className="truncate">{sub.email}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigator.clipboard.writeText(sub.email)
                    toast.success("Email copied to clipboard")
                  }}
                  className="p-0.5 text-muted-foreground/60 transition-colors hover:text-foreground"
                  title="Copy email"
                >
                  <Copy className="size-3" />
                </button>
              </div>
            </div>
          </div>
        )
      },
    }),
    columnHelper.accessor("status", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.original.status?.toLowerCase()

        if (status === "subscribed" || status === "active") {
          return (
            <Badge
              variant="default"
              className="gap-1 border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"
            >
              <CheckCircle2 className="size-3" />
              Subscribed
            </Badge>
          )
        }

        if (status === "pending" || status === "unconfirmed") {
          return (
            <Badge
              variant="secondary"
              className="gap-1 border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400"
            >
              <Clock className="size-3" />
              Pending
            </Badge>
          )
        }

        return (
          <Badge
            variant="outline"
            className="gap-1 border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-600 dark:text-rose-400"
          >
            <XCircle className="size-3" />
            Unsubscribed
          </Badge>
        )
      },
    }),
    columnHelper.accessor("source", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Acquisition Source" />
      ),
      cell: ({ row }) => {
        const source = row.original.source || "hero_section"
        const formatted = formatSourceName(source)

        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center rounded-md border border-border/60 bg-muted px-2 py-0.5 text-[11px] font-medium">
              {formatted}
            </span>
          </div>
        )
      },
    }),
    columnHelper.accessor("subscribedAt", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Subscribed Date" />
      ),
      cell: ({ row }) => {
        const date = row.original.subscribedAt
        if (!date)
          return <span className="text-xs text-muted-foreground">—</span>

        return (
          <div className="grid text-xs leading-tight">
            <span className="font-medium text-foreground">
              {formatFullDate(date)}
            </span>
            <span className="mt-0.5 text-[10px] text-muted-foreground">
              {formatRelativeTime(date)}
            </span>
          </div>
        )
      },
    }),
    columnHelper.display({
      id: "actions",
      header: () => <div className="pr-2 text-right">Actions</div>,
      cell: ({ row }) => {
        const sub = row.original
        const isSubscribed = sub.status?.toLowerCase() === "subscribed"

        return (
          <div className="pr-2 text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreVertical className="size-4" />
                  <span className="sr-only">Open subscriber menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs font-semibold">
                  Subscriber Actions
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => actions.onViewDetails(sub)}
                  className="gap-2 text-xs"
                >
                  <ExternalLink className="size-3.5 text-primary" />
                  View Details & Audit
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => actions.onEdit(sub)}
                  className="gap-2 text-xs"
                >
                  <Pencil className="size-3.5" />
                  Edit Subscriber
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => actions.onResendEmail(sub)}
                  className="gap-2 text-xs"
                >
                  <RotateCw className="size-3.5" />
                  Resend Welcome Email
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {isSubscribed ? (
                  <DropdownMenuItem
                    onClick={() => actions.onToggleStatus(sub, "unsubscribed")}
                    className="gap-2 text-xs text-amber-600 dark:text-amber-400"
                  >
                    <UserX className="size-3.5" />
                    Mark Unsubscribed
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => actions.onToggleStatus(sub, "subscribed")}
                    className="gap-2 text-xs text-emerald-600 dark:text-emerald-400"
                  >
                    <UserCheck className="size-3.5" />
                    Mark Subscribed
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(sub.id)
                    toast.success("Subscriber ID copied")
                  }}
                  className="gap-2 font-mono text-xs text-muted-foreground"
                >
                  <Copy className="size-3.5" />
                  Copy ID: {sub.id.slice(0, 8)}...
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => actions.onDelete(sub)}
                  className="gap-2 text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  Delete Subscriber
                </DropdownMenuItem>
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
