"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { usePathname } from "next/navigation"

type AdminTheme = "light" | "dark"

const AdminThemeContext = createContext<{
  theme: AdminTheme
  toggleTheme: () => void
} | null>(null)

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [theme, setTheme] = useState<AdminTheme>("light")
  const isClassroomRoute = pathname.startsWith("/dashboard/classrooms/")

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("ttacademy-admin-theme")
    if (storedTheme === "dark" || storedTheme === "light") setTheme(storedTheme)
  }, [])

  useEffect(() => {
    window.localStorage.setItem("ttacademy-admin-theme", theme)
  }, [theme])

  return (
    <AdminThemeContext.Provider
      value={{ theme, toggleTheme: () => setTheme((current) => current === "light" ? "dark" : "light") }}
    >
      <div className={`admin-theme min-h-screen transition-colors duration-300 ${theme === "dark" && !isClassroomRoute ? "admin-theme-dark" : ""}`}>
        {children}
      </div>
    </AdminThemeContext.Provider>
  )
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext)
  if (!context) throw new Error("useAdminTheme must be used within AdminThemeProvider")
  return context
}
