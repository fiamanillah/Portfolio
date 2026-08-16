"use client"

import * as React from "react"
import { AlertTriangle, CheckCircle2 } from "lucide-react"
import type { PostMortemSection } from "@workspace/shared"

interface PreviewPostMortemSectionProps {
  postMortem: PostMortemSection[]
}

export function PreviewPostMortemSection({
  postMortem,
}: PreviewPostMortemSectionProps) {
  if (!postMortem || postMortem.length === 0) return null

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <span className="font-mono text-xs font-semibold text-primary uppercase">
          [ SEC_05 // ARCHITECTURAL_POST_MORTEM ]
        </span>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {postMortem.map((sec, i) => (
          <div
            key={i}
            className="space-y-4 rounded-xl border border-border/80 bg-card/60 p-5"
          >
            <div className="flex items-center gap-2 border-b border-border/40 pb-3">
              {i % 2 === 0 ? (
                <AlertTriangle className="size-4 text-destructive" />
              ) : (
                <CheckCircle2 className="size-4 text-primary" />
              )}
              <h4 className="text-base font-bold text-foreground">
                {sec.title}
              </h4>
            </div>
            <div className="space-y-3">
              {(sec.entries || []).map((entry, entryIdx) => (
                <div
                  key={entryIdx}
                  className="border-l-2 border-primary/40 pl-3 space-y-1"
                >
                  <h5 className="font-mono text-[11px] font-semibold text-foreground uppercase">
                    // {entry.heading}
                  </h5>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {entry.detail}
                  </p>
                  {entry.code && (
                    <pre className="mt-1 rounded bg-muted/40 p-2 font-mono text-[10px] text-foreground overflow-x-auto">
                      {entry.code}
                    </pre>
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
