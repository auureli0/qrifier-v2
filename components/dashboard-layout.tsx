import type React from "react"
import { MainSidebar } from "@/components/main-sidebar"
import { MainHeader } from "@/components/main-header"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <MainHeader />
      <div className="flex flex-1">
        <MainSidebar />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6">
          <div className="container mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}

