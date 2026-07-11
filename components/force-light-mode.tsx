'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

export function ForceLightMode({ page }: { page: 'admin-login' | 'landing' }) {
  const { setTheme } = useTheme()

  useEffect(() => {
    document.body.setAttribute(`data-${page}`, '')
    setTheme('light')
    
    return () => {
      document.body.removeAttribute(`data-${page}`)
    }
  }, [page, setTheme])

  return null
}
