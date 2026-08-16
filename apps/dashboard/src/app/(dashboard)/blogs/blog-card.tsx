"use client"

import * as React from "react"
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@workspace/ui/components/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import type { BlogPostListItemDTO, BlogStatus } from "@workspace/shared"
import { toast } from "@workspace/ui/components/sonner"

interface BlogCardProps {
  post: BlogPostListItemDTO
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

const STATUS_VARIANTS: Record<BlogStatus, { label: string; class: string; dot: string }> = {
  PUBLISHED: { label: "Published", class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", dot: "bg-emerald-500" },
  DRAFT: { label: "Draft", class: "bg-amber-500/10 text-amber-500 border-amber-500/20", dot: "bg-amber-500" },
  SCHEDULED: { label: "Scheduled", class: "bg-blue-500/10 text-blue-500 border-blue-500/20", dot: "bg-blue-500" },
  ARCHIVED: { label: "Archived", class: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20", dot: "bg-zinc-500" },
}

export function BlogCard({
  post,
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  onStatusChange,
}: BlogCardProps) {
  const statusConfig = STATUS_VARIANTS[post.status] || STATUS_VARIANTS.DRAFT
  const catColor = post.category?.slug
    ? CATEGORY_COLORS[post.category.slug.toLowerCase()] || "bg-primary/10 text-primary border-primary/20"
    : "bg-primary/10 text-primary border-primary/20"

  const copyShareableLink = () => {
    const url = `https://fi.amanillah.com/blog/${post.slug}`
    navigator.clipboard.writeText(url)
    toast.success("Public article link copied!")
  }

  const dateStr = post.date || (post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Draft")

  return (
    <Card className="group overflow-hidden border-border/80 bg-card hover:border-primary/40 transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md">
      {/* Thumbnail Header */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted/40 border-b border-border/60">
        {post.thumbnail ? (
          <img
            src={post.thumbnail}
            alt={post.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xs font-mono text-muted-foreground bg-muted/20">
            No cover image
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          {post.category && (
            <Badge variant="outline" className={`backdrop-blur-md font-medium text-[11px] ${catColor}`}>
              {post.category.name}
            </Badge>
          )}
          {post.featured && (
            <Badge variant="outline" className="bg-amber-500/90 text-white border-amber-500 text-[10px] shadow-xs">
              <Sparkles className="h-2.5 w-2.5 mr-0.5" /> Featured
            </Badge>
          )}
        </div>

        <div className="absolute top-2.5 right-2.5">
          <Badge variant="outline" className={`backdrop-blur-md text-[11px] font-medium gap-1 ${statusConfig.class}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
            {statusConfig.label}
          </Badge>
        </div>
      </div>

      {/* Body Content */}
      <CardHeader className="p-4 space-y-1.5 pb-2">
        <h3
          onClick={() => onEdit(post)}
          className="font-bold text-base leading-snug line-clamp-2 hover:text-primary cursor-pointer transition-colors"
        >
          {post.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {post.summary}
        </p>
      </CardHeader>

      {/* Tags Chips */}
      <CardContent className="px-4 py-0">
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </CardContent>

      {/* Footer Metrics & Actions */}
      <CardFooter className="p-4 pt-3 mt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground font-mono bg-muted/10">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1" title="Views">
            <Eye className="h-3.5 w-3.5" /> {post.views > 999 ? `${(post.views / 1000).toFixed(1)}k` : post.views}
          </span>
          <span className="flex items-center gap-1" title="Likes">
            <ThumbsUp className="h-3.5 w-3.5" /> {post.likesCount}
          </span>
          <span className="flex items-center gap-1" title="Read time">
            <Clock className="h-3.5 w-3.5" /> {post.readTime}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => onPreview(post)}
            title="Preview & SEO"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(post)}
            title="Edit Post"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onDuplicate(post)}>
                <Copy className="mr-2 h-4 w-4" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyShareableLink}>
                <ExternalLink className="mr-2 h-4 w-4" /> Copy Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[10px] text-muted-foreground">Status</DropdownMenuLabel>
              {post.status !== "PUBLISHED" && (
                <DropdownMenuItem onClick={() => onStatusChange(post, "PUBLISHED")}>
                  <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" /> Publish
                </DropdownMenuItem>
              )}
              {post.status !== "DRAFT" && (
                <DropdownMenuItem onClick={() => onStatusChange(post, "DRAFT")}>
                  <FileEdit className="mr-2 h-4 w-4 text-amber-500" /> Draft
                </DropdownMenuItem>
              )}
              {post.status !== "ARCHIVED" && (
                <DropdownMenuItem onClick={() => onStatusChange(post, "ARCHIVED")}>
                  <Archive className="mr-2 h-4 w-4 text-zinc-500" /> Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(post)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  )
}
