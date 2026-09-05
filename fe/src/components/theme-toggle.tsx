"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative rounded-full w-10 h-10 border border-border bg-card hover:bg-accent text-foreground transition-all duration-200 shadow-sm"
      title={mounted ? (isDark ? "Beralih ke Tema Terang" : "Beralih ke Tema Gelap") : "Ganti Tema"}
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-emerald-400" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
