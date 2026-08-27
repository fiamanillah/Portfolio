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
  const [isInitialLoading, setIsInitialLoading] = React.useState(true)
  const [isTaxonomyOpen, setIsTaxonomyOpen] = React.useState(false)
  const [createdCategory, setCreatedCategory] =
    React.useState<BlogCategoryDTO | null>(null)

  const refreshTaxonomies = React.useCallback(async () => {
    try {
      const [catsRes, tagsRes] = await Promise.all([
        BlogApi.getCategories(),
        BlogApi.getTags(),
      ])
      if (catsRes.success && catsRes.data) setCategories(catsRes.data)
      if (tagsRes.success && tagsRes.data) setTags(tagsRes.data)
    } catch {
      // Quiet background refresh failure
    } finally {
      setIsInitialLoading(false)
    }
  }, [])

  React.useEffect(() => {
    refreshTaxonomies()
  }, [refreshTaxonomies])

  if (isInitialLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm font-medium">Initializing post editor...</span>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PostEditorForm
        categories={categories}
        tags={tags}
        latestCreatedCategory={createdCategory}
        isEdit={false}
        onSuccessRedirect="/blogs"
        onOpenTaxonomyManager={() => setIsTaxonomyOpen(true)}
      />

      <CategoryTagDialog
        open={isTaxonomyOpen}
        onOpenChange={setIsTaxonomyOpen}
        onUpdated={refreshTaxonomies}
        onCategoryCreated={(newCat) => {
          setCreatedCategory(newCat)
        }}
      />
    </div>
  )
}
