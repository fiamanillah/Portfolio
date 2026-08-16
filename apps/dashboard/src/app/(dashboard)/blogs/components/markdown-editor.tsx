"use client"

import * as React from "react"
import {
  Edit3,
  Eye,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Code,
  Quote,
  List,
  Table as TableIcon,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  wordCount: number
  readTime: string
}

export function MarkdownEditor({
  value,
  onChange,
  wordCount,
  readTime,
}: MarkdownEditorProps) {
  const [mode, setMode] = React.useState<"write" | "preview">("write")

  const insertSnippet = (before: string, after: string = "") => {
    const textarea = document.getElementById("content-editor-textarea") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const replacement = `${before}${selectedText || "text"}${after}`

    const newContent = value.substring(0, start) + replacement + value.substring(end)
    onChange(newContent)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + (selectedText.length || 4))
    }, 50)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Article Markdown Content *
          </label>
          <div className="flex items-center bg-muted/60 rounded-md p-0.5 border border-border">
            <Button
              type="button"
              variant={mode === "write" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => setMode("write")}
            >
              <Edit3 className="h-3 w-3 mr-1" /> Write
            </Button>
            <Button
              type="button"
              variant={mode === "preview" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs px-2.5"
              onClick={() => setMode("preview")}
            >
              <Eye className="h-3 w-3 mr-1" /> Preview
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{readTime}</span>
        </div>
      </div>

      {mode === "write" && (
        <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-lg border border-border/80 bg-muted/30 text-muted-foreground">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => insertSnippet("## ")}
            title="Heading 2"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => insertSnippet("### ")}
            title="Heading 3"
          >
            <Heading3 className="h-3.5 w-3.5" />
          </Button>
          <div className="h-4 w-[1px] bg-border mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => insertSnippet("**", "**")}
            title="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => insertSnippet("*", "*")}
            title="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => insertSnippet("`", "`")}
            title="Inline Code"
          >
            <Code className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => insertSnippet("```typescript\n", "\n```")}
            title="Code Block"
          >
            <span className="font-mono text-[10px] font-bold">{"{ }"}</span>
          </Button>
          <div className="h-4 w-[1px] bg-border mx-1" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => insertSnippet("> ")}
            title="Blockquote"
          >
            <Quote className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => insertSnippet("- ")}
            title="Bullet List"
          >
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() =>
              insertSnippet(
                "\n| Column 1 | Column 2 | Column 3 |\n| :--- | :--- | :--- |\n| Data A | Data B | Data C |\n"
              )
            }
            title="Table"
          >
            <TableIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {mode === "write" ? (
        <Textarea
          id="content-editor-textarea"
          placeholder="Write your article in Markdown with code blocks, headings, and explanations..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={20}
          className="font-mono text-sm leading-relaxed bg-card"
          required
        />
      ) : (
        <div className="p-5 rounded-lg border border-border bg-card min-h-[400px] max-h-[600px] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed">
          {value || <span className="text-muted-foreground italic">No content to preview...</span>}
        </div>
      )}
    </div>
  )
}
