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
    const headers = Array.from({ length: c }, (_, i) => `Header ${i + 1}`).join(" | ")
    const dividers = Array.from({ length: c }, () => "---").join(" | ")

    // Build data rows
    const dataRows = Array.from({ length: r }, (_, rowIdx) =>
      Array.from({ length: c }, (_, colIdx) => `Data ${rowIdx + 1}.${colIdx + 1}`).join(" | ")
    ).map((row) => `| ${row} |`).join("\n")

    const tableMarkdown = `| ${headers} |\n| ${dividers} |\n${dataRows}`
    onInsert(tableMarkdown)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:min-w-[440px] md:min-w-[480px] max-w-md bg-card border border-border/80 p-0 overflow-hidden shadow-xl gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border/80 bg-muted/20">
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Table className="h-5 w-5 text-primary" />
            Insert Markdown Table
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure grid dimensions to generate a formatted markdown table.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Columns (1-10)
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                value={cols}
                onChange={(e) => setCols(e.target.value)}
                className="text-xs h-9 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Rows (1-20)
              </label>
              <Input
                type="number"
                min="1"
                max="20"
                value={rows}
                onChange={(e) => setRows(e.target.value)}
                className="text-xs h-9 bg-background border-border/90 hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-xs font-mono"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-3 border-t border-border/80 bg-muted/20 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8 bg-background"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            className="text-xs h-8 gap-1.5 shadow-xs"
          >
            <Check className="h-3.5 w-3.5" /> Insert Table
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
