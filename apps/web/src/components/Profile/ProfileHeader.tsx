import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@workspace/ui/components/dropdown-menu"
import { toast } from "@workspace/ui/components/sonner"
import { DEMO_USERS, type AuthUser } from "@/data/commentsData"
import { loginWithDemoUser } from "@/lib/authStore"
import { AvatarSelectorModal } from "./shared/AvatarSelectorModal"
import { useProfileState } from "@/lib/profileStore"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Image01Icon,
  FlashIcon,
  Notification01Icon,
} from "@hugeicons/core-free-icons"

interface ProfileHeaderProps {
  user: AuthUser
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const { updateProfile, subscribedToNewsletter } = useProfileState()
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)

  const handleSwitchDemo = (demoId: string, demoName: string) => {
    loginWithDemoUser(demoId)
    toast.success(`Switched to ${demoName}`, {
      description: "Profile context loaded.",
    })
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-lg border border-border bg-card/80 backdrop-blur-sm">
        {/* Banner */}
        <div className="h-16 sm:h-20 w-full bg-gradient-to-br from-primary/15 via-primary/5 to-transparent relative">
          <div className="absolute right-3 top-2.5 sm:right-4 sm:top-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-md text-[11px] bg-background/80 hover:bg-primary/10 cursor-pointer"
                >
                  <HugeiconsIcon icon={FlashIcon} className="size-3 mr-1 text-primary" />
                  <span>Switch Persona</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-md text-xs bg-background/95 backdrop-blur-xl">
                <DropdownMenuSeparator />
                {DEMO_USERS.map((demo) => (
                  <DropdownMenuItem
                    key={demo.id}
                    onClick={() => handleSwitchDemo(demo.id, demo.name)}
                    className="cursor-pointer py-1.5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <img
                        src={demo.avatar}
                        alt={demo.name}
                        className="size-5 rounded-full object-cover border border-border shrink-0"
                      />
                      <span className="truncate">{demo.name}</span>
                    </div>
                    {demo.id === user.id && (
                      <span className="size-1.5 rounded-full bg-primary shrink-0" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <div className="flex items-end gap-4 -mt-8">
            {/* Avatar */}
            <div className="relative shrink-0 group">
              <img
                src={user.avatar}
                alt={user.name}
                className="size-16 sm:size-20 rounded-full border-[3px] border-background bg-card object-cover shadow-sm"
              />
              <button
                type="button"
                onClick={() => setAvatarModalOpen(true)}
                className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                title="Change avatar"
              >
                <HugeiconsIcon icon={Image01Icon} className="size-3" />
              </button>
            </div>

            {/* Info */}
            <div className="min-w-0 pb-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-semibold tracking-tight text-foreground sm:text-lg truncate">
                  {user.name}
                </h1>
                {user.badge && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    {user.badge}
                  </span>
                )}
                {subscribedToNewsletter && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    <HugeiconsIcon icon={Notification01Icon} className="size-2.5" />
                    Newsletter
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                <span className="text-primary font-medium">@{user.username}</span>
                {user.role && <span> · {user.role}</span>}
                <span className="hidden sm:inline"> · {user.email}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <AvatarSelectorModal
        open={avatarModalOpen}
        onOpenChange={setAvatarModalOpen}
        currentAvatar={user.avatar}
        onSaveAvatar={(newAvatar) => {
          updateProfile({ avatar: newAvatar })
          toast.success("Avatar updated successfully!")
        }}
      />
    </>
  )
}
