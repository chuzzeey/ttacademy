"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { Header } from "./header"

export function DashboardFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isClassroomRoute = /^\/dashboard\/classrooms\/[^/]+$/.test(pathname)

  return (
    <div className="min-h-screen bg-[#f7f8f7]">
      {!isClassroomRoute && <Header />}
      <main className={isClassroomRoute
        ? "min-h-screen min-w-0"
        : "mx-auto min-w-0 w-full max-w-[1600px] px-3 pb-10 pt-[5rem] sm:px-6 lg:ml-[17rem] lg:w-[calc(100%-17rem)] lg:px-8 lg:pt-24"}
      >
        {children}
      </main>
    </div>
  )
}
