"use client"

import * as React from "react"
import {
  AlertCircle,
  CheckCircle2,
  Code2,
  Eye,
  FileCode2,
  Pencil,
  RotateCcw,
  Save,
  Send,
  Sparkles,
} from "lucide-react"

import type {
  EmailTemplate,
  EmailTemplateType,
  UpdateTemplateDTO,
} from "@workspace/shared"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import { Switch } from "@workspace/ui/components/switch"
import { toast } from "@workspace/ui/components/sonner"

interface EditTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: EmailTemplate | null
  onSubmit: (id: string, payload: UpdateTemplateDTO) => Promise<boolean>
  onResetDefault?: (template: EmailTemplate) => void
  onOpenPreview?: (template: EmailTemplate) => void
  isProcessing?: boolean
}

const COMMON_VARIABLES = [
  "name",
  "email",
  "subject",
  "message",
  "code",
  "title",
  "unsubscribeUrl",
  "manageUrl",
  "ctaUrl",
  "expiresInMinutes",
]

export function EditTemplateDialog({
  open,
  onOpenChange,
  template,
  onSubmit,
  onResetDefault,
  onOpenPreview,
  isProcessing = false,
}: EditTemplateDialogProps) {
  const [name, setName] = React.useState("")
  const [type, setType] = React.useState<EmailTemplateType>("MARKETING")
  const [subject, setSubject] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [fromName, setFromName] = React.useState("")
  const [fromEmail, setFromEmail] = React.useState("")
  const [replyTo, setReplyTo] = React.useState("")
  const [body, setBody] = React.useState("")
  const [syncToPlunk, setSyncToPlunk] = React.useState(true)

  const bodyRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    if (template) {
      setName(template.name || "")
      setType(template.type || "MARKETING")
      setSubject(template.subject || "")
      setDescription(template.description || "")
      setFromName(template.fromName || "")
      setFromEmail(template.from || "")
      setReplyTo(template.replyTo || "")
      setBody(template.body || "")
      setSyncToPlunk(true)
    }
  }, [template, open])

  if (!template) return null

  const insertVariable = (token: string) => {
    const textarea = bodyRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const snippet = `{{ ${token} }}`
    const nextBody = body.substring(0, start) + snippet + body.substring(end)
    setBody(nextBody)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + snippet.length, start + snippet.length)
    }, 50)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Template name is required")
      return
    }

    if (!subject.trim()) {
      toast.error("Subject line is required")
      return
    }

    if (!body.trim()) {
      toast.error("HTML body is required")
      return
    }

    const payload: UpdateTemplateDTO = {
      name: name.trim(),
      type,
      subject: subject.trim(),
      description: description.trim() || null,
      fromName: fromName.trim() || null,
      from: fromEmail.trim() || null,
      replyTo: replyTo.trim() || null,
      body,
      syncToPlunk,
    }

    const success = await onSubmit(template.id, payload)
    if (success) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] sm:w-[94vw] sm:max-w-5xl lg:max-w-6xl xl:max-w-[1300px] max-h-[90vh] flex flex-col p-0 overflow-hidden border-border/80 bg-background/95 backdrop-blur-md">
        <DialogHeader className="p-6 pb-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div
                className={`flex size-9 items-center justify-center rounded-lg ${template.isSystem
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
              >
                {template.isSystem ? (
                  <Code2 className="size-5" />
                ) : (
                  <Pencil className="size-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg font-bold">
                    Edit Email Template
                  </DialogTitle>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-medium ${template.isSystem
                      ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      }`}
                  >
                    {template.isSystem ? "Codebase (System)" : "Custom Made"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <code className="text-xs font-mono text-muted-foreground">
                    slug: {template.slug}
                  </code>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenPreview(template)}
                  className="h-8 gap-1.5 text-xs bg-background/80"
                >
                  <Eye className="size-3.5 text-blue-400" />
                  Preview
                </Button>
              )}

              {template.isSystem && onResetDefault && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onResetDefault(template)}
                  className="h-8 gap-1.5 text-xs text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                  title="Revert template back to codebase defaults"
                >
                  <RotateCcw className="size-3.5" />
                  Reset to Codebase
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Codebase System Notice Banner */}
            {template.isSystem && (
              <div className="flex items-start gap-3 p-3.5 rounded-lg border border-blue-500/30 bg-blue-500/5 text-xs text-blue-200">
                <AlertCircle className="size-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-blue-300">
                    Codebase System Template Protection
                  </p>
                  <p className="text-blue-200/80 leading-relaxed">
                    This template powers live backend auth and contact triggers. Your edits are saved safely in the database and synchronized with Plunk without modifying source code files. You can restore the original code layout at any time using <strong>Reset to Codebase</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Top Grid: Name, Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name" className="text-xs font-semibold">
                  Template Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Template name"
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-type" className="text-xs font-semibold">
                  Template Type
                </Label>
                <Select
                  value={type}
                  onValueChange={(val: EmailTemplateType) => setType(val)}
                >
                  <SelectTrigger id="edit-type" className="h-9 text-xs">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRANSACTIONAL" className="text-xs">
                      Transactional (System Alerts / Auth)
                    </SelectItem>
                    <SelectItem value="MARKETING" className="text-xs">
                      Marketing (Newsletters / Broadcasts)
                    </SelectItem>
                    <SelectItem value="HEADLESS" className="text-xs">
                      Headless (Custom API Flows)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subject Line & Description */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-subject" className="text-xs font-semibold">
                  Subject Line <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject line with Liquid variables..."
                  className="h-9 text-xs"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Liquid variables in the subject line will evaluate at send time (e.g. <code className="text-primary font-mono">{`{{ name }}`}</code>).
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-description" className="text-xs font-semibold">
                  Description
                </Label>
                <Input
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Purpose and trigger conditions for this template..."
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Sender Settings */}
            <div className="rounded-lg border border-border/70 bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Send className="size-3.5 text-muted-foreground" />
                  Sender Configuration
                </span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  Overrides default sender settings
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="edit-from-name" className="text-[11px] text-muted-foreground">
                    Sender Name
                  </Label>
                  <Input
                    id="edit-from-name"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    placeholder="Fi Amanillah"
                    className="h-8 text-xs bg-background/80"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-from-email" className="text-[11px] text-muted-foreground">
                    From Email
                  </Label>
                  <Input
                    id="edit-from-email"
                    type="email"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    placeholder="hello@amanillah.com"
                    className="h-8 text-xs bg-background/80"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit-reply-to" className="text-[11px] text-muted-foreground">
                    Reply-To Email
                  </Label>
                  <Input
                    id="edit-reply-to"
                    type="email"
                    value={replyTo}
                    onChange={(e) => setReplyTo(e.target.value)}
                    placeholder="fi@amanillah.com"
                    className="h-8 text-xs bg-background/80"
                  />
                </div>
              </div>
            </div>

            {/* HTML / Liquid Body Editor */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <Label htmlFor="edit-body" className="text-xs font-semibold flex items-center gap-1.5">
                  <Code2 className="size-4 text-primary" />
                  HTML Body & Liquid Engine Template <span className="text-destructive">*</span>
                </Label>

                {/* Variable inserter pills */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] text-muted-foreground mr-1">Insert Variable:</span>
                  {COMMON_VARIABLES.slice(0, 6).map((token) => (
                    <button
                      key={token}
                      type="button"
                      onClick={() => insertVariable(token)}
                      className="px-1.5 py-0.5 rounded bg-muted/60 hover:bg-primary/20 hover:text-primary text-[10px] font-mono border border-border/50 transition-colors"
                    >
                      +{token}
                    </button>
                  ))}
                </div>
              </div>

              <Textarea
                id="edit-body"
                ref={bodyRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="HTML template body with Liquid tags..."
                className="font-mono text-xs min-h-[280px] bg-zinc-950 text-zinc-100 border-zinc-800 p-3 leading-relaxed selection:bg-primary/30"
                required
              />

              <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                <span>Supports Liquid tags: <code className="text-foreground">{`{{ var }}`}</code>, <code className="text-foreground">{`{% if %}`}</code>, <code className="text-foreground">{`| default:`}</code></span>
                <span>{body.length} characters</span>
              </div>
            </div>

            {/* Plunk Sync Switch */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
              <div className="space-y-0.5">
                <Label htmlFor="edit-sync-toggle" className="text-xs font-semibold cursor-pointer">
                  Sync changes to Plunk API
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Push updated template body and sender settings to Plunk cloud upon saving.
                </p>
              </div>
              <Switch
                id="edit-sync-toggle"
                checked={syncToPlunk}
                onCheckedChange={setSyncToPlunk}
              />
            </div>
          </div>

          <DialogFooter className="p-4 border-t border-border/60 bg-muted/20 flex items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
              disabled={isProcessing}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              size="sm"
              className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span>Saving Changes...</span>
              ) : (
                <>
                  <Save className="size-4" />
                  Save Template
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
