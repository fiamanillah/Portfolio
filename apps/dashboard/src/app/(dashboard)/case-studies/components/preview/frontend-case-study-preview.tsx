"use client"

import * as React from "react"
import type {
  CaseStudyDTO,
  ContextBlock,
  ArchitectureLayer,
  FeatureItem,
  PerformanceMetric,
  PostMortemSection,
} from "@workspace/shared"
import { PreviewHeroSection } from "./preview-hero-section"
import { PreviewContextSection } from "./preview-context-section"
import { PreviewArchitectureSection } from "./preview-architecture-section"
import { PreviewFeaturesSection } from "./preview-features-section"
import { PreviewMetricsSection } from "./preview-metrics-section"
import { PreviewPostMortemSection } from "./preview-post-mortem-section"

interface FrontendCaseStudyPreviewProps {
  caseStudy: Partial<CaseStudyDTO>
}

export function FrontendCaseStudyPreview({
  caseStudy,
}: FrontendCaseStudyPreviewProps) {
  const contextBlocks = (caseStudy.contextBlocks as ContextBlock[]) || []
  const architectureLayers =
    (caseStudy.architectureLayers as ArchitectureLayer[]) || []
  const features = (caseStudy.features as FeatureItem[]) || []
  const metrics = (caseStudy.metrics as PerformanceMetric[]) || []
  const postMortem = (caseStudy.postMortem as PostMortemSection[]) || []

  return (
    <div className="mx-auto max-w-5xl space-y-12 rounded-2xl border border-border/80 bg-background/95 p-4 sm:p-8 font-sans shadow-xl">
      {/* 1. HERO SECTION */}
      <PreviewHeroSection caseStudy={caseStudy} />

      {/* 2. SECTION 01: CONTEXT & PROBLEM */}
      <PreviewContextSection contextBlocks={contextBlocks} />

      {/* 3. SECTION 02: ARCHITECTURE TOPOLOGY */}
      <PreviewArchitectureSection architectureLayers={architectureLayers} />

      {/* 4. SECTION 03: KEY FEATURES */}
      <PreviewFeaturesSection features={features} />

      {/* 5. SECTION 04: PERFORMANCE METRICS */}
      <PreviewMetricsSection metrics={metrics} />

      {/* 6. SECTION 05: ARCHITECTURAL POST-MORTEM */}
      <PreviewPostMortemSection postMortem={postMortem} />
    </div>
  )
}
