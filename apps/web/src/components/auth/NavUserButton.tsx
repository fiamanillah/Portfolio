import { useAuthSession, setAuthUrlParam } from "@/lib/authStore"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@workspace/ui/components/dropdown-menu"
import { toast } from "@workspace/ui/components/sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Login01Icon,
  Logout01Icon,
  UserAdd01Icon,
  Notification01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons"

export function NavUserButton() {
  const { user, isAuthenticated, logout } = useAuthSession()

  const handleLogout = async () => {
    await logout()
    toast.success("Signed Out", {
      description: "You have been disconnected from your account session.",
    })
  }

  // Not Authenticated: Show "Sign In" Button
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setAuthUrlParam("signin")}
          className="h-8 cursor-pointer rounded-none border-primary/40 bg-primary/5 px-2.5 font-mono text-xs text-primary shadow-xs transition-all hover:bg-primary hover:text-primary-foreground sm:px-3"
        >
          <HugeiconsIcon icon={Login01Icon} className="mr-1 size-3.5" />
          <span>Sign In</span>
        </Button>
      </div>
    )
  }

  // Authenticated: Show Avatar with Dropdown Menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group relative flex cursor-pointer items-center gap-2 rounded-none border border-border bg-background/80 p-1 pr-2.5 transition-all hover:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
          title={`Signed in as ${user.name}`}
        >
          <div className="relative shrink-0">
            <img
              src={user.avatar || "/fi-avatar.webp"}
              alt={user.name}
              className="size-6 rounded-full border border-primary/50 object-cover"
            />
            <span className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full border border-background bg-emerald-500" />
          </div>
          <span className="hidden max-w-[100px] truncate font-mono text-xs font-bold text-foreground transition-colors group-hover:text-primary sm:inline">
            {user.name.split(" ")[0]}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 rounded-none border-border bg-background/95 p-2 font-mono backdrop-blur-xl"
      >
        {/* User Details Header */}
        <DropdownMenuLabel className="p-1.5 font-normal">
          <div className="flex items-center gap-2.5">
            <img
              src={user.avatar || "/fi-avatar.webp"}
              alt={user.name}
              className="size-8 shrink-0 rounded-full border border-primary/50 object-cover"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-xs font-bold text-foreground">
                  {user.name}
                </span>
                {user.badge && (
                  <span className="py-0.2 border border-primary/40 bg-primary/10 px-1 text-[8px] font-semibold text-primary uppercase">
                    {user.badge}
                  </span>
                )}
              </div>
              <p className="truncate text-[10px] text-muted-foreground">
                @{user.username}
              </p>
            </div>
          </div>

          <div className="mt-2 space-y-1 border-t border-border/40 pt-2">
            <p className="truncate text-[10px] text-muted-foreground">
              {user.role || "Developer"}
            </p>
            {user.subscribedToNewsletter && (
              <span className="inline-flex items-center gap-1 text-[9px] text-primary">
                <HugeiconsIcon icon={Notification01Icon} className="size-2.5" />
                <span>Newsletter Active</span>
              </span>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1 border-border/50" />

        {/* Profile & Settings Link */}
        <DropdownMenuItem asChild>
          <a
            href="/profile"
            className="flex w-full cursor-pointer items-center rounded-none py-1.5 text-xs focus:bg-primary/10 focus:text-primary"
          >
            <HugeiconsIcon
              icon={UserCircleIcon}
              className="mr-2 size-3.5 text-primary"
            />
            <span>Profile & Settings</span>
          </a>
        </DropdownMenuItem>

        {/* Register another account */}
        <DropdownMenuItem
          onClick={() => setAuthUrlParam("signup")}
          className="cursor-pointer rounded-none py-1.5 text-xs focus:bg-primary/10 focus:text-primary"
        >
          <HugeiconsIcon
            icon={UserAdd01Icon}
            className="mr-2 size-3.5 text-muted-foreground"
          />
          <span>Register New</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 border-border/50" />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer rounded-none py-1.5 text-xs text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <HugeiconsIcon icon={Logout01Icon} className="mr-2 size-3.5" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
