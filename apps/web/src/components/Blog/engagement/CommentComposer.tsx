import { useState, useRef } from "react"
import { useAuthSession } from "@/lib/authStore"
import { Button } from "@workspace/ui/components/button"
import { Textarea } from "@workspace/ui/components/textarea"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CodeIcon,
  QuoteDownIcon,
  Login01Icon,
  ArrowTurnBackwardIcon,
} from "@hugeicons/core-free-icons"
import { toast } from "@workspace/ui/components/sonner"

interface CommentComposerProps {
  onSubmit: (content: string) => void
  onOpenAuth: () => void
  isReply?: boolean
  replyToName?: string
  onCancelReply?: () => void
  autoFocus?: boolean
}

export function CommentComposer({
  onSubmit,
  onOpenAuth,
  isReply = false,
  replyToName,
  onCancelReply,
  autoFocus = false,
}: CommentComposerProps) {
  const { user, isAuthenticated, logout } = useAuthSession()
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated || !user) {
      onOpenAuth()
      return
    }

    const trimmed = content.trim()
    if (!trimmed) {
      toast.error("Please write a comment first")
      return
    }

    setIsSubmitting(true)
    try {
      onSubmit(trimmed)
      setContent("")
      toast.success(isReply ? "Reply posted!" : "Comment published!", {
        description: "Your perspective has been added to the discussion.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const replacement = `${prefix}${selectedText || "text"}${suffix}`

    const newContent =
      content.substring(0, start) + replacement + content.substring(end)
    setContent(newContent)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText.length || 4)
      )
    }, 10)
  }

  // If user is not authenticated and not in inline reply mode, show full CTA banner
  if (!isAuthenticated) {
    return (
      <div className="relative overflow-hidden border border-primary/30 bg-primary/5 p-6 backdrop-blur-md">
        {/* Cyberpunk corner accents */}
        <div className="pointer-events-none absolute top-2 left-2 h-3 w-3 border-t border-l border-primary" />
        <div className="pointer-events-none absolute top-2 right-2 h-3 w-3 border-t border-r border-primary" />
        <div className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b border-l border-primary" />
        <div className="pointer-events-none absolute right-2 bottom-2 h-3 w-3 border-r border-b border-primary" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-mono text-[10px] font-semibold text-primary uppercase tracking-wider block">
              // AUTHENTICATION_REQUIRED
            </span>
            <h4 className="font-mono text-sm font-bold text-foreground">
              {isReply
                ? `Sign in to reply to ${replyToName || "this comment"}`
                : "Join the technical discussion"}
            </h4>
            <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
              Authenticate via 1-click test profiles, email, or GitHub to share architecture insights, report benchmarks, or ask questions.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isReply && onCancelReply && (
              <button
                type="button"
                onClick={onCancelReply}
                className="font-mono text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 border border-border bg-background cursor-pointer"
              >
                Cancel
              </button>
            )}
            <Button
              type="button"
              onClick={onOpenAuth}
              className="rounded-none font-mono text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-md"
            >
              <HugeiconsIcon icon={Login01Icon} className="size-3.5 mr-1" />
              <span>Sign In to Comment</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated Composer Form
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Active User Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
        <div className="flex items-center gap-2.5">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="size-7 rounded-full border border-primary/40 object-cover"
          />
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-foreground">
              {user?.name}
            </span>
            {user?.badge && (
              <span className="border border-primary/40 bg-primary/10 px-1.5 py-0.2 font-mono text-[9px] font-semibold text-primary uppercase">
                {user?.badge}
              </span>
            )}
            <span className="font-mono text-[10px] text-muted-foreground hidden sm:inline">
              (@{user?.username})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isReply && (
            <span className="font-mono text-[11px] text-primary/90 flex items-center gap-1">
              <HugeiconsIcon icon={ArrowTurnBackwardIcon} className="size-3" />
              Replying to @{replyToName}
            </span>
          )}
          <button
            type="button"
            onClick={logout}
            className="font-mono text-[10px] text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
            title="Sign out of current account"
          >
            [Switch / Logout]
          </button>
        </div>
      </div>

      {/* Editor Box */}
      <div className="relative border border-border bg-background/90 focus-within:border-primary/60 transition-colors">
        {/* Formatting Toolbar */}
        <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-3 py-1.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => insertFormatting("`", "`")}
              className="p-1 font-mono text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              title="Inline Code (`code`)"
            >
              <HugeiconsIcon icon={CodeIcon} className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("**", "**")}
              className="p-1 font-mono text-xs font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              title="Bold (**bold**)"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("> ")}
              className="p-1 font-mono text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              title="Quote (> text)"
            >
              <HugeiconsIcon icon={QuoteDownIcon} className="size-3.5" />
            </button>
          </div>

          <span className="font-mono text-[10px] text-muted-foreground/70">
            {content.length} / 1000
          </span>
        </div>

        <Textarea
          ref={textareaRef}
          autoFocus={autoFocus}
          maxLength={1000}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            isReply
              ? `Write a thoughtful reply to @${replyToName}...`
              : "Share your architectural thoughts, benchmarks, or ask a technical question..."
          }
          className="min-h-[90px] w-full resize-y rounded-none border-0 bg-transparent p-3 font-sans text-xs leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <span className="font-mono text-[10px] text-muted-foreground">
          Markdown supported (`code`, **bold**, &gt; quotes)
        </span>

        <div className="flex items-center gap-2">
          {isReply && onCancelReply && (
            <button
              type="button"
              onClick={onCancelReply}
              className="font-mono text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 border border-border bg-background cursor-pointer"
            >
              Cancel
            </button>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="rounded-none font-mono text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer h-8 px-4"
          >
            {isSubmitting ? "Publishing..." : isReply ? "Reply" : "Post Comment"}
          </Button>
        </div>
      </div>
    </form>
  )
}
