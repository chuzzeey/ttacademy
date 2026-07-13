'use client'

import { ProfileThemeProvider } from '@/components/profile-theme-provider'

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProfileThemeProvider
      defaultTheme="dark"
      storageKey="profile-theme"
    >
      {children}
    </ProfileThemeProvider>
  )
}
