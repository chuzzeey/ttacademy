'use client'

import { useEffect } from 'react'

export function ForceLightMode({ page }: { page: 'admin-login' | 'landing' }) {
  useEffect(() => {
    document.body.setAttribute(`data-${page}`, '')
    
    // Save the user's actual theme preference before overriding
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme && savedTheme !== 'light') {
      document.documentElement.dataset.savedTheme = savedTheme
    } else if (savedTheme === null) {
      // If user has no saved preference but system prefers dark, save it
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (systemDark) {
        document.documentElement.dataset.savedTheme = 'dark'
      }
    }
    
    // Force light mode via DOM manipulation (DO NOT use setTheme which persists to localStorage)
    document.documentElement.classList.remove('dark')
    
    return () => {
      document.body.removeAttribute(`data-${page}`)
      
      // Restore the user's original theme preference when navigating away
      const restoredTheme = document.documentElement.dataset.savedTheme
      if (restoredTheme) {
        localStorage.setItem('theme', restoredTheme)
        if (restoredTheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        delete document.documentElement.dataset.savedTheme
      }
    }
  }, [page])

  return null
}
