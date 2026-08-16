"use client"

import * as React from "react"

type Theme = "dark" | "light" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "dark" | "light"
  themes: Theme[]
}

const ThemeContext = React.createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => {},
  resolvedTheme: "dark",
  themes: ["dark", "light", "system"],
})

export const useTheme = () => React.useContext(ThemeContext)

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "ui-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = React.useState<"dark" | "light">(
    "dark"
  )
  const [mounted, setMounted] = React.useState(false)

  // 1. Initial read from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey) as Theme | null
      if (
        stored &&
        (stored === "dark" || stored === "light" || stored === "system")
      ) {
        setThemeState(stored)
      } else {
        setThemeState(defaultTheme)
      }
    } catch {
      setThemeState(defaultTheme)
    }
    setMounted(true)
  }, [storageKey, defaultTheme])

  // 2. Apply classes and calculate resolvedTheme whenever theme changes
  React.useEffect(() => {
    const root = document.documentElement
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const computeResolved = (t: Theme): "dark" | "light" => {
      if (t === "system") {
        return mediaQuery.matches ? "dark" : "light"
      }
      return t === "dark" ? "dark" : "light"
    }

    const currentResolved = computeResolved(theme)
    setResolvedTheme(currentResolved)

    root.classList.remove("light", "theme-light", "dark")
    if (currentResolved === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.add("theme-light")
    }
    root.style.colorScheme = currentResolved

    const handleMediaChange = () => {
      if (theme === "system") {
        const nextResolved = computeResolved("system")
        setResolvedTheme(nextResolved)
        root.classList.remove("light", "theme-light", "dark")
        if (nextResolved === "dark") {
          root.classList.add("dark")
        } else {
          root.classList.add("theme-light")
        }
        root.style.colorScheme = nextResolved
      }
    }

    mediaQuery.addEventListener("change", handleMediaChange)
    return () => mediaQuery.removeEventListener("change", handleMediaChange)
  }, [theme])

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme)
      try {
        localStorage.setItem(storageKey, newTheme)
      } catch {
        // Ignore storage errors
      }
    },
    [storageKey]
  )

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        resolvedTheme,
        themes: ["dark", "light", "system"],
      }}
    >
      {mounted && <ThemeHotkey />}
      {children}
    </ThemeContext.Provider>
  )
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedTheme, setTheme])

  return null
}
