"use client"

import { PageHeader } from "../components/dashboard/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card"
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
  Copy,
  Check,
  Bell,
  Lock,
  Globe,
} from "lucide-react"

export default function ProfilePage() {
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [copiedPhone, setCopiedPhone] = useState(false)

  const copyToClipboard = (text: string, type: "email" | "phone") => {
    navigator.clipboard.writeText(text)
    if (type === "email") {
      setCopiedEmail(true)
      setTimeout(() => setCopiedEmail(false), 2000)
    } else {ne
      setCopiedPhone(true)
      setTimeout(() => setCopiedPhone(false), 2000)
    }
  }

  return (
    <>
      <PageHeader
        title="Profile"
        description="Manage your account settings and preferences."
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/60 p-1 rounded-xl">
          <TabsTrigger value="profile" className="rounded-lg data-[state=active]:shadow-sm">Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:shadow-sm">Notifications</TabsTrigger>
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
                      <button className="p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors hover:text-[#1877F2] hover:scale-105 duration-200" aria-label="Facebook">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </button>
                      <button className="p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors hover:text-foreground hover:scale-105 duration-200" aria-label="X (Twitter)">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
                        </svg>
                      </button>
                      <button className="p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors hover:text-[#E4405F] hover:scale-105 duration-200" aria-label="Instagram">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
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
                      <Label className="text-xs font-medium text-muted-foreground">
                        First Name
                      </Label>
                      <p className="text-sm font-medium py-2 px-3 rounded-lg bg-muted/20 border border-border/40">
                        Amah
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Last Name
                      </Label>
                      <p className="text-sm font-medium py-2 px-3 rounded-lg bg-muted/20 border border-border/40">
                        Precious
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Email Address
                    </Label>
                    <p className="text-sm font-medium py-2 px-3 rounded-lg bg-muted/20 border border-border/40">
                      amahchibu@gmail.com
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Phone Number
                      </Label>
                      <p className="text-sm font-medium py-2 px-3 rounded-lg bg-muted/20 border border-border/40">
                        +2348034826276
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Location
                      </Label>
                      <p className="text-sm font-medium py-2 px-3 rounded-lg bg-muted/20 border border-border/40">
                        Ph, Nigeria
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
      </Tabs>
    </>
  )
}