// apps/dashboard/src/app/(dashboard)/newsletters/components/campaign-columns.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import {
  MoreVertical,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Trash2,
  Mail,
  Edit,
  Eye,
  FileText,
  AlertTriangle,
  StopCircle,
  RefreshCw,
} from "lucide-react";
import type { NewsletterItem } from "@workspace/shared";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

interface ColumnCallbacks {
  onSendTest: (item: NewsletterItem) => void;
  onSchedule: (item: NewsletterItem) => void;
  onSendNow: (item: NewsletterItem) => void;
  onCancel: (item: NewsletterItem) => void;
  onDuplicate: (item: NewsletterItem) => void;
  onDelete: (item: NewsletterItem) => void;
  onSync?: (item: NewsletterItem) => void;
}

export function getStatusBadge(status: string) {
  switch (status) {
    case "SENT":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-emerald-500/30 bg-emerald-500/10 font-mono text-[10px] text-emerald-500"
        >
          <CheckCircle2 className="size-3" />
          <span>SENT</span>
        </Badge>
      );
    case "SENDING":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-amber-500/30 bg-amber-500/10 font-mono text-[10px] text-amber-500 animate-pulse"
        >
          <span className="size-1.5 rounded-full bg-amber-500 animate-ping" />
          <span>SENDING</span>
        </Badge>
      );
    case "SCHEDULED":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-blue-500/30 bg-blue-500/10 font-mono text-[10px] text-blue-400"
        >
          <Clock className="size-3" />
          <span>SCHEDULED</span>
        </Badge>
      );
    case "FAILED":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-rose-500/30 bg-rose-500/10 font-mono text-[10px] text-rose-500"
        >
          <XCircle className="size-3" />
          <span>FAILED</span>
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-border bg-muted font-mono text-[10px] text-muted-foreground"
        >
          <StopCircle className="size-3" />
          <span>CANCELLED</span>
        </Badge>
      );
    case "DRAFT":
    default:
      return (
        <Badge
          variant="outline"
          className="gap-1 border-border font-mono text-[10px] text-muted-foreground"
        >
          <span>DRAFT</span>
        </Badge>
      );
  }
}

export function CampaignActionsDropdown({
  item,
  callbacks,
}: {
  item: NewsletterItem;
  callbacks: ColumnCallbacks;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs font-semibold">
          Campaign Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href={`/newsletters/${item.id}`}
            className="flex items-center gap-2 text-xs"
          >
            <Edit className="size-3.5" />
            <span>Edit / Manage</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => callbacks.onSendTest(item)}
          className="flex items-center gap-2 text-xs cursor-pointer"
        >
          <Mail className="size-3.5 text-primary" />
          <span>Send Test Email</span>
        </DropdownMenuItem>

        {item.status === "DRAFT" && (
          <>
            <DropdownMenuItem
              onClick={() => callbacks.onSendNow(item)}
              className="flex items-center gap-2 text-xs cursor-pointer text-emerald-600 dark:text-emerald-400"
            >
              <Send className="size-3.5" />
              <span>Broadcast Now</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => callbacks.onSchedule(item)}
              className="flex items-center gap-2 text-xs cursor-pointer text-blue-500"
            >
              <Clock className="size-3.5" />
              <span>Schedule Broadcast</span>
            </DropdownMenuItem>
          </>
        )}

        {(item.status === "SCHEDULED" || item.status === "SENDING") && (
          <DropdownMenuItem
            onClick={() => callbacks.onCancel(item)}
            className="flex items-center gap-2 text-xs cursor-pointer text-amber-500"
          >
            <StopCircle className="size-3.5" />
            <span>Cancel Broadcast</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link
            href={`/newsletters/${item.id}/logs`}
            className="flex items-center gap-2 text-xs"
          >
            <FileText className="size-3.5" />
            <span>Delivery Logs</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => callbacks.onDuplicate(item)}
          className="flex items-center gap-2 text-xs cursor-pointer"
        >
          <Copy className="size-3.5" />
          <span>Duplicate</span>
        </DropdownMenuItem>

        {callbacks.onSync && (
          <DropdownMenuItem
            onClick={() => callbacks.onSync!(item)}
            className="flex items-center gap-2 text-xs cursor-pointer text-primary"
          >
            <RefreshCw className="size-3.5" />
            <span>Sync with Plunk</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => callbacks.onDelete(item)}
          disabled={item.status === "SENDING"}
          className="flex items-center gap-2 text-xs cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <Trash2 className="size-3.5" />
          <span>Delete Campaign</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
