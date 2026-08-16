"use client"

import * as React from "react"
import {
  HardDrive,
  Image as ImageIcon,
  Film,
  FileText,
  Sparkles,
  UploadCloud,
  Trash2,
  RefreshCw,
  FolderOpen,
} from "lucide-react"
import type { MediaStatsDTO } from "@workspace/shared"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"
import { Skeleton } from "@workspace/ui/components/skeleton"

interface MediaStatsOverviewProps {
  stats: MediaStatsDTO | null
  isLoading?: boolean
  onUploadClick: () => void
  onCleanupClick: () => void
  onRefreshClick: () => void
  isRefreshing?: boolean
}

export function MediaStatsOverview({
  stats,
  isLoading = false,
  onUploadClick,
  onCleanupClick,
  onRefreshClick,
  isRefreshing = false,
}: MediaStatsOverviewProps) {
  if (isLoading && !stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="mb-2 h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </Card>
        ))}
      </div>
    )
  }

  const totalFiles = stats?.totalFiles || 0
  const totalSizeFormatted = stats?.totalSizeFormatted || "0 B"
  const images = stats?.categories?.images || { count: 0, sizeFormatted: "0 B" }
  const videos = stats?.categories?.videos || { count: 0, sizeFormatted: "0 B" }
  const documents = stats?.categories?.documents || {
    count: 0,
    sizeFormatted: "0 B",
  }
  const audio = stats?.categories?.audio || { count: 0, sizeFormatted: "0 B" }
  const foldersCount = stats?.folders?.length || 0

  return (
    <div className="space-y-4">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Media Library</h1>
            <Badge
              variant="outline"
              className="border-primary/30 font-mono text-xs text-primary"
            >
              Cloudflare R2
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage, optimize, and organize all digital assets across your
            portfolio and blog.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefreshClick}
            disabled={isRefreshing}
            className="h-9 gap-1.5 text-xs"
          >
            <RefreshCw
              className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onCleanupClick}
            className="h-9 gap-1.5 border-destructive/30 text-xs hover:border-destructive/60 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5 text-destructive" />
            Storage Cleaner
          </Button>

          <Button
            onClick={onUploadClick}
            size="sm"
            className="h-9 gap-1.5 bg-primary text-xs text-primary-foreground shadow-xs hover:bg-primary/90"
          >
            <UploadCloud className="size-4" />
            Upload Media
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Storage & Assets */}
        <Card className="relative overflow-hidden border-border/80 bg-linear-to-br from-card to-card/50 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Total Storage
              </span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <HardDrive className="size-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight">
                {totalSizeFormatted}
              </span>
              <span className="font-mono text-xs font-medium text-muted-foreground">
                / {totalFiles} assets
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <FolderOpen className="size-3.5 text-primary" />
              <span>
                Organized across{" "}
                <strong className="text-foreground">{foldersCount}</strong>{" "}
                folders
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Images */}
        <Card className="relative overflow-hidden border-border/80 bg-linear-to-br from-card to-card/50 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Images & Photos
              </span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <ImageIcon className="size-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight">
                {images.count}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {images.sizeFormatted}
              </span>
            </div>
            <div className="mt-3 truncate text-xs text-muted-foreground">
              WebP, PNG, JPG, SVG & Icons
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Video & Audio */}
        <Card className="relative overflow-hidden border-border/80 bg-linear-to-br from-card to-card/50 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Video & Audio
              </span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                <Film className="size-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight">
                {videos.count + audio.count}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {videos.sizeFormatted}
              </span>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              MP4, WebM, MP3 & Media Clips
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Documents & Archives */}
        <Card className="relative overflow-hidden border-border/80 bg-linear-to-br from-card to-card/50 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Documents & Files
              </span>
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <FileText className="size-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight">
                {documents.count}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {documents.sizeFormatted}
              </span>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              PDFs, Code, Zips & Attachments
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
