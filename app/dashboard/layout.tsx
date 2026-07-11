import type React from "react"
import { Header } from "./components/dashboard/header"
import "./styles/globals.css"

export default function DashboardRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 md:px-6 lg:px-8 pb-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
