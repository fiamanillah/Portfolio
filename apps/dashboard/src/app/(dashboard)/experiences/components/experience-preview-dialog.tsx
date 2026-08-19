"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Eye, ExternalLink, Briefcase, MapPin } from "lucide-react"
import type { ExperienceDTO, ExperienceListItemDTO } from "@workspace/shared"

interface ExperiencePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  experience: ExperienceDTO | ExperienceListItemDTO | null
}

export function ExperiencePreviewDialog({
  open,
  onOpenChange,
  experience,
}: ExperiencePreviewDialogProps) {
  if (!experience) return null

  const titleArray =
    Array.isArray(experience.title) && experience.title.length > 0
      ? experience.title
      : [experience.role]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-[92vw] sm:max-w-none md:min-w-[840px] lg:min-w-[1000px] xl:min-w-[1120px] max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-2xl border-border/80 bg-background/95 backdrop-blur-md shadow-2xl">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 font-mono text-base font-bold uppercase">
              <Eye className="h-4 w-4 text-primary" />
              Website Live Preview
            </DialogTitle>
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/5 font-mono text-xs text-primary uppercase"
            >
              Status: {experience.status}
            </Badge>
          </div>
        </DialogHeader>

        {/* Portfolio Live Replica */}
        <div className="mt-4 rounded-lg border border-border bg-card overflow-hidden">
          <article className="relative flex flex-col border-border bg-background/50 backdrop-blur-sm md:flex-row">
            {/* Left Column: Year, Company, Meta */}
            <div className="flex w-full flex-row items-start justify-between border-b border-border p-5 md:w-[28%] md:flex-col md:border-r md:border-b-0 md:p-6">
              <div className="flex flex-col gap-1">
                <span className="text-[2.25rem] font-black tracking-tighter text-foreground md:text-[2.5rem]">
                  {experience.year}
                </span>
                <div className="mt-1 h-px w-6 bg-primary" />
                <p className="mt-2 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                  // {experience.period}
                </p>
              </div>

              {/* Location & Type Badge */}
              <div className="flex flex-col gap-2 md:mt-auto md:pt-6">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 border border-primary/50" />
                  <span className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                    {experience.location}
                  </span>
                </div>
                <div className="inline-flex w-fit items-center border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.12em] text-primary uppercase">
                  {experience.employmentType}
                </div>
              </div>
            </div>

            {/* Right Column: Content */}
            <div className="flex w-full flex-col gap-6 p-5 md:w-[72%] md:p-8">
              {/* Company & Role */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="inline-block w-fit border border-border bg-card px-3 py-1 font-mono text-xs font-bold tracking-[0.12em] text-foreground uppercase">
                    {experience.company}
                  </div>
                  {experience.companyUrl && (
                    <a
                      href={experience.companyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Website
                    </a>
                  )}
                </div>
                <h3 className="text-xl font-black tracking-tight text-foreground uppercase md:text-2xl lg:text-3xl">
                  {titleArray.join(" ")}
                </h3>
              </div>

              {/* Description + Highlights */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="flex flex-col gap-4">
                  <div className="relative pl-4">
                    <div className="absolute top-1 bottom-0 left-0 w-px bg-primary" />
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {experience.description}
                    </p>
                  </div>

                  {experience.highlights && experience.highlights.length > 0 && (
                    <ul className="flex flex-col gap-2">
                      {experience.highlights.map((h, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="mt-1 flex h-3 w-3 shrink-0 items-center justify-center border border-primary/30 bg-primary/10 text-[7px] text-primary">
                            +
                          </span>
                          <span className="text-sm leading-relaxed text-muted-foreground">
                            {h}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Stats row */}
                  {experience.stats && experience.stats.length > 0 && (
                    <div className="flex flex-wrap gap-4 border-t border-border pt-4">
                      {experience.stats.map((stat, idx) => (
                        <div key={idx} className="flex flex-col gap-0.5">
                          <div className="text-lg font-black tracking-tighter text-foreground">
                            {stat.value}
                          </div>
                          <div className="font-mono text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-6">
                  {/* Tech Stack */}
                  {experience.technologies &&
                    experience.technologies.length > 0 && (
                      <div className="flex flex-col gap-3">
                        <h5 className="font-mono text-xs font-bold tracking-[0.12em] text-foreground uppercase">
                          // TECH_STACK
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {experience.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="border border-border bg-muted/30 px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.1em] text-foreground uppercase"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Key Takeaway */}
                  {experience.learned && (
                    <div className="border-l-[1.5px] border-border pl-4">
                      <h5 className="mb-2 font-mono text-xs font-bold tracking-[0.12em] text-primary uppercase">
                        [ KEY_TAKEAWAY ]
                      </h5>
                      <p className="text-sm leading-relaxed text-muted-foreground italic">
                        "{experience.learned}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>
        </div>
      </DialogContent>
    </Dialog>
  )
}
