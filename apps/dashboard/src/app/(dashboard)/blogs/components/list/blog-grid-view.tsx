"use client"

import * as React from "react"
import Link from "next/link"
import { BookOpen, Plus } from "lucide-react"
import { Card } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import type { BlogPostListItemDTO, BlogStatus } from "@workspace/shared"
import { BlogCard } from "../../blog-card"

interface BlogGridViewProps {
  posts: BlogPostListItemDTO[]
  isLoading: boolean
  onEdit: (post: BlogPostListItemDTO) => void
  onPreview: (post: BlogPostListItemDTO) => void
  onDuplicate: (post: BlogPostListItemDTO) => void
  onDelete: (post: BlogPostListItemDTO) => void
  onStatusChange: (post: BlogPostListItemDTO, status: BlogStatus) => void
}

export function BlogGridView({
  posts,
  isLoading,
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  onStatusChange,
}: BlogGridViewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-80 animate-pulse bg-muted/40" />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="space-y-3 rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
        <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/60" />
        <div className="text-base font-semibold text-foreground">
          No blog posts found
        </div>
        <p className="mx-auto max-w-sm text-xs">
          No articles match the current filter or search criteria.
        </p>
        <Button size="sm" asChild>
          <Link href="/blogs/create">
            <Plus className="mr-1 h-4 w-4" /> Create First Post
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard
          key={post.id}
          post={post}
          onEdit={onEdit}
          onPreview={onPreview}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  )
}
