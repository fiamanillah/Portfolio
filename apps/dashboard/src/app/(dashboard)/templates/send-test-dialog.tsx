"use client"

import * as React from "react"
import { Mail, RefreshCw, Send } from "lucide-react"

import type { EmailTemplate, SendTestEmailDTO } from "@workspace/shared"
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
import { Textarea } from "@workspace/ui/components/textarea"
import { toast } from "@workspace/ui/components/sonner"

interface SendTestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: EmailTemplate | null
  onSubmit: (payload: SendTestEmailDTO) => Promise<boolean>
  isProcessing?: boolean
}

export function SendTestDialog({
  open,
  onOpenChange,
  template,
  onSubmit,
  isProcessing = false,
}: SendTestDialogProps) {
  const [recipient, setRecipient] = React.useState("")
  const [customDataJson, setCustomDataJson] = React.useState("{}")

  React.useEffect(() => {
    if (template && open) {
      const initialData = template.sampleData || {
        name: "Developer",
        email: "test@example.com",
        subject: template.subject,
        message: "This is a test notification message.",
        unsubscribeUrl: "https://fi.amanillah.com/unsubscribe",
      }
      setCustomDataJson(JSON.stringify(initialData, null, 2))
    }
  }, [template, open])

  if (!template) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!recipient.trim() || !recipient.includes("@")) {
      toast.error("Please enter a valid recipient email address")
      return
    }

    let parsedData = {}
    try {
      parsedData = JSON.parse(customDataJson)
    } catch {
      toast.error("Invalid JSON format in test variables")
      return
    }

    const payload: SendTestEmailDTO = {
      to: recipient.trim(),
      templateId: template.id,
      slug: template.slug,
      subject: template.subject,
      body: template.body,
      data: parsedData,
    }

    const success = await onSubmit(payload)
    if (success) {
      setRecipient("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] sm:w-[90vw] sm:max-w-lg border-border/80 bg-background/95 backdrop-blur-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Send className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Send Test Email
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Dispatch a rendered preview to verify formatting in email clients.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1">
            <div className="text-xs font-semibold text-foreground">
              {template.name}
            </div>
            <code className="text-[11px] font-mono text-muted-foreground block">
              {template.slug}
            </code>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="test-recipient" className="text-xs font-semibold">
              Recipient Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="test-recipient"
              type="email"
              placeholder="e.g. your-email@example.com"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="h-9 text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="test-json-data" className="text-xs font-semibold">
              Test Context Variables (JSON)
            </Label>
            <Textarea
              id="test-json-data"
              value={customDataJson}
              onChange={(e) => setCustomDataJson(e.target.value)}
              className="font-mono text-xs min-h-[140px] bg-zinc-950 text-zinc-100 border-zinc-800 p-2.5"
            />
          </div>

          <DialogFooter className="pt-3">
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
              disabled={isProcessing || !recipient}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" />
                  Dispatching...
                </>
              ) : (
                <>
                  <Send className="size-3.5" />
                  Send Test Email
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
