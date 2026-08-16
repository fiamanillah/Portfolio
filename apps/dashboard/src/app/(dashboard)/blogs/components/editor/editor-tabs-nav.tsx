"use client"

import * as React from "react"
import { FileText, Search, Calendar, Image as ImageIcon, User, Eye } from "lucide-react"
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
    <div className="px-4 md:px-6 border-b border-border/80 bg-muted/20 overflow-x-auto">
      <TabsList className="bg-transparent h-12 p-0 gap-2 md:gap-4 w-auto">
        <TabsTrigger
          value="content"
          className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 font-medium text-xs md:text-sm shrink-0 gap-1.5"
        >
          <FileText className="h-4 w-4" /> 1. Content & Editor
          {hasRequiredContent && (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          )}
        </TabsTrigger>

        <TabsTrigger
          value="seo"
          className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 font-medium text-xs md:text-sm shrink-0 gap-1.5"
        >
          <Search className="h-4 w-4" /> 2. SEO & Previews
          {seoAnalysis && (
            <Badge
              variant="outline"
              className={`ml-1 text-[10px] h-4 px-1.5 font-mono ${
                seoAnalysis.score >= 90
                  ? "text-emerald-500 border-emerald-500/30"
                  : seoAnalysis.score >= 75
                  ? "text-amber-500 border-amber-500/30"
                  : "text-rose-500 border-rose-500/30"
              }`}
            >
              {seoAnalysis.score}
            </Badge>
          )}
        </TabsTrigger>

        <TabsTrigger
          value="publishing"
          className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 font-medium text-xs md:text-sm shrink-0 gap-1.5"
        >
          <Calendar className="h-4 w-4" /> 3. Publishing & Schedule
        </TabsTrigger>

        <TabsTrigger
          value="media"
          className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 font-medium text-xs md:text-sm shrink-0 gap-1.5"
        >
          <ImageIcon className="h-4 w-4" /> 4. Media & Hero
          {hasCoverImage && (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          )}
        </TabsTrigger>

        <TabsTrigger
          value="author"
          className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 font-medium text-xs md:text-sm shrink-0 gap-1.5"
        >
          <User className="h-4 w-4" /> 5. Author Persona
        </TabsTrigger>

        <TabsTrigger
          value="preview"
          className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-2 font-medium text-xs md:text-sm shrink-0 gap-1.5 text-primary font-semibold"
        >
          <Eye className="h-4 w-4" /> 6. Live Website Preview
        </TabsTrigger>
      </TabsList>
    </div>
  )
}
