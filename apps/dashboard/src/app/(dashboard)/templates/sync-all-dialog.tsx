"use client"

import * as React from "react"
import {
  CheckCircle2,
  Cloud,
  CloudUpload,
  ExternalLink,
  RefreshCw,
  XCircle,
} from "lucide-react"

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

export interface SyncReport {
  total: number
  synced: number
  failed: number
  details: {
    id: string
    name: string
    plunkId?: string
    status: string
    error?: string
  }[]
}

interface SyncAllDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isSyncing: boolean
  report: SyncReport | null
  onTriggerSync: () => void
}

export function SyncAllDialog({
  open,
  onOpenChange,
  isSyncing,
  report,
  onTriggerSync,
}: SyncAllDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] border-border/80 bg-background/95 backdrop-blur-md sm:w-[90vw] sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <CloudUpload className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Plunk Cloud Synchronization
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                Push all local codebase and custom templates to your Plunk API
                instance.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {isSyncing ? (
            <div className="flex flex-col items-center justify-center space-y-3 p-8">
              <RefreshCw className="size-8 animate-spin text-primary" />
              <p className="text-sm font-semibold text-foreground">
                Synchronizing templates with Plunk API...
              </p>
              <p className="max-w-xs text-center text-xs text-muted-foreground">
                Creating new remote templates and updating existing definitions.
              </p>
            </div>
          ) : report ? (
            <div className="space-y-4">
              {/* Summary Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-center">
                  <span className="block text-[11px] font-medium text-muted-foreground">
                    Total
                  </span>
                  <span className="text-lg font-bold text-foreground">
                    {report.total}
                  </span>
                </div>
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-center">
                  <span className="block text-[11px] font-medium text-emerald-400">
                    Synced
                  </span>
                  <span className="text-lg font-bold text-emerald-400">
                    {report.synced}
                  </span>
                </div>
                <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-center">
                  <span className="block text-[11px] font-medium text-red-400">
                    Failed
                  </span>
                  <span className="text-lg font-bold text-red-400">
                    {report.failed}
                  </span>
                </div>
              </div>

              {/* Detailed Breakdown List */}
              <div className="space-y-1.5">
                <span className="block text-xs font-semibold text-foreground">
                  Synchronization Log ({report.details.length})
                </span>
                <div className="max-h-48 divide-y divide-border/40 overflow-y-auto rounded-lg border border-border/60 bg-card/60">
                  {report.details.map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className="flex items-center justify-between gap-2 p-2.5 text-xs"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        {item.status === "error" ? (
                          <XCircle className="size-3.5 shrink-0 text-destructive" />
                        ) : (
                          <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />
                        )}
                        <span className="truncate font-medium text-foreground">
                          {item.name}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`font-mono text-[10px] uppercase ${
                          item.status === "error"
                            ? "border-destructive bg-destructive/10 text-destructive"
                            : item.status === "created"
                              ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        }`}
                      >
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground">
              <p>
                Click <strong>"Start Sync"</strong> to push all local templates
                into your Plunk project. Existing templates will be updated and
                new templates will be automatically registered in Plunk.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between pt-2 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
            disabled={isSyncing}
          >
            {report ? "Close" : "Cancel"}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onTriggerSync}
            className="gap-1.5 bg-primary text-xs font-semibold text-primary-foreground"
            disabled={isSyncing}
          >
            {isSyncing ? (
              <>
                <RefreshCw className="size-3.5 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <CloudUpload className="size-3.5" />
                {report ? "Re-sync All" : "Start Sync"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
