import { type FormEvent } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldContent,
} from "@workspace/ui/components/field"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Loading03Icon,
  Notification01Icon,
  Mail02Icon,
} from "@hugeicons/core-free-icons"

interface SignUpStepProps {
  name: string
  setName: (name: string) => void
  username: string
  setUsername: (username: string) => void
  email: string
  setEmail: (email: string) => void
  password: string
  setPassword: (password: string) => void
  role: string
  setRole: (role: string) => void
  subscribeNewsletter: boolean
  setSubscribeNewsletter: (sub: boolean) => void
  errors: {
    name?: string
    username?: string
    email?: string
    password?: string
  }
  setErrors: React.Dispatch<
    React.SetStateAction<{
      name?: string
      username?: string
      email?: string
      password?: string
    }>
  >
  isSubmitting: boolean
  isGoogleSubmitting?: boolean
  onSubmit: (e: FormEvent) => void
  onGoogleSignUp?: () => void
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

export function SignUpStep({
  name,
  setName,
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  role,
  setRole,
  subscribeNewsletter,
  setSubscribeNewsletter,
  errors,
  setErrors,
  isSubmitting,
  isGoogleSubmitting = false,
  onSubmit,
  onGoogleSignUp,
}: SignUpStepProps) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3.5">
      <FieldGroup>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Full Name Field */}
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="signup-name">Full Name *</FieldLabel>
            <Input
              id="signup-name"
              type="text"
              placeholder="Elena Rostova"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name)
                  setErrors((prev) => ({ ...prev, name: undefined }))
              }}
              aria-invalid={!!errors.name}
              className="rounded-none border-border bg-background/50 font-mono text-xs focus:border-primary"
              required
            />
            <FieldError errors={errors.name} />
          </Field>

          {/* Username Field */}
          <Field data-invalid={!!errors.username}>
            <FieldLabel htmlFor="signup-username">Username</FieldLabel>
            <Input
              id="signup-username"
              type="text"
              placeholder="elena_ops"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (errors.username)
                  setErrors((prev) => ({ ...prev, username: undefined }))
              }}
              aria-invalid={!!errors.username}
              className="rounded-none border-border bg-background/50 font-mono text-xs focus:border-primary"
            />
            <FieldError errors={errors.username} />
          </Field>
        </div>

        {/* Email Field */}
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="signup-email">Email Address *</FieldLabel>
          <Input
            id="signup-email"
            type="email"
            placeholder="elena@kubestack.io"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email)
                setErrors((prev) => ({ ...prev, email: undefined }))
            }}
            aria-invalid={!!errors.email}
            className="rounded-none border-border bg-background/50 font-mono text-xs focus:border-primary"
            required
          />
          <FieldError errors={errors.email} />
        </Field>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Password Field */}
          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="signup-password">Password</FieldLabel>
            <Input
              id="signup-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password)
                  setErrors((prev) => ({ ...prev, password: undefined }))
              }}
              aria-invalid={!!errors.password}
              className="rounded-none border-border bg-background/50 font-mono text-xs focus:border-primary"
            />
            <FieldError errors={errors.password} />
          </Field>

          {/* Role Field */}
          <Field>
            <FieldLabel htmlFor="signup-role">Title / Role</FieldLabel>
            <Input
              id="signup-role"
              type="text"
              placeholder="DevOps Lead"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-none border-border bg-background/50 font-mono text-xs focus:border-primary"
            />
          </Field>
        </div>

        {/* Newsletter & Updates Subscription Checkbox with Field Component */}
        <Field
          orientation="horizontal"
          className="items-start rounded-none border border-border/80 bg-muted/20 p-3"
        >
          <Checkbox
            id="newsletter-sub"
            checked={subscribeNewsletter}
            onCheckedChange={(checked) => setSubscribeNewsletter(!!checked)}
            className="mt-0.5"
          />
          <FieldContent className="cursor-pointer select-none">
            <FieldLabel
              htmlFor="newsletter-sub"
              className="flex cursor-pointer items-center gap-1 font-semibold"
            >
              <HugeiconsIcon
                icon={Notification01Icon}
                className="inline size-3 text-primary"
              />
              Subscribe to Tech Stories &amp; Newsletter
            </FieldLabel>
            <FieldDescription>
              Receive curated dispatches on AI breakthroughs, hardware &amp;
              semiconductor markets, and modern software engineering.
            </FieldDescription>
          </FieldContent>
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
            <span>Sending Verification Code...</span>
          </>
        ) : (
          <>
            <HugeiconsIcon icon={Mail02Icon} className="size-4" />
            <span>Continue with Email Verification →</span>
          </>
        )}
      </Button>

      {onGoogleSignUp && (
        <>
          <div className="relative flex items-center justify-center py-0.5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/70" />
            </div>
            <span className="relative bg-card px-2 font-mono text-[10px] text-muted-foreground uppercase">
              Or sign up with
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting || isGoogleSubmitting}
            onClick={onGoogleSignUp}
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
                <span>Sign up with Google</span>
              </>
            )}
          </Button>
        </>
      )}

      <p className="text-center font-mono text-[10px] text-muted-foreground/80">
        By signing up, you agree to our{" "}
        <a
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-foreground"
        >
          Terms of Use
        </a>{" "}
        and{" "}
        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-foreground"
        >
          Privacy Policy
        </a>
        .
      </p>
    </form>
  )
}
