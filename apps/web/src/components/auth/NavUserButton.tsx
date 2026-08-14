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
  FlashIcon,
  UserAdd01Icon,
  Notification01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons"

export function NavUserButton() {
  const { user, isAuthenticated, logout } = useAuthSession()

  const handleLogout = () => {
    logout()
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
          className="rounded-none font-mono text-xs h-8 border-primary/40 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer shadow-xs px-2.5 sm:px-3"
        >
          <HugeiconsIcon icon={Login01Icon} className="size-3.5 mr-1" />
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
          className="group relative flex items-center gap-2 rounded-none border border-border bg-background/80 p-1 pr-2.5 transition-all hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
          title={`Signed in as ${user.name}`}
        >
          <div className="relative shrink-0">
            <img
              src={user.avatar}
              alt={user.name}
              className="size-6 rounded-full border border-primary/50 object-cover"
            />
            <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-background bg-emerald-500" />
          </div>
          <span className="font-mono text-xs font-bold text-foreground group-hover:text-primary transition-colors max-w-[100px] truncate hidden sm:inline">
            {user.name.split(" ")[0]}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 rounded-none border-border bg-background/95 backdrop-blur-xl p-2 font-mono">
        {/* User Details Header */}
        <DropdownMenuLabel className="p-1.5 font-normal">
          <div className="flex items-center gap-2.5">
            <img
              src={user.avatar}
              alt={user.name}
              className="size-8 rounded-full border border-primary/50 object-cover shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-foreground truncate">
                  {user.name}
                </span>
                {user.badge && (
                  <span className="border border-primary/40 bg-primary/10 px-1 py-0.2 text-[8px] font-semibold text-primary uppercase">
                    {user.badge}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground truncate">
                @{user.username}
              </p>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-border/40 space-y-1">
            <p className="text-[10px] text-muted-foreground truncate">
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
            className="cursor-pointer text-xs rounded-none focus:bg-primary/10 focus:text-primary py-1.5 flex items-center w-full"
          >
            <HugeiconsIcon icon={UserCircleIcon} className="size-3.5 mr-2 text-primary" />
            <span>Profile & Settings</span>
          </a>
        </DropdownMenuItem>

        {/* Switch Persona / Demo */}
        <DropdownMenuItem
          onClick={() => setAuthUrlParam("quick")}
          className="cursor-pointer text-xs rounded-none focus:bg-primary/10 focus:text-primary py-1.5"
        >
          <HugeiconsIcon icon={FlashIcon} className="size-3.5 mr-2 text-primary" />
          <span>Switch Account</span>
        </DropdownMenuItem>

        {/* Register another account */}
        <DropdownMenuItem
          onClick={() => setAuthUrlParam("signup")}
          className="cursor-pointer text-xs rounded-none focus:bg-primary/10 focus:text-primary py-1.5"
        >
          <HugeiconsIcon icon={UserAdd01Icon} className="size-3.5 mr-2 text-muted-foreground" />
          <span>Register New</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 border-border/50" />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-xs rounded-none text-destructive focus:bg-destructive/10 focus:text-destructive py-1.5"
        >
          <HugeiconsIcon icon={Logout01Icon} className="size-3.5 mr-2" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
