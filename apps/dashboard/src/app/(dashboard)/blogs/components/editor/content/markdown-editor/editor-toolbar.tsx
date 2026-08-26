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
    <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-border/80 bg-muted/40 px-3 py-1.5">
      {/* Left: View Mode Switches & Format Controls */}
      <div className="flex flex-wrap items-center gap-1">
        {/* View Mode Switcher */}
        <div className="flex items-center rounded-md border border-border/80 bg-background p-0.5 shadow-2xs mr-1">
          <Button
            type="button"
            variant={mode === "write" ? "secondary" : "ghost"}
            size="sm"
            className="h-6.5 gap-1 px-2 text-[11px] font-medium"
            onClick={() => onModeChange("write")}
            title="Write Mode"
          >
            <Edit3 className="h-3 w-3" /> Write
          </Button>
          <Button
            type="button"
            variant={mode === "split" ? "secondary" : "ghost"}
            size="sm"
            className="hidden h-6.5 gap-1 px-2 text-[11px] font-medium md:inline-flex"
            onClick={() => onModeChange("split")}
            title="Split Side-by-Side View"
          >
            <Columns2 className="h-3 w-3" /> Split
          </Button>
          <Button
            type="button"
            variant={mode === "preview" ? "secondary" : "ghost"}
            size="sm"
            className="h-6.5 gap-1 px-2 text-[11px] font-medium"
            onClick={() => onModeChange("preview")}
            title="Rendered HTML Preview"
          >
            <Eye className="h-3 w-3" /> Preview
          </Button>
        </div>

        {mode !== "preview" && (
          <>
            {/* Heading Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6.5 gap-1 px-1.5 text-[11px] font-medium"
                >
                  Heading <ChevronDown className="h-2.5 w-2.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-38 text-xs">
                <DropdownMenuItem
                  onClick={() => onInsertSnippet("## ")}
                  className="gap-2 text-xs"
                >
                  <Heading2 className="h-3.5 w-3.5" /> Heading 2 (H2)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onInsertSnippet("### ")}
                  className="gap-2 text-xs"
                >
                  <Heading3 className="h-3.5 w-3.5" /> Heading 3 (H3)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onInsertSnippet("#### ")}
                  className="gap-2 text-xs"
                >
                  <Heading4 className="h-3.5 w-3.5" /> Heading 4 (H4)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="mx-0.5 h-3.5 w-px bg-border/80" />

            {/* Inline Formatting */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6.5 w-6.5"
              onClick={() => onInsertSnippet("**", "**")}
              title="Bold (**text**)"
            >
              <Bold className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6.5 w-6.5"
              onClick={() => onInsertSnippet("*", "*")}
              title="Italic (*text*)"
            >
              <Italic className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6.5 w-6.5"
              onClick={() => onInsertSnippet("~~", "~~")}
              title="Strikethrough (~~text~~)"
            >
              <Strikethrough className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6.5 w-6.5"
              onClick={() => onInsertSnippet("`", "`")}
              title="Inline Code (`code`)"
            >
              <Code className="h-3 w-3" />
            </Button>

            <div className="mx-0.5 h-3.5 w-px bg-border/80" />

            {/* Code Block Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6.5 gap-1 px-1.5 font-mono text-[11px]"
                >
                  {"{ }"} Code <ChevronDown className="h-2.5 w-2.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="max-h-60 w-44 overflow-y-auto text-xs"
              >
                <DropdownMenuLabel className="font-mono text-[10px] text-muted-foreground uppercase">
                  Code Block
                </DropdownMenuLabel>
                {CODE_LANGUAGES.map((item) => (
                  <DropdownMenuItem
                    key={item.lang}
                    onClick={() =>
                      onInsertSnippet(`\`\`\`${item.lang}\n`, "\n```")
                    }
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6.5 gap-1 px-1.5 text-[11px] font-medium text-primary"
                >
                  <Sparkles className="h-3 w-3" /> Callout{" "}
                  <ChevronDown className="h-2.5 w-2.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44 text-xs">
                <DropdownMenuLabel className="font-mono text-[10px] text-muted-foreground uppercase">
                  Alert Callouts
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => onInsertSnippet("> [!NOTE]\n> ")}
                  className="gap-2 text-sky-400 text-xs"
                >
                  <Info className="h-3.5 w-3.5" /> [!NOTE] Info
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onInsertSnippet("> [!TIP]\n> ")}
                  className="gap-2 text-emerald-400 text-xs"
                >
                  <Lightbulb className="h-3.5 w-3.5" /> [!TIP] Tip
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onInsertSnippet("> [!IMPORTANT]\n> ")}
                  className="gap-2 text-violet-400 text-xs"
                >
                  <ShieldAlert className="h-3.5 w-3.5" /> [!IMPORTANT]
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onInsertSnippet("> [!WARNING]\n> ")}
                  className="gap-2 text-amber-400 text-xs"
                >
                  <AlertTriangle className="h-3.5 w-3.5" /> [!WARNING]
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onInsertSnippet("> [!CAUTION]\n> ")}
                  className="gap-2 text-rose-400 text-xs"
                >
                  <AlertTriangle className="h-3.5 w-3.5" /> [!CAUTION]
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="mx-0.5 h-3.5 w-px bg-border/80" />

            {/* Lists & Quotes */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6.5 w-6.5"
              onClick={() => onInsertSnippet("- ")}
              title="Bullet List"
            >
              <List className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6.5 w-6.5"
              onClick={() => onInsertSnippet("1. ")}
              title="Numbered List"
            >
              <ListOrdered className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6.5 w-6.5"
              onClick={() => onInsertSnippet("- [ ] ")}
              title="Task Checklist"
            >
              <CheckSquare className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6.5 w-6.5"
              onClick={() => onInsertSnippet("> ")}
              title="Blockquote"
            >
              <Quote className="h-3 w-3" />
            </Button>

            <div className="mx-0.5 h-3.5 w-px bg-border/80" />

            {/* Media, Links & Tables */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6.5 gap-1 px-1.5 text-[11px] text-primary hover:bg-primary/10"
              onClick={onOpenImageDialog}
              title="Insert Image"
            >
              <ImageIcon className="h-3 w-3" /> Photo
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6.5 w-6.5"
              onClick={onOpenLinkDialog}
              title="Insert Link"
            >
              <LinkIcon className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6.5 w-6.5"
              onClick={onOpenTableDialog}
              title="Insert Table"
            >
              <TableIcon className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6.5 w-6.5"
              onClick={() => onInsertSnippet("\n---\n\n")}
              title="Divider"
            >
              <Minus className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>

      {/* Right: Live Word Count & Reading Time Meter */}
      <div className="flex shrink-0 items-center gap-2 font-mono text-[11px] text-muted-foreground">
        <span className="font-semibold text-foreground">{wordCount} words</span>
        <span>•</span>
        <span className="font-medium text-primary">{readTime}</span>
      </div>
    </div>
  )
}
