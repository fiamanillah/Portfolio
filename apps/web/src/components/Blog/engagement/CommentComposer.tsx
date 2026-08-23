import { useState, useRef, useCallback, useEffect, type FormEvent } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Field,
  FieldError,
  FieldDescription,
} from "@workspace/ui/components/field"
import { useAuthSession } from "@/lib/authStore"
import { toast } from "@workspace/ui/components/sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Login01Icon,
  CodeIcon,
  QuoteDownIcon,
  ArrowTurnBackwardIcon,
  Loading03Icon,
  UserIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons"
import type { GuestCommentPayload } from "@/lib/api/commentsApi"

interface CommentComposerProps {
  postSlug?: string
  onSubmit: (content: string, guestInfo?: GuestCommentPayload) => Promise<void> | void
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
  const [guestMode, setGuestMode] = useState(false)
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [captchaToken, setCaptchaToken] = useState("")
  const [hpField, setHpField] = useState("")
  const [composerError, setComposerError] = useState<string | null>(null)
  const [guestNameError, setGuestNameError] = useState<string | null>(null)
  const [turnstileError, setTurnstileError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null)
  const turnstileWidgetIdRef = useRef<string | null>(null)

  // Initialize Cloudflare Turnstile for Guest Comments
  const initTurnstile = useCallback(() => {
    const siteKey =
      (typeof import.meta !== "undefined" &&
        import.meta.env?.PUBLIC_TURNSTILE_SITE_KEY) ||
      "1x00000000000000000000AA"

    if (typeof window === "undefined" || !turnstileContainerRef.current) return

    const renderWidget = () => {
      if (
        (window as any).turnstile &&
        turnstileContainerRef.current &&
        turnstileWidgetIdRef.current === null
      ) {
        try {
          const id = (window as any).turnstile.render(
            turnstileContainerRef.current,
            {
              sitekey: siteKey,
              theme: "auto",
              callback: (token: string) => {
                setCaptchaToken(token)
                setTurnstileError(null)
                window.dispatchEvent(new CustomEvent("grid-refresh"))
              },
              "expired-callback": () => {
                setCaptchaToken("")
                window.dispatchEvent(new CustomEvent("grid-refresh"))
              },
              "error-callback": () => {
                setCaptchaToken("")
                window.dispatchEvent(new CustomEvent("grid-refresh"))
              },
            }
          )
          turnstileWidgetIdRef.current = id
          window.dispatchEvent(new CustomEvent("grid-refresh"))
        } catch (e) {
          console.warn("Turnstile comment init warning:", e)
        }
      }
    }

    if ((window as any).turnstile) {
      renderWidget()
    } else {
      let script = document.getElementById(
        "cf-turnstile-script"
      ) as HTMLScriptElement | null
      if (!script) {
        script = document.createElement("script")
        script.id = "cf-turnstile-script"
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        script.async = true
        script.defer = true
        document.head.appendChild(script)
      }
      script.addEventListener("load", renderWidget, { once: true })
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated && guestMode) {
      const timer = setTimeout(initTurnstile, 60)
      return () => clearTimeout(timer)
    } else {
      if (turnstileWidgetIdRef.current !== null && (window as any).turnstile) {
        try {
          (window as any).turnstile.remove(turnstileWidgetIdRef.current)
        } catch {}
        turnstileWidgetIdRef.current = null
      }
      setCaptchaToken("")
      setTurnstileError(null)
    }
  }, [isAuthenticated, guestMode, initTurnstile])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const trimmed = content.trim()
    if (!trimmed) {
      setComposerError("Please enter your comment before submitting")
      return
    }
    if (trimmed.length < 3) {
      setComposerError("Comment must be at least 3 characters")
      return
    }

    if (!isAuthenticated && !user) {
      if (!guestMode) {
        onOpenAuth()
        return
      }

      if (!guestName.trim()) {
        setGuestNameError("Please enter your name to post as guest")
        return
      }
      setGuestNameError(null)

      const siteKey =
        typeof import.meta !== "undefined" &&
        import.meta.env?.PUBLIC_TURNSTILE_SITE_KEY
      if (siteKey && !captchaToken) {
        setTurnstileError("Please complete the security check before submitting")
        return
      }
      setTurnstileError(null)
    }

    setComposerError(null)
    setIsSubmitting(true)
    try {
      if (isAuthenticated && user) {
        await onSubmit(trimmed)
      } else {
        await onSubmit(trimmed, {
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim() || undefined,
          captchaToken: captchaToken || undefined,
          hp_field: hpField || undefined,
        })
      }
      setContent("")
      setHpField("")
      if (turnstileWidgetIdRef.current !== null && (window as any).turnstile) {
        try {
          (window as any).turnstile.reset(turnstileWidgetIdRef.current)
        } catch {}
      }
      setCaptchaToken("")
      toast.success(isReply ? "Reply posted!" : "Comment published!", {
        description: "Your perspective has been added to the discussion.",
      })
    } catch {
      toast.error("Failed to post comment. Please try again.")
      if (turnstileWidgetIdRef.current !== null && (window as any).turnstile) {
        try {
          (window as any).turnstile.reset(turnstileWidgetIdRef.current)
        } catch {}
      }
      setCaptchaToken("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const insertFormatting = (prefix: string, suffix: string = "") => {
    if (!textareaRef.current) return
    const el = textareaRef.current
    const start = el.selectionStart
    const end = el.selectionEnd
    const selected = content.slice(start, end)
    const replacement = `${prefix}${selected || "text"}${suffix}`
    const newContent =
      content.slice(0, start) + replacement + content.slice(end)

    setContent(newContent)
    if (composerError) setComposerError(null)

    setTimeout(() => {
      el.focus()
      const cursorTarget =
        selected.length > 0 ? start + replacement.length : start + prefix.length
      el.setSelectionRange(cursorTarget, cursorTarget + (selected ? 0 : 4))
    }, 0)
  }

  // If not logged in and not in guest mode, show quick action prompt
  if (!isAuthenticated && !guestMode) {
    return (
      <div className="relative border border-border/80 bg-background/50 p-4 backdrop-blur-xs sm:p-5">
        {/* Cyberpunk corner accents */}
        <div className="pointer-events-none absolute top-2 left-2 h-3 w-3 border-t border-l border-primary" />
        <div className="pointer-events-none absolute top-2 right-2 h-3 w-3 border-t border-r border-primary" />
        <div className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b border-l border-primary" />
        <div className="pointer-events-none absolute right-2 bottom-2 h-3 w-3 border-r border-b border-primary" />

        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <span className="block font-mono text-[10px] font-semibold tracking-wider text-primary uppercase">
              // JOIN_DISCUSSION
            </span>
            <h4 className="font-mono text-sm font-bold text-foreground">
              {isReply
                ? `Reply to @${replyToName || "this comment"}`
                : "Share your architectural insights & feedback"}
            </h4>
            <p className="max-w-lg text-xs leading-relaxed text-muted-foreground">
              Sign in with your account or continue as a guest reader to post
              questions and architectural perspectives.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {isReply && onCancelReply && (
              <button
                type="button"
                onClick={onCancelReply}
                className="cursor-pointer border border-border bg-background px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={() => setGuestMode(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 border border-border bg-background px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
            >
              <HugeiconsIcon icon={UserIcon} className="size-3.5" />
              <span>Comment as Guest</span>
            </button>
            <Button
              type="button"
              onClick={onOpenAuth}
              className="cursor-pointer rounded-none bg-primary font-mono text-xs font-bold tracking-wider text-primary-foreground uppercase shadow-md hover:bg-primary/90"
            >
              <HugeiconsIcon icon={Login01Icon} className="mr-1 size-3.5" />
              <span>Sign In</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Active Composer (Authenticated User OR Guest Mode)
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2.5">
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2.5">
            <img
              src={user.avatar || "/fi.png"}
              alt={user.name}
              className="size-7 rounded-full border border-primary/40 object-cover"
            />
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-foreground">
                {user.name}
              </span>
              {user.badge && (
                <span className="py-0.2 border border-primary/40 bg-primary/10 px-1.5 font-mono text-[9px] font-semibold text-primary uppercase">
                  {user.badge}
                </span>
              )}
              <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">
                (@{user.username})
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary uppercase">
              // GUEST_COMPOSER
            </span>
            <button
              type="button"
              onClick={onOpenAuth}
              className="cursor-pointer font-mono text-[11px] text-muted-foreground underline hover:text-primary"
            >
              (or Sign In)
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {isReply && (
            <span className="flex items-center gap-1 font-mono text-[11px] text-primary/90">
              <HugeiconsIcon icon={ArrowTurnBackwardIcon} className="size-3" />
              Replying to @{replyToName}
            </span>
          )}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={async () => {
                await logout()
                toast.info("Signed Out", {
                  description:
                    "You have been disconnected from your account session.",
                })
              }}
              className="cursor-pointer font-mono text-[10px] text-muted-foreground transition-colors hover:text-destructive"
              title="Sign out of current account"
            >
              [Switch / Logout]
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setGuestMode(false)}
              className="cursor-pointer font-mono text-[10px] text-muted-foreground transition-colors hover:text-foreground"
            >
              [Close Guest Mode]
            </button>
          )}
        </div>
      </div>

      {/* Guest Name & Email Inputs if in Guest Mode */}
      {!isAuthenticated && guestMode && (
        <div className="grid grid-cols-1 gap-3 border border-border/60 bg-muted/15 p-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block font-mono text-[10px] text-muted-foreground uppercase">
              Your Name *
            </label>
            <Input
              type="text"
              required
              value={guestName}
              onChange={(e) => {
                setGuestName(e.target.value)
                if (guestNameError) setGuestNameError(null)
              }}
              placeholder="e.g. Alex Engineer"
              className="h-8 rounded-none bg-background/80 font-mono text-xs"
            />
            {guestNameError && (
              <p className="mt-1 font-mono text-[10px] text-destructive">
                {guestNameError}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block font-mono text-[10px] text-muted-foreground uppercase">
              Email (Optional / Private)
            </label>
            <Input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="e.g. alex@example.com"
              className="h-8 rounded-none bg-background/80 font-mono text-xs"
            />
          </div>
        </div>
      )}

      {/* Invisible Honeypot Anti-Spam Field */}
      {!isAuthenticated && guestMode && (
        <div className="hidden" aria-hidden="true" style={{ display: "none" }}>
          <label htmlFor={`guest_hp_field_${isReply ? "reply_" : "main"}`}>
            Leave this field blank
          </label>
          <input
            id={`guest_hp_field_${isReply ? "reply_" : "main"}`}
            type="text"
            name="hp_field"
            tabIndex={-1}
            autoComplete="off"
            value={hpField}
            onChange={(e) => setHpField(e.target.value)}
          />
        </div>
      )}

      {/* Editor Box */}
      <Field data-invalid={!!composerError}>
        <div className="relative border border-border bg-background/90 transition-colors focus-within:border-primary/60">
          {/* Formatting Toolbar */}
          <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-3 py-1.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => insertFormatting("`", "`")}
                className="cursor-pointer p-1 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
                title="Inline Code (`code`)"
              >
                <HugeiconsIcon icon={CodeIcon} className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("**", "**")}
                className="cursor-pointer p-1 font-mono text-xs font-bold text-muted-foreground transition-colors hover:text-primary"
                title="Bold (**bold**)"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("> ")}
                className="cursor-pointer p-1 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
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
            onChange={(e) => {
              setContent(e.target.value)
              if (composerError) setComposerError(null)
            }}
            aria-invalid={!!composerError}
            placeholder={
              isReply
                ? `Write a thoughtful reply to @${replyToName}...`
                : "Share your architectural thoughts, benchmarks, or ask a technical question..."
            }
            className="min-h-[90px] w-full resize-y rounded-none border-0 bg-transparent p-3 font-sans text-xs leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0"
          />
        </div>
        <FieldError errors={composerError ?? undefined} />
      </Field>

      {/* Cloudflare Turnstile Bot Defense for Guests */}
      {!isAuthenticated && guestMode && (
        <div className="border border-border/60 bg-muted/10 p-2.5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-muted-foreground uppercase">
              <HugeiconsIcon icon={Shield01Icon} className="size-3 text-primary" />
              Bot Defense Verification
            </span>
            <span className="font-mono text-[9px] text-primary/80">
              Cloudflare Turnstile
            </span>
          </div>
          <div className="flex min-h-[65px] items-center justify-center py-1">
            <div ref={turnstileContainerRef} />
          </div>
          {turnstileError && (
            <p className="mt-1 text-center font-mono text-[10px] text-destructive">
              {turnstileError}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <FieldDescription>
          Markdown supported (`code`, **bold**, &gt; quotes)
        </FieldDescription>

        <div className="flex items-center gap-2">
          {isReply && onCancelReply && (
            <button
              type="button"
              onClick={onCancelReply}
              className="cursor-pointer border border-border bg-background px-3 py-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="h-8 cursor-pointer rounded-none bg-primary px-4 font-mono text-xs font-bold tracking-wider text-primary-foreground uppercase hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="mr-1 size-3 animate-spin"
                />
                <span>Publishing...</span>
              </>
            ) : isReply ? (
              "Reply"
            ) : (
              "Post Comment"
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
