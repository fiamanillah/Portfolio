// apps/dashboard/src/app/(dashboard)/newsletters/components/email-preview-card.tsx
"use client";

import * as React from "react";
import {
  Smartphone,
  Monitor,
  Code,
  Eye,
  Mail,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";

interface EmailPreviewCardProps {
  subject: string;
  previewText?: string | null;
  content: string;
  senderName?: string | null;
  senderEmail?: string | null;
}

export function EmailPreviewCard({
  subject,
  previewText,
  content,
  senderName,
  senderEmail,
}: EmailPreviewCardProps) {
  const [viewport, setViewport] = React.useState<"desktop" | "mobile">(
    "desktop"
  );
  const [mode, setMode] = React.useState<"rendered" | "code">("rendered");

  const fontSans =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
  const fontMono =
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

  const renderedSenderName = senderName || "Fi Amanillah";
  const renderedSenderEmail = senderEmail || "fi@amanillah.com";

  // Simulate liquid variable interpolation for preview
  const interpolatedSubject = (subject || "Untitled Newsletter Subject")
    .replace(/\{\{\s*name[^}]*\}\}/gi, "Alex Johnson")
    .replace(/\{\{\s*firstName[^}]*\}\}/gi, "Alex")
    .replace(/\{\{\s*email[^}]*\}\}/gi, "alex@example.com");

  const interpolatedPreview = (previewText || subject || "")
    .replace(/\{\{\s*name[^}]*\}\}/gi, "Alex Johnson")
    .replace(/\{\{\s*firstName[^}]*\}\}/gi, "Alex");

  const interpolatedBody = (
    content || "<p>Start drafting your newsletter content...</p>"
  )
    .replace(/\{\{\s*name[^}]*\}\}/gi, "Alex Johnson")
    .replace(/\{\{\s*firstName[^}]*\}\}/gi, "Alex")
    .replace(/\{\{\s*email[^}]*\}\}/gi, "alex@example.com")
    .replace(
      /\{\{\s*unsubscribeUrl[^}]*\}\}/gi,
      "https://fi.amanillah.com/unsubscribe?token=preview_sample"
    );

  const fullHtmlDocument = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${interpolatedSubject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: ${fontSans}; color: #334155; }
    .email-wrapper { padding: 32px 16px; width: 100%; box-sizing: border-box; background-color: #f8fafc; }
    .email-container { max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; }
    .email-header { padding: 20px 28px 16px 28px; border-bottom: 1px solid #e2e8f0; }
    .email-title-sec { padding: 22px 28px 6px 28px; }
    .email-body { padding: 14px 28px 28px 28px; font-size: 14px; line-height: 1.65; color: #334155; }
    .email-footer { padding: 20px 28px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
    a { color: #0f172a; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="left" style="vertical-align: middle;">
              <span style="font-size: 15px; font-weight: 700; color: #0f172a;">Fi Amanillah</span>
              <span style="margin-left: 8px; font-family: ${fontMono}; font-size: 11px; font-weight: 600; color: #475569; background-color: #f1f5f9; border: 1px solid #e2e8f0; padding: 2px 6px; text-transform: uppercase;">
                Newsletter
              </span>
            </td>
            <td align="right" style="vertical-align: middle;">
              <span style="font-family: ${fontMono}; font-size: 12px; color: #64748b;">fi.amanillah.com</span>
            </td>
          </tr>
        </table>
      </div>

      <div class="email-title-sec">
        <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 700; color: #0f172a; line-height: 1.3;">
          ${interpolatedSubject}
        </h1>
        ${
          interpolatedPreview
            ? `<p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">${interpolatedPreview}</p>`
            : ""
        }
      </div>

      <div class="email-body">
        ${interpolatedBody}
      </div>

      <div class="email-footer">
        <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #0f172a;">Fi Amanillah</p>
        <p style="margin: 0 0 10px 0; font-size: 12px; color: #64748b;">Full Stack Developer</p>
        <p style="margin: 0 0 10px 0;">
          <a href="https://fi.amanillah.com" style="margin-right: 12px; text-decoration: underline;">Home</a>
          <a href="https://fi.amanillah.com/blog" style="margin-right: 12px; text-decoration: underline;">Blog</a>
          <a href="https://github.com/fiamanillah" style="text-decoration: underline;">GitHub</a>
        </p>
        <p style="margin: 12px 0 0 0; font-size: 11px; line-height: 1.5; color: #94a3b8;">
          You received this email because you subscribed on <a href="https://fi.amanillah.com" style="color: #64748b;">fi.amanillah.com</a>.<br>
          <a href="https://fi.amanillah.com/unsubscribe?token=preview" style="color: #0f172a; text-decoration: underline;">Unsubscribe</a> &bull;
          <a href="https://fi.amanillah.com" style="color: #64748b; text-decoration: underline;">Preferences</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  return (
    <Card className="border-border/80 bg-card/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="size-4 text-primary" />
            <CardTitle className="text-sm font-semibold">
              Live Responsive Preview
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Dynamic liquid interpolation simulation with sample recipient data.
          </CardDescription>
        </div>

        {/* Viewport & Mode Controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5">
            <Button
              variant={viewport === "desktop" ? "secondary" : "ghost"}
              size="icon"
              className="size-7 rounded"
              onClick={() => setViewport("desktop")}
              title="Desktop (580px)"
            >
              <Monitor className="size-3.5" />
            </Button>
            <Button
              variant={viewport === "mobile" ? "secondary" : "ghost"}
              size="icon"
              className="size-7 rounded"
              onClick={() => setViewport("mobile")}
              title="Mobile (375px)"
            >
              <Smartphone className="size-3.5" />
            </Button>
          </div>

          <div className="flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5">
            <Button
              variant={mode === "rendered" ? "secondary" : "ghost"}
              size="icon"
              className="size-7 rounded"
              onClick={() => setMode("rendered")}
              title="Rendered Layout"
            >
              <Eye className="size-3.5" />
            </Button>
            <Button
              variant={mode === "code" ? "secondary" : "ghost"}
              size="icon"
              className="size-7 rounded"
              onClick={() => setMode("code")}
              title="HTML Document Source"
            >
              <Code className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Inbox Simulation Banner */}
        <div className="rounded-lg border border-border/80 bg-background/80 p-3 text-xs shadow-2xs">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 font-bold text-[10px] text-primary">
                FA
              </div>
              <div>
                <span className="font-semibold text-foreground">
                  {renderedSenderName}
                </span>
                <span className="ml-1.5 text-[11px] text-muted-foreground">
                  &lt;{renderedSenderEmail}&gt;
                </span>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-[10px]">
              INBOX PREVIEW
            </Badge>
          </div>

          <div className="pt-2">
            <div className="font-semibold text-foreground">
              {interpolatedSubject}
            </div>
            {interpolatedPreview && (
              <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                {interpolatedPreview}
              </div>
            )}
          </div>
        </div>

        {/* Email Document Area */}
        {mode === "rendered" ? (
          <div className="flex justify-center overflow-x-auto rounded-lg border border-border/80 bg-muted/40 p-4">
            <div
              className={`transition-all duration-300 ${
                viewport === "mobile" ? "w-[375px]" : "w-[580px]"
              }`}
            >
              <div className="overflow-hidden rounded border border-border bg-white shadow-sm text-slate-800">
                <iframe
                  srcDoc={fullHtmlDocument}
                  title="Email Preview"
                  className="h-[620px] w-full border-0"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border/80 bg-background p-4">
            <pre className="max-h-[500px] overflow-auto font-mono text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {fullHtmlDocument}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
