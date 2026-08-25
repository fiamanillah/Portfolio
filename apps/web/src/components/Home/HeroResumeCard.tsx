"use client"

import * as React from "react"
import { ResumeApi } from "@/lib/api/resumeApi"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpRight03Icon } from "@hugeicons/core-free-icons"

interface HeroResumeCardProps {
  initialResumeUrl?: string | null
  initialDownloadUrl?: string
  initialVersion?: string
}

export function HeroResumeCard({
  initialResumeUrl = null,
  initialDownloadUrl = "/resume",
  initialVersion,
}: HeroResumeCardProps) {
  const [resumeUrl, setResumeUrl] = React.useState<string | null>(
    initialResumeUrl
  )
  const [downloadUrl, setDownloadUrl] =
    React.useState<string>(initialDownloadUrl)
  const [version, setVersion] = React.useState<string | undefined>(
    initialVersion
  )

  React.useEffect(() => {
    // If SSR/build-time data was already supplied, do not refetch over network
    if (initialResumeUrl || initialVersion) return

    let isMounted = true

    async function loadResume() {
      try {
        const data = await ResumeApi.fetchPublicResume()
        if (isMounted) {
          setResumeUrl(data.resumeUrl)
          setDownloadUrl(data.downloadUrl || "/resume")
          setVersion(data.version)
        }
      } catch {
        // Fallback gracefully to default
      }
    }

    loadResume()

    return () => {
      isMounted = false
    }
  }, [initialResumeUrl, initialVersion])

  return (
    <div className="w-full max-w-md space-y-3.5">
      <div className="flex items-center justify-start gap-3 lg:justify-end">
        <div className="h-px w-12 bg-border"></div>
        <span className="font-mono text-xs tracking-[0.1em] whitespace-nowrap text-muted-foreground uppercase">
          Curriculum Vitae
        </span>
      </div>

      <p className="text-left text-xs leading-relaxed text-muted-foreground lg:text-right">
        Download my official resume and verified engineering track record:
      </p>

      {/* Resume Download Card */}
      <a
        href={downloadUrl}
        target={resumeUrl ? "_blank" : undefined}
        download={resumeUrl ? true : undefined}
        className="group relative flex items-center justify-between border border-border bg-background/40 p-3.5 px-4 font-mono text-sm backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:bg-background/60 focus:ring-2 focus:ring-primary/30 focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center border border-border bg-background/80 text-primary transition-all duration-300 group-hover:scale-105 group-hover:border-primary/40 group-hover:bg-primary group-hover:text-primary-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-4.5 transition-transform duration-300 group-hover:translate-y-0.5"
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
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-foreground uppercase transition-colors group-hover:text-primary">
                Download Resume (PDF)
              </span>
              {version && (
                <span className="py-0.2 rounded bg-primary/10 px-1 font-mono text-[9px] font-semibold text-primary">
                  {version}
                </span>
              )}
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">
              {resumeUrl
                ? "Direct Download · Verified Build"
                : "Interactive View & Download"}
            </span>
          </div>
        </div>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-background/80 text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:border-primary/40 group-hover:text-primary">
          <HugeiconsIcon
            icon={ArrowUpRight03Icon}
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>
      </a>

      <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground/50 uppercase">
        <span>📄 Updated for 2026</span>
        <a
          href="/resume"
          className="transition-colors hover:text-primary hover:underline"
        >
          Interactive CV Page →
        </a>
      </div>
    </div>
  )
}
