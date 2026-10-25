import type React from "react"
import { DashboardFrame } from "./components/dashboard/dashboard-frame"
import { AdminThemeProvider } from "./components/dashboard/admin-theme-provider"
import "./styles/globals.css"

export default function DashboardRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AdminThemeProvider>
      <DashboardFrame>{children}</DashboardFrame>
    </AdminThemeProvider>
  )
}