import type React from "react"
import { Header } from "./components/dashboard/header"
import { AdminThemeProvider } from "./components/dashboard/admin-theme-provider"
import "./styles/globals.css"

export default function DashboardRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AdminThemeProvider>
      <div className="min-h-screen bg-[#f7f8f7]">
        <Header />
        <main className="mx-auto min-w-0 w-full max-w-[1600px] px-3 pb-10 pt-[5rem] sm:px-6 lg:ml-[17rem] lg:w-[calc(100%-17rem)] lg:px-8 lg:pt-24">
          {children}
        </main>
      </div>
    </AdminThemeProvider>
  )
}