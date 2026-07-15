"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Bell, ChevronDown, Menu, X, LayoutDashboard, Users, BarChart3, Mail, Settings, User, LogOut, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Students", href: "/dashboard/students", icon: Users },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Email", href: "/dashboard/email", icon: Mail },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to log out? You will be redirected to the login page."
    )
    
    if (!confirmed) return

    try {
      await supabase.auth.signOut()
      toast.success("Logged out successfully")
      router.push('/admin-login')
      router.refresh()
    } catch (error) {
      toast.error("Error logging out")
    }
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [mobileMenuOpen])

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-background/95 backdrop-blur-xl shadow-sm border-b border-border/40"
            : "bg-background/80 backdrop-blur-sm border-b border-border/10"
        }`}
      >
        <div className="mx-auto w-full max-w-7xl px-3 sm:px-5 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Left Section: Logo & Mobile Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-shrink-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-muted/50 hover:bg-muted transition-colors lg:hidden flex-shrink-0"
                aria-label="Toggle menu"
              >
                <Menu className="w-4 h-4" />
              </button>
              <Link href="/dashboard" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:shadow-lg group-hover:shadow-amber-500/30 transition-all flex-shrink-0">
                  <span className="text-white font-bold text-xs sm:text-sm">TT</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-sm font-semibold tracking-tight">TT Academy</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation - centered */}
            <nav className="hidden lg:flex items-center bg-muted/30 rounded-xl px-1.5 py-1 border border-border/40 mx-2 flex-1 max-w-md xl:max-w-lg">
              {navItems.map((item) =>
                item.label === "Analytics" ? (
                  <button
                    key={item.href}
                    onClick={() => alert("Analytics coming soon!")}
                    className={`relative rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap flex-1 justify-center ${
                      "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10 hidden xl:inline">{item.label}</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-semibold">Soon</span>
                  </button>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap flex-1 justify-center ${
                      isActive(item.href)
                        ? "bg-amber-500/10 text-amber-600 shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {isActive(item.href) && (
                      <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-amber-500/5 to-amber-500/10" />
                    )}
                    <item.icon className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10 hidden xl:inline">{item.label}</span>
                  </Link>
                )
              )}
            </nav>

            {/* Tablet Navigation - compact */}
            <nav className="hidden sm:flex lg:hidden items-center bg-muted/30 rounded-xl px-1.5 py-1 border border-border/40 gap-0.5 flex-1 max-w-xs mx-2 overflow-x-auto scrollbar-hide">
              {navItems.map((item) =>
                item.label === "Analytics" ? (
                  <button
                    key={item.href}
                    onClick={() => alert("Analytics coming soon!")}
                    className="rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-all duration-200 flex items-center gap-1 whitespace-nowrap justify-center flex-1 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  >
                    <item.icon className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-2.5 py-1.5 text-[10px] font-medium transition-all duration-200 flex items-center gap-1 whitespace-nowrap justify-center flex-1 ${
                      isActive(item.href)
                        ? "bg-amber-500/10 text-amber-600"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                  </Link>
                )
              )}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-9 h-9 bg-muted/30 hover:bg-muted transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 text-[7px] font-bold text-white flex items-center justify-center shadow-sm shadow-amber-500/30">
                  3
                </span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button id="user-menu-trigger" className="flex items-center gap-1.5 cursor-pointer p-1 pr-1.5 sm:pr-2 rounded-xl hover:bg-muted/50 transition-colors">
                    <Avatar className="h-8 w-8 ring-2 ring-background shadow-sm">
                      <AvatarImage
                        className="object-cover"
                        src="https://res.cloudinary.com/djdbcoyot/image/upload/v1783729773/gyit83lrhi65fpfrtsrg.jpg"
                        alt="Amah Precious"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-amber-500/10 text-xs font-medium">
                        AP
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-xs font-medium leading-tight">Amah Precious</p>
                      <p className="text-[10px] text-muted-foreground">Admin</p>
                    </div>
                    <ChevronDown className="w-2.5 h-2.5 text-muted-foreground hidden md:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 sm:w-52 p-1.5 rounded-xl shadow-lg border-border/60">
                  <div className="px-3 py-2 mb-1">
                    <p className="text-sm font-medium">Amah Precious</p>
                    <p className="text-xs text-muted-foreground">amahchibu@gmail.com</p>
                  </div>
                  <DropdownMenuSeparator className="bg-border/40" />
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/dashboard/profile" className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-muted/50">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                    <Link href="/dashboard/settings" className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-muted/50">
                        <Settings className="w-3.5 h-3.5" />
                      </div>
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/40" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="rounded-lg cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 flex items-center gap-2.5"
                  >
                    <div className="p-1.5 rounded-md bg-destructive/5">
                      <LogOut className="w-3.5 h-3.5" />
                    </div>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar - Premium design */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 z-[100] modal-overlay animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 z-[110] w-72 max-w-[85vw] bg-background shadow-2xl animate-in slide-in-from-left duration-300 ease-out">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="px-5 py-5 border-b border-border/40">
                <div className="flex items-center justify-between">
                  <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20">
                      <span className="text-white font-bold text-sm">TT</span>
                    </div>
                    <div>
                      <span className="text-base font-semibold tracking-tight block leading-tight">TT Academy</span>
                      <span className="text-[10px] text-muted-foreground">Dashboard</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  href="/dashboard/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 mt-5 rounded-xl bg-muted/30 border border-border/40 group hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                    <AvatarImage
                      className="object-cover"
                      src="https://res.cloudinary.com/djdbcoyot/image/upload/v1783729773/gyit83lrhi65fpfrtsrg.jpg"
                      alt="Amah Precious"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-amber-500/20 to-amber-500/10 text-xs font-medium">AP</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">Amah Precious</p>
                    <p className="text-[11px] text-muted-foreground truncate">amahchibu@gmail.com</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>
              </div>

              {/* Navigation */}
              <div className="flex-1 px-3 py-5 overflow-y-auto bg-background">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 pb-2">
                  Main Menu
                </p>
                <nav className="space-y-1">
                  {navItems.map((item) =>
                    item.label === "Analytics" ? (
                      <button
                        key={item.href}
                        onClick={() => {
                          setMobileMenuOpen(false)
                          alert("Analytics coming soon!")
                        }}
                        className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left ${
                          "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-muted shrink-0">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="truncate">{item.label}</span>
                        <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-semibold">Soon</span>
                      </button>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive(item.href)
                            ? "bg-amber-500/10 text-amber-600 shadow-sm"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg shrink-0 ${
                            isActive(item.href)
                              ? "bg-amber-500/15"
                              : "bg-muted"
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="truncate">{item.label}</span>
                        {isActive(item.href) && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500" />
                        )}
                      </Link>
                    )
                  )}
                </nav>
              </div>

              {/* Bottom */}
              <div className="px-3 py-3 border-t border-border/40 bg-muted/10">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors w-full"
                >
                  <div className="p-1.5 rounded-lg bg-destructive/5 shrink-0">
                    <LogOut className="w-4 h-4" />
                  </div>
                  Log out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}