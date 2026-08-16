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
import { AVATAR_OPTIONS } from "@/data/commentsData"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Tick02Icon,
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
  selectedAvatar: string
  setSelectedAvatar: (avatar: string) => void
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
  onSubmit: (e: FormEvent) => void
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
  selectedAvatar,
  setSelectedAvatar,
  subscribeNewsletter,
  setSubscribeNewsletter,
  errors,
  setErrors,
  isSubmitting,
  onSubmit,
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

        {/* Avatar Selection Grid */}
        <Field>
          <FieldLabel>Profile Avatar</FieldLabel>
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {AVATAR_OPTIONS.map((avatarUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedAvatar(avatarUrl)}
                className={`relative shrink-0 cursor-pointer rounded-full border-2 p-0.5 transition-all ${
                  selectedAvatar === avatarUrl
                    ? "border-primary shadow-[0_0_10px_oklch(var(--primary)/40%)]"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <img
                  src={avatarUrl}
                  alt={`Avatar option ${idx + 1}`}
                  className="size-8 rounded-full object-cover"
                />
                {selectedAvatar === avatarUrl && (
                  <span className="absolute -right-1 -bottom-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <HugeiconsIcon icon={Tick02Icon} className="size-2.5" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </Field>

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
              Subscribe to Updates & Newsletter
            </FieldLabel>
            <FieldDescription>
              Receive deep-dive architectural breakdowns, system case studies,
              and engineering updates.
            </FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>

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
            <span>Sending Verification Code...</span>
          </>
        ) : (
          <>
            <HugeiconsIcon icon={Mail02Icon} className="size-4" />
            <span>Continue with Email Verification →</span>
          </>
        )}
      </Button>
    </form>
  )
}
