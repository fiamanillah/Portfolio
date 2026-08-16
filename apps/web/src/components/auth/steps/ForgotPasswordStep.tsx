import { type FormEvent } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Field, FieldLabel, FieldError } from "@workspace/ui/components/field"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Key01Icon,
  Mail01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

interface ForgotPasswordStepProps {
  email: string
  setEmail: (email: string) => void
  error: string | null
  setError: (err: string | null) => void
  isSubmitting: boolean
  onSubmit: (e: FormEvent) => void
  onNavigateToSignIn: () => void
}

export function ForgotPasswordStep({
  email,
  setEmail,
  error,
  setError,
  isSubmitting,
  onSubmit,
  onNavigateToSignIn,
}: ForgotPasswordStepProps) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="flex items-start gap-2.5 rounded-none border border-primary/20 bg-primary/5 p-3">
        <HugeiconsIcon
          icon={Key01Icon}
          className="mt-0.5 size-4 shrink-0 text-primary"
        />
        <p className="font-mono text-[11px] leading-relaxed text-foreground/80">
          Enter your registered email address. We will generate and dispatch a
          6-digit verification code (OTP) to restore your account access.
        </p>
      </div>

      <Field data-invalid={!!error}>
        <FieldLabel htmlFor="forgot-email">Account Email Address</FieldLabel>
        <div className="relative">
          <Input
            id="forgot-email"
            type="email"
            placeholder="sarah@cloudops.net"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError(null)
            }}
            aria-invalid={!!error}
            className="rounded-none border-border bg-background/50 pl-8 font-mono text-xs focus:border-primary"
            required
          />
          <HugeiconsIcon
            icon={Mail01Icon}
            className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
        </div>
        <FieldError errors={error ?? undefined} />
      </Field>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-none bg-primary font-mono text-xs font-bold tracking-wider text-primary-foreground uppercase shadow-sm transition-colors hover:bg-primary/90"
      >
        {isSubmitting ? (
          <>
            <HugeiconsIcon
              icon={Loading03Icon}
              className="size-4 animate-spin"
            />
            <span>Dispatching OTP...</span>
          </>
        ) : (
          <>
            <HugeiconsIcon icon={Key01Icon} className="size-4" />
            <span>Send Verification Code</span>
          </>
        )}
      </Button>

      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={onNavigateToSignIn}
          className="cursor-pointer font-mono text-[11px] text-muted-foreground transition-colors hover:text-primary"
        >
          ← Return to Sign In
        </button>
      </div>
    </form>
  )
}
