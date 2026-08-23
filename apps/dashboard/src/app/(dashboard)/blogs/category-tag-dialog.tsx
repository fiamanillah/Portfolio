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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Badge } from "@workspace/ui/components/badge"
import { toast } from "@workspace/ui/components/sonner"
import type { BlogCategoryDTO, BlogTagDTO } from "@workspace/shared"
import { BlogApi, showApiError } from "@/lib/api"

interface CategoryTagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
}

const COLOR_PRESETS = [
  { name: "Blue", hex: "#3b82f6" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Purple", hex: "#8b5cf6" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Indigo", hex: "#6366f1" },
  { name: "Orange", hex: "#f97316" },
  { name: "Fuchsia", hex: "#d946ef" },
  { name: "Teal", hex: "#14b8a6" },
  { name: "Lime", hex: "#84cc16" },
  { name: "Sky", hex: "#0ea5e9" },
]

function normalizeColor(color?: string | null): string {
  if (!color) return "#3b82f6"
  const clean = color.trim()
  const preset = COLOR_PRESETS.find(
    (p) => p.name.toLowerCase() === clean.toLowerCase()
  )
  if (preset) return preset.hex
  if (clean.startsWith("#")) return clean
  if (/^[0-9A-Fa-f]{6}$/.test(clean)) return `#${clean}`
  return clean
}

export function CategoryTagDialog({
  open,
  onOpenChange,
  onUpdated,
}: CategoryTagDialogProps) {
  const [categories, setCategories] = React.useState<BlogCategoryDTO[]>([])
  const [tags, setTags] = React.useState<BlogTagDTO[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  // Category Form State
  const [editingCategory, setEditingCategory] =
    React.useState<BlogCategoryDTO | null>(null)
  const [catName, setCatName] = React.useState("")
  const [catSlug, setCatSlug] = React.useState("")
  const [catColor, setCatColor] = React.useState("#3b82f6")
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
    setCatColor(normalizeColor(cat.color))
    setCatDesc(cat.description || "")
  }

  const handleCancelEditCategory = () => {
    setEditingCategory(null)
    setCatName("")
    setCatSlug("")
    setCatColor("#3b82f6")
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
      const normalizedHex = normalizeColor(catColor)
      if (editingCategory) {
        const res = await BlogApi.updateCategory(editingCategory.id, {
          name: catName.trim(),
          slug: catSlug.trim() || undefined,
          color: normalizedHex,
          description: catDesc.trim() || undefined,
        })
        if (res.success) {
          toast.success(`Category '${catName}' updated`)
          handleCancelEditCategory()
          loadData()
          onUpdated?.()
        } else {
          showApiError(res, "Failed to update category")
        }
      } else {
        const res = await BlogApi.createCategory({
          name: catName.trim(),
          slug: catSlug.trim() || undefined,
          color: normalizedHex,
          description: catDesc.trim() || undefined,
        })
        if (res.success) {
          toast.success(`Category '${catName}' created successfully`)
          handleCancelEditCategory()
          loadData()
          onUpdated?.()
        } else {
          showApiError(res, "Failed to create category")
        }
      }
    } catch (err: any) {
      showApiError(err, "Failed to save category")
    } finally {
      setIsSubmittingCat(false)
    }
  }

  const handleDeleteCategory = async (cat: BlogCategoryDTO) => {
    if (
      !confirm(
        `Are you sure you want to delete category '${cat.name}'? Posts in this category will become unassigned.`
      )
    )
      return

    try {
      const res = await BlogApi.deleteCategory(cat.id)
      if (res.success) {
        toast.success(`Category '${cat.name}' deleted`)
        loadData()
        onUpdated?.()
      } else {
        showApiError(res, "Failed to delete category")
      }
    } catch (err: any) {
      showApiError(err, "Failed to delete category")
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
          showApiError(res, "Failed to update tag")
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
          showApiError(res, "Failed to create tag")
        }
      }
    } catch (err: any) {
      showApiError(err, "Failed to save tag")
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
        showApiError(res, "Failed to delete tag")
      }
    } catch (err: any) {
      showApiError(err, "Failed to delete tag")
    }
  }

  const activeColorHex = normalizeColor(catColor)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] w-[95vw] max-w-4xl overflow-y-auto border border-border/80 bg-card p-6 shadow-2xl sm:min-w-[700px] md:min-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <FolderTree className="h-5 w-5 text-primary" />
            Manage Categories & Tags
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Organize your technical blog posts with taxonomies, topics, and
            custom colored category tags.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="categories" className="mt-2">
          <TabsList className="grid w-full grid-cols-2 border border-border bg-muted/60 p-1">
            <TabsTrigger
              value="categories"
              className="flex items-center gap-2 text-xs font-semibold"
            >
              <FolderTree className="h-4 w-4" />
              Categories ({categories.length})
            </TabsTrigger>
            <TabsTrigger
              value="tags"
              className="flex items-center gap-2 text-xs font-semibold"
            >
              <TagIcon className="h-4 w-4" />
              Tags ({tags.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: CATEGORIES */}
          <TabsContent value="categories" className="space-y-4 pt-3">
            {/* Create / Edit Form */}
            <form
              onSubmit={handleSaveCategory}
              className="space-y-4 rounded-xl border border-border/80 bg-background/80 p-4 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-bold">
                  {editingCategory ? (
                    <Edit2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Plus className="h-4 w-4 text-primary" />
                  )}
                  {editingCategory
                    ? `Edit Category: ${editingCategory.name}`
                    : "Create New Category"}
                </span>
                {editingCategory && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEditCategory}
                    className="text-xs"
                  >
                    Cancel Edit
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Name *
                  </label>
                  <Input
                    placeholder="e.g. Distributed Systems"
                    value={catName}
                    onChange={(e) => {
                      setCatName(e.target.value)
                      if (!editingCategory) {
                        setCatSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)+/g, "")
                        )
                      }
                    }}
                    className="h-9 border-border/90 bg-background text-xs hover:border-primary/50 focus:border-primary"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Slug
                  </label>
                  <Input
                    placeholder="distributed-systems"
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    className="h-9 border-border/90 bg-background font-mono text-xs hover:border-primary/50 focus:border-primary"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      <Palette className="h-3 w-3 text-primary" /> Color Accent
                    </label>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {activeColorHex}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Native / Custom Color Picker */}
                    <div className="relative flex items-center">
                      <input
                        type="color"
                        value={activeColorHex}
                        onChange={(e) => setCatColor(e.target.value)}
                        className="h-9 w-9 cursor-pointer rounded-md border border-border bg-background p-0.5"
                        title="Pick custom color"
                      />
                    </div>
                    {/* Hex text input */}
                    <Input
                      placeholder="#3b82f6"
                      value={catColor}
                      onChange={(e) => setCatColor(e.target.value)}
                      className="h-9 font-mono text-xs hover:border-primary/50 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Color Presets Palette + Live Preview */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 p-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-[11px] font-medium text-muted-foreground">
                    Presets:
                  </span>
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setCatColor(c.hex)}
                      className={`relative flex h-6 w-6 items-center justify-center rounded-full border-2 transition-transform ${
                        activeColorHex.toLowerCase() === c.hex.toLowerCase()
                          ? "scale-115 border-primary shadow-xs"
                          : "border-transparent opacity-80 hover:scale-105 hover:opacity-100"
                      }`}
                      title={c.name}
                    >
                      <span
                        className="block h-full w-full rounded-full"
                        style={{ backgroundColor: c.hex }}
                      />
                      {activeColorHex.toLowerCase() === c.hex.toLowerCase() && (
                        <Check className="absolute h-3 w-3 text-white drop-shadow-md" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Live Preview Chip */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Preview:
                  </span>
                  <div
                    className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs font-semibold"
                    style={{
                      backgroundColor: `${activeColorHex}15`,
                      borderColor: `${activeColorHex}50`,
                      color: activeColorHex,
                      boxShadow: `0 0 10px ${activeColorHex}20`,
                    }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: activeColorHex,
                        boxShadow: `0 0 6px ${activeColorHex}`,
                      }}
                    />
                    <span>{catName.trim() || "Category Preview"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Description
                </label>
                <Input
                  placeholder="Optional brief description of topics in this category..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="h-9 border-border/90 bg-background text-xs hover:border-primary/50 focus:border-primary"
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingCat || !catName.trim()}
                  className="gap-1 text-xs"
                >
                  {isSubmittingCat ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  {editingCategory ? "Update Category" : "Add Category"}
                </Button>
              </div>
            </form>

            {/* List Table */}
            <div className="overflow-hidden rounded-xl border border-border/80 bg-background/60">
              <div className="grid grid-cols-12 border-b border-border/60 bg-muted/40 p-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                <div className="col-span-4">Category</div>
                <div className="col-span-3 font-mono">Slug</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              <div className="divide-y divide-border/60">
                {categories.map((cat) => {
                  const catHex = normalizeColor(cat.color)
                  return (
                    <div
                      key={cat.id}
                      className="grid grid-cols-12 items-center p-3 text-xs hover:bg-muted/20"
                    >
                      <div className="col-span-4 flex items-center gap-2">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full border border-black/20"
                          style={{
                            backgroundColor: catHex,
                            boxShadow: `0 0 6px ${catHex}60`,
                          }}
                        />
                        <span
                          className="inline-flex items-center rounded-sm px-2 py-0.5 font-semibold"
                          style={{
                            backgroundColor: `${catHex}15`,
                            color: catHex,
                            border: `1px solid ${catHex}35`,
                          }}
                        >
                          {cat.name}
                        </span>
                      </div>
                      <div className="col-span-3 truncate font-mono text-muted-foreground">
                        {cat.slug}
                      </div>
                      <div className="col-span-3 truncate text-muted-foreground">
                        {cat.description || "—"}
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStartEditCategory(cat)}
                          className="h-7 w-7"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(cat)}
                          className="h-7 w-7 text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: TAGS */}
          <TabsContent value="tags" className="space-y-4 pt-3">
            {/* Create Tag Form */}
            <form
              onSubmit={handleSaveTag}
              className="space-y-3 rounded-xl border border-border/80 bg-background/80 p-4 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-bold">
                  {editingTag ? (
                    <Edit2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Plus className="h-4 w-4 text-primary" />
                  )}
                  {editingTag
                    ? `Edit Tag: ${editingTag.name}`
                    : "Create New Tag"}
                </span>
                {editingTag && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingTag(null)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Tag Name *
                  </label>
                  <Input
                    placeholder="e.g. redis"
                    value={tagName}
                    onChange={(e) => {
                      setTagName(e.target.value)
                      if (!editingTag) {
                        setTagSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)+/g, "")
                        )
                      }
                    }}
                    className="h-9 border-border/90 bg-background font-mono text-xs hover:border-primary/50 focus:border-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Slug
                  </label>
                  <Input
                    placeholder="redis"
                    value={tagSlug}
                    onChange={(e) => setTagSlug(e.target.value)}
                    className="h-9 border-border/90 bg-background font-mono text-xs hover:border-primary/50 focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingTag || !tagName.trim()}
                  className="gap-1 text-xs"
                >
                  {isSubmittingTag ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  {editingTag ? "Update Tag" : "Add Tag"}
                </Button>
              </div>
            </form>

            {/* Tags Chip List */}
            <div className="space-y-2 rounded-xl border border-border/80 bg-background/60 p-4">
              <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Registered Tags ({tags.length})
              </span>
              <div className="flex flex-wrap gap-2 pt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="flex items-center gap-1.5 border border-border bg-muted/80 py-1 pr-1 pl-2.5 font-mono text-xs text-foreground hover:bg-muted"
                  >
                    <span>#{tag.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTag(tag)
                        setTagName(tag.name)
                        setTagSlug(tag.slug)
                      }}
                      className="p-0.5 hover:text-primary"
                    >
                      <Edit2 className="h-2.5 w-2.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTag(tag)}
                      className="p-0.5 hover:text-destructive"
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
