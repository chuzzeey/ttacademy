"use client"

import { useState, Suspense } from "react"
import { useTheme } from "next-themes"
import { PageHeader } from "../components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Switch } from "../components/ui/switch"
import { Separator } from "../components/ui/separator"
import { Badge } from "../components/ui/badge"
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Palette as PaletteIcon,
  Globe,
  Mail,
  Sun,
  Moon,
  ChevronRight,
  BookOpen,
} from "lucide-react"
import Loading from "./loading"

const generalSettings = {
  siteName: "Tech Trailblazer Academy",
  siteDescription: "Learn Succeed Grow",
  supportEmail: "support@techacademy.com",
  timezone: "Africa/Lagos",
  language: "English",
}

const notificationSettings = [
  { id: "email-notifications", label: "Email Notifications", description: "Receive email alerts for new enrollments", enabled: true, icon: Mail },
  { id: "student-alerts", label: "Student Alerts", description: "Get notified when new students register", enabled: true, icon: User },
  { id: "payment-alerts", label: "Payment Alerts", description: "Receive notifications for successful payments", enabled: true, icon: Bell },
  { id: "weekly-reports", label: "Weekly Reports", description: "Get weekly analytics reports via email", enabled: false, icon: BookOpen },
]


export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState(generalSettings)
  const [notifications, setNotifications] = useState(notificationSettings)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useState(() => {
    setMounted(true)
  })

  const toggleNotification = (id: string) => {
    setNotifications(prev =>
      prev.map(item =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    )
  }

  const tabs = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: PaletteIcon },
  ]

  return (
    <Suspense fallback={<Loading />}>
      <>
        <PageHeader
          title="Settings"
          description="Manage your application settings and preferences."
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Settings Navigation - Sidebar */}
          <Card className="lg:col-span-1 dashboard-card h-fit">
            <CardContent className="p-3">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activeTab === tab.id
                          ? "bg-primary/10 text-primary shadow-sm"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <div className={`p-1.5 rounded-md ${
                        activeTab === tab.id ? "bg-primary/10" : "bg-muted/50"
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="flex-1 text-left">{tab.label}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                        activeTab === tab.id ? "rotate-0 opacity-100" : "opacity-0"
                      }`} />
                    </button>
                  )
                })}
              </nav>
            </CardContent>
          </Card>

          {/* Settings Content */}
          <div className="lg:col-span-4 space-y-6">
            {activeTab === "general" && (
              <>
                <Card className="dashboard-card">
                  <CardHeader className="pb-4 border-b border-border/40">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/5">
                        <Globe className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">General Settings</CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          Configure your academy's basic information
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="siteName" className="text-xs font-medium">Site Name</Label>
                      <Input
                        id="siteName"
                        value={settings.siteName}
                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                        className="h-10 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siteDescription" className="text-xs font-medium">Site Description</Label>
                      <Input
                        id="siteDescription"
                        value={settings.siteDescription}
                        onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                        className="h-10 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                      />
                    </div>
                    <Separator className="bg-border/40" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                 
                      <div className="space-y-2">
                        <Label htmlFor="timezone" className="text-xs font-medium">Timezone</Label>
                        <Input
                          id="timezone"
                          value={settings.timezone}
                          onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                          className="h-10 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language" className="text-xs font-medium">Language</Label>
                        <Input
                          id="language"
                          value={settings.language}
                          onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                          className="h-10 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

             
              </>
            )}

            {activeTab === "notifications" && (
              <Card className="dashboard-card">
                <CardHeader className="pb-4 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/5">
                      <Bell className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">Notification Settings</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Choose what notifications to send and how
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  {notifications.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between py-4 ${
                          index < notifications.length - 1 ? "border-b border-border/30" : ""
                        } group`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-muted transition-colors">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="space-y-0.5">
                            <Label htmlFor={item.id} className="text-sm font-medium cursor-pointer">
                              {item.label}
                            </Label>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                        <Switch
                          id={item.id}
                          checked={item.enabled}
                          onCheckedChange={() => toggleNotification(item.id)}
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}


            {activeTab === "appearance" && (
              <Card className="dashboard-card">
                <CardHeader className="pb-4 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/5">
                      <PaletteIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">Appearance Settings</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Customize the look and feel of your dashboard
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <Label className="text-xs font-medium mb-3 block">Theme Mode</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "light", label: "Light", icon: Sun },
                        { id: "dark", label: "Dark", icon: Moon },
                      ].map((themeOption) => {
                        const Icon = themeOption.icon
                        const isSelected = mounted && theme === themeOption.id
                        return (
                          <button
                            key={themeOption.id}
                            onClick={() => setTheme(themeOption.id)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                              isSelected
                                ? "border-primary/30 bg-primary/5 shadow-sm"
                                : "border-border/60 hover:border-border hover:bg-muted/30"
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${
                              isSelected ? "text-primary" : "text-muted-foreground"
                            }`} />
                            <span className={`text-xs font-medium ${
                              isSelected ? "text-primary" : "text-muted-foreground"
                            }`}>
                              {themeOption.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <Separator className="bg-border/40" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-1 group">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium cursor-pointer">Animations</Label>
                        <p className="text-xs text-muted-foreground">Enable smooth transitions and micro-interactions</p>
                      </div>
                      <Switch defaultChecked className="data-[state=checked]:bg-primary" />
                    </div>
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