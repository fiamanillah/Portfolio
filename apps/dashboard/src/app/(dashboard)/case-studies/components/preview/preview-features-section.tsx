"use client"

import * as React from "react"
import { Badge } from "@workspace/ui/components/badge"
import type { FeatureItem } from "@workspace/shared"

interface PreviewFeaturesSectionProps {
  features: FeatureItem[]
}

export function PreviewFeaturesSection({
  features,
}: PreviewFeaturesSectionProps) {
  if (!features || features.length === 0) return null

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <span className="font-mono text-xs font-semibold text-primary uppercase">
          [ SEC_03 // KEY_FEATURES ]
        </span>
      </div>
      <div className="space-y-6">
        {features.map((feat, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-border/80 bg-card/60 grid lg:grid-cols-12"
          >
            <div className="p-6 lg:col-span-6 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                  <span className="font-bold text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>•</span>
                  <span className="uppercase">{feat.mediaLabel}</span>
                </div>
                <h4 className="text-lg font-bold text-foreground">
                  {feat.title}
                </h4>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {feat.description}
                </p>
                {(feat.highlights || []).length > 0 && (
                  <ul className="space-y-1 pt-1">
                    {feat.highlights?.map((hl, hlIdx) => (
                      <li
                        key={hlIdx}
                        className="text-xs text-muted-foreground flex items-start gap-2"
                      >
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-primary" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {(feat.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {feat.tags?.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px] font-mono">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-muted/20 lg:col-span-6 overflow-hidden min-h-[220px]">
              {feat.media ? (
                <img
                  src={feat.media}
                  alt={feat.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  No Feature Image
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
