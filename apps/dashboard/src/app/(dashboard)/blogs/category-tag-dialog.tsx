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
  const [editingTag, setEditingTag] = React.useState<BlogTagDTO | null>(null)
  const [tagName, setTagName] = React.useState("")
  const [tagSlug, setTagSlug] = React.useState("")
  const [tagDesc, setTagDesc] = React.useState("")
  const [isSubmittingTag, setIsSubmittingTag] = React.useState(false)

  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [catsRes, tagsRes] = await Promise.all([
        BlogApi.getCategories(),
        BlogApi.getTags(),
      ])
      if (catsRes.success && catsRes.data) setCategories(catsRes.data)
      if (tagsRes.success && tagsRes.data) setTags(tagsRes.data)
    } catch {
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
          toast.success(`Category '${catName}' updated`)
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
    } catch {
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
      if (editingTag) {
        const res = await BlogApi.updateTag(editingTag.id, {
          name: tagName.trim(),
          slug: tagSlug.trim() || undefined,
          description: tagDesc.trim() || undefined,
        })
        if (res.success) {
          toast.success(`Tag '${tagName}' updated`)
          setEditingTag(null)
          setTagName("")
          setTagSlug("")
          setTagDesc("")
          loadData()
          onUpdated?.()
        } else {
          toast.error(res.message || "Failed to update tag")
        }
      } else {
        const res = await BlogApi.createTag({
          name: tagName.trim(),
          slug: tagSlug.trim() || undefined,
          description: tagDesc.trim() || undefined,
        })
        if (res.success) {
          toast.success(`Tag '${tagName}' created`)
          setTagName("")
          setTagSlug("")
          setTagDesc("")
          loadData()
          onUpdated?.()
        } else {
          toast.error(res.message || "Failed to create tag")
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to save tag")
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
    } catch {
      toast.error("Failed to delete tag")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:min-w-[700px] md:min-w-[800px] max-w-4xl max-h-[88vh] overflow-y-auto bg-card border border-border/80 p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <FolderTree className="h-5 w-5 text-primary" />
            Manage Categories & Tags
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Organize your technical blog posts with taxonomies, topics, and colored category tags.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="categories" className="mt-2">
          <TabsList className="grid w-full grid-cols-2 bg-muted/60 p-1 border border-border">
            <TabsTrigger value="categories" className="flex items-center gap-2 text-xs font-semibold">
              <FolderTree className="h-4 w-4" />
              Categories ({categories.length})
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center gap-2 text-xs font-semibold">
              <TagIcon className="h-4 w-4" />
              Tags ({tags.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: CATEGORIES */}
          <TabsContent value="categories" className="space-y-4 pt-3">
            {/* Create / Edit Form */}
            <form onSubmit={handleSaveCategory} className="rounded-xl border border-border/80 bg-background/80 p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold flex items-center gap-1.5">
                  {editingCategory ? <Edit2 className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4 text-primary" />}
                  {editingCategory ? `Edit Category: ${editingCategory.name}` : "Create New Category"}
                </span>
                {editingCategory && (
                  <Button type="button" variant="ghost" size="sm" onClick={handleCancelEditCategory} className="text-xs">
                    Cancel Edit
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Name *
                  </label>
                  <Input
                    placeholder="e.g. Distributed Systems"
                    value={catName}
                    onChange={(e) => {
                      setCatName(e.target.value)
                      if (!editingCategory) {
                        setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""))
                      }
                    }}
                    className="text-xs h-9 bg-background border-border/90 hover:border-primary/50 focus:border-primary"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Slug
                  </label>
                  <Input
                    placeholder="distributed-systems"
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    className="text-xs h-9 font-mono bg-background border-border/90 hover:border-primary/50 focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Color Accent
                  </label>
                  <div className="flex items-center gap-1 pt-1.5">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setCatColor(c.value)}
                        className={`h-6 w-6 rounded-full border-2 transition-transform ${
                          catColor === c.value ? "scale-110 border-primary" : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                        title={c.name}
                      >
                        <span className={`block h-full w-full rounded-full ${c.class.split(" ")[0].replace("/10", "")}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Description
                </label>
                <Input
                  placeholder="Optional brief description of topics in this category..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="text-xs h-9 bg-background border-border/90 hover:border-primary/50 focus:border-primary"
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button type="submit" size="sm" disabled={isSubmittingCat || !catName.trim()} className="text-xs gap-1">
                  {isSubmittingCat ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  {editingCategory ? "Update Category" : "Add Category"}
                </Button>
              </div>
            </form>

            {/* List Table */}
            <div className="rounded-xl border border-border/80 bg-background/60 overflow-hidden">
              <div className="grid grid-cols-12 bg-muted/40 p-3 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60">
                <div className="col-span-4">Category</div>
                <div className="col-span-3 font-mono">Slug</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              <div className="divide-y divide-border/60">
                {categories.map((cat) => (
                  <div key={cat.id} className="grid grid-cols-12 items-center p-3 text-xs hover:bg-muted/20">
                    <div className="col-span-4 flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${COLOR_OPTIONS.find((c) => c.value === cat.color)?.class.split(" ")[0].replace("/10", "") || "bg-primary"}`} />
                      <span className="font-semibold text-foreground">{cat.name}</span>
                    </div>
                    <div className="col-span-3 font-mono text-muted-foreground truncate">{cat.slug}</div>
                    <div className="col-span-3 text-muted-foreground truncate">{cat.description || "—"}</div>
                    <div className="col-span-2 flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleStartEditCategory(cat)} className="h-7 w-7">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat)} className="h-7 w-7 text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: TAGS */}
          <TabsContent value="tags" className="space-y-4 pt-3">
            {/* Create Tag Form */}
            <form onSubmit={handleSaveTag} className="rounded-xl border border-border/80 bg-background/80 p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold flex items-center gap-1.5">
                  {editingTag ? <Edit2 className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4 text-primary" />}
                  {editingTag ? `Edit Tag: ${editingTag.name}` : "Create New Tag"}
                </span>
                {editingTag && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setEditingTag(null)} className="text-xs">
                    Cancel
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tag Name *
                  </label>
                  <Input
                    placeholder="e.g. redis"
                    value={tagName}
                    onChange={(e) => {
                      setTagName(e.target.value)
                      if (!editingTag) {
                        setTagSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""))
                      }
                    }}
                    className="text-xs h-9 font-mono bg-background border-border/90 hover:border-primary/50 focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Slug
                  </label>
                  <Input
                    placeholder="redis"
                    value={tagSlug}
                    onChange={(e) => setTagSlug(e.target.value)}
                    className="text-xs h-9 font-mono bg-background border-border/90 hover:border-primary/50 focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button type="submit" size="sm" disabled={isSubmittingTag || !tagName.trim()} className="text-xs gap-1">
                  {isSubmittingTag ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  {editingTag ? "Update Tag" : "Add Tag"}
                </Button>
              </div>
            </form>

            {/* Tags Chip List */}
            <div className="rounded-xl border border-border/80 bg-background/60 p-4 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Registered Tags ({tags.length})
              </span>
              <div className="flex flex-wrap gap-2 pt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="text-xs font-mono pl-2.5 pr-1 py-1 flex items-center gap-1.5 bg-muted/80 hover:bg-muted text-foreground border border-border"
                  >
                    <span>#{tag.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTag(tag)
                        setTagName(tag.name)
                        setTagSlug(tag.slug)
                      }}
                      className="hover:text-primary p-0.5"
                    >
                      <Edit2 className="h-2.5 w-2.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTag(tag)}
                      className="hover:text-destructive p-0.5"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
