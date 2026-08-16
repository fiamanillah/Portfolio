import { type FormEvent } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@workspace/ui/components/field"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Login01Icon,
  Mail01Icon,
  LockPasswordIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

interface SignInStepProps {
  email: string
  setEmail: (email: string) => void
  password: string
  setPassword: (password: string) => void
  errors: { email?: string; password?: string }
  setErrors: React.Dispatch<React.SetStateAction<{ email?: string; password?: string }>>
  isSubmitting: boolean
  onSubmit: (e: FormEvent) => void
  onForgotPassword: () => void
  onNavigateToSignUp: () => void
}

export function SignInStep({
  email,
  setEmail,
  password,
  setPassword,
  errors,
  setErrors,
  isSubmitting,
  onSubmit,
  onForgotPassword,
  onNavigateToSignUp,
}: SignInStepProps) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <FieldGroup>
        {/* Email Field */}
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="signin-email">Email Address</FieldLabel>
          <div className="relative">
            <Input
              id="signin-email"
              type="email"
              placeholder="alex@chen.io"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
              }}
              aria-invalid={!!errors.email}
              className="rounded-none font-mono text-xs border-border bg-background/50 pl-8 focus:border-primary"
              required
            />
            <HugeiconsIcon
              icon={Mail01Icon}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
            />
          </div>
          <FieldError errors={errors.email} />
        </Field>

        {/* Password Field */}
        <Field data-invalid={!!errors.password}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="signin-password">Password</FieldLabel>
            <button
              type="button"
              onClick={onForgotPassword}
              className="font-mono text-[11px] text-primary hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <Input
              id="signin-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
              }}
              aria-invalid={!!errors.password}
              className="rounded-none font-mono text-xs border-border bg-background/50 pl-8 focus:border-primary"
            />
            <HugeiconsIcon
              icon={LockPasswordIcon}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
            />
          </div>
          <FieldError errors={errors.password} />
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
            <span>Signing In...</span>
          </>
        ) : (
          <>
            <HugeiconsIcon icon={Login01Icon} className="size-4" />
            <span>Sign In</span>
          </>
        )}
      </Button>

      <div className="text-center pt-2 border-t border-border/60">
        <p className="font-mono text-[11px] text-muted-foreground">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onNavigateToSignUp}
            className="text-primary font-semibold hover:underline cursor-pointer"
          >
            Register here
          </button>
        </p>
      </div>
    </form>
  )
}
