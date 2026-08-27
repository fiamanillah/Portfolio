import { useState } from "react"
import { usePostEngagement } from "@/lib/engagementStore"
import { toast } from "@workspace/ui/components/sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FavouriteIcon,
  Comment01Icon,
  Link01Icon,
  Tick02Icon,
  NewTwitterIcon,
  Linkedin02Icon,
  MenuSquareIcon,
} from "@hugeicons/core-free-icons"

interface ArticleHeaderActionsProps {
  postSlug: string
  postTitle: string
  postSummary?: string
  initialLikes?: number
  articleUrl?: string
}

export function ArticleHeaderActions({
  postSlug,
  postTitle,
  postSummary = "",
  initialLikes = 0,
  articleUrl = "",
}: ArticleHeaderActionsProps) {
  const { reactions, totalCommentsCount, toggleLike } = usePostEngagement(
    postSlug,
    initialLikes
  )

  const [isLikingAnimation, setIsLikingAnimation] = useState(false)
  const [copied, setCopied] = useState(false)

  const currentUrl =
    articleUrl || (typeof window !== "undefined" ? window.location.href : "")

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLikingAnimation(true)
    const updated = toggleLike()
    if (updated.userLiked) {
      toast.success("Article liked!", {
        description: "Your appreciation has been recorded in real-time.",
      })
    } else {
      toast.info("Like removed", {
        description: "Your preference has been updated.",
      })
    }
    setTimeout(() => setIsLikingAnimation(false), 500)
  }

  const handleShareClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    const url = currentUrl || window.location.href

    if (
      typeof navigator !== "undefined" &&
      navigator.share &&
      /mobile|android|iphone|ipad/i.test(navigator.userAgent)
    ) {
      try {
        await navigator.share({
          title: postTitle,
          text: postSummary,
          url,
        })
        return
      } catch {
        // Fallback to clipboard
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        toast.success("Link copied to clipboard!", {
          description: "Ready to share with other engineers.",
        })
        setTimeout(() => setCopied(false), 2500)
      } catch {
        window.prompt("Copy article link:", url)
      }
    }
  }

  const scrollToComments = (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.getElementById("discussion-section")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
      const input = document.getElementById("comment-input")
      if (input) input.focus()
    }
  }

  const scrollToToc = (e: React.MouseEvent) => {
    e.preventDefault()
    const dialog = document.getElementById(
      "mobile-toc-dialog"
    ) as HTMLDialogElement | null
    if (dialog) {
      dialog.showModal()
    } else {
      const el = document.getElementById("table-of-contents")
      if (el) {
        el.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    postTitle
  )}&url=${encodeURIComponent(currentUrl)}`

  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    currentUrl
  )}`

  return (
    <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: Engagement Controls (Like, Comments, Jump to Contents) */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* Like Button */}
        <button
          type="button"
          onClick={handleLikeClick}
          title={reactions.userLiked ? "Unlike article" : "Like this article"}
          aria-label={
            reactions.userLiked ? "Unlike article" : "Like this article"
          }
          className={`group relative inline-flex h-7.5 cursor-pointer items-center gap-1.5 border px-2.5 font-mono text-[11px] font-semibold transition-all duration-200 select-none sm:h-8 sm:gap-2 sm:px-3 sm:text-xs ${
            reactions.userLiked
              ? "border-rose-500/60 bg-rose-500/15 text-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.25)] ring-1 ring-rose-500/30"
              : "border-border/80 bg-background text-muted-foreground hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400"
          }`}
        >
          <span
            className={`flex items-center transition-transform duration-300 ${
              isLikingAnimation
                ? "scale-140 rotate-12"
                : "group-hover:scale-115"
            }`}
          >
            <HugeiconsIcon
              icon={FavouriteIcon}
              className={`size-3.5 transition-colors ${
                reactions.userLiked
                  ? "fill-rose-400 text-rose-400"
                  : "text-rose-400/80 group-hover:text-rose-400"
              }`}
            />
          </span>
          <span className="text-[10px] font-bold sm:text-[11px]">
            {reactions.userLiked ? "Liked" : "Like"}
          </span>
          <span
            data-post-likes-count
            className={`rounded-xs px-1.5 py-0.5 text-[9px] font-bold sm:text-[10px] ${
              reactions.userLiked
                ? "bg-rose-500/25 text-rose-300"
                : "bg-muted text-muted-foreground group-hover:text-rose-400"
            }`}
          >
            {reactions.likes ?? initialLikes}
          </span>
        </button>

        {/* Comments Jump Button */}
        <button
          type="button"
          onClick={scrollToComments}
          title="Jump to Discussion & Comments"
          aria-label="Jump to discussion"
          className="group inline-flex h-7.5 cursor-pointer items-center gap-1.5 border border-border/80 bg-background px-2.5 font-mono text-[11px] font-semibold text-muted-foreground transition-all duration-200 select-none hover:border-primary/60 hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_12px_oklch(var(--primary)/15%)] sm:h-8 sm:gap-2 sm:px-3 sm:text-xs"
        >
          <HugeiconsIcon
            icon={Comment01Icon}
            className="size-3.5 text-primary/80 transition-transform duration-200 group-hover:scale-110"
          />
          <span className="text-[10px] font-bold sm:text-[11px]">Comments</span>
          <span className="rounded-xs bg-muted px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground transition-colors group-hover:bg-primary/20 group-hover:text-primary sm:text-[10px]">
            {totalCommentsCount}
          </span>
        </button>

        {/* Jump to TOC Button (shows on mobile/tablet screens) */}
        <button
          type="button"
          onClick={scrollToToc}
          title="Open Table of Contents"
          aria-label="Open table of contents"
          className="inline-flex h-7.5 cursor-pointer items-center gap-1.5 border border-border/80 bg-background px-2.5 font-mono text-[11px] font-semibold text-muted-foreground transition-all duration-200 select-none hover:border-primary/60 hover:text-primary sm:h-8 sm:text-xs lg:hidden"
        >
          <HugeiconsIcon
            icon={MenuSquareIcon}
            className="size-3.5 text-primary/80"
          />
          <span className="text-[10px] sm:text-[11px]">TOC</span>
        </button>
      </div>

      {/* Right: Sharing & Export Actions */}
      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        <span className="mr-1 hidden font-mono text-[10px] tracking-wider text-muted-foreground/70 uppercase xl:inline-block">
          Share:
        </span>

        {/* Copy Link / Native Share Button */}
        <button
          type="button"
          onClick={handleShareClick}
          title="Copy article link"
          aria-label="Share or copy article link"
          className={`inline-flex h-7.5 cursor-pointer items-center gap-1.5 border px-2.5 font-mono text-[10px] font-semibold transition-all duration-200 select-none sm:h-8 sm:px-3 sm:text-[11px] ${
            copied
              ? "border-emerald-500/60 bg-emerald-500/15 font-bold text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/30"
              : "border-border/80 bg-background text-muted-foreground hover:border-primary/60 hover:bg-background/90 hover:text-foreground"
          }`}
        >
          <HugeiconsIcon
            icon={copied ? Tick02Icon : Link01Icon}
            className={`size-3.5 ${copied ? "text-emerald-400" : "text-primary"}`}
          />
          <span>{copied ? "Copied!" : "Copy Link"}</span>
        </button>

        {/* Twitter / X Share */}
        <a
          href={twitterShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on Twitter / X"
          aria-label="Share on X (formerly Twitter)"
          className="flex h-7.5 w-7.5 cursor-pointer items-center justify-center border border-border/80 bg-background text-muted-foreground transition-all duration-200 hover:border-primary/60 hover:bg-background/90 hover:text-foreground hover:shadow-xs sm:h-8 sm:w-8"
        >
          <HugeiconsIcon icon={NewTwitterIcon} className="size-3.5" />
        </a>

        {/* LinkedIn Share */}
        <a
          href={linkedinShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on LinkedIn"
          aria-label="Share on LinkedIn"
          className="flex h-7.5 w-7.5 cursor-pointer items-center justify-center border border-border/80 bg-background text-muted-foreground transition-all duration-200 hover:border-primary/60 hover:bg-background/90 hover:text-foreground hover:shadow-xs sm:h-8 sm:w-8"
        >
          <HugeiconsIcon icon={Linkedin02Icon} className="size-3.5" />
        </a>
      </div>
    </div>
  )
}
