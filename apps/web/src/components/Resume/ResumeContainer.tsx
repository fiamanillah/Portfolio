"use client"

import * as React from "react"
import { ResumeApi, type ResumeVersionData } from "@/lib/api/resumeApi"

function formatBytes(bytes: number) {
  if (!bytes || bytes === 0) return "PDF Document"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "Recently Released"
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return "Recently Released"
  }
}

interface ResumeContainerProps {
  initialResume?: ResumeVersionData | null
}

export function ResumeContainer({ initialResume = null }: ResumeContainerProps) {
  const [resume, setResume] = React.useState<ResumeVersionData | null>(initialResume)
  const [isLoading, setIsLoading] = React.useState<boolean>(!initialResume)

  // Fetch freshest active resume on client mount
  React.useEffect(() => {
    let isMounted = true

    async function loadActiveResume() {
      try {
        const active = await ResumeApi.fetchActiveResume()
        if (isMounted) {
          if (active) {
            setResume(active)
          }
          setIsLoading(false)
        }
      } catch {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadActiveResume()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="w-full">
      {/* Dynamic Stats Grid & Action Buttons (Hero Bottom) */}
      {resume ? (
        <div className="mb-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-border/70 bg-card/60 backdrop-blur-sm">
            <div className="group relative flex flex-col items-center justify-center border-r border-b sm:border-b-0 border-border/70 p-5 sm:p-7 transition-colors duration-200 hover:bg-primary/5">
              <span className="font-mono text-2xl font-black text-primary sm:text-3xl">
                {resume.version}
              </span>
              <span className="mt-1.5 font-mono text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase sm:text-xs">
                Active Version
              </span>
            </div>

            <div className="group relative flex flex-col items-center justify-center sm:border-r border-b sm:border-b-0 border-border/70 p-5 sm:p-7 transition-colors duration-200 hover:bg-primary/5">
              <span className="font-mono text-2xl font-black text-primary sm:text-3xl">
                {formatBytes(resume.fileSize)}
              </span>
              <span className="mt-1.5 font-mono text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase sm:text-xs">
                Document Size
              </span>
            </div>

            <div className="group relative flex flex-col items-center justify-center border-r border-border/70 p-5 sm:p-7 transition-colors duration-200 hover:bg-primary/5">
              <span className="font-mono text-2xl font-black text-primary sm:text-3xl">
                {formatDate(resume.updatedAt)}
              </span>
              <span className="mt-1.5 font-mono text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase sm:text-xs">
                Last Updated
              </span>
            </div>

            <div className="group relative flex flex-col items-center justify-center p-5 sm:p-7 transition-colors duration-200 hover:bg-primary/5">
              <span className="font-mono text-2xl font-black text-primary sm:text-3xl">
                {resume.downloadCount}
              </span>
              <span className="mt-1.5 font-mono text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase sm:text-xs">
                Downloads
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={resume.downloadEndpoint}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-md border-2 border-primary bg-primary px-6 py-3 text-xs font-bold tracking-widest text-primary-foreground uppercase shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:shadow-primary/30 active:scale-98"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-4 transition-transform duration-200 group-hover:translate-y-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Download PDF Version</span>
            </a>

            {resume.fileUrl && (
              <a
                href={resume.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-3 text-xs font-bold tracking-wider text-foreground uppercase transition-all duration-200 hover:border-primary hover:text-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                <span>Open in New Tab</span>
              </a>
            )}

            <a
              href="/#contact"
              className="group inline-flex items-center gap-2 rounded-md border border-border/80 bg-background/50 px-5 py-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase transition-all duration-200 hover:border-primary hover:text-foreground"
            >
              <span>Hire / Get in Touch →</span>
            </a>
          </div>
        </div>
      ) : isLoading ? (
        /* Loading Skeleton */
        <div className="mb-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-border/70 bg-card/40 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center p-6 border-r last:border-r-0 border-border/70 space-y-2"
              >
                <div className="h-8 w-16 bg-muted/60 rounded"></div>
                <div className="h-3 w-24 bg-muted/40 rounded"></div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center gap-3">
            <div className="h-10 w-44 bg-muted/60 rounded-md animate-pulse"></div>
            <div className="h-10 w-36 bg-muted/40 rounded-md animate-pulse"></div>
          </div>
        </div>
      ) : null}

      {/* Main Document Showcase or Fallback */}
      {resume?.fileUrl ? (
        <div className="space-y-8">
          {/* Document Frame Window */}
          <div className="relative overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xl backdrop-blur-md">
            {/* Window Titlebar */}
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="size-3 rounded-full bg-rose-500/80"></div>
                  <div className="size-3 rounded-full bg-amber-500/80"></div>
                  <div className="size-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <div className="hidden sm:block h-3.5 w-px bg-border"></div>
                <span className="font-mono text-xs font-medium text-foreground truncate max-w-[200px] sm:max-w-md">
                  {resume.fileName}
                </span>
                <span className="hidden sm:inline-flex rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">
                  {resume.version}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={resume.downloadEndpoint}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-mono text-xs font-semibold text-primary transition hover:underline"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Quick Download</span>
                </a>
              </div>
            </div>

            {/* PDF Viewer Iframe */}
            <div className="relative w-full bg-background/50">
              <iframe
                src={`${resume.fileUrl}#toolbar=1&navpanes=0`}
                className="h-[850px] w-full border-0 sm:h-[950px]"
                title="Fi Amanillah Resume Document Viewer"
              />
            </div>
          </div>

          {/* Document Version Notes / Changelog */}
          {resume.description && (
            <div className="rounded-xl border border-border/70 bg-card/60 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs text-primary">// VERSION_NOTES</span>
                <span className="text-xs font-bold text-foreground">{resume.version}</span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                {resume.description}
              </p>
            </div>
          )}
        </div>
      ) : isLoading ? (
        /* Loading Document Frame */
        <div className="rounded-xl border border-border/80 bg-card/40 h-[600px] flex flex-col items-center justify-center animate-pulse">
          <div className="size-10 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4"></div>
          <p className="font-mono text-xs text-muted-foreground">Loading verified curriculum vitae...</p>
        </div>
      ) : (
        /* Fallback State if No Active Resume Uploaded */
        <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border bg-card/70 p-10 text-center backdrop-blur-md">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
          </div>

          <p className="mt-4 font-mono text-xs text-primary">// REPOSITORY_EMPTY</p>
          <h2 className="mt-1 text-xl font-bold text-foreground">
            Resume Being Prepared
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-muted-foreground max-w-md mx-auto">
            The curriculum vitae document is currently being updated in the admin repository. In the meantime, you can explore my verified case studies or reach out directly.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/#about"
              className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
            >
              <span>Explore Track Record</span>
            </a>
            <a
              href="/case-study"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary"
            >
              <span>Case Studies</span>
            </a>
            <a
              href="/#contact"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary"
            >
              <span>Contact Directly →</span>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
