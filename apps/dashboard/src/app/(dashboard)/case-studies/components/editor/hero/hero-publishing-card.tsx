import * as React from "react"
import { Sparkles, Pin, BookOpen, Layers } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import type { CaseStudyStatus, CaseStudyType } from "@workspace/shared"

interface HeroPublishingCardProps {
  projectType: CaseStudyType
  setProjectType: (type: CaseStudyType) => void
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
}

export function HeroPublishingCard({
  projectType,
  setProjectType,
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
}: HeroPublishingCardProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-bold">
          Type & Visibility
        </CardTitle>
        <CardDescription className="text-xs">
          Select project depth mode, publishing state, and display order.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Project Type Selector */}
        <div className="space-y-2">
          <Label htmlFor="cs-project-type" className="text-xs font-semibold">
            Showcase Depth Mode
          </Label>
          <Select
            value={projectType}
            onValueChange={(val) => setProjectType(val as CaseStudyType)}
          >
            <SelectTrigger id="cs-project-type" className="text-xs font-medium">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CASE_STUDY" className="text-xs">
                <div className="flex items-center gap-1.5 font-medium">
                  <BookOpen className="size-3.5 text-primary" />
                  <span>🔬 Deep-Dive Case Study</span>
                </div>
              </SelectItem>
              <SelectItem value="PROJECT" className="text-xs">
                <div className="flex items-center gap-1.5 font-medium">
                  <Layers className="size-3.5 text-purple-400" />
                  <span>⚡ Quick Project Showcase</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground">
            {projectType === "CASE_STUDY"
              ? "Full 9-tab architectural breakdown with dedicated case study URL."
              : "Streamlined 3-step project card with direct GitHub/Live links."}
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t border-border/60">
          <Label htmlFor="cs-status" className="text-xs">
            Publication Status
          </Label>
          <Select value={status} onValueChange={(val) => setStatus(val as CaseStudyStatus)}>
            <SelectTrigger id="cs-status" className="text-xs">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT" className="text-xs">
                Draft (Hidden from public)
              </SelectItem>
              <SelectItem value="PUBLISHED" className="text-xs">
                Published (Live in portfolio)
              </SelectItem>
              <SelectItem value="ARCHIVED" className="text-xs">
                Archived
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cs-project-status" className="text-xs">
            Display Badge Text
          </Label>
          <Input
            id="cs-project-status"
            placeholder="Status: Completed / Status: Live"
            value={projectStatus}
            onChange={(e) => setProjectStatus(e.target.value)}
            className="text-xs font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cs-order" className="text-xs">
            Display Order Index
          </Label>
          <Input
            id="cs-order"
            type="number"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
            className="text-xs font-mono"
          />
          <p className="text-[10px] text-muted-foreground">
            Lower numbers appear first in the portfolio list.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <div className="space-y-0.5">
            <Label htmlFor="cs-featured" className="text-xs font-medium flex items-center gap-1">
              <Sparkles className="size-3 text-primary" /> Featured Showcase
            </Label>
            <p className="text-[10px] text-muted-foreground">
              Prominently display on the homepage
            </p>
          </div>
          <Switch
            id="cs-featured"
            checked={featured}
            onCheckedChange={setFeatured}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <div className="space-y-0.5">
            <Label htmlFor="cs-pinned" className="text-xs font-medium flex items-center gap-1">
              <Pin className="size-3 text-blue-500" /> Pinned Project
            </Label>
            <p className="text-[10px] text-muted-foreground">
              Pin to top of portfolio index
            </p>
          </div>
          <Switch
            id="cs-pinned"
            checked={pinned}
            onCheckedChange={setPinned}
          />
        </div>
      </CardContent>
    </Card>
  )
}

