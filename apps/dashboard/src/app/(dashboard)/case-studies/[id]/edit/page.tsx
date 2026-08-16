"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import type { CaseStudyDTO } from "@workspace/shared"
import { CaseStudyApi } from "@/lib/api"
import { toast } from "@workspace/ui/components/sonner"
import { CaseStudyEditorForm } from "../../components/editor/case-study-editor-form"

export default function EditCaseStudyPage() {
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
          Loading case study data...
        </p>
      </div>
    )
  }

  if (!study) return null

  return (
    <div className="space-y-6">
      <CaseStudyEditorForm
        initialStudy={study}
        isEdit={true}
        onSuccessRedirect="/case-studies"
      />
    </div>
  )
}
