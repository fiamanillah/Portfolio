"use client"

import * as React from "react"
import { AlertCircle, Lightbulb, ShieldAlert, Sparkles } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import type { ContextBlock } from "@workspace/shared"

interface ContextPresetsBarProps {
  onAddBlock: (block: ContextBlock) => void
}

export function ContextPresetsBar({ onAddBlock }: ContextPresetsBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-2.5">
      <span className="font-mono text-[11px] text-muted-foreground flex items-center gap-1">
        <Sparkles className="size-3 text-primary" /> Add standard blocks:
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 text-xs hover:border-destructive/40 hover:bg-destructive/5"
        onClick={() =>
          onAddBlock({
            label: "The Problem",
            body: "Outline the obstacles, bottlenecks, or scale limitations previously faced.",
          })
        }
      >
        <AlertCircle className="mr-1 size-3 text-destructive" /> + The Problem
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 text-xs hover:border-amber-500/40 hover:bg-amber-500/5"
        onClick={() =>
          onAddBlock({
            label: "The Solution",
            body: "Outline how the architecture resolved the requirements through modern engineering.",
          })
        }
      >
        <Lightbulb className="mr-1 size-3 text-amber-500" /> + The Solution
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 text-xs hover:border-blue-500/40 hover:bg-blue-500/5"
        onClick={() =>
          onAddBlock({
            label: "Business Constraints",
            body: "Detail budget, latency, security compliance, or SLA constraints.",
          })
        }
      >
        <ShieldAlert className="mr-1 size-3 text-blue-500" /> + Constraints
      </Button>
    </div>
  )
}
