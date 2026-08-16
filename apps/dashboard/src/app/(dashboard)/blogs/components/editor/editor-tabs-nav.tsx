"use client"

import * as React from "react"
import {
  FileText,
  Search,
  Calendar,
  Image as ImageIcon,
  User,
  Eye,
} from "lucide-react"
import { TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Badge } from "@workspace/ui/components/badge"
import type { SeoAnalysisResult } from "@workspace/shared"

interface EditorTabsNavProps {
  seoAnalysis: SeoAnalysisResult | null
  hasCoverImage: boolean
  hasRequiredContent: boolean
}

export function EditorTabsNav({
  seoAnalysis,
  hasCoverImage,
  hasRequiredContent,
}: EditorTabsNavProps) {
  return (
    <div className="overflow-x-auto border-b border-border/80 bg-muted/20 px-4 md:px-6">
      <TabsList className="h-12 w-auto gap-2 bg-transparent p-0 md:gap-4">
        <TabsTrigger
          value="content"
          className="shrink-0 gap-1.5 rounded-none px-2 text-xs font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none md:text-sm"
        >
          <FileText className="h-4 w-4" /> 1. Content & Editor
          {hasRequiredContent && (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          )}
        </TabsTrigger>

        <TabsTrigger
          value="seo"
          className="shrink-0 gap-1.5 rounded-none px-2 text-xs font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none md:text-sm"
        >
          <Search className="h-4 w-4" /> 2. SEO & Previews
          {seoAnalysis && (
            <Badge
              variant="outline"
              className={`ml-1 h-4 px-1.5 font-mono text-[10px] ${
                seoAnalysis.score >= 90
                  ? "border-emerald-500/30 text-emerald-500"
                  : seoAnalysis.score >= 75
                    ? "border-amber-500/30 text-amber-500"
                    : "border-rose-500/30 text-rose-500"
              }`}
            >
              {seoAnalysis.score}
            </Badge>
          )}
        </TabsTrigger>

        <TabsTrigger
          value="publishing"
          className="shrink-0 gap-1.5 rounded-none px-2 text-xs font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none md:text-sm"
        >
          <Calendar className="h-4 w-4" /> 3. Publishing & Schedule
        </TabsTrigger>

        <TabsTrigger
          value="media"
          className="shrink-0 gap-1.5 rounded-none px-2 text-xs font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none md:text-sm"
        >
          <ImageIcon className="h-4 w-4" /> 4. Media & Hero
          {hasCoverImage && (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          )}
        </TabsTrigger>

        <TabsTrigger
          value="author"
          className="shrink-0 gap-1.5 rounded-none px-2 text-xs font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none md:text-sm"
        >
          <User className="h-4 w-4" /> 5. Author Persona
        </TabsTrigger>

        <TabsTrigger
          value="preview"
          className="shrink-0 gap-1.5 rounded-none px-2 text-xs font-medium font-semibold text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none md:text-sm"
        >
          <Eye className="h-4 w-4" /> 6. Live Website Preview
        </TabsTrigger>
      </TabsList>
    </div>
  )
}
