"use client"

import * as React from "react"
import { User, Calendar, Building, Globe, FolderGit2 } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"

interface HeroProjectMetaCardProps {
  role: string
  setRole: (role: string) => void
  timeline: string
  setTimeline: (timeline: string) => void
  client: string
  setClient: (client: string) => void
  liveUrl: string
  setLiveUrl: (url: string) => void
  githubUrl: string
  setGithubUrl: (url: string) => void
}

export function HeroProjectMetaCard({
  role,
  setRole,
  timeline,
  setTimeline,
  client,
  setClient,
  liveUrl,
  setLiveUrl,
  githubUrl,
  setGithubUrl,
}: HeroProjectMetaCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-bold">
          Stakeholders & Links
        </CardTitle>
        <CardDescription className="text-xs">
          Role assignments, engagement timeline, client/company names, and repository URLs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="cs-role" className="flex items-center gap-1.5">
              <User className="size-3.5 text-muted-foreground" /> Role
            </Label>
            <Input
              id="cs-role"
              placeholder="e.g. Backend & DevOps"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cs-timeline" className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground" /> Timeline
            </Label>
            <Input
              id="cs-timeline"
              placeholder="e.g. 2025 - 2026"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cs-client" className="flex items-center gap-1.5">
              <Building className="size-3.5 text-muted-foreground" /> Client / Company
            </Label>
            <Input
              id="cs-client"
              placeholder="e.g. Mickanic Inc."
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cs-live-url" className="flex items-center gap-1.5">
              <Globe className="size-3.5 text-muted-foreground" /> Live Demo URL
            </Label>
            <Input
              id="cs-live-url"
              placeholder="https://mickanic.ca/"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              className="text-xs font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cs-github-url" className="flex items-center gap-1.5">
              <FolderGit2 className="size-3.5 text-muted-foreground" /> GitHub Repo URL
            </Label>
            <Input
              id="cs-github-url"
              placeholder="https://github.com/..."
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="text-xs font-mono"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
