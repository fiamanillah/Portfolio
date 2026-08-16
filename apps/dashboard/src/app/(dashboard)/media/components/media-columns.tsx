"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import type { MediaTableFeatures } from "./media-table-features"
import {
  MoreHorizontal,
  Eye,
  Copy,
  Download,
  Trash2,
  Folder,
  Lock,
  Globe,
  FileCode2,
} from "lucide-react"
import type { MediaFileDTO } from "@workspace/shared"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { DataTableColumnHeader } from "@workspace/ui/components/data-table-column-header"
import { MediaPreview } from "./media-preview"
import { toast } from "@workspace/ui/components/sonner"

interface GetColumnsOptions {
  onInspect: (file: MediaFileDTO) => void
  onDelete: (file: MediaFileDTO) => void
}

export function getMediaColumns({
  onInspect,
  onDelete,
}: GetColumnsOptions): ColumnDef<MediaTableFeatures, MediaFileDTO>[] {
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
      accessorKey: "fileName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Asset" />
      ),
      cell: ({ row }) => {
        const file = row.original
        return (
          <div
            onClick={() => onInspect(file)}
            className="group flex max-w-sm cursor-pointer items-center gap-3 py-1"
          >
            <div className="size-10 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-muted/20">
              <MediaPreview
                url={file.url}
                mimeType={file.mimeType}
                fileName={file.fileName}
                altText={file.altText}
                aspectRatio="square"
                thumbnailOnly
              />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-xs font-semibold text-foreground transition-colors group-hover:text-primary">
                {file.fileName}
              </span>
              <span className="truncate font-mono text-[11px] text-muted-foreground">
                {file.mimeType}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "folder",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Folder" />
      ),
      cell: ({ row }) => {
        const folder = row.getValue("folder") as string
        return (
          <Badge
            variant="outline"
            className="gap-1 border-border bg-card text-xs font-normal capitalize"
          >
            <Folder className="size-3 text-primary/70" />
            {folder}
          </Badge>
        )
      },
    },
    {
      accessorKey: "size",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="File Size" />
      ),
      cell: ({ row }) => {
        const file = row.original
        return (
          <span className="font-mono text-xs text-muted-foreground">
            {file.sizeFormatted}
          </span>
        )
      },
    },
    {
      accessorKey: "altText",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Alt Text / Title" />
      ),
      cell: ({ row }) => {
        const alt = row.getValue("altText") as string | null
        return (
          <span className="block max-w-[180px] truncate text-xs text-muted-foreground">
            {alt || (
              <span className="text-muted-foreground/50 italic">
                None specified
              </span>
            )}
          </span>
        )
      },
    },
    {
      accessorKey: "uploader",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Uploaded By" />
      ),
      cell: ({ row }) => {
        const uploader = row.original.uploader
        if (!uploader) {
          return (
            <span className="text-xs text-muted-foreground">System / API</span>
          )
        }
        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-5">
              <AvatarImage src={uploader.avatar || undefined} />
              <AvatarFallback className="text-[10px]">
                {uploader.name?.slice(0, 2).toUpperCase() || "AD"}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-[100px] truncate text-xs">
              {uploader.name || uploader.email}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Uploaded Date" />
      ),
      cell: ({ row }) => {
        const dateStr = row.getValue("createdAt") as string
        const date = new Date(dateStr)
        return (
          <span className="text-xs whitespace-nowrap text-muted-foreground">
            {date.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const file = row.original

        const handleCopyUrl = () => {
          navigator.clipboard.writeText(file.url)
          toast.success("Asset URL copied to clipboard!")
        }

        const handleCopyMarkdown = () => {
          const md = `![${file.altText || file.fileName}](${file.url})`
          navigator.clipboard.writeText(md)
          toast.success("Markdown code copied to clipboard!")
        }

        const handleDownload = () => {
          const a = document.createElement("a")
          a.href = file.url
          a.download = file.fileName
          a.target = "_blank"
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40 text-xs">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onInspect(file)}>
                <Eye className="mr-2 size-3.5" /> Details & Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyUrl}>
                <Copy className="mr-2 size-3.5" /> Copy Public URL
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyMarkdown}>
                <FileCode2 className="mr-2 size-3.5" /> Copy Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="mr-2 size-3.5" /> Download File
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(file)}
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              >
                <Trash2 className="mr-2 size-3.5" /> Delete Permanently
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
