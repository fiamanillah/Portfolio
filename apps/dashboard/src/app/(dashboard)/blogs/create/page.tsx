"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import type { BlogCategoryDTO, BlogTagDTO } from "@workspace/shared"
import { BlogApi } from "@/lib/api"
import { PostEditorForm } from "../components/post-editor-form"

export default function CreateBlogPostPage() {
  const [categories, setCategories] = React.useState<BlogCategoryDTO[]>([])
  const [tags, setTags] = React.useState<BlogTagDTO[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    Promise.all([BlogApi.getCategories(), BlogApi.getTags()])
      .then(([catsRes, tagsRes]) => {
        if (catsRes.success && catsRes.data) setCategories(catsRes.data)
        if (tagsRes.success && tagsRes.data) setTags(tagsRes.data)
      })
      .finally(() => setIsLoading(false))
  }, [])

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
      />
    </div>
  )
}
