"use client"

import * as React from "react"
import {
  CheckCircle2,
  Cloud,
  CloudOff,
  Code2,
  Copy,
  Eye,
  FileCode2,
  Mail,
  MoreVertical,
  Pencil,
  RotateCcw,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react"

import type { EmailTemplate } from "@workspace/shared"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { toast } from "@workspace/ui/components/sonner"

interface TemplateCardProps {
  template: EmailTemplate
  onPreview: (template: EmailTemplate) => void
  onEdit: (template: EmailTemplate) => void
  onDelete: (template: EmailTemplate) => void
  onDuplicate: (template: EmailTemplate) => void
  onSendTest: (template: EmailTemplate) => void
  onSyncSingle: (template: EmailTemplate) => void
  onResetDefault: (template: EmailTemplate) => void
}

function formatRelativeTime(dateString: string | Date): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays === 1) return "Yesterday"
  if (diffInDays < 30) return `${diffInDays}d ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo ago`
  return `${Math.floor(diffInDays / 365)}y ago`
}

export function TemplateCard({
  template,
  onPreview,
  onEdit,
  onDelete,
  onDuplicate,
  onSendTest,
  onSyncSingle,
  onResetDefault,
}: TemplateCardProps) {
  // Extract dynamic variable tokens from body + subject
  const variables = React.useMemo(() => {
    const combined = `${template.subject || ""} ${template.body || ""}`
    const matches = combined.match(/\{\{\s*([a-zA-Z0-9_]+)/g) || []
    const tokens = Array.from(
      new Set(matches.map((m) => m.replace(/^\{\{\s*/, "").trim()))
    )
    if (tokens.length > 0) return tokens
    if (template.sampleData && typeof template.sampleData === "object") {
      return Object.keys(template.sampleData)
    }
    return ["name", "email"]
  }, [template.subject, template.body, template.sampleData])

  const copyVariable = (token: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(`{{ ${token} }}`)
    toast.success(`Copied {{ ${token} }} to clipboard`)
  }

  const copySlug = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(template.slug)
    toast.success(`Slug "${template.slug}" copied`)
  }

  return (
    <Card className="group flex flex-col justify-between border-border/80 bg-card/70 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md">
      <CardHeader className="space-y-3 pb-3">
        {/* Header Top Row: Icon, Title, Badges, Options Dropdown */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${
                template.isSystem
                  ? "border border-blue-500/20 bg-blue-500/10 text-blue-400"
                  : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {template.isSystem ? (
                <Code2 className="size-5" />
              ) : (
                <Sparkles className="size-5" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="truncate text-base font-semibold text-foreground">
                  {template.name}
                </CardTitle>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <code className="truncate font-mono text-xs text-muted-foreground">
                  {template.slug}
                </code>
                <button
                  type="button"
                  onClick={copySlug}
                  className="rounded p-0.5 text-muted-foreground/60 transition-colors hover:text-foreground"
                  title="Copy slug"
                >
                  <Copy className="size-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical className="size-4" />
                  <span className="sr-only">Open options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                  Template Actions
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => onPreview(template)}
                  className="cursor-pointer gap-2 text-xs"
                >
                  <Eye className="size-3.5 text-blue-400" />
                  Live Preview
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onEdit(template)}
                  className="cursor-pointer gap-2 text-xs"
                >
                  <Pencil className="size-3.5 text-amber-400" />
                  Edit Template
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onSendTest(template)}
                  className="cursor-pointer gap-2 text-xs"
                >
                  <Send className="size-3.5 text-purple-400" />
                  Send Test Email
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onSyncSingle(template)}
                  className="cursor-pointer gap-2 text-xs"
                >
                  <Cloud className="size-3.5 text-emerald-400" />
                  Sync to Plunk
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDuplicate(template)}
                  className="cursor-pointer gap-2 text-xs"
                >
                  <Copy className="size-3.5 text-sky-400" />
                  Duplicate
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {template.isSystem ? (
                  <DropdownMenuItem
                    onClick={() => onResetDefault(template)}
                    className="cursor-pointer gap-2 text-xs text-amber-400 focus:text-amber-400"
                  >
                    <RotateCcw className="size-3.5" />
                    Reset to Codebase Default
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => onDelete(template)}
                    className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    Delete Template
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Badges Pill Row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {template.isSystem ? (
            <Badge
              variant="outline"
              className="gap-1 border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-400"
            >
              <Code2 className="size-3" />
              Codebase
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="gap-1 border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400"
            >
              <Sparkles className="size-3" />
              Custom Made
            </Badge>
          )}

          <Badge
            variant="outline"
            className={`px-2 py-0.5 text-[11px] font-medium ${
              template.type === "TRANSACTIONAL"
                ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                : template.type === "MARKETING"
                  ? "border-purple-500/30 bg-purple-500/10 text-purple-400"
                  : "border-sky-500/30 bg-sky-500/10 text-sky-400"
            }`}
          >
            {template.type === "TRANSACTIONAL"
              ? "Transactional"
              : template.type === "MARKETING"
                ? "Marketing"
                : "Headless"}
          </Badge>

          {template.plunkId ? (
            <Badge
              variant="outline"
              className="ml-auto gap-1 border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400"
            >
              <CheckCircle2 className="size-3" />
              Plunk Synced
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="ml-auto gap-1 border-zinc-700 bg-zinc-800/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              <CloudOff className="size-3" />
              Local Only
            </Badge>
          )}
        </div>

        {/* Subject preview */}
        <div className="rounded-md border border-border/60 bg-muted/30 p-2.5">
          <div className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
            <Mail className="size-3" />
            <span>Subject Line</span>
          </div>
          <p className="line-clamp-1 text-xs font-medium text-foreground">
            {template.subject}
          </p>
        </div>

        {template.description && (
          <CardDescription className="line-clamp-2 pt-0.5 text-xs">
            {template.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Dynamic Variable Chips */}
        <div className="space-y-1.5 rounded-lg border border-border/50 bg-muted/20 p-2.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileCode2 className="size-3" />
              Liquid Tokens ({variables.length})
            </span>
            <span className="text-[10px] font-normal text-muted-foreground/70">
              click token to copy
            </span>
          </div>
          <div className="flex max-h-16 flex-wrap gap-1 overflow-y-auto">
            {variables.slice(0, 6).map((v) => (
              <Badge
                key={v}
                variant="outline"
                onClick={(e) => copyVariable(v, e)}
                className="cursor-pointer bg-background/80 font-mono text-[10px] transition-colors hover:border-primary/40 hover:bg-primary/10"
                title={`Click to copy {{ ${v} }}`}
              >
                {`{{ ${v} }}`}
              </Badge>
            ))}
            {variables.length > 6 && (
              <Badge
                variant="secondary"
                className="font-mono text-[10px] text-muted-foreground"
              >
                +{variables.length - 6} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border/60 bg-muted/10 pt-3 pb-3 text-xs text-muted-foreground">
        <span className="text-[11px]">
          Updated {formatRelativeTime(template.updatedAt)}
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => onPreview(template)}
          >
            <Eye className="size-3.5 text-blue-400" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 bg-background/80 px-2.5 text-xs"
            onClick={() => onEdit(template)}
          >
            <Pencil className="size-3.5 text-amber-400" />
            Edit
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
