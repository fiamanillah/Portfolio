"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import type { BlogsTableFeatures } from "./data-table-features"
import {
  MoreHorizontal,
  Edit2,
  Eye,
  Copy,
  Trash2,
  Sparkles,
  ExternalLink,
  ThumbsUp,
  MessageSquare,
  Clock,
  Calendar,
  CheckCircle,
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
import type { BlogPostListItemDTO, BlogStatus } from "@workspace/shared"
import { toast } from "@workspace/ui/components/sonner"

interface GetColumnsOptions {
  onEdit: (post: BlogPostListItemDTO) => void
  onPreview: (post: BlogPostListItemDTO) => void
  onDuplicate: (post: BlogPostListItemDTO) => void
  onDelete: (post: BlogPostListItemDTO) => void
  onStatusChange: (post: BlogPostListItemDTO, status: BlogStatus) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  websockets: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  architecture: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  database: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  performance: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  devops: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  security: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
}

const STATUS_VARIANTS: Record<
  BlogStatus,
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
  SCHEDULED: {
    label: "Scheduled",
    class: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    dot: "bg-blue-500",
  },
  ARCHIVED: {
    label: "Archived",
    class: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
    dot: "bg-zinc-500",
  },
}

export function getBlogColumns({
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  onStatusChange,
}: GetColumnsOptions): ColumnDef<BlogsTableFeatures, BlogPostListItemDTO>[] {
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
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Article" />
      ),
      cell: ({ row }) => {
        const post = row.original
        return (
          <div className="flex max-w-md items-center gap-3 py-1">
            {post.thumbnail ? (
              <div className="h-11 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted/30">
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-11 w-16 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 font-mono text-[10px] text-muted-foreground">
                No img
              </div>
            )}
            <div className="min-w-0 space-y-0.5">
              <div className="line-clamp-1 flex items-center gap-1.5 text-sm leading-tight font-semibold text-foreground">
                <span
                  className="cursor-pointer transition-colors hover:text-primary"
                  onClick={() => onEdit(post)}
                >
                  {post.title}
                </span>
                {post.featured && (
                  <Badge
                    variant="outline"
                    className="h-4 shrink-0 border-amber-500/30 px-1 text-[10px] text-amber-500"
                  >
                    <Sparkles className="mr-0.5 h-2.5 w-2.5" /> Featured
                  </Badge>
                )}
              </div>
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {post.summary}
              </p>
              <div className="truncate font-mono text-[11px] text-muted-foreground/80">
                /{post.slug}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => {
        const cat = row.original.category
        if (!cat)
          return (
            <span className="text-xs text-muted-foreground italic">None</span>
          )
        const colorClass =
          CATEGORY_COLORS[cat.slug?.toLowerCase()] ||
          "bg-primary/10 text-primary border-primary/20"
        return (
          <Badge variant="outline" className={colorClass}>
            {cat.name}
          </Badge>
        )
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        const config = STATUS_VARIANTS[status] || STATUS_VARIANTS.DRAFT
        return (
          <Badge
            variant="outline"
            className={`gap-1.5 text-xs ${config.class}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: "metrics",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Engagement" />
      ),
      cell: ({ row }) => {
        const post = row.original
        return (
          <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
            <span
              className="flex items-center gap-1"
              title={`${post.views} views`}
            >
              <Eye className="h-3.5 w-3.5" />{" "}
              {post.views > 999
                ? `${(post.views / 1000).toFixed(1)}k`
                : post.views}
            </span>
            <span
              className="flex items-center gap-1"
              title={`${post.likesCount} likes`}
            >
              <ThumbsUp className="h-3.5 w-3.5" /> {post.likesCount}
            </span>
            <span
              className="flex items-center gap-1"
              title={`${post.commentsCount} comments`}
            >
              <MessageSquare className="h-3.5 w-3.5" /> {post.commentsCount}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "readTime",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Read Time" />
      ),
      cell: ({ row }) => {
        const post = row.original
        return (
          <div className="flex flex-col gap-0.5 font-mono text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {post.readTime}
            </span>
            <span className="text-[10px] opacity-75">
              {post.wordCount} words
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "publishedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Published" />
      ),
      cell: ({ row }) => {
        const post = row.original
        const dateStr =
          post.date ||
          (post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString()
            : "Draft")
        return (
          <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{dateStr}</span>
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const post = row.original

        const copyShareableLink = () => {
          const url = `https://fi.amanillah.com/blog/${post.slug}`
          navigator.clipboard.writeText(url)
          toast.success("Article link copied to clipboard!")
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(post)}>
                <Edit2 className="mr-2 h-4 w-4" /> Edit Post
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPreview(post)}>
                <Eye className="mr-2 h-4 w-4" /> Preview & SEO
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(post)}>
                <Copy className="mr-2 h-4 w-4" /> Duplicate Post
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyShareableLink}>
                <ExternalLink className="mr-2 h-4 w-4" /> Copy Public Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[11px] text-muted-foreground">
                Change Status
              </DropdownMenuLabel>
              {post.status !== "PUBLISHED" && (
                <DropdownMenuItem
                  onClick={() => onStatusChange(post, "PUBLISHED")}
                >
                  <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />{" "}
                  Publish Post
                </DropdownMenuItem>
              )}
              {post.status !== "DRAFT" && (
                <DropdownMenuItem onClick={() => onStatusChange(post, "DRAFT")}>
                  <FileEdit className="mr-2 h-4 w-4 text-amber-500" /> Move to
                  Draft
                </DropdownMenuItem>
              )}
              {post.status !== "ARCHIVED" && (
                <DropdownMenuItem
                  onClick={() => onStatusChange(post, "ARCHIVED")}
                >
                  <Archive className="mr-2 h-4 w-4 text-zinc-500" /> Archive
                  Post
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(post)}
                className="text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
