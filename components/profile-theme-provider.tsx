'use client'

import * as React from 'react'

type ProfileTheme = 'light' | 'dark'

interface ProfileThemeContextType {
  theme: ProfileTheme
  setTheme: (theme: ProfileTheme) => void
  mounted: boolean
}

const ProfileThemeContext = React.createContext<ProfileThemeContextType | undefined>(undefined)

export function ProfileThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = 'profile-theme'
}: {
  children: React.ReactNode
  defaultTheme?: ProfileTheme
  storageKey?: string
}) {
  const [theme, setTheme] = React.useState<ProfileTheme>(defaultTheme)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored === 'light' || stored === 'dark') {
        setTheme(stored)
      }
    } catch (e) {
      // localStorage not available
    }
  }, [storageKey])

  const handleSetTheme = React.useCallback((newTheme: ProfileTheme) => {
    setTheme(newTheme)
    try {
      localStorage.setItem(storageKey, newTheme)
    } catch (e) {
      // localStorage not available
    }
  }, [storageKey])

  const value = React.useMemo(() => ({
    theme,
    setTheme: handleSetTheme,
    mounted
  }), [theme, handleSetTheme, mounted])

  return (
    <ProfileThemeContext.Provider value={value}>
      {children}
    </ProfileThemeContext.Provider>
  )
}

export function useProfileTheme() {
  const context = React.useContext(ProfileThemeContext)
  if (context === undefined) {
    throw new Error('useProfileTheme must be used within a ProfileThemeProvider')
  }
  return context
}