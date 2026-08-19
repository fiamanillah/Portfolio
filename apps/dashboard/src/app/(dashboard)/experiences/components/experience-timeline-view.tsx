"use client"

import * as React from "react"
import {
  Edit2,
  Eye,
  Copy,
  Trash2,
  ExternalLink,
  MapPin,
  Briefcase,
  Sparkles,
  CheckCircle2,
  FileEdit,
  Archive,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import type { ExperienceListItemDTO, ExperienceStatus } from "@workspace/shared"

interface ExperienceTimelineViewProps {
  experiences: ExperienceListItemDTO[]
  onEdit: (exp: ExperienceListItemDTO) => void
  onPreview: (exp: ExperienceListItemDTO) => void
  onDuplicate: (exp: ExperienceListItemDTO) => void
  onDelete: (exp: ExperienceListItemDTO) => void
  onStatusChange: (exp: ExperienceListItemDTO, status: ExperienceStatus) => void
}

const STATUS_BADGES: Record<
  ExperienceStatus,
  { label: string; class: string; dot: string }
> = {
  PUBLISHED: {
    label: "Published",
    class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  DRAFT: {
    label: "Draft",
    class: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    dot: "bg-amber-500",
  },
  ARCHIVED: {
    label: "Archived",
    class: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
    dot: "bg-zinc-500",
  },
}

export function ExperienceTimelineView({
  experiences,
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  onStatusChange,
}: ExperienceTimelineViewProps) {
  if (experiences.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card text-center">
        <Briefcase className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-semibold text-foreground">
          No experiences found
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {experiences.map((exp, idx) => {
        const statusObj =
          STATUS_BADGES[exp.status as ExperienceStatus] || STATUS_BADGES.DRAFT
        const titleArr =
          Array.isArray(exp.title) && exp.title.length > 0
            ? exp.title
            : [exp.role]

        return (
          <div
            key={exp.id}
            className="group relative rounded-lg border border-border bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-sm"
          >
            {/* Header row */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 pb-4">
              <div className="flex items-start gap-4">
                {/* Year display */}
                <div className="flex flex-col">
                  <span className="text-2xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {exp.year}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">
                    {exp.period}
                  </span>
                </div>

                <div className="h-10 w-px bg-border/80" />

                {/* Company & Role */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-primary uppercase">
                      {exp.company}
                    </span>
                    {exp.companyUrl && (
                      <a
                        href={exp.companyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {exp.isCurrent && (
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary border-primary/20 text-[9px] px-1.5 py-0 font-mono font-bold"
                      >
                        CURRENT
                      </Badge>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-foreground">
                    {titleArr.join(" ")}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {exp.location}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-[10px] uppercase">
                      {exp.employmentType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`${statusObj.class} font-mono text-[10px] uppercase flex items-center gap-1.5`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${statusObj.dot}`} />
                  {statusObj.label}
                </Badge>

                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 font-mono text-xs"
                    onClick={() => onPreview(exp)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 font-mono text-xs"
                    onClick={() => onEdit(exp)}
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => onDuplicate(exp)}
                    title="Duplicate"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(exp)}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content summary */}
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {exp.description}
                </p>

                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="space-y-1">
                    {exp.highlights.slice(0, 3).map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="font-mono text-primary font-bold">+</span>
                        <span className="line-clamp-1">{h}</span>
                      </li>
                    ))}
                    {exp.highlights.length > 3 && (
                      <span className="text-[11px] text-muted-foreground/80 italic pl-3">
                        +{exp.highlights.length - 3} more highlights
                      </span>
                    )}
                  </ul>
                )}
              </div>

              {/* Technologies */}
              <div className="space-y-2 lg:border-l lg:border-border/60 lg:pl-4">
                <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase">
                  Tech Stack ({exp.technologies?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1">
                  {(exp.technologies || []).map((t) => (
                    <span
                      key={t}
                      className="border border-border/80 bg-muted/20 px-2 py-0.5 font-mono text-[10px] text-foreground uppercase"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
