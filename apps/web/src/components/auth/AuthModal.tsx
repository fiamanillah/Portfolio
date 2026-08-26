// src/components/auth/AuthModal.tsx
import { useState, useEffect, useCallback, type FormEvent } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import type { AuthUser } from "@/data/commentsData"
import {
  setStoredUser,
  getAuthUrlParam,
  setAuthUrlParam,
  AUTH_MODAL_EVENT,
  type AuthModalStep,
} from "@/lib/authStore"
import { toast } from "@workspace/ui/components/sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Login01Icon,
  UserAdd01Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons"

// Import modular step components
import { SignInStep } from "./steps/SignInStep"
import { SignUpStep } from "./steps/SignUpStep"
import { RegisterOtpStep } from "./steps/RegisterOtpStep"
import { ForgotPasswordStep } from "./steps/ForgotPasswordStep"
import { ResetOtpStep } from "./steps/ResetOtpStep"
import { ResetPasswordStep } from "./steps/ResetPasswordStep"

import { AuthApi } from "@/lib/api/authApi"
import {
  loginSchema,
  initiateRegisterSchema,
  verifyRegisterOtpSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
} from "@workspace/shared"

export interface AuthModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: (user: AuthUser) => void
  actionLabel?: string
  initialStep?: AuthModalStep
}

export function AuthModal({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
  actionLabel = "to access interactive features",
  initialStep = "signin",
}: AuthModalProps) {
  // Manage open state (either controlled via prop or synchronized via URL query)
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen

  // Current Step state
  const [currentStep, setCurrentStep] = useState<AuthModalStep>(initialStep)

  // Sign In Form State & Validation
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")
  const [signInErrors, setSignInErrors] = useState<{
    email?: string
    password?: string
  }>({})
  const [isSigningIn, setIsSigningIn] = useState(false)

  // Registration Form State & Validation
  const [signUpName, setSignUpName] = useState("")
  const [signUpUsername, setSignUpUsername] = useState("")
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [signUpRole, setSignUpRole] = useState("")
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true)
  const [signUpErrors, setSignUpErrors] = useState<{
    name?: string
    username?: string
    email?: string
    password?: string
  }>({})
  const [registerOtpCode, setRegisterOtpCode] = useState("")
  const [registerOtpError, setRegisterOtpError] = useState<string | null>(null)
  const [isSendingRegisterOtp, setIsSendingRegisterOtp] = useState(false)
  const [isActivatingAccount, setIsActivatingAccount] = useState(false)
  const [registerResendCountdown, setRegisterResendCountdown] = useState(45)

  // Forgot Password / Password Reset State & Validation
  const [resetEmail, setResetEmail] = useState("")
  const [resetEmailError, setResetEmailError] = useState<string | null>(null)
  const [resetOtpCode, setResetOtpCode] = useState("")
  const [resetOtpError, setResetOtpError] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [resetPasswordErrors, setResetPasswordErrors] = useState<{
    newPassword?: string
    confirmPassword?: string
  }>({})
  const [isSendingResetOtp, setIsSendingResetOtp] = useState(false)
  const [isVerifyingResetOtp, setIsVerifyingResetOtp] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [resetResendCountdown, setResetResendCountdown] = useState(45)

  // Sync with URL query on mount and URL popstate changes
  useEffect(() => {
    const handleUrlQuerySync = () => {
      const stepFromUrl = getAuthUrlParam()
      if (stepFromUrl) {
        setCurrentStep(stepFromUrl)
        if (!isControlled) {
          setInternalOpen(true)
        }
      } else if (!isControlled) {
        setInternalOpen(false)
      }
    }

    handleUrlQuerySync()
    window.addEventListener("popstate", handleUrlQuerySync)
    window.addEventListener(AUTH_MODAL_EVENT, handleUrlQuerySync)

    return () => {
      window.removeEventListener("popstate", handleUrlQuerySync)
      window.removeEventListener(AUTH_MODAL_EVENT, handleUrlQuerySync)
    }
  }, [isControlled])

  // Registration OTP Countdown Timer
  useEffect(() => {
    if (currentStep === "register-verify-otp" && registerResendCountdown > 0) {
      const timer = setInterval(() => {
        setRegisterResendCountdown((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [currentStep, registerResendCountdown])

  // Password Reset OTP Countdown Timer
  useEffect(() => {
    if (currentStep === "verify-otp" && resetResendCountdown > 0) {
      const timer = setInterval(() => {
        setResetResendCountdown((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [currentStep, resetResendCountdown])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (controlledOnOpenChange) {
        controlledOnOpenChange(nextOpen)
      } else {
        setInternalOpen(nextOpen)
      }

      if (!nextOpen) {
        setAuthUrlParam(null)
      }
    },
    [controlledOnOpenChange]
  )

  const navigateToStep = (step: AuthModalStep) => {
    setCurrentStep(step)
    setAuthUrlParam(step)
    // Clear transient errors
    setSignInErrors({})
    setSignUpErrors({})
    setRegisterOtpError(null)
    setResetEmailError(null)
    setResetOtpError(null)
    setResetPasswordErrors({})
  }

  // Sign In Handler using shared loginSchema
  const handleSignInSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const parseResult = loginSchema.safeParse({
      email: signInEmail,
      password: signInPassword,
    })

    if (!parseResult.success) {
      const errors: { email?: string; password?: string } = {}
      parseResult.error.issues.forEach((issue) => {
        const field = issue.path[0] as "email" | "password"
        if (field && !errors[field]) errors[field] = issue.message
      })
      setSignInErrors(errors)
      return
    }

    setSignInErrors({})
    setIsSigningIn(true)

    try {
      const res = await AuthApi.login({
        email: parseResult.data.email,
        password: parseResult.data.password,
      })

      if (res.success && res.data?.user) {
        setStoredUser(res.data.user)
        toast.success(`Welcome back, ${res.data.user.name}!`, {
          description: "Signed in successfully to your account.",
        })
        handleOpenChange(false)
        onSuccess?.(res.data.user)
        return
      }

      toast.error("Sign-in Failed", {
        description: res.error || res.message || "Invalid credentials.",
      })
    } catch (err: unknown) {
      toast.error("Sign-in Error", {
        description:
          err instanceof Error
            ? err.message
            : "Could not connect to authentication server.",
      })
    } finally {
      setIsSigningIn(false)
    }
  }

  // Registration Step 1: Initiate registration with shared initiateRegisterSchema
  const handleInitiateRegistration = async (e: FormEvent) => {
    e.preventDefault()

    const parseResult = initiateRegisterSchema.safeParse({
      name: signUpName,
      username: signUpUsername.trim() || undefined,
      email: signUpEmail,
      password: signUpPassword,
      role: signUpRole.trim() || undefined,
      subscribedToNewsletter: subscribeNewsletter,
    })

    if (!parseResult.success) {
      const errors: {
        name?: string
        username?: string
        email?: string
        password?: string
      } = {}
      parseResult.error.issues.forEach((issue) => {
        const field = issue.path[0] as
          | "name"
          | "username"
          | "email"
          | "password"
        if (field && !errors[field]) errors[field] = issue.message
      })
      setSignUpErrors(errors)
      return
    }

    setSignUpErrors({})
    setIsSendingRegisterOtp(true)

    try {
      const res = await AuthApi.initiateRegister(parseResult.data)

      if (res.success) {
        setRegisterResendCountdown(45)
        setRegisterOtpCode("")
        setRegisterOtpError(null)
        navigateToStep("register-verify-otp")
        toast.success("Verification Code Sent", {
          description: `We've dispatched a 6-digit verification code to ${signUpEmail}.`,
        })
      } else {
        toast.error("Registration Failed", {
          description:
            res.error || res.message || "Failed to initiate registration.",
        })
      }
    } catch (err: unknown) {
      toast.error("Registration Error", {
        description:
          err instanceof Error
            ? err.message
            : "Could not connect to authentication server.",
      })
    } finally {
      setIsSendingRegisterOtp(false)
    }
  }

  // Registration Step 2: Resend Registration OTP
  const handleResendRegisterOtp = async () => {
    if (registerResendCountdown > 0) return
    setIsSendingRegisterOtp(true)
    try {
      const res = await AuthApi.resendOtp(signUpEmail, "REGISTER_EMAIL_VERIFY")
      if (res.success) {
        setRegisterResendCountdown(45)
        setRegisterOtpError(null)
        toast.success("New OTP Code Sent", {
          description: `A new 6-digit code has been dispatched to ${signUpEmail}.`,
        })
      } else {
        toast.error("Resend Failed", { description: res.error || res.message })
      }
    } catch (err: unknown) {
      toast.error("Resend Error", {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setIsSendingRegisterOtp(false)
    }
  }

  // Registration Step 3: Verify Email OTP with shared verifyRegisterOtpSchema
  const handleVerifyRegisterOtp = async (e: FormEvent) => {
    e.preventDefault()

    const parseResult = verifyRegisterOtpSchema.safeParse({
      email: signUpEmail,
      otpCode: registerOtpCode,
    })

    if (!parseResult.success) {
      setRegisterOtpError(
        parseResult.error.issues[0]?.message || "Invalid verification code"
      )
      return
    }

    setRegisterOtpError(null)
    setIsActivatingAccount(true)

    try {
      const res = await AuthApi.verifyRegisterOtp(parseResult.data)

      if (res.success && res.data?.user) {
        setStoredUser(res.data.user)
        toast.success("Account Created & Verified!", {
          description: `Welcome to the platform, ${res.data.user.name}!`,
        })

        if (subscribeNewsletter) {
          toast.info("Newsletter Active", {
            description:
              "You have been subscribed to developer case studies and updates.",
          })
        }

        handleOpenChange(false)
        onSuccess?.(res.data.user)
      } else {
        setRegisterOtpError(res.error || res.message || "Invalid code.")
        toast.error("Verification Failed", {
          description: res.error || res.message || "Invalid verification code.",
        })
      }
    } catch (err: unknown) {
      setRegisterOtpError(
        err instanceof Error ? err.message : "Verification failed."
      )
      toast.error("Verification Error", {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setIsActivatingAccount(false)
    }
  }

  // Forgot Password: Request OTP with shared forgotPasswordSchema
  const handleRequestResetOtp = async (e: FormEvent) => {
    e.preventDefault()

    const parseResult = forgotPasswordSchema.safeParse({
      email: resetEmail,
    })

    if (!parseResult.success) {
      setResetEmailError(
        parseResult.error.issues[0]?.message || "Invalid email address"
      )
      return
    }

    setResetEmailError(null)
    setIsSendingResetOtp(true)

    try {
      const res = await AuthApi.forgotPassword(parseResult.data.email)
      if (res.success) {
        setResetResendCountdown(45)
        setResetOtpCode("")
        setResetOtpError(null)
        navigateToStep("verify-otp")
        toast.success("Verification Code Sent", {
          description: `We've sent a 6-digit OTP code to ${resetEmail}.`,
        })
      } else {
        toast.error("Request Failed", { description: res.error || res.message })
      }
    } catch (err: unknown) {
      toast.error("Request Error", {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setIsSendingResetOtp(false)
    }
  }

  // Resend Reset OTP
  const handleResendResetOtp = async () => {
    if (resetResendCountdown > 0) return
    setIsSendingResetOtp(true)
    try {
      const res = await AuthApi.resendOtp(resetEmail, "PASSWORD_RESET")
      if (res.success) {
        setResetResendCountdown(45)
        setResetOtpError(null)
        toast.success("New OTP Code Sent", {
          description: `A new 6-digit code has been dispatched to ${resetEmail}.`,
        })
      } else {
        toast.error("Resend Failed", { description: res.error || res.message })
      }
    } catch (err: unknown) {
      toast.error("Resend Error", {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setIsSendingResetOtp(false)
    }
  }

  // Verify Password Reset OTP with shared verifyResetOtpSchema
  const handleVerifyResetOtp = async (e: FormEvent) => {
    e.preventDefault()

    const parseResult = verifyResetOtpSchema.safeParse({
      email: resetEmail,
      otpCode: resetOtpCode,
    })

    if (!parseResult.success) {
      setResetOtpError(
        parseResult.error.issues[0]?.message || "Invalid verification code"
      )
      return
    }

    setResetOtpError(null)
    setIsVerifyingResetOtp(true)

    try {
      const res = await AuthApi.verifyResetOtp(
        parseResult.data.email,
        parseResult.data.otpCode
      )
      if (res.success) {
        navigateToStep("reset-password")
        toast.success("OTP Code Verified", {
          description: "Please choose a new password for your account.",
        })
      } else {
        setResetOtpError(res.error || res.message || "Invalid code.")
        toast.error("Verification Failed", {
          description: res.error || res.message,
        })
      }
    } catch (err: unknown) {
      setResetOtpError(
        err instanceof Error ? err.message : "Verification failed."
      )
      toast.error("Verification Error", {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setIsVerifyingResetOtp(false)
    }
  }

  // Reset Password Submit with shared resetPasswordSchema
  const handleResetPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const parseResult = resetPasswordSchema.safeParse({
      email: resetEmail,
      otpCode: resetOtpCode,
      newPassword,
    })

    const errors: { newPassword?: string; confirmPassword?: string } = {}

    if (!parseResult.success) {
      parseResult.error.issues.forEach((issue) => {
        if (issue.path[0] === "newPassword") errors.newPassword = issue.message
      })
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirm password is required"
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    if (Object.keys(errors).length > 0) {
      setResetPasswordErrors(errors)
      return
    }

    setResetPasswordErrors({})
    setIsResettingPassword(true)

    try {
      const res = await AuthApi.resetPassword({
        email: parseResult.success ? parseResult.data.email : resetEmail,
        otpCode: parseResult.success ? parseResult.data.otpCode : resetOtpCode,
        newPassword: parseResult.success
          ? parseResult.data.newPassword
          : newPassword,
      })

      if (res.success && res.data?.user) {
        setStoredUser(res.data.user)
        toast.success("Password Updated Successfully!", {
          description: `Welcome back, ${res.data.user.name}. You are now signed in.`,
        })
        handleOpenChange(false)
        onSuccess?.(res.data.user)
      } else {
        toast.error("Reset Failed", { description: res.error || res.message })
      }
    } catch (err: unknown) {
      toast.error("Reset Error", {
        description: err instanceof Error ? err.message : undefined,
      })
    } finally {
      setIsResettingPassword(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] gap-4 rounded-none border border-border bg-card/95 p-5 shadow-2xl backdrop-blur-xl sm:max-w-[480px] sm:p-7">
        {/* Modal Header */}
        <DialogHeader className="space-y-1.5 pb-1">
          <div className="flex items-center justify-between pr-10">
            <span className="inline-flex items-center border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary uppercase">
              // ACCOUNT_AUTHENTICATION
            </span>

            {/* Back button for recovery sub-steps or registration OTP */}
            {currentStep === "register-verify-otp" && (
              <button
                type="button"
                onClick={() => navigateToStep("signup")}
                className="inline-flex cursor-pointer items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-primary"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3" />
                <span>Edit Details</span>
              </button>
            )}

            {(currentStep === "forgot-password" ||
              currentStep === "verify-otp" ||
              currentStep === "reset-password") && (
              <button
                type="button"
                onClick={() => navigateToStep("signin")}
                className="inline-flex cursor-pointer items-center gap-1 font-mono text-[11px] text-muted-foreground transition-colors hover:text-primary"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3" />
                <span>Back to Sign In</span>
              </button>
            )}
          </div>

          <DialogTitle className="font-mono text-xl font-bold tracking-tight text-foreground">
            {currentStep === "signin" && "Sign In to Your Account"}
            {currentStep === "signup" && "Create an Account"}
            {currentStep === "register-verify-otp" && "Verify Your Email"}
            {currentStep === "forgot-password" && "Reset Password"}
            {currentStep === "verify-otp" && "Verify Security Code"}
            {currentStep === "reset-password" && "Set New Password"}
          </DialogTitle>

          <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
            {currentStep === "signin" &&
              `Sign in ${actionLabel}. Access discussions, profile preferences, and security settings.`}
            {currentStep === "signup" &&
              "Fill in your details below. We'll send a quick verification code to your email."}
            {currentStep === "register-verify-otp" &&
              `Enter the 6-digit verification code sent to ${signUpEmail || "your email"} to activate your account.`}
            {currentStep === "forgot-password" &&
              "Enter your account email to receive a 6-digit one-time passcode (OTP)."}
            {currentStep === "verify-otp" &&
              `Enter the 6-digit code sent to ${resetEmail || "your email"}.`}
            {currentStep === "reset-password" &&
              "Choose a new password to restore full access to your account."}
          </DialogDescription>
        </DialogHeader>

        {/* Tab Selector for Primary Steps (Sign In vs Register) */}
        {(currentStep === "signin" || currentStep === "signup") && (
          <div className="mb-4 grid grid-cols-2 gap-1 border border-border bg-muted/30 p-1">
            <button
              type="button"
              onClick={() => navigateToStep("signin")}
              className={`flex cursor-pointer items-center justify-center gap-1.5 py-1.5 font-mono text-xs transition-all ${
                currentStep === "signin"
                  ? "border border-border bg-background font-bold text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <HugeiconsIcon icon={Login01Icon} className="size-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => navigateToStep("signup")}
              className={`flex cursor-pointer items-center justify-center gap-1.5 py-1.5 font-mono text-xs transition-all ${
                currentStep === "signup"
                  ? "border border-border bg-background font-bold text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <HugeiconsIcon icon={UserAdd01Icon} className="size-3.5" />
              <span>Register</span>
            </button>
          </div>
        )}

        {/* STEP 1: Sign In */}
        {currentStep === "signin" && (
          <SignInStep
            email={signInEmail}
            setEmail={setSignInEmail}
            password={signInPassword}
            setPassword={setSignInPassword}
            errors={signInErrors}
            setErrors={setSignInErrors}
            isSubmitting={isSigningIn}
            onSubmit={handleSignInSubmit}
            onForgotPassword={() => {
              setResetEmail(signInEmail)
              navigateToStep("forgot-password")
            }}
            onNavigateToSignUp={() => navigateToStep("signup")}
          />
        )}

        {/* STEP 2: Register */}
        {currentStep === "signup" && (
          <SignUpStep
            name={signUpName}
            setName={setSignUpName}
            username={signUpUsername}
            setUsername={setSignUpUsername}
            email={signUpEmail}
            setEmail={setSignUpEmail}
            password={signUpPassword}
            setPassword={setSignUpPassword}
            role={signUpRole}
            setRole={setSignUpRole}
            subscribeNewsletter={subscribeNewsletter}
            setSubscribeNewsletter={setSubscribeNewsletter}
            errors={signUpErrors}
            setErrors={setSignUpErrors}
            isSubmitting={isSendingRegisterOtp}
            onSubmit={handleInitiateRegistration}
          />
        )}

        {/* STEP 3: Register OTP Verification */}
        {currentStep === "register-verify-otp" && (
          <RegisterOtpStep
            email={signUpEmail}
            otpCode={registerOtpCode}
            setOtpCode={setRegisterOtpCode}
            error={registerOtpError}
            setError={setRegisterOtpError}
            isActivating={isActivatingAccount}
            isResending={isSendingRegisterOtp}
            resendCountdown={registerResendCountdown}
            onResend={handleResendRegisterOtp}
            onSubmit={handleVerifyRegisterOtp}
          />
        )}

        {/* STEP 4: Forgot Password Request */}
        {currentStep === "forgot-password" && (
          <ForgotPasswordStep
            email={resetEmail}
            setEmail={setResetEmail}
            error={resetEmailError}
            setError={setResetEmailError}
            isSubmitting={isSendingResetOtp}
            onSubmit={handleRequestResetOtp}
            onNavigateToSignIn={() => navigateToStep("signin")}
          />
        )}

        {/* STEP 5: Verify Password Reset OTP */}
        {currentStep === "verify-otp" && (
          <ResetOtpStep
            email={resetEmail}
            otpCode={resetOtpCode}
            setOtpCode={setResetOtpCode}
            error={resetOtpError}
            setError={setResetOtpError}
            isVerifying={isVerifyingResetOtp}
            isResending={isSendingResetOtp}
            resendCountdown={resetResendCountdown}
            onResend={handleResendResetOtp}
            onSubmit={handleVerifyResetOtp}
          />
        )}

        {/* STEP 6: Set New Password */}
        {currentStep === "reset-password" && (
          <ResetPasswordStep
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            errors={resetPasswordErrors}
            setErrors={setResetPasswordErrors}
            isSubmitting={isResettingPassword}
            onSubmit={handleResetPasswordSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
