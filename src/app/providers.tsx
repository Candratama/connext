"use client"

import { useEffect, useState } from "react"
import SearchProvider from "@/components/search-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "../contexts/auth-context"

interface Props {
  children: React.ReactNode
}

export function Providers({ children }: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <SearchProvider value={{ open, setOpen }}>{children}</SearchProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
