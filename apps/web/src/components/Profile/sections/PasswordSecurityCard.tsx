import { useState, type FormEvent } from "react"
import { ProfileSectionCard } from "../shared/ProfileSectionCard"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Field, FieldLabel, FieldDescription } from "@workspace/ui/components/field"
import { toast } from "@workspace/ui/components/sonner"
import { setAuthUrlParam } from "@/lib/authStore"
import type { AuthUser } from "@/data/commentsData"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ViewIcon,
  ViewOffSlashIcon,
  Tick02Icon,
  Loading03Icon,
  Mail02Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons"

interface PasswordSecurityCardProps {
  user: AuthUser
}

export function PasswordSecurityCard({ user }: PasswordSecurityCardProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!currentPassword) {
      setError("Please enter your current password.")
      return
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.")
      return
    }

    setIsUpdating(true)
    setTimeout(() => {
      setIsUpdating(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success("Password Changed", {
        description: "Your account password has been updated successfully.",
      })
    }, 500)
  }

  const handleTriggerReset = () => {
    setAuthUrlParam("forgot-password", { email: user.email })
    toast.info("Password Reset Flow", {
      description: `Initiated verification code for ${user.email}.`,
    })
  }

  return (
    <div className="space-y-5">
      {/* Change Password */}
      <ProfileSectionCard
        id="section-password"
        title="Change Password"
        description="Update your account password. Use a strong, unique password."
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
          {/* Current Password */}
          <Field data-invalid={!!error && !currentPassword}>
            <FieldLabel htmlFor="pwd-current" className="text-xs">
              Current Password <span className="text-destructive">*</span>
            </FieldLabel>
            <div className="relative">
              <Input
                id="pwd-current"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value)
                  if (error) setError(null)
                }}
                className="rounded-md text-sm pr-9"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                tabIndex={-1}
              >
                <HugeiconsIcon
                  icon={showCurrent ? ViewOffSlashIcon : ViewIcon}
                  className="size-4"
                />
              </button>
            </div>
          </Field>

          {/* New Password */}
          <Field data-invalid={!!error && newPassword.length < 8}>
            <FieldLabel htmlFor="pwd-new" className="text-xs">
              New Password <span className="text-destructive">*</span>
            </FieldLabel>
            <div className="relative">
              <Input
                id="pwd-new"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  if (error) setError(null)
                }}
                className="rounded-md text-sm pr-9"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                tabIndex={-1}
              >
                <HugeiconsIcon
                  icon={showNew ? ViewOffSlashIcon : ViewIcon}
                  className="size-4"
                />
              </button>
            </div>
          </Field>

          {/* Confirm Password */}
          <Field data-invalid={!!error && confirmPassword !== newPassword}>
            <FieldLabel htmlFor="pwd-confirm" className="text-xs">
              Confirm New Password <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="pwd-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (error) setError(null)
              }}
              className="rounded-md text-sm"
              placeholder="••••••••••••"
            />
            <FieldDescription className="text-[11px] text-muted-foreground">
              Minimum 8 characters.
            </FieldDescription>
          </Field>

          {error && (
            <p className="flex items-center gap-1.5 text-xs text-destructive">
              <HugeiconsIcon icon={AlertCircleIcon} className="size-3.5" />
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isUpdating}
            className="rounded-md text-xs cursor-pointer"
          >
            {isUpdating ? (
              <>
                <HugeiconsIcon icon={Loading03Icon} className="size-3.5 mr-1.5 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <HugeiconsIcon icon={Tick02Icon} className="size-3.5 mr-1.5" />
                Update Password
              </>
            )}
          </Button>
        </form>
      </ProfileSectionCard>

      {/* Reset via Email */}
      <ProfileSectionCard
        id="section-reset-pwd"
        title="Reset Password via Email"
        description="Can't remember your current password? Request a secure recovery code."
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              Send verification code to {user.email}
            </p>
            <p className="text-xs text-muted-foreground max-w-md">
              We'll send a 6-digit one-time passcode to your email to securely set a new password.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTriggerReset}
            className="rounded-md text-xs cursor-pointer shrink-0"
          >
            <HugeiconsIcon icon={Mail02Icon} className="size-3.5 mr-1.5" />
            Send Reset Code
          </Button>
        </div>
      </ProfileSectionCard>
    </div>
  )
}
