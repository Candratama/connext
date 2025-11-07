"use client"

import { useEffect, useState } from "react"
import { ConvexProvider, ConvexReactClient } from "convex/react"
import SearchProvider from "@/components/search-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "../contexts/auth-context"

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

if (!convexUrl) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL. Set it in .env.local")
}

const convexClient = new ConvexReactClient(convexUrl)

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
    <ConvexProvider client={convexClient}>
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
    </ConvexProvider>
  )
}
