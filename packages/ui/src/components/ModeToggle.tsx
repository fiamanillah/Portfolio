import React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import { Button } from "./button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Moon, Sun } from "@hugeicons/core-free-icons"

export function ModeToggle() {
  const STORAGE_KEY = "ui-theme"

  // 1. Use a lazy initializer function to read the DOM only once during initial setup.
  const [theme, setThemeState] = React.useState<
    "theme-light" | "dark" | "system"
  >(() => {
    // We check typeof document to ensure this doesn't crash during SSR (Next.js/Astro/etc)
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark")
        ? "dark"
        : "theme-light"
    }
    return "theme-light" // Fallback for server-side rendering
  })

  // The first useEffect has been completely removed!

  // 2. This effect safely updates the DOM whenever the user changes the theme state.
  React.useEffect(() => {
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)

    document.documentElement.classList[isDark ? "add" : "remove"]("dark")
    document.documentElement.style.colorScheme = isDark ? "dark" : "light"

    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Ignore storage failures in private mode or restricted environments.
    }
  }, [theme])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <HugeiconsIcon
            icon={Sun}
            className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
          />
          <HugeiconsIcon
            icon={Moon}
            className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setThemeState("theme-light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setThemeState("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setThemeState("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
