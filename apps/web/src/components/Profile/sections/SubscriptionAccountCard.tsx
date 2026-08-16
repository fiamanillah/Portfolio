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

export function SubscriptionAccountCard({ user }: SubscriptionAccountCardProps) {
  const { subscribedToNewsletter, updateSubscription, deleteAccount } = useProfileState()
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
          description: "You will no longer receive recurring engineering updates.",
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
        description: "Your account and authentication session have been deleted.",
      })
    } else {
      toast.error("Account Deletion Failed", { description: res.error || "Could not delete account." })
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* 1. Newsletter & Updates */}
        <ProfileSectionCard
          id="section-subscription"
          title="Newsletter & Engineering Updates"
          description="Manage recurring email dispatches and architectural breakdown notifications."
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2 rounded-full shrink-0 ${
                      subscribedToNewsletter ? "bg-emerald-500" : "bg-zinc-500"
                    }`}
                  />
                  <label
                    htmlFor="newsletter-toggle"
                    className="font-mono text-xs font-semibold text-foreground cursor-pointer flex items-center gap-1.5"
                  >
                    <HugeiconsIcon icon={Notification01Icon} className="size-3.5 text-primary" />
                    <span>Technical Newsletter & Case Studies</span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground pl-5 leading-relaxed">
                  Deep dives on distributed systems, WebSockets, benchmarks, and DevOps architectures sent to{" "}
                  <span className="text-foreground font-mono font-medium">{user.email}</span>.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 mt-0.5">
                {isUpdatingSub && (
                  <HugeiconsIcon icon={Loading03Icon} className="size-3.5 animate-spin text-primary" />
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <p className="font-mono text-xs font-semibold text-destructive flex items-center gap-1.5">
                <HugeiconsIcon icon={AlertCircleIcon} className="size-3.5" />
                <span>Permanent Account Deletion</span>
              </p>
              <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                Once confirmed, your user record, authentication tokens, credentials, and profile details will be permanently wiped.
              </p>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="rounded-none font-mono text-xs font-bold uppercase tracking-wider bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors cursor-pointer shrink-0 h-8 px-3 flex items-center gap-1.5"
            >
              <HugeiconsIcon icon={Delete02Icon} className="size-3.5" />
              <span>Delete Account</span>
            </Button>
          </div>
        </ProfileSectionCard>
      </div>

      {/* Deletion Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md rounded-none border border-destructive/40 bg-card/95 p-6 backdrop-blur-xl gap-4">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="font-mono text-base font-bold text-destructive flex items-center gap-2">
              <HugeiconsIcon icon={AlertCircleIcon} className="size-4 text-destructive" />
              <span>Permanently delete account?</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              This action cannot be undone. All your session data, profile configuration, and credentials will be removed from the server database immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row justify-end gap-2 pt-2 border-t border-border/50">
            <AlertDialogCancel className="rounded-none font-mono text-xs cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="rounded-none font-mono text-xs font-bold uppercase bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {isDeleting ? "Deleting..." : "Yes, Erase Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
