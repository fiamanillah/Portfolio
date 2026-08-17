// apps/dashboard/src/app/(dashboard)/newsletters/components/send-confirm-dialog.tsx
"use client";

import * as React from "react";
import { Send, AlertTriangle, Users, ShieldCheck } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { Badge } from "@workspace/ui/components/badge";

interface SendConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  recipientCount: number;
  spamScore?: number | null;
  onConfirmSend: () => void;
  isSending?: boolean;
}

export function SendConfirmDialog({
  open,
  onOpenChange,
  title,
  recipientCount,
  spamScore,
  onConfirmSend,
  isSending,
}: SendConfirmDialogProps) {
  const isHighRisk = spamScore !== undefined && spamScore !== null && spamScore < 65;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-base text-foreground">
            <Send className="size-4 text-primary" />
            <span>Broadcast Campaign Immediately?</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            You are about to broadcast{" "}
            <span className="font-semibold text-foreground">"{title}"</span> to{" "}
            <span className="font-semibold text-foreground">
              {recipientCount.toLocaleString()} recipient(s)
            </span>
            . This action cannot be undone once dispatch begins.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 p-3">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <span>Target Recipients</span>
            </div>
            <span className="font-mono font-bold text-foreground">
              {recipientCount.toLocaleString()}
            </span>
          </div>

          {spamScore !== undefined && spamScore !== null && (
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 p-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-muted-foreground" />
                <span>Deliverability Score</span>
              </div>
              <Badge
                variant="outline"
                className={`font-mono text-xs ${
                  spamScore >= 85
                    ? "text-emerald-500 border-emerald-500/30"
                    : spamScore >= 65
                    ? "text-amber-500 border-amber-500/30"
                    : "text-rose-500 border-rose-500/30"
                }`}
              >
                {spamScore} / 100
              </Badge>
            </div>
          )}

          {isHighRisk && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-rose-500">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong>Warning:</strong> Deliverability score is low ({spamScore}
                /100). Consider resolving spam warnings to avoid spam folder
                placement.
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel disabled={isSending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmSend}
            disabled={isSending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSending ? "Broadcasting..." : "Yes, Broadcast Now"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
