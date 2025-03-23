import "@/app/globals.css"
import { SidebarProvider } from "@/components/sidebar-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { CookieConsentModal } from "@/components/cookie-consent-modal"
import { AnalyticsConsent } from "@/app/analytics"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "QRifier - QR-Codes für besseres Kundenfeedback",
  description: "Erstelle QR-Codes zum Sammeln von Kundenfeedback in Echtzeit",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <SidebarProvider>
            <Toaster />
            <CookieConsentModal />
            <AnalyticsConsent />
            {children}
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
