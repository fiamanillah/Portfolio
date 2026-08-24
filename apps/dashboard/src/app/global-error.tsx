"use client"

import * as React from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <h2 className="text-xl font-bold tracking-tight">System Error</h2>
          <p className="text-xs text-muted-foreground">
            {error?.message || "An unexpected error occurred in the administrator application."}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 cursor-pointer"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
