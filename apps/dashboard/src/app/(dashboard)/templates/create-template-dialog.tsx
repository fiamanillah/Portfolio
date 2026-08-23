"use client"

import * as React from "react"
import {
  Code2,
  FileCode2,
  HelpCircle,
  Layers,
  Plus,
  Send,
  Sparkles,
  Zap,
} from "lucide-react"

import type { CreateTemplateDTO, EmailTemplateType } from "@workspace/shared"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { FieldError } from "@workspace/ui/components/field"
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
import {
  showApiError,
  validateSlug,
  validateEmail,
} from "@/lib/api"

interface CreateTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: CreateTemplateDTO) => Promise<boolean>
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

const STARTER_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ subject | default: 'Notification' }}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #334155; margin: 0; padding: 36px 16px;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 0; border: 1px solid #e2e8f0;">
    <tr>
      <td style="padding: 24px 32px 18px 32px; border-bottom: 1px solid #e2e8f0;">
        <h1 style="color: #0f172a; font-size: 16px; margin: 0 0 4px 0; font-weight: 700;">Fi Amanillah</h1>
        <p style="color: #64748b; font-size: 12px; margin: 0;">Full Stack Developer</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 28px 32px;">
        <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 16px 0; font-weight: 700;">Hello {{ name | default: 'Developer' }},</h2>
        <p style="color: #334155; font-size: 14px; line-height: 1.65; margin: 0 0 20px 0;">
          {{ message | default: 'Thank you for following the engineering journal and architecture updates.' }}
        </p>
        
        <!-- CTA Action -->
        {% if ctaUrl %}
        <div style="margin: 24px 0;">
          <a href="{{ ctaUrl }}" style="background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 0; font-weight: 600; font-size: 13px; display: inline-block; border: 1px solid #0f172a;">
            Explore Article -&gt;
          </a>
        </div>
        {% endif %}
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: left;">
        <p style="color: #64748b; font-size: 12px; margin: 0 0 8px 0;">
          Fi Amanillah · fi.amanillah.com
        </p>
        {% if unsubscribeUrl %}
        <p style="color: #64748b; font-size: 11px; margin: 0;">
          <a href="{{ unsubscribeUrl }}" style="color: #0f172a; text-decoration: underline;">Unsubscribe from updates</a>
        </p>
        {% endif %}
      </td>
    </tr>
  </table>
</body>
</html>`

export function CreateTemplateDialog({
  open,
  onOpenChange,
  onSubmit,
  isProcessing = false,
}: CreateTemplateDialogProps) {
  const [name, setName] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [type, setType] = React.useState<EmailTemplateType>("MARKETING")
  const [subject, setSubject] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [fromName, setFromName] = React.useState("Fi Amanillah")
  const [fromEmail, setFromEmail] = React.useState("")
  const [replyTo, setReplyTo] = React.useState("fi@amanillah.com")
  const [body, setBody] = React.useState(STARTER_TEMPLATE)
  const [syncToPlunk, setSyncToPlunk] = React.useState(true)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({})

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const bodyRef = React.useRef<HTMLTextAreaElement>(null)

  // Auto-generate slug from name if not manually modified
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = React.useState(false)

  React.useEffect(() => {
    if (!isSlugManuallyEdited) {
      const generated = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      setSlug(generated)
    }
  }, [name, isSlugManuallyEdited])

  const handleReset = () => {
    setName("")
    setSlug("")
    setIsSlugManuallyEdited(false)
    setType("MARKETING")
    setSubject("")
    setDescription("")
    setFromName("Fi Amanillah")
    setFromEmail("")
    setReplyTo("fi@amanillah.com")
    setBody(STARTER_TEMPLATE)
    setSyncToPlunk(true)
    setFieldErrors({})
  }

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

    // 1. Client-Side Pre-Validation
    const clientErrors: Record<string, string> = {}

    if (!name.trim()) {
      clientErrors.name = "Template name is required"
    }

    if (!subject.trim()) {
      clientErrors.subject = "Subject line is required"
    }

    if (!body.trim()) {
      clientErrors.body = "HTML body is required"
    }

    if (slug.trim()) {
      const slugVal = validateSlug(slug, "Slug")
      if (!slugVal.valid && slugVal.error) {
        clientErrors.slug = slugVal.error
      }
    }

    if (fromEmail.trim()) {
      const emailVal = validateEmail(fromEmail, "From Email")
      if (!emailVal.valid && emailVal.error) {
        clientErrors.from = emailVal.error
      }
    }

    if (replyTo.trim()) {
      const emailVal = validateEmail(replyTo, "Reply-To Email")
      if (!emailVal.valid && emailVal.error) {
        clientErrors.replyTo = emailVal.error
      }
    }

    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors)
      showApiError(
        {
          errorIssues: Object.entries(clientErrors).map(([path, message]) => ({
            path,
            message,
          })),
        },
        "Validation Failed"
      )
      return
    }

    const payload: CreateTemplateDTO = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      type,
      subject: subject.trim(),
      description: description.trim() || undefined,
      fromName: fromName.trim() || undefined,
      from: fromEmail.trim() || undefined,
      replyTo: replyTo.trim() || undefined,
      body,
      syncToPlunk,
    }

    const success = await onSubmit(payload)
    if (success) {
      handleReset()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[96vw] flex-col overflow-hidden border-border/80 bg-background/95 p-0 backdrop-blur-md sm:w-[94vw] sm:max-w-5xl lg:max-w-6xl xl:max-w-[1300px]">
        <DialogHeader className="border-b border-border/60 bg-muted/20 p-6 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <Plus className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">
                Create Email Template
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                Design a custom transactional, marketing, or headless email
                template with LiquidJS interpolation.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {/* Top Grid: Name, Slug, Type */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1.5 md:col-span-1">
                <Label htmlFor="create-name" className="text-xs font-semibold">
                  Template Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="create-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    clearFieldError("name")
                  }}
                  placeholder="e.g. Monthly Tech Digest"
                  className={`h-9 text-xs ${fieldErrors.name ? "border-destructive focus:border-destructive" : ""}`}
                  required
                />
                {fieldErrors.name && <FieldError errors={fieldErrors.name} />}
              </div>

              <div className="space-y-1.5 md:col-span-1">
                <Label htmlFor="create-slug" className="text-xs font-semibold">
                  Slug (Identifier)
                </Label>
                <Input
                  id="create-slug"
                  value={slug}
                  onChange={(e) => {
                    setIsSlugManuallyEdited(true)
                    setSlug(e.target.value)
                    clearFieldError("slug")
                  }}
                  placeholder="e.g. monthly-tech-digest"
                  className={`h-9 font-mono text-xs ${fieldErrors.slug ? "border-destructive focus:border-destructive" : ""}`}
                />
                {fieldErrors.slug && <FieldError errors={fieldErrors.slug} />}
              </div>

              <div className="space-y-1.5 md:col-span-1">
                <Label htmlFor="create-type" className="text-xs font-semibold">
                  Template Type
                </Label>
                <Select
                  value={type}
                  onValueChange={(val: EmailTemplateType) => setType(val)}
                >
                  <SelectTrigger id="create-type" className="h-9 text-xs">
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
                <Label
                  htmlFor="create-subject"
                  className="text-xs font-semibold"
                >
                  Subject Line <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="create-subject"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value)
                    clearFieldError("subject")
                  }}
                  placeholder="e.g. New Post: Scaling Microservices with Bun & Go — {{ name }}"
                  className={`h-9 text-xs ${fieldErrors.subject ? "border-destructive focus:border-destructive" : ""}`}
                  required
                />
                {fieldErrors.subject && <FieldError errors={fieldErrors.subject} />}
                <p className="text-[11px] text-muted-foreground">
                  You can use dynamic Liquid variables inside subject lines like{" "}
                  <code className="font-mono text-primary">{`{{ name }}`}</code>
                  .
                </p>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="create-description"
                  className="text-xs font-semibold"
                >
                  Description
                </Label>
                <Input
                  id="create-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Sent when publishing architecture articles to active subscribers"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Sender Settings Accordion */}
            <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span className="flex items-center gap-1.5">
                  <Send className="size-3.5 text-muted-foreground" />
                  Sender Configuration
                </span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  Optional (defaults to environment settings)
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="create-from-name"
                    className="text-[11px] text-muted-foreground"
                  >
                    Sender Name
                  </Label>
                  <Input
                    id="create-from-name"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    placeholder="Fi Amanillah"
                    className="h-8 bg-background/80 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="create-from-email"
                    className="text-[11px] text-muted-foreground"
                  >
                    From Email
                  </Label>
                  <Input
                    id="create-from-email"
                    type="email"
                    value={fromEmail}
                    onChange={(e) => {
                      setFromEmail(e.target.value)
                      clearFieldError("from")
                    }}
                    placeholder="hello@mail.amanillah.com"
                    className={`h-8 bg-background/80 text-xs ${fieldErrors.from ? "border-destructive focus:border-destructive" : ""}`}
                  />
                  {fieldErrors.from && <FieldError errors={fieldErrors.from} />}
                </div>
                <div className="space-y-1">
                  <Label
                    htmlFor="create-reply-to"
                    className="text-[11px] text-muted-foreground"
                  >
                    Reply-To Email
                  </Label>
                  <Input
                    id="create-reply-to"
                    type="email"
                    value={replyTo}
                    onChange={(e) => {
                      setReplyTo(e.target.value)
                      clearFieldError("replyTo")
                    }}
                    placeholder="fi@amanillah.com"
                    className={`h-8 bg-background/80 text-xs ${fieldErrors.replyTo ? "border-destructive focus:border-destructive" : ""}`}
                  />
                  {fieldErrors.replyTo && <FieldError errors={fieldErrors.replyTo} />}
                </div>
              </div>
            </div>

            {/* HTML / Liquid Body Editor */}
            <div className="space-y-2">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <Label
                  htmlFor="create-body"
                  className="flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Code2 className="size-4 text-primary" />
                  HTML Body & Liquid Engine Template{" "}
                  <span className="text-destructive">*</span>
                </Label>

                {/* Variable inserter pills */}
                <div className="flex flex-wrap items-center gap-1">
                  <span className="mr-1 text-[10px] text-muted-foreground">
                    Insert Variable:
                  </span>
                  {COMMON_VARIABLES.slice(0, 6).map((token) => (
                    <button
                      key={token}
                      type="button"
                      onClick={() => insertVariable(token)}
                      className="rounded border border-border/50 bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] transition-colors hover:bg-primary/20 hover:text-primary"
                    >
                      +{token}
                    </button>
                  ))}
                </div>
              </div>

              <Textarea
                id="create-body"
                ref={bodyRef}
                value={body}
                onChange={(e) => {
                  setBody(e.target.value)
                  clearFieldError("body")
                }}
                placeholder="Enter valid HTML template with Liquid tags..."
                className={`min-h-[260px] border-zinc-800 bg-zinc-950 p-3 font-mono text-xs leading-relaxed text-zinc-100 selection:bg-primary/30 ${fieldErrors.body ? "border-destructive focus:border-destructive" : ""}`}
                required
              />
              {fieldErrors.body && <FieldError errors={fieldErrors.body} />}

              <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground">
                <span>
                  Supports standard HTML5 and LiquidJS interpolation tags
                </span>
                <span>{body.length} characters</span>
              </div>
            </div>

            {/* Plunk Sync Switch */}
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
              <div className="space-y-0.5">
                <Label
                  htmlFor="sync-toggle"
                  className="cursor-pointer text-xs font-semibold"
                >
                  Sync to Plunk Cloud immediately
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Synchronize this template with Plunk API upon saving so
                  campaigns can trigger it immediately.
                </p>
              </div>
              <Switch
                id="sync-toggle"
                checked={syncToPlunk}
                onCheckedChange={setSyncToPlunk}
              />
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between border-t border-border/60 bg-muted/20 p-4 sm:justify-between">
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
              className="gap-1.5 bg-primary text-xs font-semibold text-primary-foreground"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span>Creating Template...</span>
              ) : (
                <>
                  <Plus className="size-4" />
                  Create Template
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
