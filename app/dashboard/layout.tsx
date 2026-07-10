import type React from "react"
import { Header } from "./components/dashboard/header"
import "./styles/globals.css"

export default function DashboardRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto">
        <Header />
        {children}
      </div>
    </div>
  )
}
