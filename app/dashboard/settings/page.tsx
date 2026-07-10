"use client"

import { useState, Suspense } from "react"
import { PageHeader } from "../components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Switch } from "../components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Search, Settings as SettingsIcon, User, Bell, Shield, Palette, Globe, Mail, Save } from "lucide-react"
import Loading from "./loading"

const generalSettings = {
  siteName: "Rexora Academy",
  siteDescription: "Learn without limits",
  supportEmail: "support@rexora.com",
  timezone: "Africa/Lagos",
  language: "English",
}

const notificationSettings = [
  { id: "email-notifications", label: "Email Notifications", description: "Receive email alerts for new enrollments", enabled: true },
  { id: "student-alerts", label: "Student Alerts", description: "Get notified when new students register", enabled: true },
  { id: "payment-alerts", label: "Payment Alerts", description: "Receive notifications for successful payments", enabled: true },
  { id: "weekly-reports", label: "Weekly Reports", description: "Get weekly analytics reports via email", enabled: false },
]

const securitySettings = [
  { id: "two-factor", label: "Two-Factor Authentication", description: "Add extra security to your account", enabled: true },
  { id: "session-timeout", label: "Session Timeout", description: "Auto-logout after 30 minutes of inactivity", enabled: true },
  { id: "login-notifications", label: "Login Notifications", description: "Get notified of new login attempts", enabled: false },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState(generalSettings)
  const [notifications, setNotifications] = useState(notificationSettings)
  const [security, setSecurity] = useState(securitySettings)

  const toggleNotification = (id: string) => {
    setNotifications(prev =>
      prev.map(item =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    )
  }

  const toggleSecurity = (id: string) => {
    setSecurity(prev =>
      prev.map(item =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    )
  }

  return (
    <Suspense fallback={<Loading />}>
      <>
        <PageHeader
          title="Settings"
          description="Manage your application settings and preferences."
        >
          <Button className="flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <Card className="bg-card border border-border">
            <CardContent className="p-4">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("general")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "general"
                      ? "bg-[var(--color-accent)] text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <SettingsIcon className="w-4 h-4" />
                  General
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "notifications"
                      ? "bg-[var(--color-accent)] text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  Notifications
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "security"
                      ? "bg-[var(--color-accent)] text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Security
                </button>
                <button
                  onClick={() => setActiveTab("appearance")}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === "appearance"
                      ? "bg-[var(--color-accent)] text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  Appearance
                </button>
              </nav>
            </CardContent>
          </Card>

          {/* Settings Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === "general" && (
              <Card className="bg-card border border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    General Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={settings.siteName}
                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportEmail">Support Email</Label>
                      <Input
                        id="supportEmail"
                        type="email"
                        value={settings.supportEmail}
                        onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="siteDescription">Site Description</Label>
                      <Input
                        id="siteDescription"
                        value={settings.siteDescription}
                        onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        value={settings.timezone}
                        onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Input
                        id="language"
                        value={settings.language}
                        onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "notifications" && (
              <Card className="bg-card border border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {notifications.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div className="space-y-0.5">
                        <Label htmlFor={item.id} className="text-sm font-medium cursor-pointer">
                          {item.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch
                        id={item.id}
                        checked={item.enabled}
                        onCheckedChange={() => toggleNotification(item.id)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {activeTab === "security" && (
              <Card className="bg-card border border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {security.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div className="space-y-0.5">
                        <Label htmlFor={item.id} className="text-sm font-medium cursor-pointer">
                          {item.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch
                        id={item.id}
                        checked={item.enabled}
                        onCheckedChange={() => toggleSecurity(item.id)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {activeTab === "appearance" && (
              <Card className="bg-card border border-border">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Appearance Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Dark Mode</Label>
                      <p className="text-xs text-muted-foreground">Toggle between light and dark theme</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between py-3 border-t border-border">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Compact Mode</Label>
                      <p className="text-xs text-muted-foreground">Reduce spacing and padding</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between py-3 border-t border-border">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Animations</Label>
                      <p className="text-xs text-muted-foreground">Enable smooth transitions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </>
    </Suspense>
  )
}