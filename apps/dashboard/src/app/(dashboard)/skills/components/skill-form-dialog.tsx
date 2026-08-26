"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { toast } from "@workspace/ui/components/sonner"
import { FieldError } from "@workspace/ui/components/field"
import { Loader2, Plus, X, Star } from "lucide-react"
import type {
  SkillDTO,
  SkillCategoryDTO,
  CreateSkillDTO,
  SkillStatus,
} from "@workspace/shared"
import {
  SkillApi,
  showApiError,
  extractFieldErrors,
  validateUrl,
  cleanUrl,
} from "@/lib/api"

interface SkillFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingSkill?: SkillDTO | null
  categories: SkillCategoryDTO[]
  onSuccess: () => void
}

export function SkillFormDialog({
  open,
  onOpenChange,
  editingSkill,
  categories,
  onSuccess,
}: SkillFormDialogProps) {
  const isEditing = Boolean(editingSkill)

  const [name, setName] = React.useState("")
  const [categoryId, setCategoryId] = React.useState<string>("none")
  const [leftLabel, setLeftLabel] = React.useState("")
  const [rightLabel, setRightLabel] = React.useState("")
  const [level, setLevel] = React.useState<number>(5)
  const [icon, setIcon] = React.useState("")
  const [tags, setTags] = React.useState<string[]>([])
  const [tagInput, setTagInput] = React.useState("")
  const [featured, setFeatured] = React.useState(false)
  const [status, setStatus] = React.useState<SkillStatus>("PUBLISHED")
  const [order, setOrder] = React.useState<number>(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})

  // Quick Category creation
  const [isAddingCategory, setIsAddingCategory] = React.useState(false)
  const [newCategoryCode, setNewCategoryCode] = React.useState("")
  const [newCategoryTitle, setNewCategoryTitle] = React.useState("")
  const [isCreatingCategory, setIsCreatingCategory] = React.useState(false)

  const handleQuickCreateCategory = async () => {
    if (!newCategoryCode.trim() || !newCategoryTitle.trim()) return
    setIsCreatingCategory(true)
    try {
      const slug =
        newCategoryCode
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || "category"
      const res = await SkillApi.createCategory({
        code: newCategoryCode.trim(),
        title: newCategoryTitle.trim(),
        badge: newCategoryTitle.trim(),
        slug,
      })
      if (res.success && res.data) {
        toast.success(`Category "${res.data.code}" created!`)
        setCategoryId(res.data.id)
        setIsAddingCategory(false)
        setNewCategoryCode("")
        setNewCategoryTitle("")
        onSuccess()
      } else {
        showApiError(res, "Failed to create category")
      }
    } catch (err: unknown) {
      showApiError(err, "Failed to create category")
    } finally {
      setIsCreatingCategory(false)
    }
  }

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  // Hydrate form fields when editingSkill changes or modal opens
  React.useEffect(() => {
    if (editingSkill) {
      setName(editingSkill.name || "")
      setCategoryId(editingSkill.categoryId || "none")
      setLeftLabel(editingSkill.leftLabel || "")
      setRightLabel(editingSkill.rightLabel || "")
      setLevel(editingSkill.level || 5)
      setIcon(editingSkill.icon || "")
      setTags(Array.isArray(editingSkill.tags) ? [...editingSkill.tags] : [])
      setFeatured(editingSkill.featured ?? false)
      setStatus(editingSkill.status || "PUBLISHED")
      setOrder(editingSkill.order || 0)
    } else {
      setName("")
      setCategoryId(categories.length > 0 ? categories[0].id : "none")
      setLeftLabel("")
      setRightLabel("")
      setLevel(5)
      setIcon("")
      setTags([])
      setFeatured(false)
      setStatus("PUBLISHED")
      setOrder(0)
    }
    setTagInput("")
    setFieldErrors({})
  }, [editingSkill, open, categories])

  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. Client-Side Pre-Validation
    const clientErrors: Record<string, string> = {}

    if (!name.trim()) {
      clientErrors.name = "Skill name is required"
    }

    if (icon.trim() && (icon.startsWith("http://") || icon.startsWith("https://"))) {
      const urlValidation = validateUrl(icon, "Icon URL")
      if (!urlValidation.valid && urlValidation.error) {
        clientErrors.icon = urlValidation.error
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
      const payload: CreateSkillDTO = {
        name: name.trim(),
        categoryId: categoryId === "none" || !categoryId ? null : categoryId,
        leftLabel: leftLabel.trim() || null,
        rightLabel: rightLabel.trim() || null,
        level,
        icon: cleanUrl(icon) || icon.trim() || null,
        tags,
        featured,
        status,
        order,
      }

      if (isEditing && editingSkill) {
        const res = await SkillApi.update(editingSkill.id, payload)
        if (res.success) {
          setFieldErrors({})
          toast.success("Skill updated successfully")
          onOpenChange(false)
          onSuccess()
        } else {
          showApiError(res, "Failed to update skill")
          setFieldErrors(extractFieldErrors(res))
        }
      } else {
        const res = await SkillApi.create(payload)
        if (res.success) {
          setFieldErrors({})
          toast.success("Skill created successfully")
          onOpenChange(false)
          onSuccess()
        } else {
          showApiError(res, "Failed to create skill")
          setFieldErrors(extractFieldErrors(res))
        }
      }
    } catch (err: unknown) {
      showApiError(err, "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {isEditing ? "Edit Skill" : "Add New Skill"}
          </DialogTitle>
          <DialogDescription>
            Configure skill item details, category allocation, labels, and proficiency.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Skill Name */}
          <div className="space-y-1.5">
            <Label htmlFor="skill-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Skill Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="skill-name"
              placeholder="e.g. React / Next.js, Node / Express, Docker / Nginx"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                clearFieldError("name")
              }}
              className={fieldErrors.name ? "border-destructive focus:border-destructive" : ""}
              required
            />
            {fieldErrors.name && <FieldError errors={fieldErrors.name} />}
          </div>

          {/* Category Allocation & Status */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="skill-category" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Stack Category
                </Label>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory((prev) => !prev)}
                  className="font-mono text-[11px] text-primary hover:underline"
                >
                  {isAddingCategory ? "Cancel" : "+ New Category"}
                </button>
              </div>

              {!isAddingCategory ? (
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="skill-category" className="w-full">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category (Standalone)</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.code} — {cat.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-2.5 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Code (e.g. AI/ML)"
                      value={newCategoryCode}
                      onChange={(e) => setNewCategoryCode(e.target.value)}
                      className="h-8 text-xs bg-background"
                    />
                    <Input
                      placeholder="Title (e.g. AI & ML)"
                      value={newCategoryTitle}
                      onChange={(e) => setNewCategoryTitle(e.target.value)}
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleQuickCreateCategory}
                    disabled={isCreatingCategory || !newCategoryCode.trim() || !newCategoryTitle.trim()}
                    className="w-full h-7 text-xs font-bold"
                  >
                    {isCreatingCategory ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 mr-1" />
                    )}
                    Save &amp; Select Category
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="skill-status" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Visibility Status
              </Label>
              <Select value={status} onValueChange={(val) => setStatus(val as SkillStatus)}>
                <SelectTrigger id="skill-status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLISHED">Published (Live on Website)</SelectItem>
                  <SelectItem value="DRAFT">Draft (Hidden)</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Left & Right Labels with Quick Chips */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="skill-left" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Left Label (Domain / Role)
              </Label>
              <Input
                id="skill-left"
                placeholder="e.g. Core Stack, Runtime, Containers"
                value={leftLabel}
                onChange={(e) => setLeftLabel(e.target.value)}
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {["Core Stack", "Languages", "Runtime", "Architecture", "Containers", "Cloud", "Databases"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setLeftLabel(preset)}
                    className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="skill-right" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Right Label (Highlight / Subtitle)
              </Label>
              <Input
                id="skill-right"
                placeholder="e.g. SSR Ready, API Design, Reverse Proxy"
                value={rightLabel}
                onChange={(e) => setRightLabel(e.target.value)}
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {["DOM Styling", "SSR Ready", "API Design", "Scalable API", "Data Integrity", "CI/CD", "Reverse Proxy"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRightLabel(preset)}
                    className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Proficiency Level & Order */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Proficiency Level ({level}/5)
              </Label>
              <div className="flex items-center gap-1.5 pt-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setLevel(star)}
                    className="group focus:outline-none"
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        star <= level
                          ? "fill-primary text-primary"
                          : "text-muted-foreground/30 hover:text-primary/50"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="skill-order" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sort Order
              </Label>
              <Input
                id="skill-order"
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label htmlFor="skill-tags" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Keywords & Tags
            </Label>
            <div className="flex gap-2">
              <Input
                id="skill-tags"
                placeholder="Type tag and press Add"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={handleAddTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 font-mono text-xs text-secondary-foreground"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="skill-featured" className="text-sm font-semibold">
                Featured Skill
              </Label>
              <p className="text-xs text-muted-foreground">
                Highlight this skill in hero badges and key capabilities showcases.
              </p>
            </div>
            <Switch
              id="skill-featured"
              checked={featured}
              onCheckedChange={setFeatured}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Update Skill"
              ) : (
                "Create Skill"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
