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
  initialLikes?: number
}

export function ArticleReactionStation({
  postSlug,
  initialLikes = 0,
}: ArticleReactionStationProps) {
  const { reactions, totalCommentsCount, toggleLike, toggleReaction } =
    usePostEngagement(postSlug, initialLikes)

  const [isLikingAnimation, setIsLikingAnimation] = useState(false)
  const [animatingReactionKey, setAnimatingReactionKey] = useState<
    string | null
  >(null)
  const [copied, setCopied] = useState(false)

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLikingAnimation(true)
    const updated = toggleLike()
    if (updated.userLiked) {
      toast.success("❤️ Liked article!", {
        description: "Your reaction has been recorded in real-time.",
      })
    } else {
      toast.info("Like removed", {
        description: "Your preference has been updated.",
      })
    }
    setTimeout(() => setIsLikingAnimation(false), 500)
  }

  const handleReactionClick = (
    key: "fire" | "insightful" | "fast" | "rocket",
    label: string,
    emoji: string
  ) => {
    setAnimatingReactionKey(key)
    const updated = toggleReaction(key)
    const isActive = !!updated.userReactions?.[key]

    if (isActive) {
      toast.success(`${emoji} ${label} reaction added!`, {
        description: "Your feedback has been recorded and synced.",
      })
    } else {
      toast.info(`${label} reaction removed`, {
        description: "Your reaction has been updated.",
      })
    }

    setTimeout(() => {
      setAnimatingReactionKey(null)
    }, 500)
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
      const input = document.getElementById("comment-input")
      if (input) input.focus()
    }
  }

  const reactionButtons = [
    {
      key: "fire" as const,
      label: "Fire",
      emoji: "🔥",
      icon: FireIcon,
      count: reactions.fire || 0,
      active: !!reactions.userReactions?.fire,
      activeClass:
        "border-amber-500/70 bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30 shadow-[0_0_14px_rgba(245,158,11,0.25)]",
      hoverClass:
        "hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400",
      iconColor: "text-amber-500",
      badgeActiveClass: "bg-amber-500/25 text-amber-300",
    },
    {
      key: "insightful" as const,
      label: "Insightful",
      emoji: "💡",
      icon: Idea01Icon,
      count: reactions.insightful || 0,
      active: !!reactions.userReactions?.insightful,
      activeClass:
        "border-yellow-500/70 bg-yellow-500/15 text-yellow-400 ring-1 ring-yellow-500/30 shadow-[0_0_14px_rgba(234,179,8,0.25)]",
      hoverClass:
        "hover:border-yellow-500/50 hover:bg-yellow-500/10 hover:text-yellow-400",
      iconColor: "text-yellow-400",
      badgeActiveClass: "bg-yellow-500/25 text-yellow-300",
    },
    {
      key: "fast" as const,
      label: "Ultra Fast",
      emoji: "⚡",
      icon: FlashIcon,
      count: reactions.fast || 0,
      active: !!reactions.userReactions?.fast,
      activeClass:
        "border-cyan-500/70 bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30 shadow-[0_0_14px_rgba(6,182,212,0.25)]",
      hoverClass:
        "hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-400",
      iconColor: "text-cyan-400",
      badgeActiveClass: "bg-cyan-500/25 text-cyan-300",
    },
    {
      key: "rocket" as const,
      label: "Prod-Ready",
      emoji: "🚀",
      icon: RocketIcon,
      count: reactions.rocket || 0,
      active: !!reactions.userReactions?.rocket,
      activeClass:
        "border-emerald-500/70 bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 shadow-[0_0_14px_rgba(16,185,129,0.25)]",
      hoverClass:
        "hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400",
      iconColor: "text-emerald-400",
      badgeActiveClass: "bg-emerald-500/25 text-emerald-300",
    },
  ]

  return (
    <div className="relative my-6 overflow-hidden border border-border/80 bg-background/90 p-4 backdrop-blur-md sm:my-10 sm:p-6 md:p-8">
      {/* Cyberpunk corner brackets */}
      <div className="pointer-events-none absolute top-2 left-2 h-3.5 w-3.5 border-t-[1.5px] border-l-[1.5px] border-primary/40" />
      <div className="pointer-events-none absolute top-2 right-2 h-3.5 w-3.5 border-t-[1.5px] border-r-[1.5px] border-primary/40" />
      <div className="pointer-events-none absolute bottom-2 left-2 h-3.5 w-3.5 border-b-[1.5px] border-l-[1.5px] border-primary/40" />
      <div className="pointer-events-none absolute right-2 bottom-2 h-3.5 w-3.5 border-r-[1.5px] border-b-[1.5px] border-primary/40" />

      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Top Header */}
        <div className="flex flex-col justify-between gap-3 border-b border-border/60 pb-3.5 sm:flex-row sm:items-center sm:pb-5">
          <div>
            <span className="block font-mono text-[9px] font-semibold tracking-widest text-primary uppercase sm:text-[10px]">
              // ARTICLE_TELEMETRY & FEEDBACK
            </span>
            <h3 className="mt-0.5 font-mono text-sm font-bold text-foreground sm:text-base">
              Enjoyed this architecture breakdown?
            </h3>
            <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
              Leave a reaction or join the discussion below.
            </p>
          </div>

          {/* Quick Actions (Jump to Comments & Share) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={scrollToComments}
              className="inline-flex h-7.5 cursor-pointer items-center gap-1.5 border border-border bg-background px-2.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-primary hover:text-foreground sm:h-8 sm:px-3 sm:text-xs"
            >
              <HugeiconsIcon
                icon={Comment01Icon}
                className="size-3.5 text-primary"
              />
              <span>{totalCommentsCount} Comments</span>
            </button>

            <button
              type="button"
              onClick={handleShareClick}
              className="inline-flex h-7.5 cursor-pointer items-center gap-1.5 border border-border bg-background px-2.5 font-mono text-[11px] text-muted-foreground transition-colors hover:border-primary hover:text-foreground sm:h-8 sm:px-3 sm:text-xs"
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
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Main Like / Applause Hero Button */}
          <button
            type="button"
            onClick={handleLikeClick}
            className={`group relative inline-flex cursor-pointer items-center gap-2 border px-3 py-1.5 font-mono text-[11px] font-bold transition-all duration-200 select-none sm:gap-2.5 sm:px-4 sm:py-2 sm:text-xs ${
              reactions.userLiked
                ? "border-rose-500/60 bg-rose-500/10 text-rose-400 shadow-[0_0_20px_-3px_rgba(244,63,94,0.3)] ring-1 ring-rose-500/30"
                : "border-border bg-background/80 text-foreground hover:border-rose-500/50 hover:bg-rose-500/5 hover:text-rose-400"
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
                className={`size-3.5 transition-colors sm:size-4 ${
                  reactions.userLiked
                    ? "fill-rose-400 text-rose-400"
                    : "text-muted-foreground group-hover:text-rose-400"
                }`}
              />
            </span>
            <span className="tracking-wide">
              {reactions.userLiked ? "Liked" : "Like Article"}
            </span>
            <span
              className={`rounded-xs px-1.5 py-0.5 font-mono text-[10px] font-bold sm:text-[11px] ${
                reactions.userLiked
                  ? "bg-rose-500/25 text-rose-300"
                  : "bg-muted text-muted-foreground group-hover:text-foreground"
              }`}
            >
              {reactions.likes}
            </span>
          </button>

          <div className="hidden h-6 w-px bg-border/80 sm:block" />

          {/* Reaction Chips */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {reactionButtons.map((btn) => {
              const isAnimating = animatingReactionKey === btn.key
              return (
                <button
                  key={btn.key}
                  type="button"
                  onClick={() =>
                    handleReactionClick(btn.key, btn.label, btn.emoji)
                  }
                  title={`${btn.active ? "Remove" : "Add"} ${btn.label} reaction`}
                  aria-label={`${btn.label} reaction`}
                  className={`group inline-flex cursor-pointer items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] font-semibold transition-all duration-200 select-none sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs ${
                    btn.active
                      ? btn.activeClass
                      : `border-border/80 bg-background/80 text-muted-foreground ${btn.hoverClass}`
                  }`}
                >
                  <span
                    className={`flex items-center transition-transform duration-300 ${
                      isAnimating
                        ? "scale-140 rotate-12"
                        : "group-hover:scale-115"
                    }`}
                  >
                    <HugeiconsIcon
                      icon={btn.icon}
                      className={`size-3 transition-colors sm:size-3.5 ${
                        btn.active ? "text-current" : btn.iconColor
                      }`}
                    />
                  </span>
                  <span className="text-[10px] sm:text-[11px]">
                    {btn.label}
                  </span>
                  <span
                    className={`py-0.2 rounded-xs px-1 font-mono text-[9px] font-bold sm:px-1.5 sm:text-[10px] ${
                      btn.active
                        ? btn.badgeActiveClass
                        : "bg-muted text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {btn.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
