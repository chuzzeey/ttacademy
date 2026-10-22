'use client'

import { useEffect, useRef, createContext, useContext, type ReactNode } from 'react'
import Lenis from 'lenis'

type LenisContextType = {
  lenis: Lenis | null
  scrollTo: (target: string | number, options?: { offset?: number; immediate?: boolean }) => void
}

const LenisContext = createContext<LenisContextType>({
  lenis: null,
  scrollTo: () => {},
})

export function useLenis() {
  return useContext(LenisContext)
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let lenis: Lenis | null = null

    const updateScrollBehavior = () => {
      if (motionPreference.matches) {
        lenis?.destroy()
        lenis = null
        lenisRef.current = null
        return
      }

      if (lenis) return
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        infinite: false,
        autoRaf: true,
      })
      lenisRef.current = lenis
    }

    updateScrollBehavior()
    motionPreference.addEventListener('change', updateScrollBehavior)

    return () => {
      motionPreference.removeEventListener('change', updateScrollBehavior)
      lenis?.destroy()
      lenisRef.current = null
    }
  }, [])

  const scrollTo = (target: string | number, options?: { offset?: number; immediate?: boolean }) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, options)
    }
  }

  return (
    <LenisContext.Provider value={{ lenis: lenisRef.current, scrollTo }}>
      {children}
    </LenisContext.Provider>
  )
}