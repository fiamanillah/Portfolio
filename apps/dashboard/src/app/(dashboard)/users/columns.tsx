"use client"

import * as React from "react"
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table"
import {
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  MoreVertical,
  Pencil,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
} from "lucide-react"

import type { AuthUser, Role } from "@workspace/shared"
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { DataTableColumnHeader } from "@workspace/ui/components/data-table-column-header"
import { toast } from "@workspace/ui/components/sonner"
import { type UsersTableFeatures } from "./data-table-features"

export interface UserColumnActions {
  currentUserId?: string
  onChangeRole: (user: AuthUser) => void
  onDeleteUser: (user: AuthUser) => void
  onViewDetails: (user: AuthUser) => void
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "—"
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

function formatFullDate(dateString?: string): string {
  if (!dateString) return "—"
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const columnHelper = createColumnHelper<UsersTableFeatures, AuthUser>()

export function getUserColumns(
  actions: UserColumnActions
): ColumnDef<UsersTableFeatures, AuthUser>[] {
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
            aria-label="Select all users on page"
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
        <DataTableColumnHeader column={column} title="User Account" />
      ),
      cell: ({ row }) => {
        const u = row.original
        const isCurrent = u.id === actions.currentUserId

        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8 rounded-lg border border-border bg-muted">
              <AvatarImage src={u.avatar || undefined} alt={u.name} />
              <AvatarFallback className="text-[11px] font-bold">
                {u.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 leading-tight">
              <div className="flex items-center gap-1.5 truncate text-xs font-medium">
                <span className="truncate">{u.name}</span>
                {isCurrent && (
                  <Badge variant="secondary" className="h-4 px-1 text-[9px]">
                    You
                  </Badge>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                <span className="truncate">@{u.username}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigator.clipboard.writeText(`@${u.username}`)
                    toast.success("Username copied")
                  }}
                  className="p-0.5 text-muted-foreground/60 hover:text-foreground"
                  title="Copy username"
                >
                  <Copy className="size-3" />
                </button>
              </div>
            </div>
          </div>
        )
      },
    }),
    columnHelper.accessor("email", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email & Verification" />
      ),
      cell: ({ row }) => {
        const u = row.original

        return (
          <div className="grid text-xs leading-tight">
            <div className="flex items-center gap-1 font-mono text-[11px]">
              <span className="truncate">{u.email}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  navigator.clipboard.writeText(u.email)
                  toast.success("Email copied to clipboard")
                }}
                className="p-0.5 text-muted-foreground/60 hover:text-foreground"
                title="Copy email"
              >
                <Copy className="size-3" />
              </button>
            </div>
            <div className="mt-0.5 flex items-center gap-1">
              {u.isEmailVerified ? (
                <span className="flex items-center text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="mr-0.5 size-2.5" />
                  Verified
                </span>
              ) : (
                <span className="flex items-center text-[10px] font-medium text-amber-600 dark:text-amber-400">
                  <Clock className="mr-0.5 size-2.5" />
                  Unverified
                </span>
              )}
            </div>
          </div>
        )
      },
    }),
    columnHelper.accessor("role", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assigned Role" />
      ),
      cell: ({ row }) => {
        const role = row.original.role

        if (role === "ADMIN") {
          return (
            <Badge
              variant="default"
              className="gap-1 border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] text-emerald-600 uppercase dark:text-emerald-400"
            >
              <ShieldCheck className="size-3" />
              Admin
            </Badge>
          )
        }

        if (role === "MODERATOR") {
          return (
            <Badge
              variant="secondary"
              className="gap-1 border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] text-amber-600 uppercase dark:text-amber-400"
            >
              <ShieldAlert className="size-3" />
              Moderator
            </Badge>
          )
        }

        if (role === "AUTHOR") {
          return (
            <Badge
              variant="outline"
              className="gap-1 border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 font-mono text-[10px] text-indigo-600 uppercase dark:text-indigo-400"
            >
              <Pencil className="size-3" />
              Author
            </Badge>
          )
        }

        return (
          <Badge
            variant="outline"
            className="gap-1 px-2 py-0.5 font-mono text-[10px] text-muted-foreground uppercase"
          >
            <UserCheck className="size-3" />
            User
          </Badge>
        )
      },
    }),
    columnHelper.accessor("createdAt", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created Date" />
      ),
      cell: ({ row }) => {
        const date = row.original.createdAt
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
        const u = row.original
        const isCurrent = u.id === actions.currentUserId

        return (
          <div className="pr-2 text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreVertical className="size-4" />
                  <span className="sr-only">Open user actions menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs font-semibold">
                  Manage Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => actions.onViewDetails(u)}
                  className="gap-2 text-xs"
                >
                  <ExternalLink className="size-3.5 text-primary" />
                  View Account Details
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => actions.onChangeRole(u)}
                  className="gap-2 text-xs"
                >
                  <Shield className="size-3.5 text-primary" />
                  Modify Role & Access
                </DropdownMenuItem>

                {!isCurrent && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => actions.onDeleteUser(u)}
                      className="gap-2 text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                      Delete Account
                    </DropdownMenuItem>
                  </>
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
