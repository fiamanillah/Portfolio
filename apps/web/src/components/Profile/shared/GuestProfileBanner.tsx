import { setAuthUrlParam } from "@/lib/authStore"
import { DEMO_USERS } from "@/data/commentsData"
import { loginWithDemoUser } from "@/lib/authStore"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Login01Icon,
  UserAdd01Icon,
  FlashIcon,
} from "@hugeicons/core-free-icons"

export function GuestProfileBanner() {
  const handleQuickDemo = (userId: string, name: string) => {
    loginWithDemoUser(userId)
    toast.success(`Switched to ${name}`, {
      description: "You now have full access to edit account settings, security, and preferences.",
    })
  }

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-5 sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Guest Mode
            </span>
          </div>
          <h3 className="text-base font-semibold text-foreground sm:text-lg">
            Sign in to manage your profile
          </h3>
          <p className="max-w-xl text-xs text-muted-foreground leading-relaxed">
            Create an account or sign in to save articles, configure security, and personalize your experience.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            type="button"
            size="sm"
            onClick={() => setAuthUrlParam("signin")}
            className="rounded-md text-xs cursor-pointer"
          >
            <HugeiconsIcon icon={Login01Icon} className="size-3.5 mr-1.5" />
            Sign In
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAuthUrlParam("signup")}
            className="rounded-md text-xs cursor-pointer"
          >
            <HugeiconsIcon icon={UserAdd01Icon} className="size-3.5 mr-1.5" />
            Create Account
          </Button>
        </div>
      </div>

      {/* Quick Demo Logins */}
      <div className="mt-4 pt-4 border-t border-primary/15">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 shrink-0">
            <HugeiconsIcon icon={FlashIcon} className="size-3 text-primary" />
            Quick demo:
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {DEMO_USERS.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleQuickDemo(user.id, user.name)}
                className="group flex items-center gap-1.5 rounded-md border border-border bg-background/80 px-2.5 py-1 text-xs transition-colors hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="size-4 rounded-full border border-border object-cover"
                />
                <span className="text-foreground group-hover:text-primary font-medium">
                  {user.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
