'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

export function ForceLightMode({ page }: { page: 'admin-login' | 'landing' }) {
  const { setTheme } = useTheme()

  useEffect(() => {
    document.body.setAttribute(`data-${page}`, '')
    
    // The inline script in layout.tsx already saves the user's original
    // preference to data-savedTheme and writes 'light' to localStorage.
    // Here we just tell next-themes to use light to prevent it from
    // re-reading localStorage and re-applying dark mode after hydration.
    setTheme('light')
    
    return () => {
      document.body.removeAttribute(`data-${page}`)
      // Don't restore theme here - let ThemeRestorer in dashboard handle it.
      // We need to wait for the dashboard page to mount so next-themes
      // has a proper React context to apply the theme change.
    }
  }, [page, setTheme])

  return null
}
