import { lazy, Suspense } from "react"
import { useAuthSession, setAuthUrlParam } from "@/lib/authStore"
import { Button } from "@workspace/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Login01Icon } from "@hugeicons/core-free-icons"

const UserMenuDropdownComponent = lazy(() =>
  import("./UserMenuDropdown").then((m) => ({ default: m.UserMenuDropdown }))
)

export function NavUserButton() {
  const { user, isAuthenticated, logout } = useAuthSession()

  // Not Authenticated: Show lightweight "Sign In" Button (0 Radix dependencies)
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setAuthUrlParam("signin")}
          data-auth-trigger="signin"
          className="h-8 cursor-pointer rounded-none border-primary/40 bg-primary/5 px-2.5 font-mono text-xs text-primary shadow-xs transition-all hover:bg-primary hover:text-primary-foreground sm:px-3"
        >
          <HugeiconsIcon icon={Login01Icon} className="mr-1 size-3.5" />
          <span>Sign In</span>
        </Button>
      </div>
    )
  }

  // Authenticated: Dynamically load dropdown menu
  return (
    <Suspense
      fallback={
        <div className="flex h-8 w-20 animate-pulse items-center rounded-none bg-muted/40" />
      }
    >
      <UserMenuDropdownComponent user={user} logout={logout} />
    </Suspense>
  )
}

export default NavUserButton
