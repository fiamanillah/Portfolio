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
      <div className="rounded-none border border-primary/20 bg-primary/5 p-3 flex items-start gap-2.5">
        <HugeiconsIcon icon={Key01Icon} className="size-4 text-primary shrink-0 mt-0.5" />
        <p className="font-mono text-[11px] text-foreground/80 leading-relaxed">
          Enter your registered email address. We will generate and dispatch a 6-digit verification code (OTP) to restore your account access.
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
            className="rounded-none font-mono text-xs border-border bg-background/50 pl-8 focus:border-primary"
            required
          />
          <HugeiconsIcon
            icon={Mail01Icon}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
          />
        </div>
        <FieldError errors={error ?? undefined} />
      </Field>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-none font-mono text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer h-10 shadow-sm flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
            <span>Dispatching OTP...</span>
          </>
        ) : (
          <>
            <HugeiconsIcon icon={Key01Icon} className="size-4" />
            <span>Send Verification Code</span>
          </>
        )}
      </Button>

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onNavigateToSignIn}
          className="font-mono text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
        >
          ← Return to Sign In
        </button>
      </div>
    </form>
  )
}
