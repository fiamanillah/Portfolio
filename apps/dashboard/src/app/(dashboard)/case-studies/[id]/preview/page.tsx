"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Edit2, ExternalLink, Loader2 } from "lucide-react"
import type { CaseStudyDTO } from "@workspace/shared"
import { CaseStudyApi } from "@/lib/api"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { FrontendCaseStudyPreview } from "../../components/preview/frontend-case-study-preview"

export default function PreviewCaseStudyPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [study, setStudy] = React.useState<CaseStudyDTO | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      if (!id) return
      setIsLoading(true)
      try {
        const res = await CaseStudyApi.getById(id)
        if (res.success && res.data) {
          setStudy(res.data)
        } else {
          toast.error(res.message || "Failed to load case study")
          router.push("/case-studies")
        }
      } catch {
        toast.error("Failed to load case study")
        router.push("/case-studies")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [id, router])

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Loading case study preview...
        </p>
      </div>
    )
  }

  if (!study) return null

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/case-studies")}
            className="h-8 px-2"
          >
            <ArrowLeft className="mr-1 size-4" /> Back to Case Studies
          </Button>

          <div className="h-4 w-px bg-border" />

          <div>
            <span className="font-mono text-xs text-muted-foreground">
              PREVIEW MODE
            </span>
            <h2 className="text-sm font-bold text-foreground line-clamp-1">
              {study.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {study.slug && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              asChild
            >
              <a
                href={`${process.env.NEXT_PUBLIC_SITE_URL || "https://fi.amanillah.com"}/case-study/${study.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="size-3.5" /> View Public
              </a>
            </Button>
          )}

          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => router.push(`/case-studies/${study.id}/edit`)}
          >
            <Edit2 className="size-3.5" /> Edit Case Study
          </Button>
        </div>
      </div>

      {/* Main Preview Container */}
      <FrontendCaseStudyPreview caseStudy={study} />
    </div>
  )
}
