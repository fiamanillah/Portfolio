// apps/web/src/components/Blog/engagement/ReportCommentModal.tsx
import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { CommentsApi } from "@/lib/api/commentsApi";

interface ReportCommentModalProps {
  commentId: string;
  isOpen: boolean;
  userName?: string;
  userEmail?: string;
  onClose: () => void;
}

export function ReportCommentModal({
  commentId,
  isOpen,
  userName,
  userEmail,
  onClose,
}: ReportCommentModalProps) {
  const [reportReason, setReportReason] = useState<string>("INAPPROPRIATE");
  const [reportDetails, setReportDetails] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccessMessage, setReportSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsReporting(true);
    try {
      const res = await CommentsApi.reportComment(
        commentId,
        reportReason,
        reportDetails,
        userName,
        userEmail
      );
      setReportSuccessMessage(res.message || "Thank you for reporting.");
      setTimeout(() => {
        onClose();
        setReportSuccessMessage(null);
        setReportDetails("");
      }, 2000);
    } catch {
      setReportSuccessMessage("Thank you. Report received.");
      setTimeout(() => {
        onClose();
        setReportSuccessMessage(null);
      }, 2000);
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-md border border-border bg-background p-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={AlertCircleIcon} className="size-4 text-rose-500" />
            <h3 className="font-mono text-sm font-bold text-foreground">
              Report Inappropriate Comment
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            [ESC]
          </button>
        </div>

        {reportSuccessMessage ? (
          <div className="py-6 text-center space-y-2">
            <div className="inline-flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
              <HugeiconsIcon icon={Tick02Icon} className="size-5" />
            </div>
            <p className="font-mono text-xs text-foreground font-semibold">
              {reportSuccessMessage}
            </p>
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-mono text-xs text-muted-foreground">
                Reason for flag:
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full border border-border bg-muted/30 px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <option value="INAPPROPRIATE">Inappropriate or offensive content</option>
                <option value="SPAM">Spam, advertising, or self-promotion</option>
                <option value="HARASSMENT">Harassment or abusive behavior</option>
                <option value="HATE_SPEECH">Hate speech or discrimination</option>
                <option value="MISINFORMATION">Misinformation or false claims</option>
                <option value="OTHER">Other issue</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-xs text-muted-foreground">
                Additional details (optional):
              </label>
              <textarea
                rows={3}
                placeholder="Provide brief context for the moderation team..."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                className="w-full border border-border bg-muted/30 p-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isReporting}
                className="border border-rose-500/40 bg-rose-500/15 px-4 py-1.5 font-mono text-xs font-semibold text-rose-500 hover:bg-rose-500/25 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isReporting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
