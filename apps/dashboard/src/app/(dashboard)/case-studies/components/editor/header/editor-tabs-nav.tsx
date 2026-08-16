"use client"

import * as React from "react"
import {
  Info,
  Layers,
  AlertCircle,
  Server,
  Sparkles,
  Activity,
  CheckCircle2,
  Share2,
  Eye,
} from "lucide-react"
import { TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

interface EditorTabsNavProps {
  metadataCount: number
  contextCount: number
  architectureCount: number
  featuresCount: number
  metricsCount: number
  postMortemCount: number
}

export function EditorTabsNav({
  metadataCount,
  contextCount,
  architectureCount,
  featuresCount,
  metricsCount,
  postMortemCount,
}: EditorTabsNavProps) {
  return (
    <div className="w-full overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <TabsList className="inline-flex h-auto min-w-full w-max flex-nowrap items-center justify-start gap-1 rounded-xl border border-border bg-card p-1.5 shadow-xs">
        <TabsTrigger
          value="hero"
          className="shrink-0 gap-1.5 text-xs whitespace-nowrap px-3 py-1.5"
        >
          <Info className="size-3.5" /> Hero & Overview
        </TabsTrigger>

        <TabsTrigger
          value="metadata"
          className="shrink-0 gap-1.5 text-xs whitespace-nowrap px-3 py-1.5"
        >
          <Layers className="size-3.5" /> Metadata ({metadataCount})
        </TabsTrigger>

        <TabsTrigger
          value="context"
          className="shrink-0 gap-1.5 text-xs whitespace-nowrap px-3 py-1.5"
        >
          <AlertCircle className="size-3.5" /> 01. Context ({contextCount})
        </TabsTrigger>

        <TabsTrigger
          value="architecture"
          className="shrink-0 gap-1.5 text-xs whitespace-nowrap px-3 py-1.5"
        >
          <Server className="size-3.5" /> 02. Architecture ({architectureCount})
        </TabsTrigger>

        <TabsTrigger
          value="features"
          className="shrink-0 gap-1.5 text-xs whitespace-nowrap px-3 py-1.5"
        >
          <Sparkles className="size-3.5" /> 03. Features ({featuresCount})
        </TabsTrigger>

        <TabsTrigger
          value="metrics"
          className="shrink-0 gap-1.5 text-xs whitespace-nowrap px-3 py-1.5"
        >
          <Activity className="size-3.5" /> 04. Metrics ({metricsCount})
        </TabsTrigger>

        <TabsTrigger
          value="post-mortem"
          className="shrink-0 gap-1.5 text-xs whitespace-nowrap px-3 py-1.5"
        >
          <CheckCircle2 className="size-3.5" /> 05. Post-Mortem ({postMortemCount})
        </TabsTrigger>

        <TabsTrigger
          value="seo"
          className="shrink-0 gap-1.5 text-xs whitespace-nowrap px-3 py-1.5"
        >
          <Share2 className="size-3.5" /> SEO & Social
        </TabsTrigger>

        <TabsTrigger
          value="preview"
          className="shrink-0 gap-1.5 text-xs font-semibold whitespace-nowrap px-3 py-1.5 text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Eye className="size-3.5" /> Live Preview
        </TabsTrigger>
      </TabsList>
    </div>
  )
}
