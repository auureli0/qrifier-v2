"use client"

import Link from "next/link"
import { Bell, LogOut, Menu, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/sidebar-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/server/users"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Spinner } from "@/components/ui/spinner"

export function MainHeader() {
  const { toggle, isMobile } = useSidebar()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Erfolgreich abgemeldet")
            setTimeout(() => {
              router.push("/login")
              router.refresh()
            }, 300)
          },
          onError: () => {
            toast.error("Beim Abmelden ist ein Fehler aufgetreten")
          }
        }
      })
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Ein unerwarteter Fehler ist aufgetreten")
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggle}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        )}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="text-lg font-bold text-primary-foreground">Q</span>
          </div>
          <span className="text-xl font-bold">QRifier</span>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/notifications">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mein Konto</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Einstellungen
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? (
                <>
                  <Spinner size={16} className="mr-2" />
                  <span>Wird abgemeldet...</span>
                </>
              ) : (
                "Abmelden"
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
