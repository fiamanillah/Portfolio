"use client"

import * as React from "react"
import {
  FolderTree,
  Tag as TagIcon,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Check,
  Palette,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Badge } from "@workspace/ui/components/badge"
import { toast } from "@workspace/ui/components/sonner"
import type { BlogCategoryDTO, BlogTagDTO } from "@workspace/shared"
import { BlogApi } from "@/lib/api"

interface CategoryTagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
}

const COLOR_OPTIONS = [
  { name: "Blue", value: "blue", class: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { name: "Emerald", value: "emerald", class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { name: "Amber", value: "amber", class: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  { name: "Purple", value: "purple", class: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { name: "Rose", value: "rose", class: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
  { name: "Cyan", value: "cyan", class: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  { name: "Indigo", value: "indigo", class: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
]

export function CategoryTagDialog({
  open,
  onOpenChange,
  onUpdated,
}: CategoryTagDialogProps) {
  const [categories, setCategories] = React.useState<BlogCategoryDTO[]>([])
  const [tags, setTags] = React.useState<BlogTagDTO[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  // Category Form State
  const [editingCategory, setEditingCategory] = React.useState<BlogCategoryDTO | null>(null)
  const [catName, setCatName] = React.useState("")
  const [catSlug, setCatSlug] = React.useState("")
  const [catColor, setCatColor] = React.useState("blue")
  const [catDesc, setCatDesc] = React.useState("")
  const [isSubmittingCat, setIsSubmittingCat] = React.useState(false)

  // Tag Form State
  const [tagName, setTagName] = React.useState("")
  const [tagDesc, setTagDesc] = React.useState("")
  const [isSubmittingTag, setIsSubmittingTag] = React.useState(false)

  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [catsRes, tagsRes] = await Promise.all([
        BlogApi.getCategories(),
        BlogApi.getTags(),
      ])
      if (catsRes.success && catsRes.data) {
        setCategories(catsRes.data)
      }
      if (tagsRes.success && tagsRes.data) {
        setTags(tagsRes.data)
      }
    } catch (err) {
      toast.error("Failed to load categories and tags")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open, loadData])

  const handleStartEditCategory = (cat: BlogCategoryDTO) => {
    setEditingCategory(cat)
    setCatName(cat.name)
    setCatSlug(cat.slug)
    setCatColor(cat.color || "blue")
    setCatDesc(cat.description || "")
  }

  const handleCancelEditCategory = () => {
    setEditingCategory(null)
    setCatName("")
    setCatSlug("")
    setCatColor("blue")
    setCatDesc("")
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!catName.trim()) {
      toast.error("Category name is required")
      return
    }

    setIsSubmittingCat(true)
    try {
      if (editingCategory) {
        const res = await BlogApi.updateCategory(editingCategory.id, {
          name: catName.trim(),
          slug: catSlug.trim() || undefined,
          color: catColor,
          description: catDesc.trim() || undefined,
        })
        if (res.success) {
          toast.success(`Category '${catName}' updated successfully`)
          handleCancelEditCategory()
          loadData()
          onUpdated?.()
        } else {
          toast.error(res.message || "Failed to update category")
        }
      } else {
        const res = await BlogApi.createCategory({
          name: catName.trim(),
          slug: catSlug.trim() || undefined,
          color: catColor,
          description: catDesc.trim() || undefined,
        })
        if (res.success) {
          toast.success(`Category '${catName}' created successfully`)
          handleCancelEditCategory()
          loadData()
          onUpdated?.()
        } else {
          toast.error(res.message || "Failed to create category")
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to save category")
    } finally {
      setIsSubmittingCat(false)
    }
  }

  const handleDeleteCategory = async (cat: BlogCategoryDTO) => {
    if (!confirm(`Delete category '${cat.name}'? Posts will remain but will have no category.`)) {
      return
    }

    try {
      const res = await BlogApi.deleteCategory(cat.id)
      if (res.success) {
        toast.success(`Category '${cat.name}' deleted`)
        loadData()
        onUpdated?.()
      } else {
        toast.error(res.message || "Failed to delete category")
      }
    } catch (err) {
      toast.error("Failed to delete category")
    }
  }

  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tagName.trim()) {
      toast.error("Tag name is required")
      return
    }

    setIsSubmittingTag(true)
    try {
      const res = await BlogApi.createTag({
        name: tagName.trim(),
        description: tagDesc.trim() || undefined,
      })
      if (res.success) {
        toast.success(`Tag '${tagName}' created`)
        setTagName("")
        setTagDesc("")
        loadData()
        onUpdated?.()
      } else {
        toast.error(res.message || "Failed to create tag")
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to create tag")
    } finally {
      setIsSubmittingTag(false)
    }
  }

  const handleDeleteTag = async (tag: BlogTagDTO) => {
    try {
      const res = await BlogApi.deleteTag(tag.id)
      if (res.success) {
        toast.success(`Tag '${tag.name}' deleted`)
        loadData()
        onUpdated?.()
      } else {
        toast.error(res.message || "Failed to delete tag")
      }
    } catch (err) {
      toast.error("Failed to delete tag")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-primary" />
            Manage Categories & Tags
          </DialogTitle>
          <DialogDescription>
            Organize your technical blog posts with taxonomies, topics, and colored category tags.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="categories" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <FolderTree className="h-4 w-4" />
              Categories ({categories.length})
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center gap-2">
              <TagIcon className="h-4 w-4" />
              Tags ({tags.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: CATEGORIES */}
          <TabsContent value="categories" className="space-y-4 pt-3">
            {/* Create / Edit Form */}
            <form onSubmit={handleSaveCategory} className="rounded-lg border border-border/70 bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  {editingCategory ? <Edit2 className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4 text-primary" />}
                  {editingCategory ? `Edit Category: ${editingCategory.name}` : "Create New Category"}
                </span>
                {editingCategory && (
                  <Button type="button" variant="ghost" size="sm" onClick={handleCancelEditCategory}>
                    Cancel Edit
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Category Name *</label>
                  <Input
                    placeholder="e.g. Distributed Systems"
                    value={catName}
                    onChange={(e) => {
                      setCatName(e.target.value)
                      if (!editingCategory) {
                        setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))
                      }
                    }}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">URL Slug</label>
                  <Input
                    placeholder="e.g. distributed-systems"
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                  />
                </div>
              </div>

              {/* Color Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5" />
                  Badge Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCatColor(c.value)}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-all flex items-center gap-1.5 ${c.class} ${
                        catColor === c.value ? "ring-2 ring-primary ring-offset-1 font-semibold" : "opacity-80 hover:opacity-100"
                      }`}
                    >
                      {catColor === c.value && <Check className="h-3 w-3" />}
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Description (Optional)</label>
                <Textarea
                  placeholder="Brief description of this category topic..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button type="submit" size="sm" disabled={isSubmittingCat}>
                  {isSubmittingCat && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                  {editingCategory ? "Update Category" : "Add Category"}
                </Button>
              </div>
            </form>

            {/* Categories List */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Existing Categories ({categories.length})
              </span>
              {isLoading ? (
                <div className="py-6 flex items-center justify-center text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading categories...
                </div>
              ) : categories.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
                  No categories found. Create one above!
                </div>
              ) : (
                <div className="divide-y divide-border/60 rounded-lg border border-border bg-card">
                  {categories.map((cat) => (
                    <div key={cat.id} className="p-3 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Badge
                          variant="outline"
                          className={
                            COLOR_OPTIONS.find((c) => c.value === cat.color)?.class ||
                            "bg-primary/10 text-primary border-primary/20"
                          }
                        >
                          {cat.name}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono truncate">/{cat.slug}</span>
                        {cat.description && (
                          <span className="text-xs text-muted-foreground/80 hidden sm:inline truncate max-w-xs">
                            — {cat.description}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className="text-[11px] font-mono">
                          {cat.postCount || 0} posts
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => handleStartEditCategory(cat)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteCategory(cat)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 2: TAGS */}
          <TabsContent value="tags" className="space-y-4 pt-3">
            {/* Create Tag Form */}
            <form onSubmit={handleSaveTag} className="rounded-lg border border-border/70 bg-card p-4 space-y-3">
              <span className="text-sm font-semibold flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-primary" /> Create New Tag
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Tag Name *</label>
                  <Input
                    placeholder="e.g. WebSockets, Redis, Docker"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Description (Optional)</label>
                  <Input
                    placeholder="Tag description..."
                    value={tagDesc}
                    onChange={(e) => setTagDesc(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <Button type="submit" size="sm" disabled={isSubmittingTag}>
                  {isSubmittingTag && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                  Add Tag
                </Button>
              </div>
            </form>

            {/* Tags Grid / Cloud */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                All Tags ({tags.length})
              </span>
              {isLoading ? (
                <div className="py-6 flex items-center justify-center text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading tags...
                </div>
              ) : tags.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
                  No tags created yet.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-border bg-card max-h-60 overflow-y-auto">
                  {tags.map((t) => (
                    <div
                      key={t.id}
                      className="group flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-md bg-secondary text-secondary-foreground text-xs border border-border"
                    >
                      <TagIcon className="h-3 w-3 text-muted-foreground" />
                      <span>{t.name}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">({t.postCount || 0})</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTag(t)}
                        className="h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-destructive opacity-50 group-hover:opacity-100 transition-opacity ml-1"
                        title={`Delete ${t.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
