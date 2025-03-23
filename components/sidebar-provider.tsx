"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

type SidebarContextType = {
  isOpen: boolean
  toggle: () => void
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(true)
  const [isMobile, setIsMobile] = React.useState(false)
  const pathname = usePathname()

  // Check if mobile on mount and when window resizes
  React.useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }

    // Check on mount
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // Close sidebar on mobile when route changes
  React.useEffect(() => {
    if (isMobile) {
      setIsOpen(false)
    }
  }, [pathname, isMobile])

  const toggle = React.useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  return <SidebarContext.Provider value={{ isOpen, toggle, isMobile }}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

