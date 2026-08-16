// src/components/Profile/ProfileHeader.tsx
import { useState } from "react"
import { toast } from "@workspace/ui/components/sonner"
import type { AuthUser } from "@workspace/shared"
import { AvatarSelectorModal } from "./shared/AvatarSelectorModal"
import { useProfileState } from "@/lib/profileStore"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Image01Icon,
  Notification01Icon,
  CheckmarkCircle02Icon,
  Location01Icon,
  GlobalIcon,
  GithubIcon,
  NewTwitterIcon,
  Linkedin02Icon,
} from "@hugeicons/core-free-icons"

interface ProfileHeaderProps {
  user: AuthUser
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const { updateProfile, subscribedToNewsletter } = useProfileState()
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)

  const isVerified = user.isEmailVerified !== false
  const roleLabel = typeof user.role === "string" ? user.role : "USER"

  return (
    <>
      <div className="relative overflow-hidden border border-border bg-card/90 backdrop-blur-xl">
        {/* Cyberpunk Decorative Header Banner */}
        <div className="h-20 sm:h-24 w-full bg-gradient-to-r from-primary/20 via-primary/5 to-transparent relative border-b border-border/40">
          <div className="absolute top-2 left-3 font-mono text-[9px] font-semibold text-primary/70 uppercase tracking-wider">
            // USER_PROFILE_SESSION
          </div>
        </div>

        {/* Profile Summary */}
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-10 sm:-mt-12">
            {/* Avatar & User Details */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-5 min-w-0 flex-1">
              {/* Avatar with Quick-Edit Button */}
              <div className="relative shrink-0 group self-start sm:self-auto">
                <img
                  src={user.avatar || "/avatars/avatar-1.svg"}
                  alt={user.name}
                  className="size-20 sm:size-24 rounded-full border-4 border-background bg-card object-cover shadow-lg"
                />
                <button
                  type="button"
                  onClick={() => setAvatarModalOpen(true)}
                  className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer shadow-sm group-hover:scale-105"
                  title="Change profile avatar"
                >
                  <HugeiconsIcon icon={Image01Icon} className="size-3.5" />
                </button>
              </div>

              {/* Identity Details */}
              <div className="min-w-0 flex-1 space-y-1.5 pb-0.5">
                {/* Name & Badges Row */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  <h1 className="font-mono text-lg sm:text-xl font-bold tracking-tight text-foreground">
                    {user.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* RBAC Role Badge */}
                    <span className="inline-flex items-center border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[9px] font-semibold text-primary uppercase">
                      {roleLabel}
                    </span>

                    {/* Verified Badge */}
                    {isVerified && (
                      <span className="inline-flex items-center gap-1 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-2.5" />
                        Verified
                      </span>
                    )}

                    {/* Newsletter Badge */}
                    {subscribedToNewsletter && (
                      <span className="inline-flex items-center gap-1 border border-primary/30 bg-primary/5 px-2 py-0.5 font-mono text-[9px] font-semibold text-primary">
                        <HugeiconsIcon icon={Notification01Icon} className="size-2.5" />
                        Newsletter
                      </span>
                    )}
                  </div>
                </div>

                {/* Handle, Title, and Location Row */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-muted-foreground">
                  <span className="text-primary font-medium">@{user.username}</span>
                  {user.headline && (
                    <>
                      <span className="text-border/80">•</span>
                      <span className="text-foreground/80">{user.headline}</span>
                    </>
                  )}
                  {user.location && (
                    <>
                      <span className="text-border/80">•</span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <HugeiconsIcon icon={Location01Icon} className="size-3 text-primary/70 shrink-0" />
                        <span>{user.location}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Social & Website Quick Links */}
            <div className="flex items-center gap-2 sm:self-end pt-1 sm:pt-0 shrink-0">
              {user.website && (
                <a
                  href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 border border-border bg-background hover:border-primary hover:text-primary transition-colors text-muted-foreground"
                  title="Website / Portfolio"
                >
                  <HugeiconsIcon icon={GlobalIcon} className="size-4" />
                </a>
              )}
              {user.githubUrl && (
                <a
                  href={user.githubUrl.startsWith("http") ? user.githubUrl : `https://github.com/${user.githubUrl.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 border border-border bg-background hover:border-primary hover:text-primary transition-colors text-muted-foreground"
                  title="GitHub Profile"
                >
                  <HugeiconsIcon icon={GithubIcon} className="size-4" />
                </a>
              )}
              {user.twitterUrl && (
                <a
                  href={user.twitterUrl.startsWith("http") ? user.twitterUrl : `https://twitter.com/${user.twitterUrl.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 border border-border bg-background hover:border-primary hover:text-primary transition-colors text-muted-foreground"
                  title="X (Twitter) Profile"
                >
                  <HugeiconsIcon icon={NewTwitterIcon} className="size-4" />
                </a>
              )}
              {user.linkedinUrl && (
                <a
                  href={user.linkedinUrl.startsWith("http") ? user.linkedinUrl : `https://linkedin.com/in/${user.linkedinUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 border border-border bg-background hover:border-primary hover:text-primary transition-colors text-muted-foreground"
                  title="LinkedIn Profile"
                >
                  <HugeiconsIcon icon={Linkedin02Icon} className="size-4" />
                </a>
              )}
            </div>
          </div>

          {/* Bio Snippet if provided */}
          {user.bio && (
            <div className="mt-4 pt-3 border-t border-border/50">
              <p className="text-xs text-foreground/80 leading-relaxed font-sans line-clamp-2">
                {user.bio}
              </p>
            </div>
          )}
        </div>
      </div>

      <AvatarSelectorModal
        open={avatarModalOpen}
        onOpenChange={setAvatarModalOpen}
        currentAvatar={user.avatar}
        onSaveAvatar={async (newAvatar) => {
          const res = await updateProfile({ avatar: newAvatar })
          if (res.success) {
            toast.success("Avatar updated successfully!")
          } else {
            toast.error("Avatar Update Failed", { description: res.error })
          }
        }}
      />
    </>
  )
}
