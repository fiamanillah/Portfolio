"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import type {
  BlogPostDTO,
  BlogCategoryDTO,
  BlogTagDTO,
} from "@workspace/shared"
import { BlogApi } from "@/lib/api"
import { PostEditorForm } from "../../components/post-editor-form"
import { CategoryTagDialog } from "../../category-tag-dialog"

export default function EditBlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : ""

  const [post, setPost] = React.useState<BlogPostDTO | null>(null)
  const [categories, setCategories] = React.useState<BlogCategoryDTO[]>([])
  const [tags, setTags] = React.useState<BlogTagDTO[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [isTaxonomyOpen, setIsTaxonomyOpen] = React.useState(false)

  const loadData = React.useCallback(() => {
    if (!id) return

    setIsLoading(true)
    Promise.all([
      BlogApi.getById(id),
      BlogApi.getCategories(),
      BlogApi.getTags(),
    ])
      .then(([postRes, catsRes, tagsRes]) => {
        if (postRes.success && postRes.data) {
          setPost(postRes.data)
        } else {
          setError(postRes.message || "Failed to load blog post")
        }

        if (catsRes.success && catsRes.data) setCategories(catsRes.data)
        if (tagsRes.success && tagsRes.data) setTags(tagsRes.data)
      })
      .catch((err) => {
        setError(err?.message || "Failed to load blog post data")
      })
      .finally(() => setIsLoading(false))
  }, [id])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm font-medium">Loading post details...</span>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="mx-auto my-12 max-w-md space-y-4 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
        <div className="space-y-1">
          <h2 className="text-base font-bold text-foreground">
            Error Loading Post
          </h2>
          <p className="text-xs text-muted-foreground">
            {error || "Blog post not found"}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/blogs")}
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Blog Posts
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PostEditorForm
        initialPost={post}
        categories={categories}
        tags={tags}
        isEdit={true}
        onSuccessRedirect="/blogs"
        onOpenTaxonomyManager={() => setIsTaxonomyOpen(true)}
      />

      <CategoryTagDialog
        open={isTaxonomyOpen}
        onOpenChange={setIsTaxonomyOpen}
        onUpdated={loadData}
      />
    </div>
  )
}
