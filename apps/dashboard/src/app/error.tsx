"use client"

import * as React from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("Dashboard error:", error)
  }, [error])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto max-w-md space-y-4 rounded-xl border border-destructive/30 bg-destructive/5 p-6 shadow-xs">
        <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-foreground">
            Something went wrong
          </h2>
          <p className="text-xs text-muted-foreground">
            {error?.message || "An unexpected error occurred in the dashboard."}
          </p>
        </div>
        <Button
          onClick={() => reset()}
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Try Again
        </Button>
      </div>
    </div>
  )
}
