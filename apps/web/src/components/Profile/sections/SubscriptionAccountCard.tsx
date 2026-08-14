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
import type { AuthUser } from "@/data/commentsData"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Delete02Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons"

interface SubscriptionAccountCardProps {
  user: AuthUser
}

export function SubscriptionAccountCard({ user }: SubscriptionAccountCardProps) {
  const { subscribedToNewsletter, updateSubscription, deleteAccount } = useProfileState()
  const { logout } = useAuthSession()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleToggleSubscription = (checked: boolean) => {
    updateSubscription(checked)
    if (checked) {
      toast.success("Subscribed to Newsletter", {
        description: `Technical dispatches will be sent to ${user.email}.`,
      })
    } else {
      toast.info("Unsubscribed from Newsletter", {
        description: "You will no longer receive recurring engineering updates.",
      })
    }
  }

  const handleDeleteConfirm = () => {
    deleteAccount()
    logout()
    toast.success("Account Deleted", {
      description: "Your session and stored profile information have been erased.",
    })
  }

  return (
    <>
      <div className="space-y-5">
        {/* Newsletter */}
        <ProfileSectionCard
          id="section-subscription"
          title="Newsletter"
          description="Manage your email subscription preferences."
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2 rounded-full shrink-0 ${
                      subscribedToNewsletter ? "bg-emerald-500" : "bg-zinc-400"
                    }`}
                  />
                  <label
                    htmlFor="newsletter-toggle"
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    Engineering Newsletter & Case Studies
                  </label>
                </div>
                <p className="text-xs text-muted-foreground pl-4">
                  Deep dives on distributed systems, WebSockets, and DevOps architectures sent to{" "}
                  <span className="text-foreground font-medium">{user.email}</span>.
                </p>
              </div>

              <Switch
                id="newsletter-toggle"
                checked={subscribedToNewsletter}
                onCheckedChange={handleToggleSubscription}
                className="shrink-0 mt-0.5"
              />
            </div>

            <div className="text-right">
              <a
                href="/unsubscribe"
                className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
              >
                Advanced unsubscribe settings →
              </a>
            </div>
          </div>
        </ProfileSectionCard>

        {/* Delete Account */}
        <ProfileSectionCard
          id="section-delete-account"
          title="Delete Account"
          description="Permanently delete your account and local profile data."
          danger={true}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-medium text-destructive flex items-center gap-1.5">
                <HugeiconsIcon icon={AlertCircleIcon} className="size-4" />
                Erase Profile & Disconnect Session
              </p>
              <p className="text-xs text-muted-foreground max-w-md">
                Once deleted, your local credentials, custom username, and profile bio will be completely wiped from this device.
              </p>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="rounded-md text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer shrink-0"
            >
              <HugeiconsIcon icon={Delete02Icon} className="size-3.5 mr-1.5" />
              Delete Account
            </Button>
          </div>
        </ProfileSectionCard>
      </div>

      {/* Deletion Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-lg border border-destructive/40 bg-card/95 p-5 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold text-destructive flex items-center gap-2">
              <HugeiconsIcon icon={AlertCircleIcon} className="size-4 text-destructive" />
              Delete your account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              This action will delete your stored profile details and sign you out immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row justify-end gap-2 pt-2 border-t border-border/50">
            <AlertDialogCancel className="rounded-md text-xs cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="rounded-md text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              Yes, Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
