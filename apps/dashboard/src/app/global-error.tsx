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
      <body style={{ fontFamily: "sans-serif", margin: 0, padding: "2rem", display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a", color: "#f8fafc" }}>
        <div style={{ maxWidth: "28rem", width: "100%", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>System Error</h2>
          <p style={{ fontSize: "0.875rem", color: "#94a3b8", marginBottom: "1rem" }}>
            {error?.message || "An unexpected error occurred in the administrator application."}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{ padding: "0.5rem 1rem", backgroundColor: "#06b6d4", color: "#0f172a", border: "none", borderRadius: "0.375rem", fontWeight: 600, cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}

