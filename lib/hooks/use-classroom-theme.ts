"use client"

import { useEffect, useState } from "react"

export function useClassroomTheme(courseSlug: string) {
  const [dark, setDark] = useState(false)
  const [loadedCourse, setLoadedCourse] = useState("")

  useEffect(() => {
    setDark(window.localStorage.getItem(`ttacademy-classroom-${courseSlug}-theme`) === "dark")
    setLoadedCourse(courseSlug)
  }, [courseSlug])

  useEffect(() => {
    if (loadedCourse === courseSlug) {
      window.localStorage.setItem(`ttacademy-classroom-${courseSlug}-theme`, dark ? "dark" : "light")
    }
  }, [courseSlug, dark, loadedCourse])

  return { dark, setDark }
}
