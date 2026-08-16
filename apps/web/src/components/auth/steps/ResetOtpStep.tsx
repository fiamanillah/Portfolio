// src/components/auth/steps/ResetOtpStep.tsx
import { type FormEvent } from "react"
import { Button } from "@workspace/ui/components/button"
import { Field, FieldLabel, FieldError } from "@workspace/ui/components/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Loading03Icon,
  CheckmarkCircle02Icon,
  Mail02Icon,
} from "@hugeicons/core-free-icons"

interface ResetOtpStepProps {
  email: string
  otpCode: string
  setOtpCode: (code: string) => void
  error: string | null
  setError: (err: string | null) => void
  isVerifying: boolean
  isResending: boolean
  resendCountdown: number
  onResend: () => void
  onSubmit: (e: FormEvent) => void
}

export function ResetOtpStep({
  email,
  otpCode,
  setOtpCode,
  error,
  setError,
  isVerifying,
  isResending,
  resendCountdown,
  onResend,
  onSubmit,
}: ResetOtpStepProps) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {/* Information Banner */}
      <div className="flex items-start gap-3 rounded-none border border-primary/30 bg-primary/5 p-3.5">
        <HugeiconsIcon
          icon={Mail02Icon}
          className="mt-0.5 size-4 shrink-0 text-primary"
        />
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="font-mono text-xs font-semibold text-foreground">
            Password Recovery Code Sent
          </p>
          <p className="font-mono text-[11px] leading-relaxed break-words text-muted-foreground">
            Please check your inbox at{" "}
            <span className="font-bold text-primary">
              {email || "your email"}
            </span>{" "}
            for the recovery OTP.
          </p>
        </div>
      </div>

      {/* OTP Code Input */}
      <Field data-invalid={!!error} className="space-y-2">
        <FieldLabel
          htmlFor="reset-otp-input"
          className="block font-mono text-xs font-semibold text-foreground"
        >
          Enter 6-Digit Verification Code
        </FieldLabel>
        <div className="flex justify-center py-1">
          <InputOTP
            id="reset-otp-input"
            maxLength={6}
            value={otpCode}
            onChange={(val) => {
              setOtpCode(val)
              if (error) setError(null)
            }}
            autoFocus
          >
            <InputOTPGroup className="gap-2 sm:gap-2.5">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <FieldError errors={error ?? undefined} />
      </Field>

      {/* Resend Link */}
      <div className="flex items-center justify-between pt-1 font-mono text-xs">
        <span className="text-muted-foreground">Didn't receive code?</span>
        <button
          type="button"
          disabled={resendCountdown > 0 || isResending}
          onClick={onResend}
          className="cursor-pointer font-semibold text-primary transition-colors hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          {resendCountdown > 0
            ? `Resend in ${resendCountdown}s`
            : isResending
              ? "Sending..."
              : "Resend Code"}
        </button>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={otpCode.length < 6 || isVerifying}
        className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-none bg-primary font-mono text-xs font-bold tracking-wider text-primary-foreground uppercase shadow-sm transition-colors hover:bg-primary/90"
      >
        {isVerifying ? (
          <>
            <HugeiconsIcon
              icon={Loading03Icon}
              className="size-4 animate-spin"
            />
            <span>Validating Code...</span>
          </>
        ) : (
          <>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
            <span>Verify Recovery Code</span>
          </>
        )}
      </Button>
    </form>
  )
}
