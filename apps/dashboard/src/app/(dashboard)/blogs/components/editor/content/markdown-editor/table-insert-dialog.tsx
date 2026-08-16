"use client"

import * as React from "react"
import { Table, Check } from "lucide-react"
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

interface TableInsertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsert: (tableMarkdown: string) => void
}

export function TableInsertDialog({
  open,
  onOpenChange,
  onInsert,
}: TableInsertDialogProps) {
  const [rows, setRows] = React.useState("3")
  const [cols, setCols] = React.useState("3")

  const handleConfirm = () => {
    const r = parseInt(rows, 10) || 3
    const c = parseInt(cols, 10) || 3

    if (r < 1 || c < 1 || r > 20 || c > 10) {
      toast.error("Rows (1-20) and Columns (1-10) must be within valid range")
      return
    }

    // Build header row
    const headers = Array.from({ length: c }, (_, i) => `Header ${i + 1}`).join(
      " | "
    )
    const dividers = Array.from({ length: c }, () => "---").join(" | ")

    // Build data rows
    const dataRows = Array.from({ length: r }, (_, rowIdx) =>
      Array.from(
        { length: c },
        (_, colIdx) => `Data ${rowIdx + 1}.${colIdx + 1}`
      ).join(" | ")
    )
      .map((row) => `| ${row} |`)
      .join("\n")

    const tableMarkdown = `| ${headers} |\n| ${dividers} |\n${dataRows}`
    onInsert(tableMarkdown)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md gap-0 overflow-hidden border border-border/80 bg-card p-0 shadow-xl sm:min-w-[440px] md:min-w-[480px]">
        <DialogHeader className="border-b border-border/80 bg-muted/20 px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Table className="h-5 w-5 text-primary" />
            Insert Markdown Table
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure grid dimensions to generate a formatted markdown table.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Columns (1-10)
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                value={cols}
                onChange={(e) => setCols(e.target.value)}
                className="h-9 border-border/90 bg-background font-mono text-xs shadow-xs hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Rows (1-20)
              </label>
              <Input
                type="number"
                min="1"
                max="20"
                value={rows}
                onChange={(e) => setRows(e.target.value)}
                className="h-9 border-border/90 bg-background font-mono text-xs shadow-xs hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>
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
            className="h-8 gap-1.5 text-xs shadow-xs"
          >
            <Check className="h-3.5 w-3.5" /> Insert Table
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
