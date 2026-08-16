"use client"

import * as React from "react"
import {
  Trash2,
  AlertTriangle,
  HardDrive,
  CheckCircle2,
  Loader2,
  Sparkles,
  ShieldCheck,
  Calendar,
} from "lucide-react"
import { MediaApi, type CleanupMediaResult } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Badge } from "@workspace/ui/components/badge"
import { toast } from "@workspace/ui/components/sonner"

interface MediaCleanupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function MediaCleanupDialog({
  open,
  onOpenChange,
  onSuccess,
}: MediaCleanupDialogProps) {
  const [cleanType, setCleanType] = React.useState<"all" | "avatars" | "blog" | "temp">("all")
  const [olderThanDays, setOlderThanDays] = React.useState<number>(1)
  const [dryRun, setDryRun] = React.useState<boolean>(true)
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false)
  const [result, setResult] = React.useState<CleanupMediaResult | null>(null)

  React.useEffect(() => {
    if (open) {
      setResult(null)
      setIsProcessing(false)
      setDryRun(true)
    }
  }, [open])

  const handleRunCleanup = async () => {
    setIsProcessing(true)
    setResult(null)
    try {
      const res = await MediaApi.cleanupOrphans({
        type: cleanType,
        olderThanDays,
        dryRun,
      })

      if (res.success && res.data) {
        setResult(res.data)
        if (!dryRun) {
          toast.success(res.data.message)
          onSuccess()
        } else {
          toast.info(res.data.message)
        }
      } else {
        toast.error(res.error || "Cleanup operation failed")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to execute cleanup")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-destructive">
            <HardDrive className="size-5" />
            Storage Cleaner & Orphan Purge
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Identify and reclaim Cloudflare R2 storage space from unreferenced avatars, temporary uploads,
            and deleted blog thumbnails.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Scan Type & Age Threshold */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Scope</Label>
              <Select
                value={cleanType}
                onValueChange={(val) => setCleanType(val as any)}
              >
                <SelectTrigger className="h-8 text-xs bg-card">
                  <SelectValue placeholder="Scope" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="all">All Media Categories</SelectItem>
                  <SelectItem value="blog">Unlinked Blog Covers</SelectItem>
                  <SelectItem value="avatars">Orphaned Avatars</SelectItem>
                  <SelectItem value="temp">Expired Temp Uploads</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <Calendar className="size-3 text-primary" /> Older Than
              </Label>
              <Select
                value={String(olderThanDays)}
                onValueChange={(val) => setOlderThanDays(Number(val))}
              >
                <SelectTrigger className="h-8 text-xs bg-card">
                  <SelectValue placeholder="Age threshold" />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  <SelectItem value="0">Any Age (0+ hours)</SelectItem>
                  <SelectItem value="1">1 Day Old</SelectItem>
                  <SelectItem value="7">7 Days Old</SelectItem>
                  <SelectItem value="30">30 Days Old</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dry Run Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-muted/20">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-primary" />
                Dry Run Simulation
              </span>
              <p className="text-[11px] text-muted-foreground">
                Safely inspect orphaned files without deleting anything.
              </p>
            </div>
            <Switch checked={dryRun} onCheckedChange={setDryRun} />
          </div>

          {/* Result Block */}
          {result && (
            <div className="p-4 rounded-xl border border-border/80 bg-card space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <Badge
                  variant={result.dryRun ? "outline" : "default"}
                  className="font-mono text-[10px]"
                >
                  {result.dryRun ? "DRY RUN REPORT" : "CLEANUP COMPLETE"}
                </Badge>
                <span className="font-mono text-xs font-semibold text-emerald-500">
                  {result.freedFormatted} reclaimable
                </span>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  Found <strong className="text-foreground">{result.count}</strong> orphaned file(s).
                </p>
                <p className="text-[11px] leading-relaxed">{result.message}</p>
              </div>

              {result.dryRun && result.count > 0 && (
                <div className="pt-2 border-t border-border/60 flex justify-end">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setDryRun(false)
                      handleRunCleanup()
                    }}
                    disabled={isProcessing}
                    className="h-8 text-xs gap-1.5"
                  >
                    <Trash2 className="size-3.5" />
                    Purge {result.count} Orphan(s) Permanently
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
            className="text-xs"
          >
            Close
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleRunCleanup}
            disabled={isProcessing}
            className="text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
          >
            {isProcessing ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Scanning...
              </>
            ) : dryRun ? (
              <>
                <Sparkles className="size-3.5" /> Run Safe Scan
              </>
            ) : (
              <>
                <Trash2 className="size-3.5" /> Execute Purge
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
