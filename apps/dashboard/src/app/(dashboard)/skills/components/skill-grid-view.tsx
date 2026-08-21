"use client"

import * as React from "react"
import {
  MoreHorizontal,
  Edit2,
  Copy,
  Trash2,
  Star,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import type {
  SkillListItemDTO,
  SkillCategoryDTO,
  SkillStatus,
} from "@workspace/shared"

interface SkillGridViewProps {
  skills: SkillListItemDTO[]
  categories: SkillCategoryDTO[]
  onEdit: (skill: SkillListItemDTO) => void
  onDuplicate: (id: string) => void
  onDelete: (skill: SkillListItemDTO) => void
  onAddSkillToCategory?: (categoryId: string) => void
}

export function SkillGridView({
  skills,
  categories,
  onEdit,
  onDuplicate,
  onDelete,
  onAddSkillToCategory,
}: SkillGridViewProps) {
  // Group skills by categoryId
  const skillsByCategory = React.useMemo(() => {
    const map = new Map<string, SkillListItemDTO[]>()

    // Initialize all known categories
    for (const cat of categories) {
      map.set(cat.id, [])
    }
    // Unassigned category key
    map.set("unassigned", [])

    for (const skill of skills) {
      const catKey = skill.categoryId && map.has(skill.categoryId) ? skill.categoryId : "unassigned"
      const list = map.get(catKey) || []
      list.push(skill)
      map.set(catKey, list)
    }

    return map
  }, [skills, categories])

  if (skills.length === 0 && categories.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center">
        <Sparkles className="h-8 w-8 text-muted-foreground/50 mb-3" />
        <h3 className="text-base font-semibold text-foreground">No skills found</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm">
          Get started by adding your first skill or seeding the default full-stack skills template.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {categories.map((category) => {
        const catSkills = skillsByCategory.get(category.id) || []

        return (
          <div
            key={category.id}
            className="flex flex-col rounded-xl border border-border bg-card/60 backdrop-blur-xs transition-all hover:border-primary/40 hover:shadow-md"
          >
            {/* Category Header */}
            <div className="flex items-center justify-between border-b border-border/80 p-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-bold text-primary">
                  {category.ordinal || "01"}
                </span>
                <div>
                  <h4 className="font-mono text-sm font-bold tracking-tight text-foreground uppercase">
                    {category.code}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {category.title}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="font-mono text-[10px]">
                  {catSkills.length} items
                </Badge>
                {onAddSkillToCategory && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onAddSkillToCategory(category.id)}
                    title={`Add skill to ${category.code}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Category Skill Items */}
            <div className="flex-1 space-y-2 p-3">
              {catSkills.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground/60">
                  No skills in this category yet
                </div>
              ) : (
                catSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="group relative flex flex-col justify-between rounded-lg border border-border/60 bg-background/50 p-3 transition-colors hover:border-primary/30 hover:bg-background/80"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                            {skill.name}
                          </span>
                          {skill.featured && (
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          )}
                          {skill.status !== "PUBLISHED" && (
                            <Badge variant="secondary" className="text-[9px] py-0 px-1 uppercase">
                              {skill.status}
                            </Badge>
                          )}
                        </div>

                        {(skill.leftLabel || skill.rightLabel) && (
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground tracking-wider uppercase">
                            {skill.leftLabel && <span>{skill.leftLabel}</span>}
                            {skill.leftLabel && skill.rightLabel && (
                              <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                            )}
                            {skill.rightLabel && <span>{skill.rightLabel}</span>}
                          </div>
                        )}
                      </div>

                      {/* Item Action Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem onClick={() => onEdit(skill)}>
                            <Edit2 className="mr-2 h-3.5 w-3.5" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDuplicate(skill.id)}>
                            <Copy className="mr-2 h-3.5 w-3.5" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(skill)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Tags & Level Indicator */}
                    <div className="mt-2 flex items-center justify-between gap-2 border-t border-border/40 pt-2 text-xs">
                      {/* Level Stars */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-2.5 w-2.5 ${
                              star <= skill.level
                                ? "fill-primary text-primary"
                                : "text-muted-foreground/20"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Tags */}
                      {skill.tags && skill.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {skill.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-sm bg-secondary/80 px-1 py-0.5 font-mono text-[9px] text-secondary-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                          {skill.tags.length > 2 && (
                            <span className="font-mono text-[9px] text-muted-foreground">
                              +{skill.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}

      {/* Unassigned Skills group (if any) */}
      {(skillsByCategory.get("unassigned") || []).length > 0 && (
        <div className="flex flex-col rounded-xl border border-dashed border-border bg-card/40 p-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h4 className="font-mono text-sm font-bold text-muted-foreground uppercase">
              Unassigned Skills
            </h4>
            <Badge variant="outline">
              {(skillsByCategory.get("unassigned") || []).length}
            </Badge>
          </div>
          <div className="mt-3 space-y-2">
            {(skillsByCategory.get("unassigned") || []).map((skill) => (
              <div
                key={skill.id}
                className="flex items-center justify-between rounded-lg border border-border/40 p-2.5 text-xs"
              >
                <span className="font-semibold">{skill.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(skill)}
                  className="h-6 text-xs gap-1"
                >
                  <Edit2 className="h-3 w-3" />
                  Assign
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
