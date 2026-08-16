// apps/dashboard/src/app/(dashboard)/comments/components/comment-badge-utils.tsx
import * as React from "react";
import { Check, Clock, Ban, X } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import type { CommentStatus, CommentReportReason } from "@workspace/shared";

export function renderStatusBadge(status: CommentStatus) {
  switch (status) {
    case "APPROVED":
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1 text-[10px]"
        >
          <Check className="size-3" />
          Approved
        </Badge>
      );
    case "PENDING":
      return (
        <Badge
          variant="secondary"
          className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1 text-[10px]"
        >
          <Clock className="size-3" />
          Pending Review
        </Badge>
      );
    case "SPAM":
      return (
        <Badge
          variant="destructive"
          className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 gap-1 text-[10px]"
        >
          <Ban className="size-3" />
          Spam Blocked
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge
          variant="outline"
          className="border-zinc-500/30 bg-zinc-500/10 text-zinc-500 gap-1 text-[10px]"
        >
          <X className="size-3" />
          Rejected
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export function renderReasonBadge(reason: CommentReportReason) {
  switch (reason) {
    case "HARASSMENT":
    case "HATE_SPEECH":
      return (
        <Badge className="bg-rose-500/20 text-rose-600 border border-rose-500/40 text-[10px]">
          {reason.replace("_", " ")}
        </Badge>
      );
    case "SPAM":
      return (
        <Badge className="bg-amber-500/20 text-amber-600 border border-amber-500/40 text-[10px]">
          SPAM
        </Badge>
      );
    case "INAPPROPRIATE":
    case "MISINFORMATION":
      return (
        <Badge className="bg-orange-500/20 text-orange-600 border border-orange-500/40 text-[10px]">
          {reason}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-[10px]">
          {reason}
        </Badge>
      );
  }
}
