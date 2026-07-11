"use client"

import { PageHeader } from "../components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Badge } from "../components/ui/badge"
import { Separator } from "../components/ui/separator"
import { Switch } from "../components/ui/switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { useState } from "react"
import {
  Camera,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Key,
  Shield,
  Copy,
  Check,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Edit2,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  LogOut,
  Trash2,
} from "lucide-react"

export default function ProfilePage() {
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedPhone, setCopiedPhone] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const copyToClipboard = (text: string, type: "email" | "phone") => {
    navigator.clipboard.writeText(text)
    if (type === "email") {
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 2000)
    } else {
      setCopiedPhone(true)
      setTimeout(() => setCopiedPhone(false), 2000)
    }
  }

  return (
    <>
      <PageHeader
        title="Profile"
        description="Manage your account settings and preferences."
      >
        <Button className="bg-foreground text-background hover:bg-foreground/90 shadow-sm">
          <Edit2 className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </PageHeader>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/60 p-1 rounded-xl">
          <TabsTrigger value="profile" className="rounded-lg data-[state=active]:shadow-sm">Profile</TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg data-[state=active]:shadow-sm">Security</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:shadow-sm">Notifications</TabsTrigger>
          <TabsTrigger value="sessions" className="rounded-lg data-[state=active]:shadow-sm">Sessions</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="bg-card border-border/60 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
              <CardContent className="p-6 -mt-12">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4 group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-primary/50 to-primary/30 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity" />
                    <Avatar className="h-24 w-24 ring-4 ring-background relative">
                      <AvatarImage
                        className="object-cover"
                        src="https://res.cloudinary.com/djdbcoyot/image/upload/v1783729773/gyit83lrhi65fpfrtsrg.jpg"
                        alt="Amah Precious"
                      />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-primary/10">
                        AP
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-1 right-1 p-2 bg-foreground text-background rounded-full hover:bg-foreground/90 transition-all duration-200 shadow-lg hover:shadow-xl opacity-0 group-hover:opacity-100 hover:scale-110">
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight">Amah Precious</h2>
                  <p className="text-sm text-muted-foreground">amahchibu@gmail.com</p>
                  <Badge className="mt-3 bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20 px-3 py-0.5">
                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse inline-block" />
                    Admin
                  </Badge>

                  <Separator className="my-6" />

                  <div className="w-full space-y-3.5 text-left">
                    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
                      <div className="p-2 rounded-md bg-primary/5 group-hover:bg-primary/10 transition-colors">
                        <Mail className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm flex-1 truncate">amahchibu@gmail.com</span>
                      <button
                        onClick={() => copyToClipboard("amahchibu@gmail.com", "email")}
                        className="p-1.5 hover:bg-muted rounded-md transition-all duration-200 hover:scale-110"
                        title="Copy email"
                      >
                        {copiedEmail ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    {copiedEmail && (
                      <p className="text-xs text-green-600 ml-3 -mt-2 animate-in fade-in slide-in-from-top-1">
                        Email copied!
                      </p>
                    )}
                    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
                      <div className="p-2 rounded-md bg-primary/5 group-hover:bg-primary/10 transition-colors">
                        <Phone className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm flex-1">+2348034826276</span>
                      <button
                        onClick={() => copyToClipboard("+2348034826276", "phone")}
                        className="p-1.5 hover:bg-muted rounded-md transition-all duration-200 hover:scale-110"
                        title="Copy phone"
                      >
                        {copiedPhone ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    {copiedPhone && (
                      <p className="text-xs text-green-600 ml-3 -mt-2 animate-in fade-in slide-in-from-top-1">
                        Phone copied!
                      </p>
                    )}
                    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
                      <div className="p-2 rounded-md bg-primary/5 group-hover:bg-primary/10 transition-colors">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm">Ph, Nigeria</span>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
                      <div className="p-2 rounded-md bg-primary/5 group-hover:bg-primary/10 transition-colors">
                        <Building className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm">Founder | Tech trailblazer Academy</span>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
                      <div className="p-2 rounded-md bg-primary/5 group-hover:bg-primary/10 transition-colors">
                        <Calendar className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm">Admin since July, 2026</span>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="w-full">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Social Links</p>
                    <div className="flex justify-center gap-2">
                      <button className="p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors hover:text-primary hover:scale-105 duration-200">
                        <Github className="w-4 h-4" />
                      </button>
                      <button className="p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors hover:text-primary hover:scale-105 duration-200">
                        <Linkedin className="w-4 h-4" />
                      </button>
                      <button className="p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors hover:text-primary hover:scale-105 duration-200">
                        <Twitter className="w-4 h-4" />
                      </button>
                      <button className="p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors hover:text-primary hover:scale-105 duration-200">
                        <Globe className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information & Activity */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card border-border/60 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-4 border-b border-border/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold">Personal Information</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Manage your personal details and contact information
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-xs">
                      Verified
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-xs font-medium">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        defaultValue="Amah"
                        className="h-10 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-xs font-medium">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        defaultValue="Precious"
                        className="h-10 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="amahchibu@gmail.com"
                      className="h-10 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs font-medium">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        defaultValue="+2348034826276"
                        className="h-10 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-xs font-medium">
                        Location
                      </Label>
                      <Input
                        id="location"
                        defaultValue="Ph, Nigeria"
                        className="h-10 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button className="bg-foreground text-background hover:bg-foreground/90 shadow-sm">
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/60 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-4 border-b border-border/40">
                  <div>
                    <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Your latest account activities and changes
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-0">
                    {[
                      {
                        action: "Updated profile picture",
                        time: "2 hours ago",
                        type: "update",
                      },
                      {
                        action: "Changed account password",
                        time: "3 days ago",
                        type: "security",
                      },
                      {
                        action: "Logged in from new device",
                        time: "1 week ago",
                        type: "login",
                      },
                      {
                        action: "Updated email preferences",
                        time: "2 weeks ago",
                        type: "settings",
                      },
                      {
                        action: "Completed profile verification",
                        time: "1 month ago",
                        type: "verification",
                      },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 py-3.5 border-b border-border/30 last:border-0 group hover:bg-muted/20 -mx-2 px-2 rounded-lg transition-colors"
                      >
                        <div className="p-2 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors mt-0.5">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              activity.type === "update"
                                ? "bg-blue-500"
                                : activity.type === "security"
                                  ? "bg-amber-500"
                                  : activity.type === "login"
                                    ? "bg-green-500"
                                    : activity.type === "settings"
                                      ? "bg-purple-500"
                                      : "bg-emerald-500"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-2 py-0 h-5 capitalize bg-muted/50"
                        >
                          {activity.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-card border-border/60 shadow-sm hover:shadow-md transition-shadow duration-300 lg:col-span-2">
              <CardHeader className="pb-4 border-b border-border/40">
                <div>
                  <CardTitle className="text-base font-semibold">Password & Authentication</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Update your password and manage authentication methods
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                  <Label className="text-xs font-medium">Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      className="h-10 bg-muted/30 border-border/60 focus:bg-background transition-colors pr-10"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <Label className="text-xs font-medium">New Password</Label>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      className="h-10 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-xs font-medium">Confirm New Password</Label>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      className="h-10 bg-muted/30 border-border/60 focus:bg-background transition-colors"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button className="bg-foreground text-background hover:bg-foreground/90 shadow-sm">
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-4 border-b border-border/40">
                <div>
                  <CardTitle className="text-base font-semibold">Security Status</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Your account security overview
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-100">
                      <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Password</p>
                      <p className="text-xs text-muted-foreground">Strong</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-amber-100">
                      <Smartphone className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">2FA</p>
                      <p className="text-xs text-muted-foreground">Not enabled</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">
                    Inactive
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-100">
                      <Monitor className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Sessions</p>
                      <p className="text-xs text-muted-foreground">3 active</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border/60 shadow-sm hover:shadow-md transition-shadow duration-300 lg:col-span-3">
              <CardHeader className="pb-4 border-b border-border/40">
                <div>
                  <CardTitle className="text-base font-semibold">Two-Factor Authentication</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Add an extra layer of security to your account
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/40">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-full bg-primary/5">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Enable Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
                        Secure your account with an additional authentication method. You'll need to verify
                        your identity using a code from your authenticator app.
                      </p>
                    </div>
                  </div>
                  <Switch className="data-[state=checked]:bg-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-card border-border/60 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-4 border-b border-border/40">
              <div>
                <CardTitle className="text-base font-semibold">Notification Preferences</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Choose what notifications you want to receive
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-0">
              {[
                {
                  title: "Email Notifications",
                  description: "Receive notifications via email",
                  icon: Mail,
                  defaultChecked: true,
                },
                {
                  title: "Push Notifications",
                  description: "Receive push notifications on your browser",
                  icon: Bell,
                  defaultChecked: true,
                },
                {
                  title: "Security Alerts",
                  description: "Get notified about security-related events",
                  icon: Lock,
                  defaultChecked: true,
                },
                {
                  title: "Marketing Updates",
                  description: "Receive updates about new features and offers",
                  icon: Globe,
                  defaultChecked: false,
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-4 border-b border-border/30 last:border-0 group hover:bg-muted/20 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-muted transition-colors">
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <Switch defaultChecked={item.defaultChecked} className="data-[state=checked]:bg-primary" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <Card className="bg-card border-border/60 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-4 border-b border-border/40">
              <div>
                <CardTitle className="text-base font-semibold">Active Sessions</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Manage your active sessions across devices
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-0">
              {[
                {
                  device: "MacBook Pro - Chrome",
                  location: "Port Harcourt, Nigeria",
                  ip: "192.168.1.1",
                  lastActive: "Active now",
                  isCurrent: true,
                  icon: Monitor,
                },
                {
                  device: "iPhone 15 - Safari",
                  location: "Port Harcourt, Nigeria",
                  ip: "192.168.1.2",
                  lastActive: "2 hours ago",
                  isCurrent: false,
                  icon: Smartphone,
                },
                {
                  device: "Windows PC - Firefox",
                  location: "Lagos, Nigeria",
                  ip: "192.168.1.3",
                  lastActive: "3 days ago",
                  isCurrent: false,
                  icon: Monitor,
                },
              ].map((session, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-4 border-b border-border/30 last:border-0 group hover:bg-muted/20 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-muted/50 group-hover:bg-muted transition-colors">
                      <session.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{session.device}</p>
                        {session.isCurrent && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] h-5">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {session.location} · {session.ip}
                      </p>
                      <p className="text-xs text-muted-foreground">{session.lastActive}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1.5" />
                    End
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-destructive/20 border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-full bg-destructive/5">
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-destructive">Danger Zone</p>
                    <p className="text-xs text-muted-foreground">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}