"use client"

import * as React from "react"
import type { CaseStudyStatus } from "@workspace/shared"
import { HeroBasicInfoCard } from "./hero/hero-basic-info-card"
import { HeroProjectMetaCard } from "./hero/hero-project-meta-card"
import { HeroTechStackCard } from "./hero/hero-tech-stack-card"
import { HeroCoverMediaCard } from "./hero/hero-cover-media-card"
import { HeroPublishingCard } from "./hero/hero-publishing-card"

interface HeroTabProps {
  title: string
  setTitle: (title: string) => void
  subtitle: string
  setSubtitle: (subtitle: string) => void
  slug: string
  setSlug: (slug: string) => void
  description: string
  setDescription: (desc: string) => void
  status: CaseStudyStatus
  setStatus: (status: CaseStudyStatus) => void
  projectStatus: string
  setProjectStatus: (status: string) => void
  order: number
  setOrder: (order: number) => void
  featured: boolean
  setFeatured: (featured: boolean) => void
  pinned: boolean
  setPinned: (pinned: boolean) => void
  image: string
  setImage: (image: string) => void
  imageLabel: string
  setImageLabel: (label: string) => void
  liveUrl: string
  setLiveUrl: (url: string) => void
  githubUrl: string
  setGithubUrl: (url: string) => void
  role: string
  setRole: (role: string) => void
  timeline: string
  setTimeline: (timeline: string) => void
  client: string
  setClient: (client: string) => void
  impact: string
  setImpact: (impact: string) => void
  techStack: string[]
  setTechStack: (tech: string[]) => void
}

export function HeroTab({
  title,
  setTitle,
  subtitle,
  setSubtitle,
  slug,
  setSlug,
  description,
  setDescription,
  status,
  setStatus,
  projectStatus,
  setProjectStatus,
  order,
  setOrder,
  featured,
  setFeatured,
  pinned,
  setPinned,
  image,
  setImage,
  imageLabel,
  setImageLabel,
  liveUrl,
  setLiveUrl,
  githubUrl,
  setGithubUrl,
  role,
  setRole,
  timeline,
  setTimeline,
  client,
  setClient,
  impact,
  setImpact,
  techStack,
  setTechStack,
}: HeroTabProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left Main Column */}
      <div className="space-y-6 lg:col-span-8">
        <HeroBasicInfoCard
          title={title}
          setTitle={setTitle}
          subtitle={subtitle}
          setSubtitle={setSubtitle}
          slug={slug}
          setSlug={setSlug}
          description={description}
          setDescription={setDescription}
          impact={impact}
          setImpact={setImpact}
        />

        <HeroProjectMetaCard
          role={role}
          setRole={setRole}
          timeline={timeline}
          setTimeline={setTimeline}
          client={client}
          setClient={setClient}
          liveUrl={liveUrl}
          setLiveUrl={setLiveUrl}
          githubUrl={githubUrl}
          setGithubUrl={setGithubUrl}
        />

        <HeroTechStackCard
          techStack={techStack}
          setTechStack={setTechStack}
        />
      </div>

      {/* Right Column / Sidebar Controls */}
      <div className="space-y-6 lg:col-span-4">
        <HeroCoverMediaCard
          image={image}
          setImage={setImage}
          imageLabel={imageLabel}
          setImageLabel={setImageLabel}
        />

        <HeroPublishingCard
          status={status}
          setStatus={setStatus}
          projectStatus={projectStatus}
          setProjectStatus={setProjectStatus}
          order={order}
          setOrder={setOrder}
          featured={featured}
          setFeatured={setFeatured}
          pinned={pinned}
          setPinned={setPinned}
        />
      </div>
    </div>
  )
}
