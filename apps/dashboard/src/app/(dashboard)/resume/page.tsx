"use client"

import * as React from "react"
import {
  FileText,
  Upload,
  Plus,
  Search,
  Download,
  ExternalLink,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCheck,
  Sparkles,
  RotateCcw,
  Eye,
  Layers,
  History,
  TrendingUp,
  FileUp,
} from "lucide-react"
import type {
  ResumeDTO,
  ResumeStatsDTO,
  CreateResumeInput,
  UpdateResumeInput,
} from "@workspace/shared"
import { ResumeApi } from "@/lib/api"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Switch } from "@workspace/ui/components/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { toast } from "@workspace/ui/components/sonner"

function formatBytes(bytes: number, decimals = 1) {
  if (!bytes || bytes === 0) return "0 Bytes"
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function formatDate(dateStr: string) {
  if (!dateStr) return "N/A"
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return dateStr
  }
}

export default function ResumeManagementPage() {
  const [resumes, setResumes] = React.useState<ResumeDTO[]>([])
  const [stats, setStats] = React.useState<ResumeStatsDTO>({
    totalVersions: 0,
    activeVersion: null,
    activeResumeId: null,
    totalDownloads: 0,
    latestUpdatedAt: null,
  })
  const [isLoading, setIsLoading] = React.useState(true)

  // Filters
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")

  // Upload Modal
  const [isUploadOpen, setIsUploadOpen] = React.useState(false)
  const [uploadTitle, setUploadTitle] = React.useState("Full Stack Developer Resume")
  const [uploadVersion, setUploadVersion] = React.useState(`v${new Date().getFullYear()}.${new Date().getMonth() + 1}`)
  const [uploadDesc, setUploadDesc] = React.useState("")
  const [uploadIsActive, setUploadIsActive] = React.useState(true)
  const [uploadFile, setUploadFile] = React.useState<File | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Edit Modal
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [editingResume, setEditingResume] = React.useState<ResumeDTO | null>(null)
  const [editTitle, setEditTitle] = React.useState("")
  const [editVersion, setEditVersion] = React.useState("")
  const [editDesc, setEditDesc] = React.useState("")
  const [editIsActive, setEditIsActive] = React.useState(false)
  const [isSavingEdit, setIsSavingEdit] = React.useState(false)

  // Delete Modal
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [deletingResume, setDeletingResume] = React.useState<ResumeDTO | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  // Action Loading
  const [activatingId, setActivatingId] = React.useState<string | null>(null)

  const loadResumes = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await ResumeApi.list({
        search: search.trim() || undefined,
        isActive: statusFilter === "all" ? undefined : statusFilter === "active",
      })

      if (res.success && res.data) {
        setResumes(res.data)
        if (res.stats) {
          setStats(res.stats)
        }
      }
    } catch (err: any) {
      toast.error("Failed to load resume versions", {
        description: err?.message,
      })
    } finally {
      setIsLoading(false)
    }
  }, [search, statusFilter])

  React.useEffect(() => {
    loadResumes()
  }, [loadResumes])

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!uploadFile) {
      toast.error("File Required", {
        description: "Please choose a PDF or Word resume document to upload.",
      })
      return
    }

    if (!uploadVersion.trim()) {
      toast.error("Version Required", {
        description: "Please specify a version label (e.g. v2.1, 2026.1).",
      })
      return
    }

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append("file", uploadFile)
      formData.append("title", uploadTitle.trim())
      formData.append("version", uploadVersion.trim())
      if (uploadDesc.trim()) formData.append("description", uploadDesc.trim())
      formData.append("isActive", String(uploadIsActive))

      const res = await ResumeApi.uploadVersion(formData)

      if (res.success) {
        toast.success("Resume Version Published", {
          description: `Version ${res.data?.version} uploaded to S3/R2 storage.`,
        })
        setIsUploadOpen(false)
        setUploadFile(null)
        setUploadDesc("")
        await loadResumes()
      } else {
        toast.error("Upload Failed", {
          description: res.error || "Could not publish resume version.",
        })
      }
    } catch (err: any) {
      toast.error("Upload Error", { description: err?.message })
    } finally {
      setIsUploading(false)
    }
  }

  const handleOpenEdit = (resume: ResumeDTO) => {
    setEditingResume(resume)
    setEditTitle(resume.title)
    setEditVersion(resume.version)
    setEditDesc(resume.description || "")
    setEditIsActive(resume.isActive)
    setIsEditOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingResume) return

    try {
      setIsSavingEdit(true)
      const payload: UpdateResumeInput = {
        title: editTitle.trim(),
        version: editVersion.trim(),
        description: editDesc.trim() || null,
        isActive: editIsActive,
      }

      const res = await ResumeApi.update(editingResume.id, payload)
      if (res.success) {
        toast.success("Version Updated", {
          description: `Resume version ${res.data?.version} metadata updated.`,
        })
        setIsEditOpen(false)
        setEditingResume(null)
        await loadResumes()
      } else {
        toast.error("Update Failed", { description: res.error })
      }
    } catch (err: any) {
      toast.error("Update Error", { description: err?.message })
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleSetActive = async (resume: ResumeDTO) => {
    try {
      setActivatingId(resume.id)
      const res = await ResumeApi.setActive(resume.id)
      if (res.success) {
        toast.success("Active Resume Switched", {
          description: `Version ${resume.version} is now the live resume across the portfolio.`,
        })
        await loadResumes()
      } else {
        toast.error("Activation Failed", { description: res.error })
      }
    } catch (err: any) {
      toast.error("Error", { description: err?.message })
    } finally {
      setActivatingId(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingResume) return
    try {
      setIsDeleting(true)
      const res = await ResumeApi.delete(deletingResume.id)
      if (res.success) {
        toast.success("Version Deleted", {
          description: `Resume version ${deletingResume.version} removed from database & storage.`,
        })
        setIsDeleteOpen(false)
        setDeletingResume(null)
        await loadResumes()
      } else {
        toast.error("Delete Failed", { description: res.error })
      }
    } catch (err: any) {
      toast.error("Error", { description: err?.message })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Resume / CV Versions
            </h1>
            <Badge variant="outline" className="border-primary/30 font-mono text-xs text-primary">
              Multi-Version Engine
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your document versions, track public download telemetry, and toggle which CV is active on the live website.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadResumes}
            disabled={isLoading}
            className="h-9 gap-1.5 text-xs"
          >
            <RotateCcw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            className="h-9 gap-1.5 text-xs shadow-sm"
          >
            <Plus className="size-4" />
            Upload New Version
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Live Version
            </CardTitle>
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <CheckCircle2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-primary">
              {stats.activeVersion || "None"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Synced with web download buttons
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Versions
            </CardTitle>
            <div className="flex size-7 items-center justify-center rounded-md bg-muted text-foreground">
              <Layers className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {stats.totalVersions}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Archived in Cloudflare R2 / S3
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Downloads
            </CardTitle>
            <div className="flex size-7 items-center justify-center rounded-md bg-muted text-foreground">
              <TrendingUp className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {stats.totalDownloads}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Across all public CTA clicks
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Last Updated
            </CardTitle>
            <div className="flex size-7 items-center justify-center rounded-md bg-muted text-foreground">
              <History className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-semibold truncate">
              {stats.latestUpdatedAt ? formatDate(stats.latestUpdatedAt) : "Never"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Most recent release date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search version, title, or filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[140px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Versions</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="archived">Archived Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Version List */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border bg-card/40">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-xs">Loading resume repository...</p>
          </div>
        </div>
      ) : resumes.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/10 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FileText className="size-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground">
            No Resume Versions Found
          </h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Upload your first resume PDF or document to publish it across the portfolio homepage and dedicated /resume page.
          </p>
          <Button
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            className="mt-5 h-8 gap-1.5 text-xs"
          >
            <Plus className="size-3.5" />
            Upload First Version
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {resumes.map((resume) => (
            <Card
              key={resume.id}
              className={`border transition-all duration-200 ${
                resume.isActive
                  ? "border-primary/50 bg-primary/[0.02] shadow-sm ring-1 ring-primary/20"
                  : "border-border/70 hover:border-border"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-xl border ${
                        resume.isActive
                          ? "border-primary/40 bg-primary/15 text-primary"
                          : "border-border bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <FileText className="size-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-foreground">
                          {resume.version}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <h3 className="text-sm font-semibold text-foreground">
                          {resume.title}
                        </h3>
                        {resume.isActive ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-500/40 bg-emerald-500/10 font-mono text-[10px] text-emerald-600 dark:text-emerald-400"
                          >
                            <CheckCircle2 className="mr-1 size-3" /> ACTIVE ON WEBSITE
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="font-mono text-[10px] text-muted-foreground"
                          >
                            Archived
                          </Badge>
                        )}
                      </div>

                      {resume.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {resume.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-muted-foreground">
                        <span className="font-mono">{resume.fileName}</span>
                        <span>•</span>
                        <span>{formatBytes(resume.fileSize)}</span>
                        <span>•</span>
                        <span>Uploaded: {formatDate(resume.createdAt)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono text-primary">
                          <Download className="size-3" /> {resume.downloadCount} downloads
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {!resume.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={activatingId === resume.id}
                        onClick={() => handleSetActive(resume)}
                        className="h-8 gap-1.5 text-xs border-primary/40 text-primary hover:bg-primary/10"
                      >
                        {activatingId === resume.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <CheckCircle2 className="size-3.5" />
                        )}
                        Set as Active
                      </Button>
                    )}

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                    >
                      <a
                        href={resume.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye className="size-3.5" />
                        Preview
                      </a>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                    >
                      <a
                        href={resume.fileUrl}
                        download={resume.fileName}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="size-3.5" />
                        Download
                      </a>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(resume)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="size-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDeletingResume(resume)
                        setIsDeleteOpen(true)
                      }}
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleUploadSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileUp className="size-5 text-primary" />
                Upload New Resume Version
              </DialogTitle>
              <DialogDescription className="text-xs">
                Upload a revised PDF / Word CV and assign a version tag to maintain clear changelogs.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Document Title
                </label>
                <Input
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Full Stack Developer Resume"
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Version Identifier
                  </label>
                  <Input
                    value={uploadVersion}
                    onChange={(e) => setUploadVersion(e.target.value)}
                    placeholder="e.g. v2.1 or 2026.1"
                    className="h-9 font-mono text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Active Status
                  </label>
                  <div className="flex h-9 items-center justify-between rounded-md border border-input px-3">
                    <span className="text-xs text-muted-foreground">Make Active Now</span>
                    <Switch
                      checked={uploadIsActive}
                      onCheckedChange={setUploadIsActive}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Version Changelog / Notes (Optional)
                </label>
                <Textarea
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="e.g. Added Softvence Agency experience, updated Docker & RabbitMQ stack."
                  className="min-h-[70px] text-xs resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  File Document (.pdf, .doc, .docx)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/80 bg-muted/20 p-4 text-center transition-colors hover:border-primary/50 hover:bg-muted/30"
                >
                  <Upload className="size-5 text-primary" />
                  <p className="text-xs font-medium text-foreground">
                    {uploadFile ? uploadFile.name : "Click to select resume file"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {uploadFile
                      ? formatBytes(uploadFile.size)
                      : "PDF or Word document up to 25MB"}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsUploadOpen(false)}
                disabled={isUploading}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isUploading || !uploadFile}
                className="gap-1.5 text-xs"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="size-3.5" />
                    Upload & Publish
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Metadata Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit2 className="size-4 text-primary" />
                Edit Resume Version Details
              </DialogTitle>
              <DialogDescription className="text-xs">
                Update document title, version tag, or changelog description.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Document Title
                </label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Version Tag
                  </label>
                  <Input
                    value={editVersion}
                    onChange={(e) => setEditVersion(e.target.value)}
                    className="h-9 font-mono text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Active on Site
                  </label>
                  <div className="flex h-9 items-center justify-between rounded-md border border-input px-3">
                    <span className="text-xs text-muted-foreground">Active Version</span>
                    <Switch
                      checked={editIsActive}
                      onCheckedChange={setEditIsActive}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Changelog / Notes
                </label>
                <Textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Notes about changes in this release..."
                  className="min-h-[80px] text-xs resize-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(false)}
                disabled={isSavingEdit}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSavingEdit}
                className="gap-1.5 text-xs"
              >
                {isSavingEdit ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="size-5" />
              Delete Resume Version
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to permanently delete{" "}
              <span className="font-mono font-semibold text-foreground">
                {deletingResume?.version} ({deletingResume?.fileName})
              </span>
              ? This will remove the file from cloud storage.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="gap-1.5 text-xs"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Version"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
