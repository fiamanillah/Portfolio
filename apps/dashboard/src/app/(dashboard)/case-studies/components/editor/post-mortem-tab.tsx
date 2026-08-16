"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import type { PostMortemSection, PostMortemEntry } from "@workspace/shared"
import { PostMortemPresetsBar } from "./post-mortem/post-mortem-presets-bar"
import { PostMortemSectionCard } from "./post-mortem/post-mortem-section-card"

interface PostMortemTabProps {
  postMortem: PostMortemSection[]
  setPostMortem: (pm: PostMortemSection[]) => void
}

export function PostMortemTab({
  postMortem,
  setPostMortem,
}: PostMortemTabProps) {
  const handleAddSection = (preset?: PostMortemSection) => {
    setPostMortem([
      ...postMortem,
      preset || {
        title: "Technical Challenges",
        entries: [
          {
            heading: "Challenge Name",
            detail: "Explain the architectural challenge and how it was resolved.",
          },
        ],
      },
    ])
  }

  const handleUpdateSectionTitle = (index: number, title: string) => {
    const updated = [...postMortem]
    updated[index] = { ...updated[index], title }
    setPostMortem(updated)
  }

  const handleRemoveSection = (index: number) => {
    setPostMortem(postMortem.filter((_, i) => i !== index))
  }

  const handleAddEntryToSection = (sectionIndex: number) => {
    const updated = [...postMortem]
    updated[sectionIndex].entries = [
      ...(updated[sectionIndex].entries || []),
      {
        heading: "New Insight / Resolution",
        detail: "Describe the engineering lesson or implementation detail...",
      },
    ]
    setPostMortem(updated)
  }

  const handleUpdateEntry = (
    sectionIndex: number,
    entryIndex: number,
    field: keyof PostMortemEntry,
    value: string
  ) => {
    const updated = [...postMortem]
    const entries = [...(updated[sectionIndex].entries || [])]
    entries[entryIndex] = { ...entries[entryIndex], [field]: value }
    updated[sectionIndex].entries = entries
    setPostMortem(updated)
  }

  const handleRemoveEntry = (sectionIndex: number, entryIndex: number) => {
    const updated = [...postMortem]
    updated[sectionIndex].entries = updated[sectionIndex].entries.filter(
      (_, i) => i !== entryIndex
    )
    setPostMortem(updated)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-base font-bold">
            Section 05: Architectural Post-Mortem ({postMortem.length})
          </CardTitle>
          <CardDescription className="text-xs">
            Reflections, technical challenges faced during production, and architectural lessons learned.
          </CardDescription>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => handleAddSection()}
          className="h-8 gap-1 text-xs"
        >
          <Plus className="size-3.5" /> Add Section
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <PostMortemPresetsBar onAddSection={handleAddSection} />

        <div className="space-y-4">
          {postMortem.map((section, sectionIndex) => (
            <PostMortemSectionCard
              key={sectionIndex}
              section={section}
              index={sectionIndex}
              onUpdateTitle={(title) =>
                handleUpdateSectionTitle(sectionIndex, title)
              }
              onRemoveSection={() => handleRemoveSection(sectionIndex)}
              onAddEntry={() => handleAddEntryToSection(sectionIndex)}
              onUpdateEntry={(entryIdx, field, val) =>
                handleUpdateEntry(sectionIndex, entryIdx, field, val)
              }
              onRemoveEntry={(entryIdx) =>
                handleRemoveEntry(sectionIndex, entryIdx)
              }
            />
          ))}
        </div>

        {!postMortem.length && (
          <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border text-center">
            <p className="text-xs text-muted-foreground">
              No post-mortem sections added. Click "Add Section" or use quick presets above.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
