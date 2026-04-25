import * as React from "react"

import { Button } from "@workspace/ui/components/button"

type Theme = "light" | "dark"

const STORAGE_KEY = "portfolio-theme"

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark")
}

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<Theme>("light")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY)
    const initialTheme: Theme = savedTheme === "dark" ? "dark" : "light"
    applyTheme(initialTheme)
    setTheme(initialTheme)
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const nextTheme: Theme = currentTheme === "dark" ? "light" : "dark"
      localStorage.setItem(STORAGE_KEY, nextTheme)
      applyTheme(nextTheme)
      return nextTheme
    })
  }

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" disabled>
        Theme
      </Button>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={toggleTheme}>
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </Button>
  )
}
