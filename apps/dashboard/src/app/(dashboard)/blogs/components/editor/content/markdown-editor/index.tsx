"use client"

import * as React from "react"
import { EditorToolbar, type EditorViewMode } from "./editor-toolbar"
import { MarkdownPreview } from "./markdown-preview"
import { ImageInsertDialog } from "./image-insert-dialog"
import { LinkInsertDialog } from "./link-insert-dialog"
import { TableInsertDialog } from "./table-insert-dialog"

interface MarkdownEditorProps {
  value: string
  onChange: (val: string) => void
  wordCount: number
  readTime: string
}

export function MarkdownEditor({
  value,
  onChange,
  wordCount,
  readTime,
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = React.useState<EditorViewMode>("write")
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // Dialog triggers
  const [isImageOpen, setIsImageOpen] = React.useState(false)
  const [isLinkOpen, setIsLinkOpen] = React.useState(false)
  const [isTableOpen, setIsTableOpen] = React.useState(false)

  const insertTextAtCursor = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    const replacement = `${prefix}${selectedText}${suffix}`
    const newValue =
      value.substring(0, start) + replacement + value.substring(end)

    onChange(newValue)

    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + prefix.length + selectedText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 10)
  }

  const handleInsertImage = (markdownSnippet: string) => {
    insertTextAtCursor(`\n${markdownSnippet}\n\n`)
  }

  const handleInsertLink = (anchor: string, url: string) => {
    insertTextAtCursor(`[${anchor}](${url})`)
  }

  const handleInsertTable = (markdownTable: string) => {
    insertTextAtCursor(`\n${markdownTable}\n\n`)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-background shadow-2xs">
      {/* Seamless Top Toolbar */}
      <EditorToolbar
        mode={viewMode}
        onModeChange={setViewMode}
        wordCount={wordCount}
        readTime={readTime}
        onInsertSnippet={insertTextAtCursor}
        onOpenImageDialog={() => setIsImageOpen(true)}
        onOpenLinkDialog={() => setIsLinkOpen(true)}
        onOpenTableDialog={() => setIsTableOpen(true)}
      />

      {/* Editor Main Canvas (Clean, single surface, no nested boxes) */}
      <div className="relative">
        {viewMode === "write" && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={18}
            placeholder="Write article in GitHub-flavored markdown with ```code, > [!NOTE], and ![images]..."
            className="w-full resize-y bg-transparent p-4 sm:p-5 font-mono text-sm leading-relaxed text-foreground outline-none border-0 focus:ring-0 focus:outline-none placeholder:text-muted-foreground/50 min-h-[400px]"
          />
        )}

        {viewMode === "split" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/80">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={20}
              placeholder="Write article in GitHub-flavored markdown..."
              className="w-full resize-none bg-transparent p-4 sm:p-5 font-mono text-sm leading-relaxed text-foreground outline-none border-0 focus:ring-0 focus:outline-none placeholder:text-muted-foreground/50 min-h-[440px]"
            />
            <div className="p-4 sm:p-5 max-h-[550px] overflow-y-auto bg-muted/10">
              <MarkdownPreview content={value} />
            </div>
          </div>
        )}

        {viewMode === "preview" && (
          <div className="p-5 sm:p-6 min-h-[400px]">
            <MarkdownPreview content={value} />
          </div>
        )}
      </div>

      {/* Insert Dialogs */}
      <ImageInsertDialog
        open={isImageOpen}
        onOpenChange={setIsImageOpen}
        onInsert={handleInsertImage}
      />
      <LinkInsertDialog
        open={isLinkOpen}
        onOpenChange={setIsLinkOpen}
        onInsert={handleInsertLink}
      />
      <TableInsertDialog
        open={isTableOpen}
        onOpenChange={setIsTableOpen}
        onInsert={handleInsertTable}
      />
    </div>
  )
}
