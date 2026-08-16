// src/components/Profile/shared/GuestProfileBanner.tsx
import { setAuthUrlParam } from "@/lib/authStore"
import { Button } from "@workspace/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Login01Icon, UserAdd01Icon } from "@hugeicons/core-free-icons"

export function GuestProfileBanner() {
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-5 sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-amber-500" />
            <span className="text-xs font-semibold tracking-wider text-primary uppercase">
              Guest Mode
            </span>
          </div>
          <h3 className="text-base font-semibold text-foreground sm:text-lg">
            Sign in to manage your profile
          </h3>
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
            Create an account or sign in to configure security, manage comments,
            and personalize your experience.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => setAuthUrlParam("signin")}
            className="cursor-pointer rounded-md text-xs"
          >
            <HugeiconsIcon icon={Login01Icon} className="mr-1.5 size-3.5" />
            Sign In
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAuthUrlParam("signup")}
            className="cursor-pointer rounded-md text-xs"
          >
            <HugeiconsIcon icon={UserAdd01Icon} className="mr-1.5 size-3.5" />
            Create Account
          </Button>
        </div>
      </div>
    </div>
  )
}
