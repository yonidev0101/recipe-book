import "./globals.css"
import type React from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { OfflineIndicator } from "@/components/offline-indicator"

export const metadata: Metadata = {
  title: "ספר המתכונים שלי",
  description: "אתר לניהול מתכונים אישיים",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light">
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <OfflineIndicator />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
