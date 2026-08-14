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
      <div className="rounded-none border border-border bg-muted/20 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-muted-foreground">
            Target Email:
          </span>
          <span className="font-mono text-xs font-semibold text-primary">
            {email || "user@example.io"}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-border/40">
          <span className="font-mono text-[10px] text-muted-foreground">
            Demo Shortcut:
          </span>
          <button
            type="button"
            onClick={() => {
              setOtpCode("123456")
              setError(null)
            }}
            className="font-mono text-[10px] text-primary underline hover:text-primary/80 cursor-pointer"
          >
            Auto-fill code (123456)
          </button>
        </div>
      </div>

      <Field data-invalid={!!error} className="flex flex-col items-center">
        <FieldLabel htmlFor="reset-otp-input" className="self-start">
          Enter 6-Digit Code
        </FieldLabel>
        <InputOTP
          id="reset-otp-input"
          maxLength={6}
          value={otpCode}
          onChange={(val) => {
            setOtpCode(val)
            if (error) setError(null)
          }}
          className="gap-2 my-1"
        >
          <InputOTPGroup className="gap-2">
            <InputOTPSlot index={0} className="rounded-none font-mono text-base font-bold border-border" />
            <InputOTPSlot index={1} className="rounded-none font-mono text-base font-bold border-border" />
            <InputOTPSlot index={2} className="rounded-none font-mono text-base font-bold border-border" />
            <InputOTPSlot index={3} className="rounded-none font-mono text-base font-bold border-border" />
            <InputOTPSlot index={4} className="rounded-none font-mono text-base font-bold border-border" />
            <InputOTPSlot index={5} className="rounded-none font-mono text-base font-bold border-border" />
          </InputOTPGroup>
        </InputOTP>
        <FieldError errors={error ?? undefined} />
      </Field>

      <div className="flex items-center justify-between font-mono text-[11px] pt-1">
        <span className="text-muted-foreground">
          Didn't receive code?
        </span>
        <button
          type="button"
          disabled={resendCountdown > 0 || isResending}
          onClick={onResend}
          className="text-primary font-semibold hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resendCountdown > 0
            ? `Resend in ${resendCountdown}s`
            : "Resend Code"}
        </button>
      </div>

      <Button
        type="submit"
        disabled={otpCode.length < 6 || isVerifying}
        className="w-full rounded-none font-mono text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer h-9 shadow-sm"
      >
        {isVerifying ? (
          <>
            <HugeiconsIcon icon={Loading03Icon} className="size-3.5 animate-spin mr-1.5" />
            <span>Validating Code...</span>
          </>
        ) : (
          <>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5 mr-1.5" />
            <span>Verify Code</span>
          </>
        )}
      </Button>
    </form>
  )
}
