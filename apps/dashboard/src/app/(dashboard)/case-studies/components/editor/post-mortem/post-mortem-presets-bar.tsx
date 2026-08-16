"use client"

import * as React from "react"
import { AlertTriangle, CheckCircle2, Sparkles } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import type { PostMortemSection } from "@workspace/shared"

interface PostMortemPresetsBarProps {
  onAddSection: (section: PostMortemSection) => void
}

export function PostMortemPresetsBar({
  onAddSection,
}: PostMortemPresetsBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-2.5">
      <span className="font-mono text-[11px] text-muted-foreground flex items-center gap-1">
        <Sparkles className="size-3 text-primary" /> Add standard sections:
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 text-xs hover:border-destructive/40 hover:bg-destructive/5"
        onClick={() =>
          onAddSection({
            title: "Technical Challenges",
            entries: [
              {
                heading: "Real-Time State Synchronization",
                detail:
                  "Keeping the client state in sync with distributed backend nodes was complex. We implemented Redis Pub/Sub channels to broadcast state changes across WebSocket clusters.",
              },
            ],
          })
        }
      >
        <AlertTriangle className="mr-1 size-3 text-destructive" /> + Technical Challenges
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 text-xs hover:border-emerald-500/40 hover:bg-emerald-500/5"
        onClick={() =>
          onAddSection({
            title: "Lessons Learned",
            entries: [
              {
                heading: "Infrastructure Orchestration",
                detail:
                  "Containerizing PostgreSQL, Redis, and RabbitMQ within Docker Compose simplified developer workflows and guaranteed production environment parity.",
              },
            ],
          })
        }
      >
        <CheckCircle2 className="mr-1 size-3 text-emerald-500" /> + Lessons Learned
      </Button>
    </div>
  )
}
