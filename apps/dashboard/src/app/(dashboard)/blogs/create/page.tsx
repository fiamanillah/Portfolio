"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import type { BlogCategoryDTO, BlogTagDTO } from "@workspace/shared"
import { BlogApi } from "@/lib/api"
import { PostEditorForm } from "../components/post-editor-form"
import { CategoryTagDialog } from "../category-tag-dialog"

export default function CreateBlogPostPage() {
  const [categories, setCategories] = React.useState<BlogCategoryDTO[]>([])
  const [tags, setTags] = React.useState<BlogTagDTO[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isTaxonomyOpen, setIsTaxonomyOpen] = React.useState(false)

  const loadMetadata = React.useCallback(() => {
    setIsLoading(true)
    Promise.all([BlogApi.getCategories(), BlogApi.getTags()])
      .then(([catsRes, tagsRes]) => {
        if (catsRes.success && catsRes.data) setCategories(catsRes.data)
        if (tagsRes.success && tagsRes.data) setTags(tagsRes.data)
      })
      .finally(() => setIsLoading(false))
  }, [])

  React.useEffect(() => {
    loadMetadata()
  }, [loadMetadata])

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm font-medium">Initializing post editor...</span>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PostEditorForm
        categories={categories}
        tags={tags}
        isEdit={false}
        onSuccessRedirect="/blogs"
        onOpenTaxonomyManager={() => setIsTaxonomyOpen(true)}
      />

      <CategoryTagDialog
        open={isTaxonomyOpen}
        onOpenChange={setIsTaxonomyOpen}
        onUpdated={loadMetadata}
      />
    </div>
  )
}
