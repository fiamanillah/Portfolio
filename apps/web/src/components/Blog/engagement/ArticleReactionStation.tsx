import { useState } from "react"
import { usePostEngagement } from "@/lib/engagementStore"
import { toast } from "@workspace/ui/components/sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Comment01Icon,
  Share01Icon,
  Tick02Icon,
  FavouriteIcon,
  FireIcon,
  Idea01Icon,
  FlashIcon,
  RocketIcon,
} from "@hugeicons/core-free-icons"

interface ArticleReactionStationProps {
  postSlug: string
  postTitle?: string
}

export function ArticleReactionStation({
  postSlug,
}: ArticleReactionStationProps) {
  const {
    reactions,
    totalCommentsCount,
    toggleLike,
    toggleReaction,
  } = usePostEngagement(postSlug)

  const [isLikingAnimation, setIsLikingAnimation] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleLikeClick = () => {
    setIsLikingAnimation(true)
    const updated = toggleLike()
    if (updated.userLiked) {
      toast.success("Thanks for liking this post!", {
        description: "Your reaction has been recorded.",
      })
    }
    setTimeout(() => setIsLikingAnimation(false), 600)
  }

  const handleShareClick = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true)
        toast.success("Link copied to clipboard!", {
          description: "Ready to share with other engineers.",
        })
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  const scrollToComments = () => {
    const el = document.getElementById("discussion-section")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  const reactionButtons = [
    {
      key: "fire" as const,
      label: "Fire",
      icon: FireIcon,
      iconColor: "text-amber-500",
      count: reactions.fire || 0,
      active: !!reactions.userReactions?.fire,
    },
    {
      key: "insightful" as const,
      label: "Insightful",
      icon: Idea01Icon,
      iconColor: "text-yellow-400",
      count: reactions.insightful || 0,
      active: !!reactions.userReactions?.insightful,
    },
    {
      key: "fast" as const,
      label: "Ultra Fast",
      icon: FlashIcon,
      iconColor: "text-cyan-400",
      count: reactions.fast || 0,
      active: !!reactions.userReactions?.fast,
    },
    {
      key: "rocket" as const,
      label: "Prod-Ready",
      icon: RocketIcon,
      iconColor: "text-emerald-400",
      count: reactions.rocket || 0,
      active: !!reactions.userReactions?.rocket,
    },
  ]

  return (
    <div className="relative my-10 overflow-hidden border border-border/80 bg-background/90 p-6 sm:p-8 backdrop-blur-md">
      {/* Cyberpunk corner brackets */}
      <div className="pointer-events-none absolute top-2 left-2 h-3.5 w-3.5 border-t-[1.5px] border-l-[1.5px] border-primary/40" />
      <div className="pointer-events-none absolute top-2 right-2 h-3.5 w-3.5 border-t-[1.5px] border-r-[1.5px] border-primary/40" />
      <div className="pointer-events-none absolute bottom-2 left-2 h-3.5 w-3.5 border-b-[1.5px] border-l-[1.5px] border-primary/40" />
      <div className="pointer-events-none absolute right-2 bottom-2 h-3.5 w-3.5 border-r-[1.5px] border-b-[1.5px] border-primary/40" />

      <div className="flex flex-col gap-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
          <div>
            <span className="font-mono text-[10px] font-semibold text-primary uppercase tracking-widest block">
              // ARTICLE_TELEMETRY & FEEDBACK
            </span>
            <h3 className="font-mono text-base font-bold text-foreground mt-0.5">
              Enjoyed this architecture breakdown?
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Leave a reaction or join the discussion below.
            </p>
          </div>

          {/* Quick Actions (Jump to Comments & Share) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={scrollToComments}
              className="inline-flex h-8 items-center gap-1.5 border border-border bg-background px-3 font-mono text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground cursor-pointer"
            >
              <HugeiconsIcon icon={Comment01Icon} className="size-3.5 text-primary" />
              <span>{totalCommentsCount} Comments</span>
            </button>

            <button
              type="button"
              onClick={handleShareClick}
              className="inline-flex h-8 items-center gap-1.5 border border-border bg-background px-3 font-mono text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground cursor-pointer"
            >
              <HugeiconsIcon
                icon={copied ? Tick02Icon : Share01Icon}
                className={`size-3.5 ${copied ? "text-emerald-500" : "text-primary"}`}
              />
              <span>{copied ? "Copied" : "Share"}</span>
            </button>
          </div>
        </div>

        {/* Reaction Hub Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Main Like / Applause Hero Button */}
          <button
            type="button"
            onClick={handleLikeClick}
            className={`group relative inline-flex items-center gap-2.5 border px-4 py-2 font-mono text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
              reactions.userLiked
                ? "border-rose-500/60 bg-rose-500/10 text-rose-400 shadow-[0_0_20px_-3px_rgba(244,63,94,0.3)]"
                : "border-border bg-background/80 text-foreground hover:border-rose-500/50 hover:bg-rose-500/5 hover:text-rose-400"
            }`}
          >
            <span
              className={`flex items-center transition-transform duration-300 ${
                isLikingAnimation ? "scale-140 rotate-12" : "group-hover:scale-115"
              }`}
            >
              <HugeiconsIcon
                icon={FavouriteIcon}
                className={`size-4 transition-colors ${
                  reactions.userLiked ? "text-rose-400 fill-rose-400" : "text-muted-foreground group-hover:text-rose-400"
                }`}
              />
            </span>
            <span className="tracking-wide">
              {reactions.userLiked ? "Liked" : "Like Article"}
            </span>
            <span
              className={`rounded-none px-1.5 py-0.5 font-mono text-[11px] ${
                reactions.userLiked
                  ? "bg-rose-500/20 text-rose-300"
                  : "bg-muted text-muted-foreground group-hover:text-foreground"
              }`}
            >
              {reactions.likes}
            </span>
          </button>

          <div className="h-6 w-px bg-border/80 hidden sm:block" />

          {/* Reaction Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {reactionButtons.map((btn) => (
              <button
                key={btn.key}
                type="button"
                onClick={() => toggleReaction(btn.key)}
                className={`inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-xs transition-all duration-150 cursor-pointer ${
                  btn.active
                    ? "border-primary/70 bg-primary/15 text-primary shadow-[0_0_12px_-2px_oklch(var(--primary)/30%)]"
                    : "border-border bg-background/60 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-primary/5"
                }`}
              >
                <HugeiconsIcon icon={btn.icon} className={`size-3.5 ${btn.active ? "text-primary" : btn.iconColor}`} />
                <span className="text-[11px]">{btn.label}</span>
                <span className="font-mono text-[10px] opacity-70">
                  {btn.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
