// apps/dashboard/src/app/(dashboard)/newsletters/components/test-send-dialog.tsx
"use client";

import * as React from "react";
import { Send, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { NewsletterApi } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { toast } from "@workspace/ui/components/sonner";

interface TestSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newsletterId?: string;
  subject?: string;
  previewText?: string | null;
  content?: string;
  senderName?: string | null;
  senderEmail?: string | null;
}

export function TestSendDialog({
  open,
  onOpenChange,
  newsletterId,
  subject,
  previewText,
  content,
  senderName,
  senderEmail,
}: TestSendDialogProps) {
  const [emailsText, setEmailsText] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedEmails = emailsText
      .split(/[\n,]+/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.includes("@"));

    if (parsedEmails.length === 0) {
      toast.error("No valid email addresses provided", {
        description: "Please enter at least one valid recipient email.",
      });
      return;
    }

    try {
      setIsSending(true);
      const res = await NewsletterApi.sendTest({
        newsletterId,
        subject,
        previewText,
        content,
        testEmails: parsedEmails,
        senderName,
        senderEmail,
      });

      if (res.success && res.data) {
        toast.success("Test newsletter dispatched!", {
          description: `Delivered test broadcast to ${res.data.successful} address(es).`,
        });
        onOpenChange(false);
        setEmailsText("");
      } else {
        toast.error("Test send failed", {
          description: res.error || "Please check Plunk credentials.",
        });
      }
    } catch (err: any) {
      toast.error("Error sending test email", {
        description: err?.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSend}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Mail className="size-4 text-primary" />
              <span>Send Test Broadcast</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Preview this newsletter rendered in real email clients before
              broadcasting to all subscribers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label htmlFor="test-emails" className="text-xs">
                Test Recipient Emails <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="test-emails"
                placeholder="test1@example.com&#10;developer@domain.com"
                value={emailsText}
                onChange={(e) => setEmailsText(e.target.value)}
                required
                className="min-h-[90px] font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Enter one or multiple addresses separated by commas or line breaks.
              </p>
            </div>

            <div className="rounded-md border border-border/60 bg-muted/30 p-2.5 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Note: </span>
              Test emails will be delivered with a{" "}
              <code className="font-mono text-primary">[TEST]</code> subject
              prefix and sample personalization tags.
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSending}
              className="gap-1.5"
            >
              <Send className="size-3.5" />
              {isSending ? "Sending Test..." : "Send Test Now"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
