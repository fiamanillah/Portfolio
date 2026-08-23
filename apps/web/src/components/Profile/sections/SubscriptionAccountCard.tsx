// src/components/Profile/sections/SubscriptionAccountCard.tsx
import { useState } from "react"
import { ProfileSectionCard } from "../shared/ProfileSectionCard"
import { Switch } from "@workspace/ui/components/switch"
import { Button } from "@workspace/ui/components/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@workspace/ui/components/alert-dialog"
import { toast } from "@workspace/ui/components/sonner"
import { useProfileState } from "@/lib/profileStore"
import { useAuthSession } from "@/lib/authStore"
import type { AuthUser } from "@workspace/shared"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Delete02Icon,
  AlertCircleIcon,
  Loading03Icon,
  Notification01Icon,
} from "@hugeicons/core-free-icons"

interface SubscriptionAccountCardProps {
  user: AuthUser
}

export function SubscriptionAccountCard({
  user,
}: SubscriptionAccountCardProps) {
  const { subscribedToNewsletter, updateSubscription, deleteAccount } =
    useProfileState()
  const { logout } = useAuthSession()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isUpdatingSub, setIsUpdatingSub] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleToggleSubscription = async (checked: boolean) => {
    setIsUpdatingSub(true)
    const res = await updateSubscription(checked)
    setIsUpdatingSub(false)

    if (res.success) {
      if (checked) {
        toast.success("Subscribed to Newsletter", {
          description: `Technical dispatches will be sent to ${user.email}.`,
        })
      } else {
        toast.info("Unsubscribed from Newsletter", {
          description:
            "You will no longer receive recurring engineering updates.",
        })
      }
    } else {
      toast.error("Subscription Update Failed", { description: res.error })
    }
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    const res = await deleteAccount()
    setIsDeleting(false)

    if (res.success) {
      await logout()
      toast.success("Account Erased", {
        description:
          "Your account and authentication session have been deleted.",
      })
    } else {
      toast.error("Account Deletion Failed", {
        description: res.error || "Could not delete account.",
      })
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* 1. Newsletter & Updates */}
        <ProfileSectionCard
          id="section-subscription"
          title="Newsletter & Tech Dispatches"
          description="Manage recurring email dispatches on AI, semiconductor trends, hardware markets, and modern engineering."
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2 shrink-0 rounded-full ${
                      subscribedToNewsletter ? "bg-emerald-500" : "bg-zinc-500"
                    }`}
                  />
                  <label
                    htmlFor="newsletter-toggle"
                    className="flex cursor-pointer items-center gap-1.5 font-mono text-xs font-semibold text-foreground"
                  >
                    <HugeiconsIcon
                      icon={Notification01Icon}
                      className="size-3.5 text-primary"
                    />
                    <span>Tech Stories, AI & Engineering Dispatches</span>
                  </label>
                </div>
                <p className="pl-5 text-xs leading-relaxed text-muted-foreground">
                  Curated stories on AI breakthroughs, hardware market trends,
                  chip innovations, and engineering practices sent to{" "}
                  <span className="font-mono font-medium text-foreground">
                    {user.email}
                  </span>
                  .
                </p>
              </div>

              <div className="mt-0.5 flex shrink-0 items-center gap-2">
                {isUpdatingSub && (
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    className="size-3.5 animate-spin text-primary"
                  />
                )}
                <Switch
                  id="newsletter-toggle"
                  checked={subscribedToNewsletter}
                  disabled={isUpdatingSub}
                  onCheckedChange={handleToggleSubscription}
                />
              </div>
            </div>
          </div>
        </ProfileSectionCard>

        {/* 2. Danger Zone: Erase Account */}
        <ProfileSectionCard
          id="section-delete-account"
          title="Account Danger Zone"
          description="Permanently delete your account and personal data from the database."
          danger={true}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
              <p className="flex items-center gap-1.5 font-mono text-xs font-semibold text-destructive">
                <HugeiconsIcon icon={AlertCircleIcon} className="size-3.5" />
                <span>Permanent Account Deletion</span>
              </p>
              <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
                Once confirmed, your user record, authentication tokens,
                credentials, and profile details will be permanently wiped.
              </p>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive-foreground flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-none bg-destructive px-3 font-mono text-xs font-bold tracking-wider uppercase transition-colors hover:bg-destructive/90"
            >
              <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
              <span>Delete Account</span>
            </Button>
          </div>
        </ProfileSectionCard>
      </div>

      {/* Deletion Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="gap-4 rounded-none border border-destructive/40 bg-card/95 p-6 backdrop-blur-xl sm:max-w-md">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="flex items-center gap-2 font-mono text-base font-bold text-destructive">
              <HugeiconsIcon
                icon={AlertCircleIcon}
                className="size-4 text-destructive"
              />
              <span>Permanently delete account?</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed text-muted-foreground">
              This action cannot be undone. All your session data, profile
              configuration, and credentials will be removed from the server
              database immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row justify-end gap-2 border-t border-border/50 pt-2">
            <AlertDialogCancel className="cursor-pointer rounded-none font-mono text-xs">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="text-destructive-foreground cursor-pointer rounded-none bg-destructive font-mono text-xs font-bold uppercase hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Yes, Erase Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
