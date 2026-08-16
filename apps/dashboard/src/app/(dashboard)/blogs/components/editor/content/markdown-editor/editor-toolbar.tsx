"use client"

import * as React from "react"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading2,
  Heading3,
  Heading4,
  Quote,
  List,
  ListOrdered,
  CheckSquare,
  Table as TableIcon,
  Link as LinkIcon,
  ImageIcon,
  Minus,
  Sparkles,
  Columns2,
  Edit3,
  Eye,
  ChevronDown,
  Info,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

export type EditorViewMode = "write" | "split" | "preview"

interface EditorToolbarProps {
  mode: EditorViewMode
  onModeChange: (mode: EditorViewMode) => void
  wordCount: number
  readTime: string
  onInsertSnippet: (before: string, after?: string) => void
  onOpenImageDialog: () => void
  onOpenLinkDialog: () => void
  onOpenTableDialog: () => void
}

const CODE_LANGUAGES = [
  { label: "TypeScript", lang: "typescript" },
  { label: "JavaScript", lang: "javascript" },
  { label: "Python", lang: "python" },
  { label: "Rust", lang: "rust" },
  { label: "Go", lang: "go" },
  { label: "SQL", lang: "sql" },
  { label: "Bash / Shell", lang: "bash" },
  { label: "Dockerfile", lang: "dockerfile" },
  { label: "YAML / Compose", lang: "yaml" },
  { label: "JSON", lang: "json" },
  { label: "HTML / CSS", lang: "html" },
  { label: "Plain Text", lang: "plaintext" },
]

export function EditorToolbar({
  mode,
  onModeChange,
  wordCount,
  readTime,
  onInsertSnippet,
  onOpenImageDialog,
  onOpenLinkDialog,
  onOpenTableDialog,
}: EditorToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-2.5">
      {/* Left: View Mode Switches & Format Group */}
      <div className="flex flex-wrap items-center gap-1.5">
        {/* View Mode Toggle */}
        <div className="flex items-center bg-muted/60 rounded-lg p-0.5 border border-border mr-1">
          <Button
            type="button"
            variant={mode === "write" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs px-2.5 gap-1.5"
            onClick={() => onModeChange("write")}
            title="Write Mode"
          >
            <Edit3 className="h-3.5 w-3.5" /> Write
          </Button>
          <Button
            type="button"
            variant={mode === "split" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs px-2.5 gap-1.5 hidden md:inline-flex"
            onClick={() => onModeChange("split")}
            title="Split Side-by-Side View"
          >
            <Columns2 className="h-3.5 w-3.5" /> Split View
          </Button>
          <Button
            type="button"
            variant={mode === "preview" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs px-2.5 gap-1.5"
            onClick={() => onModeChange("preview")}
            title="Rendered HTML Preview"
          >
            <Eye className="h-3.5 w-3.5" /> Preview
          </Button>
        </div>

        {mode !== "preview" && (
          <>
            {/* Heading Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold gap-1">
                  Heading <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40 text-xs">
                <DropdownMenuItem onClick={() => onInsertSnippet("## ")} className="gap-2">
                  <Heading2 className="h-4 w-4" /> Heading 2 (Section)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onInsertSnippet("### ")} className="gap-2">
                  <Heading3 className="h-4 w-4" /> Heading 3 (Subsection)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onInsertSnippet("#### ")} className="gap-2">
                  <Heading4 className="h-4 w-4" /> Heading 4 (Small)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-4 w-px bg-border mx-0.5" />

            {/* Inline Formatting */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onInsertSnippet("**", "**")}
              title="Bold (**text**)"
            >
              <Bold className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onInsertSnippet("*", "*")}
              title="Italic (*text*)"
            >
              <Italic className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onInsertSnippet("~~", "~~")}
              title="Strikethrough (~~text~~)"
            >
              <Strikethrough className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onInsertSnippet("`", "`")}
              title="Inline Code (`code`)"
            >
              <Code className="h-3.5 w-3.5" />
            </Button>

            <div className="h-4 w-px bg-border mx-0.5" />

            {/* Code Block Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-mono font-semibold gap-1">
                  {"{ }"} Code <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 text-xs max-h-64 overflow-y-auto">
                <DropdownMenuLabel className="text-[10px] uppercase font-mono text-muted-foreground">
                  Select Language Block
                </DropdownMenuLabel>
                {CODE_LANGUAGES.map((item) => (
                  <DropdownMenuItem
                    key={item.lang}
                    onClick={() => onInsertSnippet(`\`\`\`${item.lang}\n`, "\n```")}
                    className="font-mono text-xs"
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Alert Callouts Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-medium gap-1 text-primary">
                  <Sparkles className="h-3 w-3" /> Callout <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 text-xs">
                <DropdownMenuLabel className="text-[10px] uppercase font-mono text-muted-foreground">
                  GitHub Alert Callouts
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => onInsertSnippet("> [!NOTE]\n> ")}
                  className="gap-2 text-sky-400"
                >
                  <Info className="h-3.5 w-3.5" /> [!NOTE] Informational
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onInsertSnippet("> [!TIP]\n> ")}
                  className="gap-2 text-emerald-400"
                >
                  <Lightbulb className="h-3.5 w-3.5" /> [!TIP] Pro Tip
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onInsertSnippet("> [!IMPORTANT]\n> ")}
                  className="gap-2 text-violet-400"
                >
                  <ShieldAlert className="h-3.5 w-3.5" /> [!IMPORTANT] Essential
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onInsertSnippet("> [!WARNING]\n> ")}
                  className="gap-2 text-amber-400"
                >
                  <AlertTriangle className="h-3.5 w-3.5" /> [!WARNING] Warning
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onInsertSnippet("> [!CAUTION]\n> ")}
                  className="gap-2 text-rose-400"
                >
                  <AlertTriangle className="h-3.5 w-3.5" /> [!CAUTION] Caution
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-4 w-px bg-border mx-0.5" />

            {/* Lists & Quotes */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onInsertSnippet("- ")}
              title="Bullet List"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onInsertSnippet("1. ")}
              title="Numbered List"
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onInsertSnippet("- [ ] ")}
              title="Task Checklist"
            >
              <CheckSquare className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onInsertSnippet("> ")}
              title="Blockquote"
            >
              <Quote className="h-3.5 w-3.5" />
            </Button>

            <div className="h-4 w-px bg-border mx-0.5" />

            {/* Media, Links & Tables */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1.5 text-primary hover:bg-primary/10"
              onClick={onOpenImageDialog}
              title="Insert Photo / Diagram"
            >
              <ImageIcon className="h-3.5 w-3.5" /> Photo
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onOpenLinkDialog}
              title="Insert Link"
            >
              <LinkIcon className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onOpenTableDialog}
              title="Insert Table"
            >
              <TableIcon className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onInsertSnippet("\n---\n\n")}
              title="Horizontal Divider"
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>

      {/* Right: Live Word Count & Reading Time Meter */}
      <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground shrink-0">
        <span className="font-semibold text-foreground">{wordCount} words</span>
        <span>•</span>
        <span className="text-primary font-medium">{readTime}</span>
      </div>
    </div>
  )
}
