// src/components/auth/steps/RegisterOtpStep.tsx
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

interface RegisterOtpStepProps {
  email: string
  otpCode: string
  setOtpCode: (code: string) => void
  error: string | null
  setError: (err: string | null) => void
  isActivating: boolean
  isResending: boolean
  resendCountdown: number
  onResend: () => void
  onSubmit: (e: FormEvent) => void
}

export function RegisterOtpStep({
  email,
  otpCode,
  setOtpCode,
  error,
  setError,
  isActivating,
  isResending,
  resendCountdown,
  onResend,
  onSubmit,
}: RegisterOtpStepProps) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {/* Information Banner */}
      <div className="rounded-none border border-primary/30 bg-primary/5 p-3.5 flex items-start gap-3">
        <HugeiconsIcon icon={Mail02Icon} className="size-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-0.5 min-w-0 flex-1">
          <p className="font-mono text-xs font-semibold text-foreground">
            Verification Code Dispatched
          </p>
          <p className="font-mono text-[11px] text-muted-foreground break-words leading-relaxed">
            Please check your inbox at <span className="text-primary font-bold">{email || "your email"}</span> and enter the 6-digit code.
          </p>
        </div>
      </div>

      {/* OTP Code Input */}
      <Field data-invalid={!!error} className="space-y-2">
        <FieldLabel htmlFor="reg-otp-input" className="font-mono text-xs font-semibold text-foreground block">
          Enter 6-Digit Email OTP Code
        </FieldLabel>
        <div className="flex justify-center py-1">
          <InputOTP
            id="reg-otp-input"
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
      <div className="flex items-center justify-between font-mono text-xs pt-1">
        <span className="text-muted-foreground">
          Didn't receive code?
        </span>
        <button
          type="button"
          disabled={resendCountdown > 0 || isResending}
          onClick={onResend}
          className="text-primary font-semibold hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        disabled={otpCode.length < 6 || isActivating}
        className="w-full rounded-none font-mono text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer h-10 shadow-sm flex items-center justify-center gap-2"
      >
        {isActivating ? (
          <>
            <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
            <span>Activating Account...</span>
          </>
        ) : (
          <>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
            <span>Verify & Activate Account</span>
          </>
        )}
      </Button>
    </form>
  )
}
