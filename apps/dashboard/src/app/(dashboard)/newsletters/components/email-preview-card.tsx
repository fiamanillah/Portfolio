// apps/dashboard/src/app/(dashboard)/newsletters/components/email-preview-card.tsx
"use client";

import * as React from "react";
import {
  Smartphone,
  Monitor,
  Code2,
  Eye,
  Mail,
  Copy,
  Check,
  ExternalLink,
  UserCheck,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MoreVertical,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { toast } from "@workspace/ui/components/sonner";
import {
  renderSiteEmailLayout,
  PREVIEW_PERSONAS,
} from "@/lib/email-layout";

interface EmailPreviewCardProps {
  subject: string;
  previewText?: string | null;
  content: string;
  senderName?: string | null;
  senderEmail?: string | null;
  replyTo?: string | null;
  badgeLabel?: string;
  className?: string;
  onSendTestClick?: () => void;
}

export function EmailPreviewCard({
  subject,
  previewText,
  content,
  senderName,
  senderEmail,
  replyTo,
  badgeLabel = "NEWSLETTER",
  className,
  onSendTestClick,
}: EmailPreviewCardProps) {
  const [viewport, setViewport] = React.useState<"desktop" | "mobile" | "code">(
    "desktop"
  );
  const [zoomPercent, setZoomPercent] = React.useState<number>(100);
  const [selectedPersona, setSelectedPersona] = React.useState(
    PREVIEW_PERSONAS[0]!
  );
  const [hasCopied, setHasCopied] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState<number>(600);

  // Measure container width for fluid auto-scaling
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleResize = () => {
      if (el) {
        setContainerWidth(el.clientWidth);
      }
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Compute scale factor so 600px desktop email fits seamlessly into any column width
  const baseScale = Math.min(1, Math.max(0.5, (containerWidth - 24) / 600));
  const scale = (zoomPercent / 100) * baseScale;
  const iframeContainerHeight = Math.max(520, Math.round(700 * scale));

  // Render authentic site email layout
  const rendered = React.useMemo(() => {
    return renderSiteEmailLayout({
      title: subject,
      previewText,
      content,
      senderName,
      senderEmail,
      badgeLabel,
      sampleRecipient: {
        name: selectedPersona.name,
        firstName: selectedPersona.firstName,
        email: selectedPersona.email,
      },
    });
  }, [
    subject,
    previewText,
    content,
    senderName,
    senderEmail,
    badgeLabel,
    selectedPersona,
  ]);

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(rendered.html);
      setHasCopied(true);
      toast.success("Full HTML copied to clipboard!");
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      toast.error("Failed to copy HTML to clipboard");
    }
  };

  const handleOpenInNewWindow = () => {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(rendered.html);
      win.document.close();
    }
  };

  return (
    <Card className={`border-border/80 bg-card/60 shadow-sm ${className || ""}`}>
      {/* Sleek Compact Header */}
      <CardHeader className="flex flex-row items-center justify-between gap-2 p-3.5 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex size-6 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
            <Eye className="size-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <CardTitle className="text-xs font-semibold truncate">
                Live Preview
              </CardTitle>
              <Badge
                variant="outline"
                className="hidden sm:inline-flex border-emerald-500/30 bg-emerald-500/10 font-mono text-[9px] text-emerald-600 dark:text-emerald-400 px-1 py-0"
              >
                Sync
              </Badge>
            </div>
          </div>
        </div>

        {/* Compact Right-Aligned Toolbar */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Viewport Switcher */}
          <div className="flex items-center rounded-md border border-border/60 bg-muted/40 p-0.5">
            <Button
              variant={viewport === "desktop" ? "secondary" : "ghost"}
              size="icon"
              className="size-6 rounded"
              onClick={() => setViewport("desktop")}
              title="Desktop Layout (580px)"
            >
              <Monitor className="size-3" />
            </Button>
            <Button
              variant={viewport === "mobile" ? "secondary" : "ghost"}
              size="icon"
              className="size-6 rounded"
              onClick={() => setViewport("mobile")}
              title="Mobile Device (375px)"
            >
              <Smartphone className="size-3" />
            </Button>
            <Button
              variant={viewport === "code" ? "secondary" : "ghost"}
              size="icon"
              className="size-6 rounded"
              onClick={() => setViewport("code")}
              title="HTML Source Code"
            >
              <Code2 className="size-3" />
            </Button>
          </div>

          {/* Persona Picker Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-6 gap-1 text-[11px] px-2"
                title="Simulate Recipient Persona"
              >
                <UserCheck className="size-3 text-muted-foreground" />
                <span className="max-w-[70px] truncate">
                  {selectedPersona.firstName || "Anon"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 text-xs">
              <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase font-semibold">
                Simulate Recipient Persona
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {PREVIEW_PERSONAS.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  onClick={() => setSelectedPersona(p)}
                  className="flex items-center justify-between text-xs cursor-pointer"
                >
                  <div className="truncate pr-2">
                    <div className="font-medium text-foreground truncate">{p.label}</div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {p.email}
                    </div>
                  </div>
                  {selectedPersona.id === p.id && (
                    <Check className="size-3.5 text-primary shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-6"
                title="Preview Options & Actions"
              >
                <MoreVertical className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs">
              <DropdownMenuItem onClick={handleCopyHtml} className="cursor-pointer gap-2">
                <Copy className="size-3.5 text-muted-foreground" />
                <span>Copy Full HTML</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenInNewWindow} className="cursor-pointer gap-2">
                <ExternalLink className="size-3.5 text-muted-foreground" />
                <span>Pop-out Preview</span>
              </DropdownMenuItem>

              {onSendTestClick && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onSendTestClick} className="cursor-pointer gap-2 text-primary">
                    <Mail className="size-3.5" />
                    <span>Send Test Email</span>
                  </DropdownMenuItem>
                </>
              )}

              {viewport === "desktop" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase font-semibold">
                    Zoom: {zoomPercent}%
                  </DropdownMenuLabel>
                  <div className="flex items-center justify-between px-2 py-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      onClick={() => setZoomPercent((prev) => Math.max(60, prev - 15))}
                      disabled={zoomPercent <= 60}
                    >
                      <ZoomOut className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] px-1.5"
                      onClick={() => setZoomPercent(100)}
                    >
                      Reset (100%)
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      onClick={() => setZoomPercent((prev) => Math.min(130, prev + 15))}
                      disabled={zoomPercent >= 130}
                    >
                      <ZoomIn className="size-3" />
                    </Button>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Copy Icon */}
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={handleCopyHtml}
            title="Copy Raw HTML"
          >
            {hasCopied ? (
              <Check className="size-3 text-emerald-500" />
            ) : (
              <Copy className="size-3 text-muted-foreground hover:text-foreground" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-3.5 pt-3" ref={containerRef}>
        {/* Inbox Simulation Snippet Banner */}
        <div className="rounded-lg border border-border/80 bg-background/90 p-2.5 text-xs shadow-2xs">
          <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-900 font-mono font-bold text-[9px] text-white">
                FA
              </div>
              <div className="min-w-0 truncate">
                <span className="font-semibold text-foreground text-[11px]">
                  {rendered.senderName}
                </span>
                <span className="ml-1 font-mono text-[10px] text-muted-foreground truncate">
                  &lt;{rendered.senderEmail}&gt;
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] text-muted-foreground">Now</span>
              <Badge variant="outline" className="font-mono text-[8px] uppercase px-1 py-0">
                Inbox
              </Badge>
            </div>
          </div>

          <div className="pt-1.5">
            <div className="font-semibold text-[12px] text-foreground truncate">
              {rendered.interpolatedSubject}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground truncate">
              {rendered.interpolatedPreview ? (
                <span>{rendered.interpolatedPreview}</span>
              ) : (
                <span className="italic text-muted-foreground/60">
                  (No preheader provided)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Email Document Area */}
        {viewport === "code" ? (
          <div className="relative rounded-lg border border-border/80 bg-slate-950 p-3">
            <div className="absolute right-2.5 top-2.5">
              <Button
                variant="secondary"
                size="sm"
                className="h-6 gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200"
                onClick={handleCopyHtml}
              >
                {hasCopied ? (
                  <>
                    <Check className="size-3 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
            <pre className="max-h-[500px] overflow-auto font-mono text-[11px] leading-relaxed text-slate-300 whitespace-pre-wrap select-all">
              {rendered.html}
            </pre>
          </div>
        ) : viewport === "mobile" ? (
          /* Mobile Frame (375px) */
          <div className="flex justify-center overflow-x-auto rounded-lg border border-border/80 bg-muted/30 p-3">
            <div className="w-[340px] sm:w-[375px] shrink-0 overflow-hidden rounded-[28px] border-[5px] border-slate-800 bg-slate-900 shadow-lg">
              {/* Phone Top Bar */}
              <div className="flex items-center justify-between bg-slate-900 px-5 py-1.5 text-[10px] font-semibold text-slate-300">
                <span>9:41</span>
                <div className="h-3 w-14 rounded-full bg-slate-800" />
                <span className="font-mono text-[9px]">100%</span>
              </div>

              {/* Mobile App Header */}
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-3 py-1.5 text-xs text-slate-700">
                <div className="flex items-center gap-1 font-medium text-[11px]">
                  <Mail className="size-3 text-slate-500" />
                  <span className="font-semibold text-slate-900">Inbox</span>
                </div>
                <Badge variant="outline" className="h-4 text-[8px] bg-white px-1">
                  1 of 1
                </Badge>
              </div>

              {/* Email Content Frame */}
              <div className="h-[480px] w-full overflow-y-auto bg-slate-50">
                <iframe
                  srcDoc={rendered.html}
                  title="Mobile Email Preview"
                  className="h-full w-full border-0"
                  sandbox="allow-same-origin"
                />
              </div>

              {/* Home Bar */}
              <div className="flex justify-center bg-slate-900 py-1">
                <div className="h-1 w-24 rounded-full bg-slate-600" />
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Scaled Fluid Preview */
          <div className="flex justify-center overflow-hidden rounded-lg border border-border/80 bg-muted/30 p-2">
            <div
              className="w-full flex justify-center overflow-hidden"
              style={{
                height: `${iframeContainerHeight}px`,
              }}
            >
              <div
                style={{
                  width: "600px",
                  transform: `scale(${scale})`,
                  transformOrigin: "top center",
                }}
                className="shrink-0 transition-transform duration-150"
              >
                <div className="overflow-hidden rounded border border-border/80 bg-white shadow-xs">
                  <iframe
                    srcDoc={rendered.html}
                    title="Desktop Email Preview"
                    className="h-[680px] w-[600px] border-0"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
