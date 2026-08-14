import { useState, useEffect, useCallback, type FormEvent } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { DEMO_USERS, AVATAR_OPTIONS, type AuthUser } from "@/data/commentsData"
import {
  useAuthSession,
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
  FlashIcon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons"

// Import modular step components
import { QuickLoginStep } from "./steps/QuickLoginStep"
import { SignInStep } from "./steps/SignInStep"
import { SignUpStep } from "./steps/SignUpStep"
import { RegisterOtpStep } from "./steps/RegisterOtpStep"
import { ForgotPasswordStep } from "./steps/ForgotPasswordStep"
import { ResetOtpStep } from "./steps/ResetOtpStep"
import { ResetPasswordStep } from "./steps/ResetPasswordStep"

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
  initialStep = "quick",
}: AuthModalProps) {
  const { loginDemo, login, register, resetPassword } = useAuthSession()

  // Manage open state (either controlled via prop or synchronized via URL query)
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen

  // Current Step state
  const [currentStep, setCurrentStep] = useState<AuthModalStep>(initialStep)

  // Sign In Form State & Validation
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")
  const [signInErrors, setSignInErrors] = useState<{ email?: string; password?: string }>({})
  const [isSigningIn, setIsSigningIn] = useState(false)

  // Registration Form State & Validation
  const [signUpName, setSignUpName] = useState("")
  const [signUpUsername, setSignUpUsername] = useState("")
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [signUpRole, setSignUpRole] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0])
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

  // 1-Click Demo Login
  const handleDemoSelect = (userId: string) => {
    const user = loginDemo(userId)
    if (user) {
      toast.success(`Signed in as ${user.name}`, {
        description: "You now have access to discussions, reactions, and personalized preferences.",
      })
      handleOpenChange(false)
      onSuccess?.(user)
    }
  }

  // Social Login Simulation
  const handleOAuthSimulate = (provider: "GitHub" | "Google") => {
    const defaultDemo = provider === "GitHub" ? DEMO_USERS[1] : DEMO_USERS[2]
    const user = loginDemo(defaultDemo.id) || login(`${provider.toLowerCase()}@example.io`)
    toast.success(`Connected with ${provider}!`, {
      description: `Signed in as ${user.name}`,
    })
    handleOpenChange(false)
    onSuccess?.(user)
  }

  // Sign In Handler with validation
  const handleSignInSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errors: { email?: string; password?: string } = {}

    if (!signInEmail.trim()) {
      errors.email = "Email address is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signInEmail.trim())) {
      errors.email = "Please enter a valid email address (e.g. name@domain.com)"
    }

    if (Object.keys(errors).length > 0) {
      setSignInErrors(errors)
      return
    }

    setSignInErrors({})
    setIsSigningIn(true)
    setTimeout(() => {
      setIsSigningIn(false)
      const user = login(signInEmail, signInPassword)
      toast.success(`Welcome back, ${user.name}!`, {
        description: "Signed in successfully to your account.",
      })
      handleOpenChange(false)
      onSuccess?.(user)
    }, 350)
  }

  // Registration Step 1: Initiate registration with form validation and dispatch Email OTP
  const handleInitiateRegistration = (e: FormEvent) => {
    e.preventDefault()
    const errors: {
      name?: string
      username?: string
      email?: string
      password?: string
    } = {}

    if (!signUpName.trim()) {
      errors.name = "Full name is required"
    } else if (signUpName.trim().length < 2) {
      errors.name = "Name must be at least 2 characters"
    }

    if (signUpUsername.trim() && !/^[a-zA-Z0-9_]{3,20}$/.test(signUpUsername.trim())) {
      errors.username = "Username must be 3-20 letters, numbers, or underscores"
    }

    if (!signUpEmail.trim()) {
      errors.email = "Email address is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpEmail.trim())) {
      errors.email = "Please provide a valid email address"
    }

    if (signUpPassword && signUpPassword.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }

    if (Object.keys(errors).length > 0) {
      setSignUpErrors(errors)
      return
    }

    setSignUpErrors({})
    setIsSendingRegisterOtp(true)
    setTimeout(() => {
      setIsSendingRegisterOtp(false)
      setRegisterResendCountdown(45)
      setRegisterOtpCode("")
      setRegisterOtpError(null)
      navigateToStep("register-verify-otp")
      toast.success("Verification Code Sent", {
        description: `We've sent a 6-digit OTP code to ${signUpEmail}. (Demo OTP: 123456)`,
      })
    }, 450)
  }

  // Registration Step 2: Resend Registration OTP
  const handleResendRegisterOtp = () => {
    if (registerResendCountdown > 0) return
    setIsSendingRegisterOtp(true)
    setTimeout(() => {
      setIsSendingRegisterOtp(false)
      setRegisterResendCountdown(45)
      setRegisterOtpError(null)
      toast.success("New OTP Code Sent", {
        description: `A new 6-digit code has been sent to ${signUpEmail}. (Demo OTP: 123456)`,
      })
    }, 350)
  }

  // Registration Step 3: Verify Email OTP and Activate Account
  const handleVerifyRegisterOtp = (e: FormEvent) => {
    e.preventDefault()
    if (registerOtpCode.length < 6) {
      setRegisterOtpError("Please enter all 6 digits of the verification code")
      return
    }

    setRegisterOtpError(null)
    setIsActivatingAccount(true)
    setTimeout(() => {
      setIsActivatingAccount(false)
      const user = register({
        name: signUpName,
        username: signUpUsername || signUpName.toLowerCase().replace(/\s+/g, "_"),
        email: signUpEmail,
        role: signUpRole || "Software Engineer",
        avatar: selectedAvatar,
        subscribedToNewsletter: subscribeNewsletter,
      })

      if (subscribeNewsletter) {
        toast.success(`Account Verified & Activated!`, {
          description: `Welcome, ${user.name}! You're also subscribed to newsletters and architectural updates.`,
        })
      } else {
        toast.success(`Account Verified & Activated!`, {
          description: `Welcome, ${user.name}! Your account is now active.`,
        })
      }

      handleOpenChange(false)
      onSuccess?.(user)
    }, 400)
  }

  // Forgot Password: Request OTP with validation
  const handleRequestResetOtp = (e: FormEvent) => {
    e.preventDefault()
    if (!resetEmail.trim()) {
      setResetEmailError("Email address is required")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail.trim())) {
      setResetEmailError("Please provide a valid email address")
      return
    }

    setResetEmailError(null)
    setIsSendingResetOtp(true)
    setTimeout(() => {
      setIsSendingResetOtp(false)
      setResetResendCountdown(45)
      setResetOtpCode("")
      setResetOtpError(null)
      navigateToStep("verify-otp")
      toast.success("Verification Code Sent", {
        description: `We've sent a 6-digit OTP code to ${resetEmail}. (Demo OTP: 123456)`,
      })
    }, 450)
  }

  // Resend Reset OTP
  const handleResendResetOtp = () => {
    if (resetResendCountdown > 0) return
    setIsSendingResetOtp(true)
    setTimeout(() => {
      setIsSendingResetOtp(false)
      setResetResendCountdown(45)
      setResetOtpError(null)
      toast.success("New OTP Code Sent", {
        description: `A new 6-digit code has been dispatched to ${resetEmail}. (Demo OTP: 123456)`,
      })
    }, 350)
  }

  // Verify Password Reset OTP
  const handleVerifyResetOtp = (e: FormEvent) => {
    e.preventDefault()
    if (resetOtpCode.length < 6) {
      setResetOtpError("Please enter all 6 digits of the verification code")
      return
    }

    setResetOtpError(null)
    setIsVerifyingResetOtp(true)
    setTimeout(() => {
      setIsVerifyingResetOtp(false)
      navigateToStep("reset-password")
      toast.success("OTP Code Verified", {
        description: "Please choose a new password for your account.",
      })
    }, 400)
  }

  // Reset Password Submit with validation
  const handleResetPasswordSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errors: { newPassword?: string; confirmPassword?: string } = {}

    if (!newPassword) {
      errors.newPassword = "New password is required"
    } else if (newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters"
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
    setTimeout(() => {
      setIsResettingPassword(false)
      resetPassword(resetEmail, newPassword)
      const user = login(resetEmail, newPassword)
      toast.success("Password Updated Successfully!", {
        description: `Welcome back, ${user.name}. You are now signed in.`,
      })
      handleOpenChange(false)
      onSuccess?.(user)
    }, 450)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md border border-border/80 bg-background/95 p-6 backdrop-blur-xl sm:rounded-none">
        {/* Cyberpunk corner accents */}
        <div className="pointer-events-none absolute top-2 left-2 z-10 h-3 w-3 border-t border-l border-primary" />
        <div className="pointer-events-none absolute top-2 right-2 z-10 h-3 w-3 border-t border-r border-primary" />
        <div className="pointer-events-none absolute bottom-2 left-2 z-10 h-3 w-3 border-b border-l border-primary" />
        <div className="pointer-events-none absolute right-2 bottom-2 z-10 h-3 w-3 border-r border-b border-primary" />

        {/* Modal Top Header */}
        <DialogHeader className="text-left space-y-1.5 pb-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary uppercase">
              // ACCOUNT_AUTHENTICATION
            </span>

            {/* Back button for recovery sub-steps or registration OTP */}
            {currentStep === "register-verify-otp" && (
              <button
                type="button"
                onClick={() => navigateToStep("signup")}
                className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
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
                className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3" />
                <span>Back to Sign In</span>
              </button>
            )}
          </div>

          <DialogTitle className="font-mono text-xl font-bold tracking-tight text-foreground">
            {currentStep === "quick" && "Instant Account Access"}
            {currentStep === "signin" && "Sign In to Your Account"}
            {currentStep === "signup" && "Create an Account"}
            {currentStep === "register-verify-otp" && "Verify Your Email"}
            {currentStep === "forgot-password" && "Reset Password"}
            {currentStep === "verify-otp" && "Verify Security Code"}
            {currentStep === "reset-password" && "Set New Password"}
          </DialogTitle>

          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {currentStep === "quick" &&
              `Authenticate ${actionLabel}. Use a 1-click test profile or sign in with email.`}
            {currentStep === "signin" &&
              "Access your account, discussions, and personal preferences."}
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

        {/* Tab Selector for Primary Steps */}
        {(currentStep === "quick" || currentStep === "signin" || currentStep === "signup") && (
          <div className="grid grid-cols-3 gap-1 border border-border bg-muted/30 p-1 mb-4">
            <button
              type="button"
              onClick={() => navigateToStep("quick")}
              className={`flex items-center justify-center gap-1.5 py-1.5 font-mono text-xs transition-all cursor-pointer ${
                currentStep === "quick"
                  ? "bg-background text-primary font-bold shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <HugeiconsIcon icon={FlashIcon} className="size-3.5" />
              <span>1-Click</span>
            </button>
            <button
              type="button"
              onClick={() => navigateToStep("signin")}
              className={`flex items-center justify-center gap-1.5 py-1.5 font-mono text-xs transition-all cursor-pointer ${
                currentStep === "signin"
                  ? "bg-background text-primary font-bold shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <HugeiconsIcon icon={Login01Icon} className="size-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => navigateToStep("signup")}
              className={`flex items-center justify-center gap-1.5 py-1.5 font-mono text-xs transition-all cursor-pointer ${
                currentStep === "signup"
                  ? "bg-background text-primary font-bold shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <HugeiconsIcon icon={UserAdd01Icon} className="size-3.5" />
              <span>Register</span>
            </button>
          </div>
        )}

        {/* STEP 1: Quick 1-Click Login */}
        {currentStep === "quick" && (
          <QuickLoginStep
            onSelectDemo={handleDemoSelect}
            onSelectOAuth={handleOAuthSimulate}
          />
        )}

        {/* STEP 2: Sign In */}
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

        {/* STEP 3: Register */}
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
            selectedAvatar={selectedAvatar}
            setSelectedAvatar={setSelectedAvatar}
            subscribeNewsletter={subscribeNewsletter}
            setSubscribeNewsletter={setSubscribeNewsletter}
            errors={signUpErrors}
            setErrors={setSignUpErrors}
            isSubmitting={isSendingRegisterOtp}
            onSubmit={handleInitiateRegistration}
          />
        )}

        {/* STEP 4: Email OTP Verification */}
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

        {/* STEP 5: Forgot Password OTP Request */}
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

        {/* STEP 6: Password Reset OTP Verification */}
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

        {/* STEP 7: Set New Password */}
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
