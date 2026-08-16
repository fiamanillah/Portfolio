"use client"

import * as React from "react"
import { ExternalLink, FolderGit2 } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import type { CaseStudyDTO, CaseStudyMetadataItem } from "@workspace/shared"

interface PreviewHeroSectionProps {
  caseStudy: Partial<CaseStudyDTO>
}

export function PreviewHeroSection({ caseStudy }: PreviewHeroSectionProps) {
  const metadata = (caseStudy.metadata as CaseStudyMetadataItem[]) || []

  return (
    <article className="relative w-full overflow-hidden rounded-xl border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-5 py-3 md:px-6">
        <span className="font-mono text-xs font-semibold text-primary uppercase">
          PROJECT_INIT //
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            <span className="font-mono text-[10px] text-muted-foreground uppercase">
              Active
            </span>
          </span>
          <Badge variant="outline" className="font-mono text-xs">
            {caseStudy.projectStatus || "Status: Completed"}
          </Badge>
        </div>
      </header>

      <div className="flex flex-col gap-8 p-6 md:flex-row md:items-start md:gap-8">
        <div className="flex flex-1 flex-col justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              {caseStudy.title || "Untitled Case Study"}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {caseStudy.description || "No description provided."}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <span className="font-mono text-[10px] text-muted-foreground/80 uppercase">
                // Tech_Stack
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(caseStudy.techStack || []).map((tech) => (
                  <Badge key={tech} variant="outline" className="text-xs">
                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-primary/70" />
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              {caseStudy.liveUrl && (
                <Button size="sm" className="gap-1.5">
                  <ExternalLink className="size-3.5" /> Live Demo
                </Button>
              )}
              {caseStudy.githubUrl && (
                <Button size="sm" variant="outline" className="gap-1.5">
                  <FolderGit2 className="size-3.5" /> GitHub Repo
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Hero Thumbnail Artwork */}
        <div className="flex-1 md:max-w-[45%]">
          <div className="overflow-hidden rounded-lg border border-border shadow-xs aspect-video bg-muted/40 flex items-center justify-center">
            {caseStudy.image ? (
              <img
                src={caseStudy.image}
                alt={caseStudy.title || "Cover"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-xs text-muted-foreground font-mono">
                No Cover Preview
              </div>
            )}
          </div>
          {caseStudy.imageLabel && (
            <p className="mt-1.5 font-mono text-[10px] text-muted-foreground uppercase">
              — {caseStudy.imageLabel}
            </p>
          )}
        </div>
      </div>

      {/* 4-column Meta Grid */}
      {metadata.length > 0 && (
        <div className="grid grid-cols-2 border-t border-border sm:grid-cols-4">
          {metadata.map((m, i) => (
            <div
              key={i}
              className={`p-4 ${i < metadata.length - 1 ? "border-r border-border" : ""}`}
            >
              <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                {m.label}
              </span>
              <p className="mt-1 text-xs font-bold text-foreground">
                {m.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </article>
  )
}
