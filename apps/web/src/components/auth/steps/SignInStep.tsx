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
  setErrors: React.Dispatch<
    React.SetStateAction<{ email?: string; password?: string }>
  >
  isSubmitting: boolean
  isGoogleSubmitting?: boolean
  onSubmit: (e: FormEvent) => void
  onGoogleSignIn?: () => void
  onForgotPassword: () => void
  onNavigateToSignUp: () => void
}

function GoogleIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27A7.16 7.16 0 0 1 4.9 12c0-.79.14-1.57.38-2.27V6.58H1.25A11.97 11.97 0 0 0 0 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
      />
    </svg>
  )
}

export function SignInStep({
  email,
  setEmail,
  password,
  setPassword,
  errors,
  setErrors,
  isSubmitting,
  isGoogleSubmitting = false,
  onSubmit,
  onGoogleSignIn,
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
                if (errors.email)
                  setErrors((prev) => ({ ...prev, email: undefined }))
              }}
              aria-invalid={!!errors.email}
              className="rounded-none border-border bg-background/50 pl-8 font-mono text-xs focus:border-primary"
              required
            />
            <HugeiconsIcon
              icon={Mail01Icon}
              className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
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
              className="cursor-pointer font-mono text-[11px] text-primary hover:underline"
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
                if (errors.password)
                  setErrors((prev) => ({ ...prev, password: undefined }))
              }}
              aria-invalid={!!errors.password}
              className="rounded-none border-border bg-background/50 pl-8 font-mono text-xs focus:border-primary"
            />
            <HugeiconsIcon
              icon={LockPasswordIcon}
              className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
          </div>
          <FieldError errors={errors.password} />
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        disabled={isSubmitting || isGoogleSubmitting}
        className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-none bg-primary font-mono text-xs font-bold tracking-wider text-primary-foreground uppercase shadow-sm transition-colors hover:bg-primary/90"
      >
        {isSubmitting ? (
          <>
            <HugeiconsIcon
              icon={Loading03Icon}
              className="size-4 animate-spin"
            />
            <span>Signing In...</span>
          </>
        ) : (
          <>
            <HugeiconsIcon icon={Login01Icon} className="size-4" />
            <span>Sign In</span>
          </>
        )}
      </Button>

      {onGoogleSignIn && (
        <>
          <div className="relative flex items-center justify-center py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/70" />
            </div>
            <span className="relative bg-card px-2 font-mono text-[10px] text-muted-foreground uppercase">
              Or continue with
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting || isGoogleSubmitting}
            onClick={onGoogleSignIn}
            className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-none border border-border bg-background/60 font-mono text-xs font-semibold text-foreground transition-all hover:bg-muted/60 hover:text-foreground"
          >
            {isGoogleSubmitting ? (
              <>
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="size-4 animate-spin"
                />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon className="size-4" />
                <span>Continue with Google</span>
              </>
            )}
          </Button>
        </>
      )}

      <div className="border-t border-border/60 pt-2 text-center">
        <p className="font-mono text-[11px] text-muted-foreground">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onNavigateToSignUp}
            className="cursor-pointer font-semibold text-primary hover:underline"
          >
            Register here
          </button>
        </p>
      </div>
    </form>
  )
}
