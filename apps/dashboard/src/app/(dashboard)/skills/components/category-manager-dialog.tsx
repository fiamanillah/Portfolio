"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Badge } from "@workspace/ui/components/badge"
import { toast } from "@workspace/ui/components/sonner"
import { FieldError } from "@workspace/ui/components/field"
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Layers,
  Loader2,
  FolderTree,
} from "lucide-react"
import type {
  SkillCategoryDTO,
  CreateSkillCategoryDTO,
  UpdateSkillCategoryDTO,
} from "@workspace/shared"
import {
  SkillApi,
  showApiError,
  extractFieldErrors,
  validateSlug,
} from "@/lib/api"

interface CategoryManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: SkillCategoryDTO[]
  onSuccess: () => void
}

export function CategoryManagerDialog({
  open,
  onOpenChange,
  categories,
  onSuccess,
}: CategoryManagerDialogProps) {
  const [isCreating, setIsCreating] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)

  // Form fields for creating/editing
  const [slug, setSlug] = React.useState("")
  const [code, setCode] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [badge, setBadge] = React.useState("")
  const [ordinal, setOrdinal] = React.useState("01")
  const [suffix, setSuffix] = React.useState("ST")
  const [color, setColor] = React.useState("blue")
  const [icon, setIcon] = React.useState("◈")
  const [order, setOrder] = React.useState(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const resetForm = () => {
    setSlug("")
    setCode("")
    setTitle("")
    setBadge("")
    setOrdinal("01")
    setSuffix("ST")
    setColor("blue")
    setIcon("◈")
    setOrder(0)
    setIsCreating(false)
    setEditingId(null)
    setFieldErrors({})
  }

  const startEdit = (cat: SkillCategoryDTO) => {
    setEditingId(cat.id)
    setIsCreating(false)
    setSlug(cat.slug)
    setCode(cat.code)
    setTitle(cat.title)
    setBadge(cat.badge)
    setOrdinal(cat.ordinal || "01")
    setSuffix(cat.suffix || "ST")
    setColor(cat.color || "blue")
    setIcon(cat.icon || "◈")
    setOrder(cat.order || 0)
    setFieldErrors({})
  }

  const handleSave = async () => {
    // 1. Client-Side Pre-Validation
    const clientErrors: Record<string, string> = {}

    if (!code.trim()) {
      clientErrors.code = "Category code is required"
    }
    if (!title.trim()) {
      clientErrors.title = "Category title is required"
    }
    if (!slug.trim()) {
      clientErrors.slug = "Category slug is required"
    } else {
      const slugVal = validateSlug(slug, "Slug")
      if (!slugVal.valid && slugVal.error) {
        clientErrors.slug = slugVal.error
      }
    }

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      showApiError(
        {
          errorIssues: Object.entries(clientErrors).map(([path, message]) => ({
            path,
            message,
          })),
        },
        "Validation Failed"
      )
      return
    }

    setIsSubmitting(true)
    try {
      if (editingId) {
        const payload: UpdateSkillCategoryDTO = {
          slug: slug.trim().toLowerCase(),
          code: code.trim(),
          title: title.trim(),
          badge: badge.trim() || title.trim(),
          ordinal: ordinal.trim(),
          suffix: suffix.trim(),
          color: color.trim(),
          icon: icon.trim(),
          order,
        }
        const res = await SkillApi.updateCategory(editingId, payload)
        if (res.success) {
          setFieldErrors({})
          toast.success("Category updated successfully")
          resetForm()
          onSuccess()
        } else {
          showApiError(res, "Failed to update category")
          setFieldErrors(extractFieldErrors(res))
        }
      } else {
        const payload: CreateSkillCategoryDTO = {
          slug: slug.trim().toLowerCase(),
          code: code.trim(),
          title: title.trim(),
          badge: badge.trim() || title.trim(),
          ordinal: ordinal.trim(),
          suffix: suffix.trim(),
          color: color.trim(),
          icon: icon.trim(),
          order,
          status: "PUBLISHED",
        }
        const res = await SkillApi.createCategory(payload)
        if (res.success) {
          setFieldErrors({})
          toast.success("Category created successfully")
          resetForm()
          onSuccess()
        } else {
          showApiError(res, "Failed to create category")
          setFieldErrors(extractFieldErrors(res))
        }
      }
    } catch (err: unknown) {
      showApiError(err, "An unexpected error occurred while saving category")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, catTitle: string) => {
    if (!confirm(`Are you sure you want to delete category "${catTitle}"? Associated skills will become unassigned.`)) {
      return
    }

    try {
      const res = await SkillApi.deleteCategory(id)
      if (res.success) {
        toast.success(`Deleted category "${catTitle}"`)
        onSuccess()
      } else {
        showApiError(res, "Failed to delete category")
      }
    } catch (err: unknown) {
      showApiError(err, "Failed to delete category")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[620px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-md border border-primary/20 bg-primary/10 p-2 text-primary">
                <FolderTree className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight">
                  Stack Categories
                </DialogTitle>
                <DialogDescription>
                  Manage architectural pillars and groupings displayed on your website.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Top action: Add new category button */}
          {!isCreating && !editingId && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  resetForm()
                  setIsCreating(true)
                  setOrder(categories.length + 1)
                  setOrdinal(`0${categories.length + 1}`)
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Category
              </Button>
            </div>
          )}

          {/* Create or Edit Form */}
          {(isCreating || editingId) && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
                  {editingId ? "Edit Category" : "New Category"}
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">
                    Code (Short Heading) *
                  </Label>
                  <Input
                    placeholder="e.g. Frontend, Backend, Infra"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value)
                      clearFieldError("code")
                      if (!editingId && !slug) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"))
                      }
                    }}
                    className={fieldErrors.code ? "border-destructive focus:border-destructive" : ""}
                  />
                  {fieldErrors.code && <FieldError errors={fieldErrors.code} />}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">
                    Slug (URL / DB Key) *
                  </Label>
                  <Input
                    placeholder="e.g. frontend, backend"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value)
                      clearFieldError("slug")
                    }}
                    className={fieldErrors.slug ? "border-destructive focus:border-destructive" : ""}
                  />
                  {fieldErrors.slug && <FieldError errors={fieldErrors.slug} />}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">
                    Section Title *
                  </Label>
                  <Input
                    placeholder="e.g. Frontend & Languages"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value)
                      clearFieldError("title")
                      if (!badge) setBadge(e.target.value)
                    }}
                    className={fieldErrors.title ? "border-destructive focus:border-destructive" : ""}
                  />
                  {fieldErrors.title && <FieldError errors={fieldErrors.title} />}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">
                    Badge Label
                  </Label>
                  <Input
                    placeholder="e.g. Frontend & Languages"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">
                    Ordinal (01)
                  </Label>
                  <Input
                    value={ordinal}
                    onChange={(e) => setOrdinal(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">
                    Suffix (ST)
                  </Label>
                  <Input
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">
                    Color
                  </Label>
                  <Input
                    placeholder="e.g. cyan, indigo, gold"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={resetForm} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                      Save Category
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="space-y-2">
            {categories.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No categories found. Click "Add Category" or seed defaults.
              </div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary font-mono text-sm font-bold text-secondary-foreground">
                      {cat.ordinal}
                      <span className="text-[9px]">{cat.suffix}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {cat.code}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {cat.badge}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {cat.title} · {cat.skillsCount ?? 0} skills
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => startEdit(cat)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(cat.id, cat.title)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
