"use client"

import { useEffect, useMemo, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

function displayName(user: User | null) {
  if (!user) return "Administrator"
  const metadataName = user.user_metadata?.name || user.user_metadata?.full_name
  if (typeof metadataName === "string" && metadataName.trim()) return metadataName.trim()
  return user.email?.split("@")[0] || "Administrator"
}

export function useAdminProfile() {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    void supabase.auth.getUser().then(({ data, error: authError }) => {
      if (!active) return
      if (authError) setError("Unable to load the administrator account.")
      setUser(data.user)
      setIsLoading(false)
    }).catch((authError: unknown) => {
      if (!active) return
      console.error("Administrator profile load failed:", authError)
      setError("Unable to load the administrator account.")
      setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setError("")
      setIsLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [supabase])

  return {
    user,
    name: displayName(user),
    email: user?.email ?? "",
    avatarUrl: typeof user?.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : "",
    isLoading,
    error,
    supabase,
  }
}
