"use client"

import * as React from "react"
import { Circle, LightbulbOff } from "lucide-react"
import type { ContextBlock } from "@workspace/shared"

interface PreviewContextSectionProps {
  contextBlocks: ContextBlock[]
}

export function PreviewContextSection({
  contextBlocks,
}: PreviewContextSectionProps) {
  if (!contextBlocks || contextBlocks.length === 0) return null

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <span className="font-mono text-xs font-semibold text-primary uppercase">
          [ SEC_01 // CONTEXT_&_PROBLEM ]
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {contextBlocks.map((b, i) => (
          <div
            key={i}
            className="space-y-2 rounded-xl border border-border/80 bg-card/60 p-5"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary">
                {i === 0 ? (
                  <Circle className="size-3.5" />
                ) : (
                  <LightbulbOff className="size-3.5" />
                )}
              </div>
              <h4 className="text-sm font-bold text-foreground">{b.label}</h4>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {b.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
