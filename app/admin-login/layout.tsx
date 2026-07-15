import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Login - Tech Trailblazer Academy",
  description: "Admin login page",
}

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      {children}
    </div>
  )
}
