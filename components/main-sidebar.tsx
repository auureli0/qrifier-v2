"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Bell, Home, QrCode, MessageSquare, FormInput, Settings, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/sidebar-provider"
import { Button } from "@/components/ui/button"

const sidebarLinks = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "QR-Codes", href: "/qr-codes", icon: QrCode },
  { name: "Feedback", href: "/feedback", icon: MessageSquare },
  { name: "Formulare", href: "/forms", icon: FormInput },
  { name: "Analytik", href: "/analytics", icon: BarChart3 },
  { name: "Benachrichtigungen", href: "/notifications", icon: Bell },
  { name: "Benutzer", href: "/users", icon: Users },
  { name: "Einstellungen", href: "/settings", icon: Settings },
]

export function MainSidebar() {
  const pathname = usePathname()
  const { isOpen, isMobile } = useSidebar()

  if (!isOpen) {
    return null
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r bg-background pt-16 transition-transform md:static",
        isMobile && "animate-in slide-in-from-left",
        !isOpen && "transform -translate-x-full md:translate-x-0",
      )}
    >
      <div className="flex flex-1 flex-col overflow-y-auto py-4">
        <nav className="flex-1 space-y-1 px-2">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {link.name}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="border-t p-4">
        <div className="rounded-md bg-muted p-3">
          <h3 className="font-medium">Business Plan</h3>
          <p className="text-xs text-muted-foreground">Sie nutzen den Business-Plan. Upgrade für mehr Funktionen.</p>
          <Button className="mt-2 w-full" size="sm">
            Plan upgraden
          </Button>
        </div>
      </div>
    </aside>
  )
}

