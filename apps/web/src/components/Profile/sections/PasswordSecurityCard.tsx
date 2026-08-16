// src/components/Profile/sections/PasswordSecurityCard.tsx
import { useState, type FormEvent } from "react"
import { ProfileSectionCard } from "../shared/ProfileSectionCard"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Field, FieldLabel, FieldDescription, FieldError } from "@workspace/ui/components/field"
import { toast } from "@workspace/ui/components/sonner"
import { setAuthUrlParam } from "@/lib/authStore"
import { AuthApi } from "@/lib/api/authApi"
import { changePasswordSchema } from "@workspace/shared"
import type { AuthUser } from "@workspace/shared"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ViewIcon,
  ViewOffSlashIcon,
  Tick02Icon,
  Loading03Icon,
  Mail02Icon,
  LockPasswordIcon,
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

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const parseResult = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
    })

    if (!parseResult.success) {
      setError(parseResult.error.issues[0]?.message || "Invalid password parameters.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.")
      return
    }

    setIsUpdating(true)
    try {
      const res = await AuthApi.changePassword(currentPassword, newPassword)
      if (res.success) {
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        toast.success("Password Updated", {
          description: "Your account password has been changed successfully.",
        })
      } else {
        setError(res.error || res.message || "Failed to update password.")
        toast.error("Password Update Failed", { description: res.error || res.message })
      }
    } catch (err: any) {
      setError(err?.message || "Password update failed.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleTriggerReset = () => {
    setAuthUrlParam("forgot-password")
    toast.info("Password Reset Flow", {
      description: `Verification OTP triggered for ${user.email}.`,
    })
  }

  return (
    <div className="space-y-6">
      {/* 1. Change Password */}
      <ProfileSectionCard
        id="section-password"
        title="Update Password"
        description="Change your login password. Must be at least 8 characters."
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
          {/* Current Password */}
          <Field data-invalid={!!error && !currentPassword}>
            <FieldLabel htmlFor="pwd-current" className="font-mono text-xs font-semibold">
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
                className="rounded-none font-mono text-xs border-border bg-background/50 pr-9 focus:border-primary"
                placeholder="••••••••••••"
                required
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
            <FieldLabel htmlFor="pwd-new" className="font-mono text-xs font-semibold">
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
                className="rounded-none font-mono text-xs border-border bg-background/50 pr-9 focus:border-primary"
                placeholder="••••••••••••"
                required
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
            <FieldDescription className="font-mono text-[10px]">
              Minimum 8 characters.
            </FieldDescription>
          </Field>

          {/* Confirm Password */}
          <Field data-invalid={!!error && confirmPassword !== newPassword}>
            <FieldLabel htmlFor="pwd-confirm" className="font-mono text-xs font-semibold">
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
              className="rounded-none font-mono text-xs border-border bg-background/50 focus:border-primary"
              placeholder="••••••••••••"
              required
            />
            {error && <FieldError className="font-mono text-xs">{error}</FieldError>}
          </Field>

          <Button
            type="submit"
            disabled={isUpdating || !currentPassword || newPassword.length < 8}
            className="rounded-none font-mono text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer h-9 px-4 flex items-center gap-2"
          >
            {isUpdating ? (
              <>
                <HugeiconsIcon icon={Loading03Icon} className="size-3.5 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
                <span>Save New Password</span>
              </>
            )}
          </Button>
        </form>
      </ProfileSectionCard>

      {/* 2. Reset via Email */}
      <ProfileSectionCard
        id="section-reset-pwd"
        title="Forgot Current Password?"
        description="Trigger an instant 6-digit one-time passcode to your verified inbox."
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <p className="font-mono text-xs font-semibold text-foreground flex items-center gap-1.5">
              <HugeiconsIcon icon={Mail02Icon} className="size-3.5 text-primary" />
              <span>Send recovery OTP to {user.email}</span>
            </p>
            <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
              If you have forgotten your existing password, you can generate a secure OTP code to reset it.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTriggerReset}
            className="rounded-none font-mono text-xs border-primary/40 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer shrink-0 h-8 px-3 flex items-center gap-1.5"
          >
            <HugeiconsIcon icon={LockPasswordIcon} className="size-3.5" />
            <span>Reset via OTP</span>
          </Button>
        </div>
      </ProfileSectionCard>
    </div>
  )
}
