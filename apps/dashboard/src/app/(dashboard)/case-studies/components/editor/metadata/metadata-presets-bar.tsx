"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import type { CaseStudyMetadataItem } from "@workspace/shared"

interface MetadataPresetsBarProps {
  onAddPreset: (preset: CaseStudyMetadataItem) => void
}

const PRESETS: CaseStudyMetadataItem[] = [
  { label: "Role", value: "Full Stack Developer" },
  { label: "Timeline", value: "2025 - 2026" },
  { label: "Client / Company", value: "Enterprise Client" },
  { label: "Domain", value: "Automotive B2B Marketplace" },
  { label: "Tech Stack", value: "TypeScript, Bun, PostgreSQL, Redis" },
  { label: "Team Size", value: "4 Engineers" },
]

export function MetadataPresetsBar({ onAddPreset }: MetadataPresetsBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 p-2.5">
      <span className="font-mono text-[11px] text-muted-foreground flex items-center gap-1">
        <Sparkles className="size-3 text-primary" /> Quick presets:
      </span>
      {PRESETS.map((preset) => (
        <Button
          key={preset.label}
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs hover:border-primary/40 hover:bg-primary/5"
          onClick={() => onAddPreset(preset)}
        >
          + {preset.label}
        </Button>
      ))}
    </div>
  )
}
