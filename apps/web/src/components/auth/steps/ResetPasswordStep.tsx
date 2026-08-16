import { type FormEvent } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@workspace/ui/components/field"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  LockPasswordIcon,
  Tick02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

interface ResetPasswordStepProps {
  newPassword: string
  setNewPassword: (password: string) => void
  confirmPassword: string
  setConfirmPassword: (password: string) => void
  errors: { newPassword?: string; confirmPassword?: string }
  setErrors: React.Dispatch<
    React.SetStateAction<{ newPassword?: string; confirmPassword?: string }>
  >
  isSubmitting: boolean
  onSubmit: (e: FormEvent) => void
}

export function ResetPasswordStep({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  errors,
  setErrors,
  isSubmitting,
  onSubmit,
}: ResetPasswordStepProps) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <FieldGroup>
        <Field data-invalid={!!errors.newPassword}>
          <FieldLabel htmlFor="new-password">New Password</FieldLabel>
          <div className="relative">
            <Input
              id="new-password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                if (errors.newPassword) {
                  setErrors((prev) => ({ ...prev, newPassword: undefined }))
                }
              }}
              aria-invalid={!!errors.newPassword}
              className="rounded-none font-mono text-xs border-border bg-background/50 pl-8 focus:border-primary"
              required
            />
            <HugeiconsIcon
              icon={LockPasswordIcon}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
            />
          </div>
          <FieldDescription>Must be at least 8 characters.</FieldDescription>
          <FieldError errors={errors.newPassword} />
        </Field>

        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <div className="relative">
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                }
              }}
              aria-invalid={!!errors.confirmPassword}
              className="rounded-none font-mono text-xs border-border bg-background/50 pl-8 focus:border-primary"
              required
            />
            <HugeiconsIcon
              icon={LockPasswordIcon}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
            />
          </div>
          <FieldError errors={errors.confirmPassword} />
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-none font-mono text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer h-10 shadow-sm flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
            <span>Updating Password...</span>
          </>
        ) : (
          <>
            <HugeiconsIcon icon={Tick02Icon} className="size-4" />
            <span>Update Password & Sign In</span>
          </>
        )}
      </Button>
    </form>
  )
}
