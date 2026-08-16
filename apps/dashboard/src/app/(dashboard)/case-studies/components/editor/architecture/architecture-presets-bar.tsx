"use client"

import * as React from "react"
import { Layers, Server, Database, Cloud, Sparkles } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import type { ArchitectureLayer } from "@workspace/shared"

interface ArchitecturePresetsBarProps {
  onAddLayer: (layer: ArchitectureLayer) => void
}

export function ArchitecturePresetsBar({
  onAddLayer,
}: ArchitecturePresetsBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-2.5">
      <span className="font-mono text-[11px] text-muted-foreground flex items-center gap-1">
        <Sparkles className="size-3 text-primary" /> Add standard 4-tier layer:
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 text-xs hover:border-blue-500/40 hover:bg-blue-500/5"
        onClick={() =>
          onAddLayer({
            name: "Client / UI",
            description:
              "Frontend client application catering to Admin, Consumer, and Contractor roles.",
            items: [
              { title: "Next.js & React", subtitle: "App Router framework" },
              { title: "Tailwind CSS", subtitle: "Utility-first styling system" },
            ],
          })
        }
      >
        <Layers className="mr-1 size-3 text-blue-500" /> + Client / UI
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 text-xs hover:border-emerald-500/40 hover:bg-emerald-500/5"
        onClick={() =>
          onAddLayer({
            name: "API & Compute",
            description:
              "High-performance backend API services and WebSocket communication nodes.",
            items: [
              { title: "Bun / Express", subtitle: "REST API runtime" },
              { title: "Socket.IO", subtitle: "Real-time messaging" },
            ],
          })
        }
      >
        <Server className="mr-1 size-3 text-emerald-500" /> + API & Compute
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 text-xs hover:border-amber-500/40 hover:bg-amber-500/5"
        onClick={() =>
          onAddLayer({
            name: "Data Layer",
            description:
              "Relational database, memory caching, and object storage.",
            items: [
              { title: "PostgreSQL", subtitle: "Primary database via Prisma ORM" },
              { title: "Redis", subtitle: "In-memory caching and session store" },
            ],
          })
        }
      >
        <Database className="mr-1 size-3 text-amber-500" /> + Data Layer
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 text-xs hover:border-purple-500/40 hover:bg-purple-500/5"
        onClick={() =>
          onAddLayer({
            name: "Infra / Delivery",
            description:
              "Containerized orchestration and asynchronous task queues.",
            items: [
              { title: "Docker Compose", subtitle: "Multi-container orchestration" },
              { title: "RabbitMQ", subtitle: "Asynchronous worker broker" },
            ],
          })
        }
      >
        <Cloud className="mr-1 size-3 text-purple-500" /> + Infra / Delivery
      </Button>
    </div>
  )
}
