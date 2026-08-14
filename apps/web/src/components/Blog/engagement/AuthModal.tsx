import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@workspace/ui/components/tabs"
import { DEMO_USERS, AVATAR_OPTIONS, type AuthUser } from "@/data/commentsData"
import { useAuthSession } from "@/lib/authStore"
import { toast } from "@workspace/ui/components/sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Login01Icon,
  UserAdd01Icon,
  Tick02Icon,
  FlashIcon,
  GithubIcon,
  GoogleIcon,
} from "@hugeicons/core-free-icons"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (user: AuthUser) => void
  actionLabel?: string
}

export function AuthModal({
  open,
  onOpenChange,
  onSuccess,
  actionLabel = "to comment on this article",
}: AuthModalProps) {
  const { loginDemo, login, register } = useAuthSession()
  const [activeTab, setActiveTab] = useState<string>("quick")

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState("")
  const [signUpUsername, setSignUpUsername] = useState("")
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpRole, setSignUpRole] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0])

  const handleDemoSelect = (userId: string) => {
    const user = loginDemo(userId)
    if (user) {
      toast.success(`Logged in as ${user.name}`, {
        description: "You can now post comments, reply to discussions, and react.",
      })
      onOpenChange(false)
      onSuccess?.(user)
    }
  }

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!signInEmail.trim()) {
      toast.error("Please enter your email address")
      return
    }
    const user = login(signInEmail, signInPassword)
    toast.success(`Welcome back, ${user.name}!`, {
      description: "Signed in successfully.",
    })
    onOpenChange(false)
    onSuccess?.(user)
  }

  const handleOAuthSimulate = (provider: "GitHub" | "Google") => {
    const defaultDemo = provider === "GitHub" ? DEMO_USERS[1] : DEMO_USERS[2]
    const user = loginDemo(defaultDemo.id) || login(`${provider.toLowerCase()}@dev.io`)
    toast.success(`Connected with ${provider}!`, {
      description: `Signed in as ${user.name}`,
    })
    onOpenChange(false)
    onSuccess?.(user)
  }

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!signUpName.trim() || !signUpEmail.trim()) {
      toast.error("Name and email are required")
      return
    }
    const user = register({
      name: signUpName,
      username: signUpUsername || signUpName.toLowerCase().replace(/\s+/g, "_"),
      email: signUpEmail,
      role: signUpRole || "Software Engineer",
      avatar: selectedAvatar,
    })
    toast.success(`Account created! Welcome, ${user.name}`, {
      description: "You are now authenticated and ready to engage.",
    })
    onOpenChange(false)
    onSuccess?.(user)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border border-border/80 bg-background/95 p-6 backdrop-blur-xl sm:rounded-none">
        {/* Cyberpunk corner accents */}
        <div className="pointer-events-none absolute top-2 left-2 z-10 h-3 w-3 border-t border-l border-primary" />
        <div className="pointer-events-none absolute top-2 right-2 z-10 h-3 w-3 border-t border-r border-primary" />
        <div className="pointer-events-none absolute bottom-2 left-2 z-10 h-3 w-3 border-b border-l border-primary" />
        <div className="pointer-events-none absolute right-2 bottom-2 z-10 h-3 w-3 border-r border-b border-primary" />

        <DialogHeader className="text-left space-y-1.5 pb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary uppercase">
              // AUTHENTICATION_GATEWAY
            </span>
          </div>
          <DialogTitle className="font-mono text-xl font-bold tracking-tight text-foreground">
            Join the Discussion
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Authenticate {actionLabel}. Fast, frictionless, and zero-password required for demo testing.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-2 w-full"
        >
          <TabsList className="grid w-full grid-cols-3 rounded-none bg-muted/60 p-1 border border-border/60">
            <TabsTrigger
              value="quick"
              className="rounded-none font-mono text-xs data-active:bg-background data-active:text-primary data-active:shadow-xs py-1.5 flex items-center justify-center gap-1.5"
            >
              <HugeiconsIcon icon={FlashIcon} className="size-3.5" />
              <span>1-Click</span>
            </TabsTrigger>
            <TabsTrigger
              value="signin"
              className="rounded-none font-mono text-xs data-active:bg-background data-active:text-primary data-active:shadow-xs py-1.5 flex items-center justify-center gap-1.5"
            >
              <HugeiconsIcon icon={Login01Icon} className="size-3.5" />
              <span>Sign In</span>
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="rounded-none font-mono text-xs data-active:bg-background data-active:text-primary data-active:shadow-xs py-1.5 flex items-center justify-center gap-1.5"
            >
              <HugeiconsIcon icon={UserAdd01Icon} className="size-3.5" />
              <span>Register</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: 1-Click Demo Personas */}
          <TabsContent value="quick" className="space-y-4 pt-4 outline-none">
            <div className="rounded-none border border-primary/20 bg-primary/5 p-3 flex items-start gap-2">
              <HugeiconsIcon icon={FlashIcon} className="size-4 text-primary shrink-0 mt-0.5" />
              <p className="font-mono text-[11px] text-foreground/80 leading-relaxed">
                <strong className="text-primary font-semibold">Instant Test Access</strong>: Select any pre-configured engineer profile to test replying, liking, and commenting without typing.
              </p>
            </div>

            <div className="space-y-2">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => handleDemoSelect(demo.id)}
                  className="group w-full flex items-center justify-between border border-border bg-background/80 p-2.5 transition-all duration-150 hover:border-primary hover:bg-primary/5 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={demo.avatar}
                      alt={demo.name}
                      className="size-9 rounded-full border border-primary/40 object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {demo.name}
                        </span>
                        {demo.badge && (
                          <span className="border border-primary/30 bg-primary/10 px-1.5 py-0.2 font-mono text-[9px] font-semibold text-primary uppercase">
                            {demo.badge}
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-[10px] text-muted-foreground truncate">
                        {demo.role}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono text-xs text-primary/80 opacity-0 transition-opacity group-hover:opacity-100 shrink-0 ml-2">
                    Select →
                  </span>
                </button>
              ))}
            </div>

            {/* Quick OAuth Simulations */}
            <div className="pt-2 border-t border-border/60">
              <span className="font-mono text-[10px] uppercase text-muted-foreground tracking-wider block mb-2">
                // OR QUICK SOCIAL SIGN-IN
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleOAuthSimulate("GitHub")}
                  className="rounded-none font-mono text-xs h-8 border-border hover:border-primary hover:text-primary cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <HugeiconsIcon icon={GithubIcon} className="size-3.5" />
                  <span>GitHub</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleOAuthSimulate("Google")}
                  className="rounded-none font-mono text-xs h-8 border-border hover:border-primary hover:text-primary cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <HugeiconsIcon icon={GoogleIcon} className="size-3.5" />
                  <span>Google</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Standard Sign In */}
          <TabsContent value="signin" className="space-y-4 pt-4 outline-none">
            <form onSubmit={handleSignInSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="signin-email" className="font-mono text-xs text-muted-foreground">
                  Email Address
                </Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="engineer@domain.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className="rounded-none font-mono text-xs h-9 border-border bg-input/40 focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="signin-pass" className="font-mono text-xs text-muted-foreground">
                  Password <span className="text-muted-foreground/60">(any password for demo)</span>
                </Label>
                <Input
                  id="signin-pass"
                  type="password"
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className="rounded-none font-mono text-xs h-9 border-border bg-input/40 focus:border-primary"
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-none font-mono text-xs font-bold uppercase tracking-wider h-9 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer mt-2"
              >
                Sign In & Continue
              </Button>
            </form>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between">
              <span className="font-mono text-[11px] text-muted-foreground">
                No account yet?
              </span>
              <button
                type="button"
                onClick={() => setActiveTab("signup")}
                className="font-mono text-[11px] text-primary hover:underline cursor-pointer"
              >
                Create Account →
              </button>
            </div>
          </TabsContent>

          {/* TAB 3: Create Account / Sign Up */}
          <TabsContent value="signup" className="space-y-3 pt-4 outline-none">
            <form onSubmit={handleSignUpSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="signup-name" className="font-mono text-xs text-muted-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="signup-name"
                    placeholder="Jane Doe"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    className="rounded-none font-mono text-xs h-9 border-border bg-input/40"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="signup-user" className="font-mono text-xs text-muted-foreground">
                    Username
                  </Label>
                  <Input
                    id="signup-user"
                    placeholder="janedoe"
                    value={signUpUsername}
                    onChange={(e) => setSignUpUsername(e.target.value)}
                    className="rounded-none font-mono text-xs h-9 border-border bg-input/40"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="signup-email" className="font-mono text-xs text-muted-foreground">
                  Email Address
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="jane@company.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className="rounded-none font-mono text-xs h-9 border-border bg-input/40"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="signup-role" className="font-mono text-xs text-muted-foreground">
                  Role / Bio Title
                </Label>
                <Input
                  id="signup-role"
                  placeholder="Backend Architect / Cloud Engineer"
                  value={signUpRole}
                  onChange={(e) => setSignUpRole(e.target.value)}
                  className="rounded-none font-mono text-xs h-9 border-border bg-input/40"
                />
              </div>

              {/* Avatar Selector */}
              <div className="space-y-1.5 pt-1">
                <Label className="font-mono text-xs text-muted-foreground">
                  Select Profile Avatar
                </Label>
                <div className="flex items-center gap-2">
                  {AVATAR_OPTIONS.map((avatarUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(avatarUrl)}
                      className={`relative size-9 rounded-full border-2 transition-all p-0.5 cursor-pointer ${
                        selectedAvatar === avatarUrl
                          ? "border-primary scale-110 shadow-sm"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={avatarUrl}
                        alt={`Avatar option ${idx + 1}`}
                        className="size-full rounded-full object-cover"
                      />
                      {selectedAvatar === avatarUrl && (
                        <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <HugeiconsIcon icon={Tick02Icon} className="size-2.5" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full rounded-none font-mono text-xs font-bold uppercase tracking-wider h-9 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer mt-3"
              >
                Create Account & Comment
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
