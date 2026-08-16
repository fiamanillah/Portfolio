"use client"

import * as React from "react"
import { Link as LinkIcon, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { toast } from "@workspace/ui/components/sonner"

interface LinkInsertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsert: (anchor: string, url: string) => void
}

export function LinkInsertDialog({
  open,
  onOpenChange,
  onInsert,
}: LinkInsertDialogProps) {
  const [anchor, setAnchor] = React.useState("")
  const [url, setUrl] = React.useState("")

  React.useEffect(() => {
    if (open) {
      setAnchor("")
      setUrl("")
    }
  }, [open])

  const handleConfirm = () => {
    if (!url.trim()) {
      toast.error("Please enter a destination URL")
      return
    }
    const cleanAnchor = anchor.trim() || url.trim()
    onInsert(cleanAnchor, url.trim())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg gap-0 overflow-hidden border border-border/80 bg-card p-0 shadow-xl sm:min-w-[480px] md:min-w-[540px]">
        <DialogHeader className="border-b border-border/80 bg-muted/20 px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <LinkIcon className="h-5 w-5 text-primary" />
            Insert Hyperlink
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Create an inline markdown hyperlink to an internal page or external
            resource.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Anchor Text (Display Label)
            </label>
            <Input
              placeholder="e.g. Read the Redis documentation"
              value={anchor}
              onChange={(e) => setAnchor(e.target.value)}
              className="h-9 border-border/90 bg-background text-xs shadow-xs hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              Destination URL *
            </label>
            <Input
              placeholder="https://redis.io/docs/ or /blog/another-post"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-9 border-border/90 bg-background font-mono text-xs shadow-xs hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleConfirm()
                }
              }}
            />
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between border-t border-border/80 bg-muted/20 px-6 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 bg-background text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            disabled={!url.trim()}
            className="h-8 gap-1.5 text-xs shadow-xs"
          >
            <Check className="h-3.5 w-3.5" /> Insert Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
