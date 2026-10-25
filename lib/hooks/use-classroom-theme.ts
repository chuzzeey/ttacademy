"use client"

import { useEffect, useState } from "react"

export function useClassroomTheme(courseSlug: string, userId: string | null) {
  const [dark, setDark] = useState(false)
  const [loadedKey, setLoadedKey] = useState<string | null>(null)
  const storageKey = userId
    ? `ttacademy-classroom-${courseSlug}-${userId}-theme`
    : null

  useEffect(() => {
    if (!storageKey) {
      setDark(false)
      setLoadedKey(null)
      return
    }

    setDark(window.localStorage.getItem(storageKey) === "dark")
    setLoadedKey(storageKey)
  }, [storageKey])

  useEffect(() => {
    if (storageKey && loadedKey === storageKey) {
      window.localStorage.setItem(storageKey, dark ? "dark" : "light")
    }
  }, [storageKey, loadedKey, dark])

  useEffect(() => {
    if (!storageKey) return
    const syncTheme = (event: StorageEvent) => {
      if (event.key === storageKey) {
        setDark(event.newValue === "dark")
      }
    }
    window.addEventListener("storage", syncTheme)
    return () => window.removeEventListener("storage", syncTheme)
  }, [storageKey])

  return { dark: Boolean(storageKey && loadedKey === storageKey && dark), setDark }
}
