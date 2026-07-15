'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

export function ForceLightMode({ page }: { page: 'admin-login' | 'landing' }) {
  const { setTheme, theme } = useTheme()

  useEffect(() => {
    document.body.setAttribute(`data-${page}`, '')
    
    // Save the user's actual theme preference before overriding
    // This preserves their choice for when they go back to dashboard
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme && savedTheme !== 'light') {
      document.documentElement.dataset.savedTheme = savedTheme
    } else if (!savedTheme) {
      // If user had no saved preference but system prefers dark, note it
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (systemDark) {
        document.documentElement.dataset.savedTheme = 'system-dark'
      }
    }
    
    // Tell next-themes to use light mode (this ensures it stays light after hydration)
    setTheme('light')
    
    return () => {
      document.body.removeAttribute(`data-${page}`)
      
      // Restore the user's original theme preference when navigating away
      const saved = document.documentElement.dataset.savedTheme
      if (saved && saved === 'system-dark') {
        // User had no explicit preference, just system dark - remove our override
        localStorage.removeItem('theme')
        // next-themes will re-evaluate system preference
      } else if (saved) {
        // Restore user's explicit dark preference
        setTheme(saved)
      }
      delete document.documentElement.dataset.savedTheme
    }
  }, [page, setTheme])

  return null
}
