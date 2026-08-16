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
      <DialogContent className="w-[96vw] sm:w-[90vw] sm:max-w-xl border-border/80 bg-background/95 backdrop-blur-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CloudUpload className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Plunk Cloud Synchronization
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Push all local codebase and custom templates to your Plunk API instance.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {isSyncing ? (
            <div className="flex flex-col items-center justify-center p-8 space-y-3">
              <RefreshCw className="size-8 text-primary animate-spin" />
              <p className="text-sm font-semibold text-foreground">
                Synchronizing templates with Plunk API...
              </p>
              <p className="text-xs text-muted-foreground text-center max-w-xs">
                Creating new remote templates and updating existing definitions.
              </p>
            </div>
          ) : report ? (
            <div className="space-y-4">
              {/* Summary Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border border-border/60 bg-muted/20 text-center">
                  <span className="text-[11px] text-muted-foreground font-medium block">
                    Total
                  </span>
                  <span className="text-lg font-bold text-foreground">
                    {report.total}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-center">
                  <span className="text-[11px] text-emerald-400 font-medium block">
                    Synced
                  </span>
                  <span className="text-lg font-bold text-emerald-400">
                    {report.synced}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/5 text-center">
                  <span className="text-[11px] text-red-400 font-medium block">
                    Failed
                  </span>
                  <span className="text-lg font-bold text-red-400">
                    {report.failed}
                  </span>
                </div>
              </div>

              {/* Detailed Breakdown List */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-foreground block">
                  Synchronization Log ({report.details.length})
                </span>
                <div className="max-h-48 overflow-y-auto rounded-lg border border-border/60 bg-card/60 divide-y divide-border/40">
                  {report.details.map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className="p-2.5 flex items-center justify-between text-xs gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {item.status === "error" ? (
                          <XCircle className="size-3.5 text-destructive shrink-0" />
                        ) : (
                          <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                        )}
                        <span className="font-medium text-foreground truncate">
                          {item.name}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-mono ${
                          item.status === "error"
                            ? "border-destructive text-destructive bg-destructive/10"
                            : item.status === "created"
                            ? "border-blue-500/30 text-blue-400 bg-blue-500/10"
                            : "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
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
            <div className="p-4 rounded-lg border border-border/60 bg-muted/20 space-y-2 text-xs text-muted-foreground">
              <p>
                Click <strong>"Start Sync"</strong> to push all local templates into your Plunk project. Existing templates will be updated and new templates will be automatically registered in Plunk.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2 flex items-center justify-between sm:justify-between">
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
            className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
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
