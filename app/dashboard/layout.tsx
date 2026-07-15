import type React from "react"
import { Header } from "./components/dashboard/header"
import { ThemeRestorer } from "@/components/theme-restorer"
import "./styles/globals.css"

export default function DashboardRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <ThemeRestorer />
      <div className="min-h-screen bg-background">
        {/* Subtle grid background */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(128,128,128,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(128,128,128,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size_64px_64px] pointer-events-none z-0" />
        <Header />
        <main className="relative z-10 w-full px-3 sm:px-5 md:px-6 lg:px-8 pb-12 pt-16 sm:pt-18 lg:pt-22 transition-all duration-200 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </>
  )
}