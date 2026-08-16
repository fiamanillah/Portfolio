"use client"

import * as React from "react"
import {
  MoreHorizontal,
  Edit2,
  Eye,
  Copy,
  Trash2,
  ExternalLink,
  ThumbsUp,
  Calendar,
  Sparkles,
  CheckCircle,
  FileEdit,
  Archive,
} from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import type { CaseStudyListItemDTO, CaseStudyStatus } from "@workspace/shared"

interface CaseStudyCardProps {
  study: CaseStudyListItemDTO
  onEdit: (study: CaseStudyListItemDTO) => void
  onPreview: (study: CaseStudyListItemDTO) => void
  onDuplicate: (study: CaseStudyListItemDTO) => void
  onDelete: (study: CaseStudyListItemDTO) => void
  onStatusChange: (study: CaseStudyListItemDTO, status: CaseStudyStatus) => void
}

const STATUS_VARIANTS: Record<
  CaseStudyStatus,
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

export function CaseStudyCard({
  study,
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  onStatusChange,
}: CaseStudyCardProps) {
  const statusConfig =
    STATUS_VARIANTS[study.status as CaseStudyStatus] || STATUS_VARIANTS.DRAFT
  const dateStr = study.publishedAt || study.createdAt
  const date = new Date(dateStr)

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:border-primary/40 hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted/30">
        {study.image ? (
          <img
            src={study.image}
            alt={study.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono text-xs text-muted-foreground">
            No cover image
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <Badge
            variant="outline"
            className={`backdrop-blur-md font-mono text-[10px] ${statusConfig.class}`}
          >
            <span className={`mr-1 h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
            {statusConfig.label}
          </Badge>
        </div>

        {study.featured && (
          <div className="absolute top-2.5 left-2.5">
            <Badge
              variant="default"
              className="bg-primary/90 text-primary-foreground backdrop-blur-md px-1.5 py-0.5 text-[10px]"
            >
              <Sparkles className="mr-1 size-2.5" /> Featured
            </Badge>
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] font-semibold text-primary">
              #{String(study.order).padStart(2, "0")}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {study.timeline || "2026"}
            </span>
          </div>

          <h3
            className="line-clamp-1 cursor-pointer text-base font-bold text-foreground transition-colors hover:text-primary"
            onClick={() => onEdit(study)}
          >
            {study.title}
          </h3>

          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {study.description}
          </p>
        </div>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-1 pt-1">
          {(study.techStack || []).slice(0, 4).map((tech) => (
            <Badge
              key={tech}
              variant="secondary"
              className="px-1.5 py-0 font-mono text-[10px]"
            >
              {tech}
            </Badge>
          ))}
          {(study.techStack?.length || 0) > 4 && (
            <Badge
              variant="outline"
              className="px-1 py-0 font-mono text-[10px] text-muted-foreground"
            >
              +{study.techStack.length - 4}
            </Badge>
          )}
        </div>

        {/* Footer info & Actions */}
        <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <Eye className="size-3 text-muted-foreground/70" />
              {study.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="size-3 text-muted-foreground/70" />
              {study.likesCount}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onPreview(study)}
            >
              <Eye className="mr-1 size-3" /> Preview
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreHorizontal className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-mono text-[11px] text-muted-foreground uppercase">
                  Actions
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => onEdit(study)}
                  className="cursor-pointer text-xs"
                >
                  <Edit2 className="mr-2 size-3.5" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDuplicate(study)}
                  className="cursor-pointer text-xs"
                >
                  <Copy className="mr-2 size-3.5" /> Duplicate
                </DropdownMenuItem>
                {study.liveUrl && (
                  <DropdownMenuItem asChild className="cursor-pointer text-xs">
                    <a
                      href={study.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center"
                    >
                      <ExternalLink className="mr-2 size-3.5" /> Live Demo
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="font-mono text-[11px] text-muted-foreground uppercase">
                  Change Status
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => onStatusChange(study, "PUBLISHED")}
                  disabled={study.status === "PUBLISHED"}
                  className="cursor-pointer text-xs text-emerald-600 focus:text-emerald-600"
                >
                  <CheckCircle className="mr-2 size-3.5" /> Publish
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onStatusChange(study, "DRAFT")}
                  disabled={study.status === "DRAFT"}
                  className="cursor-pointer text-xs text-amber-600 focus:text-amber-600"
                >
                  <FileEdit className="mr-2 size-3.5" /> Draft
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onStatusChange(study, "ARCHIVED")}
                  disabled={study.status === "ARCHIVED"}
                  className="cursor-pointer text-xs text-zinc-500 focus:text-zinc-500"
                >
                  <Archive className="mr-2 size-3.5" /> Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(study)}
                  className="cursor-pointer text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <Trash2 className="mr-2 size-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}
