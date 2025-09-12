"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "relative inline-flex h-10 w-20 items-center justify-center rounded-full",
        "bg-gray-200 dark:bg-gray-800",
        "transition-colors duration-200 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
        "dark:focus:ring-offset-gray-900"
      )}
      aria-label="Toggle theme"
    >
      <span
        className={cn(
          "absolute left-1 inline-block h-8 w-8 transform rounded-full",
          "bg-white dark:bg-gray-900",
          "transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
          "shadow-lg",
          theme === "dark" && "translate-x-10"
        )}
      />
      <Sun className="absolute left-2 h-5 w-5 text-yellow-500 transition-opacity dark:opacity-0" />
      <Moon className="absolute right-2 h-5 w-5 text-gray-400 opacity-0 transition-opacity dark:opacity-100" />
    </button>
  )
}