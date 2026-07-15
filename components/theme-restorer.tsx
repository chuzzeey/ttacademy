'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

/**
 * This component handles restoring the user's theme preference
 * when navigating from the landing page (light mode forced) to
 * the dashboard via client-side navigation (SPA).
 * 
 * The inline script in layout.tsx handles the initial full page load,
 * but SPA navigation doesn't re-run that script.
 */
export function ThemeRestorer() {
  const { setTheme } = useTheme()

  useEffect(() => {
    const saved = document.documentElement.dataset.savedTheme

    if (saved === 'system-dark') {
      localStorage.removeItem('theme')
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark')
      } else {
        setTheme('light')
      }
    } else if (saved) {
      localStorage.setItem('theme', saved)
      setTheme(saved)
    }

    // Clean up the data attribute regardless
    delete document.documentElement.dataset.savedTheme
  }, [setTheme])

  return null
}