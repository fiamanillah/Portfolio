"use client"

import * as React from "react"
import {
  Code,
  Copy,
  Eye,
  Laptop,
  Maximize2,
  Minimize2,
  Pencil,
  RefreshCw,
  Send,
  Smartphone,
  Sparkles,
  Tablet,
} from "lucide-react"

import type { EmailTemplate, PreviewTemplateDTO } from "@workspace/shared"
import { TemplateApi } from "@/lib/api"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Textarea } from "@workspace/ui/components/textarea"
import { toast } from "@workspace/ui/components/sonner"

interface TemplatePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template: EmailTemplate | null
  onOpenEdit?: (template: EmailTemplate) => void
}

type DeviceMode = "desktop" | "tablet" | "mobile"

export function TemplatePreviewDialog({
  open,
  onOpenChange,
  template,
  onOpenEdit,
}: TemplatePreviewDialogProps) {
  const [deviceMode, setDeviceMode] = React.useState<DeviceMode>("desktop")
  const [isFullScreen, setIsFullScreen] = React.useState<boolean>(false)
  const [activeTab, setActiveTab] = React.useState<string>("visual")
  const [sampleDataJson, setSampleDataJson] = React.useState<string>("{}")
  const [renderedSubject, setRenderedSubject] = React.useState<string>("")
  const [renderedBody, setRenderedBody] = React.useState<string>("")
  const [isRendering, setIsRendering] = React.useState<boolean>(false)
  const [renderError, setRenderError] = React.useState<string | null>(null)

  // Test send state
  const [testRecipient, setTestRecipient] = React.useState<string>("")
  const [isSendingTest, setIsSendingTest] = React.useState<boolean>(false)

  // Initialize sample data & render when template opens
  React.useEffect(() => {
    if (template && open) {
      const initialData = template.sampleData || {
        name: "Alex Mercer",
        email: "alex.mercer@example.com",
        subject: "Collaboration on Distributed Systems",
        message: "Hi Fi, I loved your microservices architecture post!",
        code: "849201",
        title: "Scaling Real-Time WebSockets",
        unsubscribeUrl: "https://fi.amanillah.com/unsubscribe?token=sample",
        manageUrl: "https://fi.amanillah.com/manage",
      }

      const jsonStr = JSON.stringify(initialData, null, 2)
      setSampleDataJson(jsonStr)
      triggerRender(template, initialData)
    }
  }, [template, open])

  const triggerRender = async (
    tpl: EmailTemplate,
    sampleData: Record<string, any>
  ) => {
    setIsRendering(true)
    setRenderError(null)

    try {
      const res = await TemplateApi.preview({
        templateId: tpl.id,
        slug: tpl.slug,
        subject: tpl.subject,
        body: tpl.body,
        sampleData,
      })

      if (res.success && res.data) {
        setRenderedSubject(res.data.subject)
        setRenderedBody(res.data.body)
        if (res.data.error) {
          setRenderError(res.data.error)
        }
      } else {
        setRenderedSubject(tpl.subject)
        setRenderedBody(tpl.body)
        setRenderError(res.error || "Failed to render liquid template")
      }
    } catch (err: any) {
      setRenderedSubject(tpl.subject)
      setRenderedBody(tpl.body)
      setRenderError(err?.message || "Failed to render preview")
    } finally {
      setIsRendering(false)
    }
  }

  const handleJsonChange = (newJson: string) => {
    setSampleDataJson(newJson)
    try {
      const parsed = JSON.parse(newJson)
      if (template) {
        triggerRender(template, parsed)
      }
    } catch {
      // invalid json while typing, don't trigger render until valid
    }
  }

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!template) return
    if (!testRecipient || !testRecipient.includes("@")) {
      toast.error("Please enter a valid recipient email address")
      return
    }

    let parsedData = {}
    try {
      parsedData = JSON.parse(sampleDataJson)
    } catch {
      toast.error("Invalid JSON sample data. Please correct it before sending test email.")
      return
    }

    setIsSendingTest(true)
    try {
      const res = await TemplateApi.sendTestEmail({
        to: testRecipient.trim(),
        templateId: template.id,
        slug: template.slug,
        subject: renderedSubject,
        body: renderedBody,
        data: parsedData,
      })

      if (res.success) {
        toast.success(`Test email sent to ${testRecipient}! Check your inbox.`)
        setTestRecipient("")
      } else {
        toast.error(res.error || "Failed to dispatch test email")
      }
    } catch (err: any) {
      toast.error(err?.message || "Error sending test email")
    } finally {
      setIsSendingTest(false)
    }
  }

  const copyHtml = () => {
    navigator.clipboard.writeText(renderedBody)
    toast.success("Rendered HTML copied to clipboard")
  }

  if (!template) return null

  // Calculate container width based on device mode
  const getDeviceWidth = () => {
    switch (deviceMode) {
      case "mobile":
        return "max-w-[400px]"
      case "tablet":
        return "max-w-[680px]"
      default:
        return "max-w-[960px]"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`flex flex-col p-0 overflow-hidden border-border/80 bg-background/95 backdrop-blur-md transition-all duration-300 ${
          isFullScreen
            ? "w-screen h-screen max-w-none rounded-none"
            : "w-[96vw] max-w-[1400px] h-[92vh] max-h-[92vh] rounded-xl sm:max-w-[96vw] lg:max-w-[1400px]"
        }`}
      >
        {/* Modal Header */}
        <DialogHeader className="p-5 pb-3 border-b border-border/60 bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Eye className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base font-bold">
                    {template.name}
                  </DialogTitle>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${template.isSystem
                      ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      }`}
                  >
                    {template.isSystem ? "Codebase" : "Custom"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <code className="text-xs font-mono text-muted-foreground">
                    {template.slug}
                  </code>
                </div>
              </div>
            </div>

            {/* Device Viewport & Action Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5">
                <Button
                  type="button"
                  variant={deviceMode === "desktop" ? "secondary" : "ghost"}
                  size="icon"
                  className="size-7 rounded"
                  onClick={() => setDeviceMode("desktop")}
                  title="Desktop View (960px)"
                >
                  <Laptop className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant={deviceMode === "tablet" ? "secondary" : "ghost"}
                  size="icon"
                  className="size-7 rounded"
                  onClick={() => setDeviceMode("tablet")}
                  title="Tablet View (680px)"
                >
                  <Tablet className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant={deviceMode === "mobile" ? "secondary" : "ghost"}
                  size="icon"
                  className="size-7 rounded"
                  onClick={() => setDeviceMode("mobile")}
                  title="Mobile View (400px)"
                >
                  <Smartphone className="size-3.5" />
                </Button>
              </div>

              {onOpenEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false)
                    onOpenEdit(template)
                  }}
                  className="h-8 gap-1.5 text-xs bg-background/80"
                >
                  <Pencil className="size-3.5 text-amber-400" />
                  Edit
                </Button>
              )}

              {/* Fullscreen Expand Toggle */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsFullScreen(!isFullScreen)}
                title={isFullScreen ? "Exit Fullscreen" : "Fullscreen Preview"}
              >
                {isFullScreen ? (
                  <Minimize2 className="size-4" />
                ) : (
                  <Maximize2 className="size-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Rendered Subject Line Bar */}
          <div className="mt-3 p-2.5 rounded-lg border border-border/60 bg-card/80 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-muted-foreground shrink-0">
                Subject:
              </span>
              <span className="font-medium text-foreground truncate">
                {renderedSubject || template.subject}
              </span>
            </div>
            {isRendering && (
              <RefreshCw className="size-3.5 animate-spin text-primary shrink-0" />
            )}
          </div>
        </DialogHeader>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-2 border-b border-border/50 bg-muted/10">
              <TabsList className="h-8 bg-muted/60">
                <TabsTrigger value="visual" className="text-xs h-7 gap-1.5">
                  <Eye className="size-3.5" />
                  Rendered Preview
                </TabsTrigger>
                <TabsTrigger value="raw" className="text-xs h-7 gap-1.5">
                  <Code className="size-3.5" />
                  Raw HTML
                </TabsTrigger>
                <TabsTrigger value="context" className="text-xs h-7 gap-1.5">
                  <Sparkles className="size-3.5" />
                  Test Data (JSON)
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                {activeTab === "raw" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyHtml}
                    className="h-7 text-xs gap-1"
                  >
                    <Copy className="size-3" />
                    Copy HTML
                  </Button>
                )}
              </div>
            </div>

            {/* Visual Render Tab (iframe sandbox) */}
            <TabsContent
              value="visual"
              className="flex-1 m-0 overflow-y-auto bg-zinc-950 p-4 md:p-8 flex items-start justify-center"
            >
              <div
                className={`w-full ${getDeviceWidth()} transition-all duration-300 rounded-xl overflow-hidden shadow-2xl border border-zinc-800 bg-zinc-900`}
              >
                {/* Browser Bezel Frame */}
                <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="size-2.5 rounded-full bg-red-500/80" />
                    <div className="size-2.5 rounded-full bg-yellow-500/80" />
                    <div className="size-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-3 py-0.5 rounded border border-zinc-800">
                    {deviceMode === "desktop"
                      ? "Desktop View (Wide Canvas)"
                      : deviceMode === "tablet"
                        ? "Tablet View (680px)"
                        : "Mobile View (400px)"}
                  </div>
                  <div className="size-2.5" />
                </div>

                {/* Rendered HTML Sandbox iframe */}
                <iframe
                  srcDoc={renderedBody}
                  title="Template Preview"
                  className="w-full min-h-[560px] h-[65vh] bg-zinc-950 border-0"
                  sandbox="allow-same-origin"
                />
              </div>
            </TabsContent>

            {/* Raw HTML Code Tab */}
            <TabsContent
              value="raw"
              className="flex-1 m-0 overflow-y-auto p-4 bg-zinc-950"
            >
              <pre className="font-mono text-xs text-zinc-200 whitespace-pre-wrap break-all leading-relaxed p-4 rounded-lg bg-zinc-900/80 border border-zinc-800">
                {renderedBody}
              </pre>
            </TabsContent>

            {/* Test Context Data Tab (Editable JSON) */}
            <TabsContent
              value="context"
              className="flex-1 m-0 overflow-y-auto p-6 space-y-4"
            >
              <div className="space-y-1.5 max-w-3xl mx-auto">
                <Label htmlFor="sample-json" className="text-xs font-semibold">
                  Test Variables (JSON Format)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Modify the test payload below to see how this template dynamically evaluates variables in real time.
                </p>
                <Textarea
                  id="sample-json"
                  value={sampleDataJson}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  className="font-mono text-xs min-h-[350px] bg-zinc-950 text-emerald-400 border-zinc-800 p-4 leading-relaxed"
                />
              </div>
            </TabsContent>
          </Tabs>

          {renderError && (
            <div className="p-2 bg-destructive/10 border-t border-destructive/30 text-destructive text-xs px-6">
              Render Note: {renderError}
            </div>
          )}
        </div>

        {/* Footer: Live Test Email Dispatcher */}
        <DialogFooter className="p-4 border-t border-border/60 bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <form
            onSubmit={handleSendTestEmail}
            className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md"
          >
            <Input
              type="email"
              placeholder="Enter email to receive test copy..."
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              className="h-8 text-xs bg-background/80"
            />
            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs gap-1.5 shrink-0 bg-primary text-primary-foreground font-semibold"
              disabled={isSendingTest || !testRecipient}
            >
              {isSendingTest ? (
                <RefreshCw className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              Send Test
            </Button>
          </form>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs self-end sm:self-center"
          >
            Close Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
