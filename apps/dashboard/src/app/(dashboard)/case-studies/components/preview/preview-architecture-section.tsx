"use client"

import * as React from "react"
import type { ArchitectureLayer } from "@workspace/shared"

interface PreviewArchitectureSectionProps {
  architectureLayers: ArchitectureLayer[]
}

export function PreviewArchitectureSection({
  architectureLayers,
}: PreviewArchitectureSectionProps) {
  if (!architectureLayers || architectureLayers.length === 0) return null

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <span className="font-mono text-xs font-semibold text-primary uppercase">
          [ SEC_02 // ARCHITECTURE_TOPOLOGY ]
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {architectureLayers.map((layer, i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-border/80 bg-card/60 p-4"
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h4 className="text-xs font-bold text-foreground">
                {layer.name}
              </h4>
              <span className="font-mono text-[10px] text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {layer.description}
            </p>
            <div className="space-y-1.5 pt-1">
              {(layer.items || []).map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className="rounded border border-border/40 bg-muted/30 p-2"
                >
                  <p className="text-xs font-semibold text-foreground">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="text-[10px] text-muted-foreground">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
