"use client"

import * as React from "react"
import { CaseStudyEditorForm } from "../components/editor/case-study-editor-form"

export default function CreateCaseStudyPage() {
  return (
    <div className="space-y-6">
      <CaseStudyEditorForm isEdit={false} onSuccessRedirect="/case-studies" />
    </div>
  )
}
