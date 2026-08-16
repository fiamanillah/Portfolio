"use client"

import * as React from "react"
import { CaseStudyCard } from "../../case-study-card"
import type { CaseStudyListItemDTO, CaseStudyStatus } from "@workspace/shared"
import { Layers } from "lucide-react"

interface CaseStudyGridViewProps {
  data: CaseStudyListItemDTO[]
  isLoading?: boolean
  onEdit: (study: CaseStudyListItemDTO) => void
  onPreview: (study: CaseStudyListItemDTO) => void
  onDuplicate: (study: CaseStudyListItemDTO) => void
  onDelete: (study: CaseStudyListItemDTO) => void
  onStatusChange: (study: CaseStudyListItemDTO, status: CaseStudyStatus) => void
}

export function CaseStudyGridView({
  data,
  isLoading = false,
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  onStatusChange,
}: CaseStudyGridViewProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-border bg-card p-4 space-y-4"
          >
            <div className="aspect-video w-full rounded-lg bg-muted/60" />
            <div className="space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted/60" />
              <div className="h-3 w-1/2 rounded bg-muted/40" />
            </div>
            <div className="flex gap-2">
              <div className="h-5 w-14 rounded bg-muted/40" />
              <div className="h-5 w-14 rounded bg-muted/40" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
          <Layers className="size-6" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-foreground">
          No case studies found
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Try adjusting your search criteria or create a new case study.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((study) => (
        <CaseStudyCard
          key={study.id}
          study={study}
          onEdit={onEdit}
          onPreview={onPreview}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  )
}
