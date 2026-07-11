import type React from "react"
import { Header } from "./components/dashboard/header"
import "./styles/globals.css"
import { ThemeProvider } from "./components/theme-provider"

export default function DashboardRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="min-h-screen bg-background">
        {/* Subtle grid background */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(128,128,128,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(128,128,128,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size_64px_64px] pointer-events-none z-0" />
        <Header />
        <main className="relative z-10 px-4 md:px-8 lg:px-12 pb-8 pt-20">
          {children}
        </main>
      </div>
    </ThemeProvider>
  )
}