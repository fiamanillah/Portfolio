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
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mb-2" />
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
  const documents = stats?.categories?.documents || { count: 0, sizeFormatted: "0 B" }
  const audio = stats?.categories?.audio || { count: 0, sizeFormatted: "0 B" }
  const foldersCount = stats?.folders?.length || 0

  return (
    <div className="space-y-4">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Media Library</h1>
            <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
              Cloudflare R2
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage, optimize, and organize all digital assets across your portfolio and blog.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefreshClick}
            disabled={isRefreshing}
            className="gap-1.5 text-xs h-9"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onCleanupClick}
            className="gap-1.5 text-xs h-9 border-destructive/30 hover:border-destructive/60 hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="size-3.5 text-destructive" />
            Storage Cleaner
          </Button>

          <Button
            onClick={onUploadClick}
            size="sm"
            className="gap-1.5 text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
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
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Storage
              </span>
              <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <HardDrive className="size-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight">{totalSizeFormatted}</span>
              <span className="text-xs text-muted-foreground font-medium font-mono">
                / {totalFiles} assets
              </span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <FolderOpen className="size-3.5 text-primary" />
              <span>
                Organized across <strong className="text-foreground">{foldersCount}</strong> folders
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Images */}
        <Card className="relative overflow-hidden border-border/80 bg-linear-to-br from-card to-card/50 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Images & Photos
              </span>
              <div className="size-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <ImageIcon className="size-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight">{images.count}</span>
              <span className="text-xs text-muted-foreground font-mono">{images.sizeFormatted}</span>
            </div>
            <div className="mt-3 text-xs text-muted-foreground truncate">
              WebP, PNG, JPG, SVG & Icons
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Video & Audio */}
        <Card className="relative overflow-hidden border-border/80 bg-linear-to-br from-card to-card/50 shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Video & Audio
              </span>
              <div className="size-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Film className="size-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight">
                {videos.count + audio.count}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
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
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Documents & Files
              </span>
              <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <FileText className="size-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight">{documents.count}</span>
              <span className="text-xs text-muted-foreground font-mono">
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
