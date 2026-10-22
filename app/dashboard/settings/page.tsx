"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "../components/dashboard/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Switch } from "../components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { Bell, BookOpen, Globe, Mail, UserRound } from "lucide-react"

type NotificationPreferences = {
  newRegistrations: boolean
  paymentStatusChanges: boolean
  weeklySummary: boolean
}

const defaultPreferences: NotificationPreferences = {
  newRegistrations: false,
  paymentStatusChanges: false,
  weeklySummary: false,
}

const notificationOptions = [
  {
    id: "newRegistrations" as const,
    label: "New registrations",
    description: "Preference for alerts when a learner registers.",
    icon: UserRound,
  },
  {
    id: "paymentStatusChanges" as const,
    label: "Payment status changes",
    description: "Preference for alerts when a learner payment status changes.",
    icon: Bell,
  },
  {
    id: "weeklySummary" as const,
    label: "Weekly summary",
    description: "Preference for a weekly enrollment summary.",
    icon: BookOpen,
  },
]

export default function SettingsPage() {
  const supabase = createClient()
  const [preferences, setPreferences] = useState(defaultPreferences)
  const [isLoading, setIsLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<keyof NotificationPreferences | null>(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    void supabase.auth.getUser().then(({ data: { user }, error: authError }) => {
      if (!active) return
      if (authError || !user) {
        setError("Unable to load your account preferences.")
      } else {
        const stored = user.user_metadata?.academy_notification_preferences
        if (stored && typeof stored === "object") {
          setPreferences({
            newRegistrations: stored.newRegistrations === true,
            paymentStatusChanges: stored.paymentStatusChanges === true,
            weeklySummary: stored.weeklySummary === true,
          })
        }
      }
      setIsLoading(false)
    })
    return () => { active = false }
  }, [supabase])

  const savePreference = async (key: keyof NotificationPreferences, enabled: boolean) => {
    setSavingKey(key)
    setError("")
    setMessage("")
    const updated = { ...preferences, [key]: enabled }
    try {
      const { error: saveError } = await supabase.auth.updateUser({
        data: { academy_notification_preferences: updated },
      })
      if (saveError) throw saveError
      setPreferences(updated)
      setMessage("Preference saved to your administrator account.")
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save notification preference.")
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <main className="space-y-6">
      <PageHeader title="Settings" description="Review workspace configuration and manage account preferences." />

      {(message || error) && (
        <p role={error ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${
          error ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
        }`}>
          {error || message}
        </p>
      )}

      <Card className="dashboard-card scroll-mt-24">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Globe className="h-4 w-4 text-emerald-700" /> Workspace configuration</CardTitle>
          <CardDescription>Current application values. These are configured centrally and are not editable here.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Academy", value: "Tech Trailblazer Academy" },
            { label: "Analytics timezone", value: "Africa/Lagos" },
            { label: "Dashboard language", value: "English" },
          ].map((setting) => (
            <div key={setting.label} className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">{setting.label}</p>
              <p className="mt-1 text-sm font-medium">{setting.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="dashboard-card scroll-mt-24" id="notifications">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Bell className="h-4 w-4 text-emerald-700" /> Notification preferences</CardTitle>
          <CardDescription>Preferences are saved to your signed-in admin account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs leading-5 text-amber-950">
            <Mail className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Notification delivery is not connected yet. These preferences are stored, but enabling them will not send alerts until an email provider is configured.</p>
          </div>
          {isLoading ? (
            <div className="h-40 animate-pulse rounded-xl bg-muted/40" role="status" aria-label="Loading notification preferences" />
          ) : (
            <div className="divide-y divide-border/60">
              {notificationOptions.map((option) => {
                const Icon = option.icon
                return (
                  <div key={option.id} className="flex items-center justify-between gap-4 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted/50">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{option.label}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                    <Switch
                      aria-label={option.label}
                      checked={preferences[option.id]}
                      disabled={savingKey !== null}
                      onCheckedChange={(enabled) => void savePreference(option.id, enabled)}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
